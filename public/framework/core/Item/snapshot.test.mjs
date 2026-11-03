// Snapshots: an item loads from its last state plus the tail of its log, not from line 1.
//   node public/framework/core/Item/snapshot.test.mjs
// What a snapshot is, where it lives and why: core/Item/doc/snapshots.md. Short version: `task.snapshot.json` beside `task.jsonl`
// holds the item's saved shape (toJSON) and how much of the log it covers (lines and bytes). Item.open reads it, asks for only the
// bytes after that, and replays those. A snapshot that no longer matches the log (the log was rewritten) is ignored with a warning.
//
// Real parts: real files in a temp dir, a real HTTP server that answers byte-range requests (the way a static host does), the
// real Item.open / Item.Store / Task / List, and the real script (Server/Snapshots.mjs). Nothing is mocked. The dev server's
// socket tail (the browser, on localhost) cannot run in node; that half is checked in a real browser (see doc/snapshots.md).
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import http from "node:http";
import crypto from "node:crypto";
import { register } from "node:module";
import { test } from "../Test/Test.js";

register("../../../../Servex/agents/site-hooks.mjs", import.meta.url);
// A fixed clock: a replayed task stamps `ran_since` and friends from the wall clock, and two replays a millisecond apart must be equal.
const FIXED = Date.parse("2026-10-30T12:00:00Z"), RealDate = Date;
globalThis.Date = class extends RealDate { constructor(...a){ a.length ? super(...a) : super(FIXED); } static now(){ return FIXED; } };

const { default: Item } = await import("./Item.js");
const { default: List } = await import("../List/List.js");
const { default: Task } = await import("../Task/Task.js");
const Snapshots = (await import("../../../../Server/Snapshots.mjs").catch(() => ({}))).default;

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), "snapshot-"));
const J = x => JSON.stringify(x);
const text_of = lines => lines.map(J).join("\n") + "\n";
const sha = file => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const quiet = async fn => { const w = console.warn, said = []; console.warn = (...a) => said.push(a.join(" ")); try { return { value: await fn(), said }; } finally { console.warn = w; } };

// A static host in miniature: files from a folder, 404 for a missing one, and `Range: bytes=a-b` answered with a 206.
// `hits` remembers every request, so a test can say how many bytes of the log a load really asked for.
function serve(dir){
	const hits = [];
	const server = http.createServer((req, res) => {
		const file = path.join(dir, decodeURIComponent(req.url.split("?")[0]));
		if (!fs.existsSync(file)){ hits.push({ url: req.url, status: 404 }); res.statusCode = 404; return res.end("no"); }
		const all = fs.readFileSync(file), m = /^bytes=(\d+)-(\d*)$/.exec(req.headers.range ?? "");
		if (!m){ hits.push({ url: req.url, status: 200, sent: all.length }); return res.end(all); }
		const from = +m[1], to = m[2] === "" ? all.length - 1 : Math.min(+m[2], all.length - 1);
		if (from >= all.length){ hits.push({ url: req.url, status: 416, range: req.headers.range }); res.statusCode = 416; return res.end(); }
		const part = all.subarray(from, to + 1);
		hits.push({ url: req.url, status: 206, range: req.headers.range, sent: part.length });
		res.statusCode = 206;
		res.setHeader("Content-Range", `bytes ${from}-${to}/${all.length}`);
		res.end(part);
	});
	server.unref();   // a test that throws before close() must not keep node alive
	return new Promise(resolve => server.listen(0, "127.0.0.1", () => resolve({ hits, url: name => `http://127.0.0.1:${server.address().port}/${name}`, close: () => server.close() })));
}

// A folder per test (Item.Store keeps one Store per url, so no two tests may share a url).
let n = 0;
const folder = async () => { const dir = path.join(TMP, "t" + ++n); fs.mkdirSync(dir); return { dir, ...(await serve(dir)) }; };

// What must be equal: the saved shape, and each item's class and state (the part only a live object has).
const shape = root => {
	const out = [];
	root.walk(item => out.push([item.constructor.name, item.id, item.get_one("state") ?? null, item._last_ts ?? null]));
	return J([root.toJSON(), out]);
};

class Table extends Item {
	static runs = 0;                       // how many times the hook ran, in this whole process
	constructor(...args){ super(...args); this.rows = new List({ owner: this, name: "rows" }); }
	set_qty(value){ Table.runs++; this.put("qty", value); this.doubled = value * 2; }   // a hook (D17) with a cache beside the data
	sort_by(key){
		return this.as_call("sort_by", [key], () => {
			this.rows.order([...this.rows].sort((a, b) => String(a.get(key)).localeCompare(String(b.get(key)))).map(row => row.id));
			this.set({ sorted_by: key });
		});
	}
}
Item.register(Table, "Table");

// ---- 1. snapshot + tail equals the full replay: a Task with children, a #id line ----
const ledger_head = [
	{ assign: { slug: "ledger", title: "Ledger", at: "2026-10-01T09:00:00Z" } },
	{ tasks: { add: { id: "a", title: "first" } }, ts: "2026-10-01T09:01:00Z" },
	{ tasks: { add: { id: "b", title: "second" } }, ts: "2026-10-01T09:02:00Z" },
	{ start: {}, ts: "2026-10-01T09:03:00Z" },
	{ tasks: { "#a": { set: { title: "first, renamed" } } }, ts: "2026-10-01T09:04:00Z" },
];
const ledger_tail = [
	{ tasks: { "#b": { set: { title: "second, renamed" } } }, ts: "2026-10-01T09:05:00Z" },
	{ tasks: { add: { id: "c", title: "third" } }, ts: "2026-10-01T09:06:00Z" },
	{ tasks: { "#c": { set: { title: "third, renamed" } } }, ts: "2026-10-01T09:07:00Z" },
	{ set: { note: "after the snapshot" }, ts: "2026-10-01T09:08:00Z" },
];

test.node("a Task opened from its snapshot plus the tail equals a full replay, and asks only for the tail", async t => {
	t.ok(typeof Snapshots?.run === "function", "Server/Snapshots.mjs exists and has run()");
	const { dir, url, hits, close } = await folder();
	const log = path.join(dir, "task.jsonl");
	fs.writeFileSync(log, text_of(ledger_head));
	const made = await Snapshots.run({ paths: [log], write: true, log: () => {} });
	t.ok(made[0]?.wrote, "the script wrote a snapshot: " + J(made[0]));
	t.ok(fs.existsSync(path.join(dir, "task.snapshot.json")), "task.snapshot.json sits beside task.jsonl");
	fs.appendFileSync(log, text_of(ledger_tail));
	const size = fs.statSync(log).size;

	hits.length = 0;
	const opened = await Item.open(url("task.jsonl"));
	const full = Task.replay([...ledger_head, ...ledger_tail]);
	t.eq(shape(opened), shape(full), "snapshot + tail gives the state a full replay gives");
	t.eq(opened.tasks.find("c")?.get("title"), "third, renamed", "a child added in the tail is there");
	t.eq(opened.get("note"), "after the snapshot", "and a field set in the tail");
	t.eq(opened.store.snapshot?.lines, ledger_head.length, "the store started from the snapshot (it covers the head's lines)");

	const log_hits = hits.filter(h => h.url.includes("task.jsonl"));
	t.ok(log_hits.length > 0 && log_hits.every(h => h.status === 206), "the log was only ever asked for by byte range: " + J(log_hits));
	t.ok(log_hits.every(h => h.sent < size / 2 + 200), "and a lot less than the whole log came back (" + log_hits.map(h => h.sent) + " of " + size + " bytes)");
	close();
});

// ---- 1b. the same, for an Item with a list, a set_<key> hook and an as_call line ----
const table_head = [
	{ type: "Table", id: "table" },
	{ rows: { add: { id: "r1", title: "pear" } } },
	{ rows: { add: { id: "r2", title: "apple" } } },
	{ rows: { add: { id: "r3", title: "fig" } } },
	...[1, 2, 3, 4, 5].map(qty => ({ qty })),
	{ rows: { "#r2": { set: { title: "apricot" } } } },
	{ "sort_by()": "title" },
];
const table_tail = [
	{ rows: { add: { id: "r4", title: "banana" } } },
	{ "sort_by()": "title" },
	{ qty: 6 },
];

test.node("an Item with a list, a hook and an as_call line: same state, and each hook runs once per key from a snapshot", async t => {
	const { dir, url, close } = await folder();
	const log = path.join(dir, "table.jsonl");
	fs.writeFileSync(log, text_of(table_head));
	const made = await Snapshots.run({ paths: [log], write: true, log: () => {} });
	t.ok(made[0]?.wrote, "the script wrote a snapshot: " + J(made[0]));
	fs.appendFileSync(log, text_of(table_tail));

	Table.runs = 0;
	const full = Table.replay([...table_head, ...table_tail]);
	const full_runs = Table.runs;
	Table.runs = 0;
	const opened = await Item.open(url("table.jsonl"));
	const snap_runs = Table.runs;
	t.eq(shape(opened), shape(full), "snapshot + tail equals the full replay (rows, their order, the sorted_by field)");
	t.eq([...opened.rows].map(r => r.id), [...full.rows].map(r => r.id), "the rows are in the replayed order");
	t.eq(opened.doubled, 12, "the hook's cache is right (qty 6, doubled)");
	t.eq(full_runs, 6, "a full replay runs set_qty once per qty line (6)");
	t.eq(snap_runs, 2, "from a snapshot it runs once for the saved value, and once for the one qty line in the tail");
	close();
});

// ---- 2. a stale snapshot is ignored with a warning ----
test.node("a snapshot whose log was rewritten before its offset is ignored with a warning", async t => {
	const { dir, url, close } = await folder();
	const log = path.join(dir, "task.jsonl");
	fs.writeFileSync(log, text_of(ledger_head));
	await Snapshots.run({ paths: [log], write: true, log: () => {} });
	// The log is rewritten: an early line is different and longer, so the old offset now lands somewhere else in the file.
	const rewritten = [ledger_head[0], { tasks: { add: { id: "a", title: "a much longer first title than before" } } }, ...ledger_head.slice(2), ...ledger_tail];
	fs.writeFileSync(log, text_of(rewritten));

	const { value: opened, said } = await quiet(() => Item.open(url("task.jsonl")));
	t.eq(shape(opened), shape(Task.replay(rewritten)), "the item is what a full replay of the rewritten log gives");
	t.ok(said.some(s => /snapshot/i.test(s) && /task\.snapshot\.json|task\.jsonl/.test(s)), "and a warning names the snapshot: " + J(said));
	close();
});

test.optional("edge: a log cut shorter than the snapshot's offset is stale too", async t => {
	const { dir, url, close } = await folder();
	const log = path.join(dir, "task.jsonl");
	fs.writeFileSync(log, text_of(ledger_head));
	await Snapshots.run({ paths: [log], write: true, log: () => {} });
	fs.writeFileSync(log, text_of(ledger_head.slice(0, 2)));
	const { value: opened, said } = await quiet(() => Item.open(url("task.jsonl")));
	t.eq(shape(opened), shape(Task.replay(ledger_head.slice(0, 2))), "a shorter log replays in full");
	t.ok(said.some(s => /snapshot/i.test(s)), "with a warning: " + J(said));
	close();
});

// ---- 3. no snapshot: loads as before ----
test.node("a log with no snapshot loads as it always did: one plain request, no byte range", async t => {
	const { dir, url, hits, close } = await folder();
	fs.writeFileSync(path.join(dir, "task.jsonl"), text_of([...ledger_head, ...ledger_tail]));
	const opened = await Item.open(url("task.jsonl"));
	t.eq(shape(opened), shape(Task.replay([...ledger_head, ...ledger_tail])), "equals a full replay");
	const log_hits = hits.filter(h => h.url.includes("task.jsonl") && !h.url.includes("snapshot"));
	t.ok(log_hits.length === 1 && log_hits[0].status === 200 && !log_hits[0].range, "the log was fetched whole, once: " + J(log_hits));
	close();
});

// ---- 4. the script's dry run writes nothing; a real run never touches the log ----
test.node("the script's dry run writes nothing, and writing a snapshot leaves the log byte for byte as it was", async t => {
	const { dir, close } = await folder();
	const log = path.join(dir, "task.jsonl");
	fs.writeFileSync(log, text_of(ledger_head));
	const before = sha(log);

	const said = [];
	const dry = await Snapshots.run({ paths: [dir], log: line => said.push(line) });
	t.eq(fs.readdirSync(dir).sort(), ["task.jsonl"], "after a dry run the folder holds only the log");
	t.ok(dry[0]?.ok && !dry[0].wrote, "the dry run says it would write: " + J(dry[0]));
	t.ok(said.some(l => /dry run/i.test(l)), "and the printed report says it was a dry run: " + J(said));

	const real = await Snapshots.run({ paths: [dir], write: true, log: () => {} });
	t.ok(real[0]?.wrote, "a real run writes");
	t.eq(sha(log), before, "the log is byte for byte the same");
	const sidecar = JSON.parse(fs.readFileSync(path.join(dir, "task.snapshot.json"), "utf8"));
	t.eq([sidecar.lines, sidecar.bytes], [ledger_head.length, fs.statSync(log).size], "the snapshot says it covers every line and every byte");
	close();
});

test.optional("edge: the script refuses a log with an unreadable line in the middle, and a page.jsonl", async t => {
	const { dir, close } = await folder();
	const log = path.join(dir, "task.jsonl");
	fs.writeFileSync(log, J(ledger_head[0]) + "\n{ this line is torn\n" + text_of(ledger_head.slice(1)));
	const bad = await Snapshots.run({ paths: [log], write: true, log: () => {} });
	t.ok(!bad[0].ok && /unreadable|torn|parse/i.test(bad[0].why) && !fs.existsSync(path.join(dir, "task.snapshot.json")), "a torn middle line: refused, nothing written: " + J(bad[0]));
	const page = path.join(dir, "page.jsonl");
	fs.writeFileSync(page, text_of([{ title: "A page" }]));
	const refused = await Snapshots.run({ paths: [page], write: true, log: () => {} });
	t.ok(!refused[0].ok && /page/i.test(refused[0].why), "a page.jsonl: refused (it loads through Page.Reader): " + J(refused[0]));
	close();
});

// ---- 5. review finding 6: an Item held in a data slot must still be an Item after a snapshot ----
// (review.md, item-mvp: a full replay turns {"box": {type, id, data}} into an adopted child Item; restore() kept it as plain data.)
const { default: Snapshot } = await import("./Snapshot.js");
const slot_head = [{ id: "root", title: "r" }, { box: { type: "Item", id: "k", data: { x: 1 } } }];
const covering = (lines, bytes = 10) => ({ log: "a.jsonl", lines, bytes, covered_end: new Uint8Array([1, 2, 3]), made_at: "x" });

test.node("an Item held in a data slot is still an Item (same id, same parent) when restored from a snapshot, and a later line reaches it", async t => {
	const full = Item.replay(slot_head);
	t.ok(full.get_one("box") instanceof Item, "(a full replay makes the slot an Item)");
	const snap = Snapshot.of(full, covering(2));
	const later = [{ box: { x: 2 } }];
	const a = Item.replay([...slot_head, ...later]);
	const b = Item.replay(later, snap);
	const box = b.get_one("box");
	t.ok(box instanceof Item, "from a snapshot the slot is an Item too, not a plain object");
	t.eq([box?.id, box?.parent === b, box?._slot], ["k", true, "box"], "with its id, its parent and its slot name");
	t.eq(b.get_one("box")?.get_one("x"), 2, "and the later line wrote into it (x is 2), instead of replacing it");
	t.eq(J(b.toJSON()), J(a.toJSON()), "the saved shape equals the full replay's");
});

test.node("the proof compares slot Items too: a restore that turns a slot into plain data makes the script refuse the log", async t => {
	// A class whose restore has the review's bug on purpose: after the normal restore, every slot Item becomes the plain object it saves as.
	class Leaky extends Item {
		restore(state, memory){
			super.restore(state, memory);
			for (const key of Object.keys(this.data)) if (this.data[key] instanceof Item) this.data[key] = JSON.parse(J(this.data[key]));
			return this;
		}
	}
	Item.register(Leaky, "Leaky");
	// Two lines only: nothing after the cut points writes into the slot, so only a probe of the slot itself can see the loss.
	const entries = [{ type: "Leaky", id: "root" }, { box: { type: "Item", id: "k", data: { x: 1 } } }];
	const bad = Snapshots.prove(entries, { log: "leaky.jsonl", lines: 2, bytes: 10, covered: new Uint8Array([1, 2, 3]), made_at: "x" });
	t.ok(bad.why && /different item/.test(bad.why), "the proof refuses it: " + J(bad));
	const good = Snapshots.prove([{ type: "Item", id: "root" }, entries[1]], { log: "ok.jsonl", lines: 2, bytes: 10, covered: new Uint8Array([1, 2, 3]), made_at: "x" });
	t.ok(good.snapshot && !good.why, "and passes the same log on a class that restores properly: " + J(good.why));
});

// ---- 6. review finding 7: a snapshot is only good for the replay code that made it ----
const bump = [{ type: "Versioned", id: "v" }, { n: 1 }, { n: 2 }];

test.node("a snapshot made by other replay code is ignored by a reader, and the script rewrites it instead of saying 'current'", async t => {
	class Versioned extends Item { replay_line(line){ return super.replay_line(line); } }
	Item.register(Versioned, "Versioned");
	const { dir, url, close } = await folder();
	const log = path.join(dir, "versioned.jsonl");
	fs.writeFileSync(log, text_of(bump));
	const run = async () => (await Snapshots.run({ paths: [log], write: true, log: () => {} }))[0];

	t.ok((await run()).wrote, "the first run writes a snapshot");
	const again = await run();
	t.ok(again.current && !again.wrote, "the same log and the same code: current, nothing written: " + J(again));
	t.ok(typeof JSON.parse(fs.readFileSync(path.join(dir, "versioned.snapshot.json"), "utf8")).code === "string", "the snapshot file records a code version");

	// The class is changed (any edit to its source counts): the same name now names different replay code.
	class Versioned2 extends Item { replay_line(line){ return this.set(line.n === undefined ? line : { n: line.n * 10 }); } }
	Item.register(Versioned2, "Versioned");
	const after = await run();
	t.ok(after.wrote && !after.current, "after the class changed the script re-proves and rewrites: " + J(after));

	// A reader holding the new code must not trust a sidecar written for other code.
	const sidecar = path.join(dir, "versioned.snapshot.json");
	const file = JSON.parse(fs.readFileSync(sidecar, "utf8"));
	file.code = "made-by-older-code";
	file.state.data.n = 999;   // visibly wrong, so a reader that trusted the file would show it
	fs.writeFileSync(sidecar, J(file));
	fs.appendFileSync(log, text_of([{ m: 1 }]));
	const { value: opened, said } = await quiet(() => Item.open(url("versioned.jsonl")));
	t.eq([opened.get_one("n"), opened.get_one("m")], [20, 1], "a snapshot with another code version is ignored: the whole log replays (n is 2 x 10, not the doctored 999)");
	t.ok(said.some(s => /snapshot/i.test(s) && /code|version|replay/i.test(s)), "with a warning that says why: " + J(said));
	close();
});
