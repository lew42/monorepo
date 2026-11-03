// The one path a change takes, both ways, run for real. Plain node, no server:
//   node public/framework/core/Session/tasks/data-shapes/seats/delta-flow/demo-delta-flow.mjs
//
// It uses the REAL Item, List, Item.Store, Page and PageLogReader. Exactly one piece is swapped: the
// store's last step (flush). In a browser that step POSTs the line to Servex's item tool (task, session
// and improvements files) or sends it over the dev socket (page.jsonl); here it appends to a temp file
// the way the item tool's write_line() does (Servex/agents/page_tools.js:172-181), stamping by/ts.
// The dev server's tail is the same ten lines as Server/plugins/SocketServer/Tail.js read() (:51-66).
//
// It prints every hop of every change, then a fresh replay from disk, then PASS or FAIL.
// Part 2 re-proves the known breaks; each one prints "still true" or "STALE" (fixed since: update notes.md).
// Nothing here edits the framework. The temp file lives in the OS temp folder.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { register } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../../../../../../../..");
register(pathToFileURL(path.join(ROOT, "Servex", "agents", "site-hooks.mjs")).href);   // "/framework/…" imports map to public/, as Page.test.mjs does
const load = rel => import(pathToFileURL(path.join(ROOT, "public", "framework", rel)).href);

const { default: Item } = await load("core/Item/Item.js");
const { default: List } = await load("core/List/List.js");
const { default: Page } = await load("core/Page/Page.class.js");
const { default: PageLogReader } = await load("core/Page/Reader.js");
console.warn = () => {};   // the framework's own one-time warnings would interleave with the hops; the checks below say what matters

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), "delta-flow-"));
const tick = () => new Promise(r => setTimeout(r, 0));   // Store.append queues one microtask, then flush()
const J = x => JSON.stringify(x);
const strip = ({ by, ts, ...bare }) => bare;
let failures = 0;
const check = (ok, what) => { if (!ok) failures++; console.log(`   ${ok ? "ok  " : "FAIL"} ${what}`); };

// ── The one swapped piece: where a flushed line goes ──────────────────────────────────────────
// Everything up to flush() is Item.Store's own code: attach (Store.js:124), line_for → hops + wrap (:148, :273, :297),
// the one-microtask queue (:162), the echo list (:182) and skip_echo (:112).
const disk = Base => class extends Base {
	get writable(){ return true; }
	async flush(){
		const lines = this._queue.splice(0);
		this._flushing = false;
		for (const line of lines){
			(this.sent ??= []).push(J(line));
			fs.appendFileSync(this.file, J({ ...line, by: this.by, ts: new Date().toISOString() }) + "\n");   // = write_line + the tool's by/ts (page_tools.js:1179)
		}
	}
};
const DiskStore = disk(Item.Store);
const DiskPageStore = disk(PageLogReader);

// The dev server's tail: only whole lines past `from` (Tail.js:51-66).
function tail(file, from){
	const buf = fs.existsSync(file) ? fs.readFileSync(file).subarray(from) : Buffer.alloc(0);
	const end = buf.lastIndexOf(10) + 1;
	return { lines: buf.subarray(0, end).toString("utf8").split("\n").filter(Boolean).map(l => JSON.parse(l)), offset: from + end };
}

// ── The classes. Code builds the STRUCTURE; clicks and agents bring the ITEMS ─────────────────
// Board: the root. Its `cards` List is built by code, quietly, before any line is read (the code-made rule).
// It strips by/ts from each line before set(), as Session.replay_line does (core/Session/Session.js:78);
// a plain Item does not (see break B5).
class Board extends Item {
	constructor(...args){ super(...args); this.cards = new List({ owner: this, name: "cards" }); }
	replay_line(line){ const { by, ts, ...rest } = line; return this.set(rest); }
}
// Card: made by a click, so code cannot pre-build its list. `notes` is made on first use: Task's pattern for `tasks`
// (core/Task/Task.js:52-56, :71, :76-78), the getter, the setter, the get() route and the lists() rename.
class Card extends Item {
	get notes(){ return this._notes ??= new List({ owner: this, name: "notes" }); }
	set notes(list){ this._notes = list; }
	get(key){ return key === "notes" ? this.notes : super.get(key); }
	lists(){ const { _notes, ...rest } = super.lists(); return { ...rest, ...(_notes ? { notes: _notes } : {}) }; }
}
Item.register(Board, "Board");
Item.register(Card, "Card");

// A "tab": a root built by code, a store on the file, and its own read offset on the tail.
function open_tab(name, file){
	const root = new Board({ id: "board" });
	const store = new DiskStore({ url: "/demo/session.jsonl", file, by: name });
	store.attach(root);
	const tab = { name, root, store, offset: 0 };
	tab.pull = () => {
		const t = tail(file, tab.offset); tab.offset = t.offset;
		const sent = [...(store.sent ?? [])];   // count the echoes the way skip_echo (Store.js:112) will find them…
		const echoes = t.lines.filter(l => { const i = sent.indexOf(J(strip(l))); if (i === -1) return false; sent.splice(i, 1); return true; }).length;
		store.read(t.lines);                    // …then the real read() skips them itself
		return { got: t.lines.length, echoes, applied: t.lines.length - echoes };
	};
	return tab;
}
const canon = root => J(root.toJSON());

// Who hears a "delta" event, bottom up (core/Events/Events.js:23-27: own listeners, then .parent).
function listen(nodes){
	const heard = [];
	const offs = nodes.map(([label, node]) => { const fn = () => heard.push(label); node.on("delta", fn); return () => node.off("delta", fn); });
	return { heard, off: () => offs.forEach(f => f()) };
}

// ══ PART 1: the path, both ways ═══════════════════════════════════════════════════════════════
console.log("\nPART 1 — the path a change takes\n");
const FILE = path.join(TMP, "session.jsonl");
fs.writeFileSync(FILE, "");
const A = open_tab("tab-A", FILE), B = open_tab("tab-B", FILE);
let bytes = 0;

async function ui(label, nodes, act){
	console.log(`── UI (tab A): ${label}`);
	const ears = listen(nodes());
	act();
	ears.off();
	await tick();
	const t = tail(FILE, bytes); bytes = t.offset;
	console.log(`   heard at:  ${ears.heard.join(" → ") || "(nobody)"}`);
	t.lines.forEach(l => console.log(`   line:      ${J((({ by, ts, ...b }) => b)(l))}   (+ by, ts)`));
	if (!t.lines.length) console.log("   line:      (none written)");
	console.log(`   on disk:   ${fs.statSync(FILE).size} bytes, ${fs.readFileSync(FILE, "utf8").split("\n").filter(Boolean).length} lines`);
	const a = A.pull(), b = B.pull();
	console.log(`   tab A:     ${a.got} line(s) back, ${a.echoes} skipped as its own echo`);
	console.log(`   tab B:     ${b.applied} line(s) applied; B equals A: ${canon(A.root) === canon(B.root) ? "yes" : "NO"}`);
	check(canon(A.root) === canon(B.root), "the other tab has the same tree");
}

const r = A.root;
await ui(`r.set("title", "Plan")  — a field on the root`, () => [["root", r]], () => r.set("title", "Plan"));
await ui(`r.cards.add({id:"c1", …}) — a list verb, one level down`, () => [["cards(List)", r.cards], ["root", r]],
	() => { r.cards.add(new Card({ id: "c1", data: { title: "Fix the tab bar" } })); });
await ui(`r.cards.add(c2)`, () => [["root", r]], () => { r.cards.add(new Card({ id: "c2", data: { title: "Ship it" } })); });
const c1 = r.cards.find("c1"), c2 = r.cards.find("c2");
await ui(`c1.notes.add({id:"n1"}) — a list verb two levels down`, () => [["notes(List)", c1.notes], ["c1", c1], ["root", r]],
	() => c1.notes.add({ id: "n1", text: "first" }));
const n1 = c1.notes.find("n1");
await ui(`n1.set("text", …) — a field on an item two levels down`, () => [["n1", n1], ["notes(List)", c1.notes], ["c1", c1], ["root", r]],
	() => n1.set("text", "first, edited"));
await ui(`c2.notes.move(n1, {from: c1.notes}) — a move across lists`, () => [["c2.notes", c2.notes], ["c2", c2], ["root", r]],
	() => { c2.notes.move(n1, { from: c1.notes, after: null }); });
await ui(`r.cards.add(c3) then r.cards.remove("c3")`, () => [["root", r]],
	() => { r.cards.add(new Card({ id: "c3" })); r.cards.remove("c3"); });

// (2) An AI change: the item tool expands a dotted key (page_tools.js:429), replays the line on its own live root
// (:1118 try_line), appends it (:1119 write_line), and the dev server's tail sends the new bytes to every tab.
console.log(`── AI (item tool): item({path, delta: {"cards.c1": {"set": {"title": "Fix the tab bar on phones"}}}})`);
{
	const dotted = { "cards.c1": { set: { title: "Fix the tab bar on phones" } } };
	const line = {};   // expand_dots, as page_tools.js:429-439
	for (const [k, v] of Object.entries(dotted)){ const parts = k.split("."); let at = line; for (const p of parts.slice(0, -1)) at = at[p] ??= {}; at[parts.at(-1)] = v; }
	Board.replay(fs.readFileSync(FILE, "utf8").split("\n").filter(Boolean).map(l => JSON.parse(l))).replay_line(line);   // try_line: would it replay?
	fs.appendFileSync(FILE, J({ ...line, by: "agent", ts: new Date().toISOString() }) + "\n");
	console.log(`   line:      ${J(line)}   (+ by, ts)   ← names the list "cards"; the browser's writer never does (Store.js:289-290)`);
	const a = A.pull(), b = B.pull(); bytes = A.offset;
	console.log(`   tab A:     ${a.applied} applied → c1.title = "${c1.get("title")}"`);
	console.log(`   tab B:     ${b.applied} applied; B equals A: ${canon(A.root) === canon(B.root) ? "yes" : "NO"}`);
	check(c1.get("title") === "Fix the tab bar on phones" && canon(A.root) === canon(B.root), "an agent's line reaches every tab, and they agree");
}

// (3) A raw append by a hook (prompt-relay.mjs:74, ledger.mjs:47): no tool, no check, no by/ts unless the hook adds them.
console.log(`── Hook (raw append): half a line, then the rest`);
{
	const raw = J({ cards: { c2: { set: { owner: "hook" } } } });
	fs.appendFileSync(FILE, raw.slice(0, 20));
	const half = A.pull();
	console.log(`   after half a line: tab A got ${half.got} line(s) (the tail stops at the last "\\n", Tail.js:62)`);
	fs.appendFileSync(FILE, raw.slice(20) + "\n");
	const a = A.pull(), b = B.pull(); bytes = A.offset;
	console.log(`   after the rest:    tab A got ${a.got}, applied ${a.applied}; c2.owner = "${c2.get("owner")}"`);
	check(half.got === 0 && a.applied === 1 && canon(A.root) === canon(B.root), "a torn line waits; the whole line reaches every tab");
}

// A fresh load: code builds the structure, then the file replays (Store.read → replay_line → set).
console.log(`\n── A fresh tab replays the file from line 1`);
const C = open_tab("tab-C", FILE); C.pull();
console.log(`   ${fs.readFileSync(FILE, "utf8").split("\n").filter(Boolean).length} lines replayed`);
console.log(`   tree:      ${[...C.root.cards].map(c => `${c.id}[${[...c.notes].map(n => `${n.id}:"${n.get("text")}"`).join(",")}]`).join(" ")}`);
check(canon(C.root) === canon(A.root), "a fresh replay rebuilds a tree equal to the live one");
check(C.root.cards.find("c2").notes.find("n1")?.parent === C.root.cards.find("c2"), "the replayed item is adopted: n1.parent is c2");
check(!C.root.cards.find("c3"), "the removed card stays removed");

console.log(`\n${failures ? "FAIL" : "PASS"} — the delta path, both ways (${failures} failed check${failures === 1 ? "" : "s"})`);
const part1_failures = failures;

// ══ PART 2: the known breaks, re-proved ═══════════════════════════════════════════════════════
console.log("\nPART 2 — where the path breaks today (each should print \"still true\")\n");
let still = 0, stale = 0;
const known = (id, claim, holds, detail = "") => { holds ? still++ : stale++; console.log(`${holds ? "still true" : "STALE     "}  ${id}  ${claim}${detail ? "\n            " + detail : ""}`); };
// Record what a root's store would write, without a file.
// Serialized at once, as a line on disk is (flush stringifies a microtask later, so the real file holds the item as it is THEN).
const record = root => { const lines = []; root.on("delta", (l, o) => lines.push(JSON.parse(J(Item.Store.prototype.line_for(l, o, root))))); return lines; };

// B1: a nested List on a bare Item is not made on demand, so its lines replay as plain data.
{
	const root = new Item({ id: "r" }); root.cards = new List({ owner: root, name: "cards" });
	const lines = record(root);
	const card = root.cards.add({ id: "c1" }); card.notes = new List({ owner: card, name: "notes" }); card.notes.add({ id: "n1" });
	const back = new Item({ id: "r" }); back.cards = new List({ owner: back, name: "cards" }); lines.forEach(l => back.set(l));
	const bc = back.cards.find("c1");
	known("B1", "a List made by code on a click-made Item is not rebuilt on replay", !bc.notes && J(bc.data.notes) === J({ add: { id: "n1", after: null } }),
		`lines ${J(lines)} → replayed c1.notes = ${bc.notes}, c1.data.notes = ${J(bc.data.notes)}`);
}

// B2: the writer drops the list's name, so two lists holding the same id misroute on replay.
{
	const root = new Item({ id: "r" }); root.a = new List({ owner: root, name: "a" }); root.b = new List({ owner: root, name: "b" });
	root.a.insert({ id: "s1", title: "sentence" }); root.b.insert({ id: "s1", title: "card" });
	const lines = record(root); root.b.find("s1").set("title", "card edited");
	const back = new Item({ id: "r" }); back.a = new List({ owner: back, name: "a" }); back.b = new List({ owner: back, name: "b" });
	back.a.insert({ id: "s1", title: "sentence" }); back.b.insert({ id: "s1", title: "card" }); lines.forEach(l => back.set(l));
	known("B2", "a member's line has no list name, so it lands on the first list with that id", back.a.find("s1").get("title") === "card edited",
		`line ${J(lines[0])} → replayed a.s1 = "${back.a.find("s1").get("title")}", b.s1 = "${back.b.find("s1").get("title")}"`);
}

// B3: set(prop, item) writes a snapshot of the item but does not adopt it; replay gives a plain object.
{
	const root = new Item({ id: "r" }); const lines = record(root);
	const kid = new Item({ id: "k" }); root.set("kid", kid);
	const back = new Item({ id: "r" }); lines.forEach(l => back.set(l));
	const later = lines.length; kid.set("title", "x");
	known("B3", "set(\"kid\", item) only snapshots: no parent, no later lines, a plain object on replay",
		!kid.parent && lines.length === later && !(back.get("kid") instanceof Item),
		`line ${J(lines[0])}; kid.parent = ${kid.parent}; kid.set() wrote ${lines.length - later} line(s); replayed kid is ${back.get("kid")?.constructor?.name}`);
}

// B4: an Item held in a property with its parent set by hand writes its change FLAT onto the parent.
{
	const root = new Item({ id: "r" }); const kid = new Item({ id: "k" }); root.kid = kid; kid.parent = root;
	const lines = record(root); kid.set("title", "kid title");
	const back = new Item({ id: "r" }); lines.forEach(l => back.set(l));
	known("B4", "a property-held child's change is written as the parent's own field (hops only knows lists, Store.js:286-292)",
		J(lines[0]) === J({ set: { title: "kid title" } }) && back.get("title") === "kid title", `line ${J(lines[0])} → replay sets the ROOT's title`);
}

// B5: by/ts on a plain Item root become data.
{
	const root = new Item({ id: "r" }); root.replay_line({ set: { title: "t" }, by: "agent", ts: "2026-10-28T00:00:00Z" });
	known("B5", "a plain Item keeps the line's by/ts as data (only Session and Task strip them)", root.data.by === "agent" && !!root.data.ts,
		`root.data = ${J(root.data)}`);
}

// Pages. A page's store is a PageLogReader (core/Page/Reader.js); line 1 built the page, so attach skips it.
const page_tab = (Kind = Page) => {
	const file = path.join(TMP, `page-${Math.random().toString(36).slice(2, 8)}.jsonl`);
	fs.writeFileSync(file, J({ title: "Demo page" }) + "\n");
	const page = new Kind({ title: "Demo page", url: "/demo/" });
	const store = new DiskPageStore({ url: "/demo/page.jsonl", file, by: "tab" });
	store.entries = [{ title: "Demo page" }]; store.attach(page);
	const written = () => fs.readFileSync(file, "utf8").split("\n").filter(Boolean).slice(1).map(l => (({ by, ts, ...b }) => b)(JSON.parse(l)));
	const replay = () => Page.replay(fs.readFileSync(file, "utf8").split("\n").filter(Boolean).map(l => JSON.parse(l)));
	return { page, store, file, written, replay };
};

// Pages: what a page writes and what it keeps quiet (a check, not a break).
{
	const t = page_tab();
	t.page.content.fill(() => "drawn by the page's code");                 // code content: a transient PageCode, never written
	t.store.read([{ file: "kid/page.jsonl" }]);                             // a line Subpages.js:42 writes when a child page is created
	await tick(); const quiet = t.written().length;
	t.page.content.add({ id: "note1", text: "added from the UI" });         // a content part from the UI: loud
	await tick();
	const back = t.replay();
	console.log(`page       code content and a {"file"} line wrote ${quiet} line(s); the {"file"} line made pages = [${[...t.page.pages].map(p => p.id + (p.stub ? " (stub)" : ""))}]`);
	console.log(`           content.add wrote ${J(t.written())}; replayed content = [${[...back.content].map(x => x.id)}]`);
	check(quiet === 0 && t.written().length === 1 && back.content.find("note1"), "pages: code content and child links are quiet; a UI content part is one line and replays");
}

// B7: page.pages verbs write a line that does not replay (Page.get has no "pages" route; lists() calls it "_pages").
{
	const t = page_tab();
	t.page.pages.add({ id: "kid", name: "kid" }); await tick();
	const back = t.replay();
	known("B7", "page.pages.add writes {\"pages\":{\"add\"}} but replay stores it as data, not a child page",
		t.written().length === 1 && back.pages.length === 0 && !!back.data.pages,
		`line ${J(t.written()[0])} → replayed pages.length = ${back.pages.length}, data.pages = ${J(back.data.pages)}; lists() keys: ${Object.keys(t.page.lists())}`);
}

// B6: on a Page, the two-argument set("x", v) throws (Page.set takes one object, Page.class.js:74); the object form
// set({x: item}) / set({pages: list}) writes one snapshot line each and links nothing.
{
	const t = page_tab();
	let threw = null; try { t.page.set("x", new Item({ id: "k0" })); } catch (e){ threw = e.message; }
	const list = new List(); list.insert({ id: "p1" });
	const kid = new Item({ id: "k" });
	t.page.set({ x: kid }); t.page.set({ pages: list }); await tick();
	const before = t.written().length; kid.set("title", "changed"); await tick();
	const back = t.replay();
	known("B6", "page.set(\"x\", v) throws; page.set({x: item}) and page.set({pages: list}) snapshot and link nothing",
		!!threw && !kid.parent && t.page.data.pages === list && t.written().length === before && !(back.data.x instanceof Item) && back.pages.length === 0,
		`two-arg form: "${threw}"; lines ${J(t.written())}; kid.parent = ${kid.parent}; a later kid.set wrote ${t.written().length - before}; replayed x is ${back.data.x?.constructor?.name ?? typeof back.data.x}, replayed pages.length = ${back.pages.length}`);
}

// B8: a child page's changes never reach its parent's file (Page.bubbles() is false, Page.class.js:68).
{
	const t = page_tab();
	const child = new Page({ title: "Kid", name: "kid" }); t.page.pages.insert(child);
	child.set({ title: "Kid, renamed" }); await tick();
	known("B8", "a child page with no store of its own: its change is not written anywhere", t.written().length === 0 && child.parent === t.page,
		`child.parent is the page: ${child.parent === t.page}; lines in the parent's file: ${t.written().length}`);
}

// B9: PageLogReader.attach skips the Store.muted check, so act() on a page writes the set lines AND the verb.
{
	class Renamer extends Page { rename(to){ this.set({ title: to }); } }
	const t = page_tab(Renamer);
	t.page.act("rename", "Renamed"); await tick();
	const w = t.written();
	known("B9", "page.act(verb) records both the verb and the set lines it made (Reader.js:33-36 has no Store.muted check)",
		w.length === 2, `lines ${J(w)} (Item.Store would write only {"rename":…}, Store.js:129)`);
}

// B10: the Panel collision that an on-demand `items` would spread: Panel keeps a per-cell data word named
// `items` (ext/Panel/persist.js:61-63) beside its own member List named `items` (Panel.js:22).
{
	const { Panel } = await load("ext/Panel/Panel.js");
	const p = new Panel({ id: "p1" }); p.add(new Panel({ id: "k1" }));
	const lines = record(p);
	const saved = p.get("items") ?? {};
	p.set("items", { ...saved, k1: { align: "center" } });                  // what set_item(p, "k1", "align", "center") does
	known("B10", "on a Panel, get(\"items\") is the member List, so a per-cell word is written onto the child panel instead",
		saved === p.items && p.data.items === undefined && J(lines[0]) === J({ k1: { set: { align: "center" } } }),
		`set_item wrote ${J(lines[0])} (the child's own "align" field) and data.items = ${p.data.items}`);
}

console.log(`\n${still} known break(s) still true, ${stale} stale.`);
console.log(`\n${failures ? "FAIL" : "PASS"} — ${part1_failures ? "the delta path failed" : "the delta path round-trips"}${failures > part1_failures ? "; a page check failed" : ""}`);
fs.rmSync(TMP, { recursive: true, force: true });
process.exitCode = failures ? 1 : 0;
