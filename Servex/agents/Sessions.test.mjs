/* node Servex/agents/Sessions.test.mjs — Sessions.js against a scratch repo and a fake
 * agent host (no Claude session is started). Covers the one-dictation merge-3 additions:
 *   item 1: nav() carries a card, and leaves a note for the fast assistant
 *   item 2: pause() start/end, phase validated
 *   item 3: a refinement's path/card come from the ORIGINAL owner line, not the session's
 *           current location — card_at() walks the file's own nav lines
 *   item 4: recent_project() — every session of a project, any page or card
 *   item 6: say()'s `selection` is kept on the line and prefixed onto what the assistants hear
 * Everything else Sessions.js already did (say/floor/react/dir_log/…) is unchanged and not
 * re-proven here. */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import Sessions, { PAUSE_PHASES } from "./Sessions.js";

let checks = 0;
const check = (name, fn) => { fn(); checks++; };

// ── a scratch repo: just enough real folders for page_path()/is_dir() to find ──────────
const repo = fs.mkdtempSync(path.join(os.tmpdir(), "sessions-test-"));
for (const dir of ["public/a", "public/b", "public/framework/ai/2026/09/30/demo-card"])
	fs.mkdirSync(path.join(repo, dir), { recursive: true });
// A real card needs its own page.jsonl — card_home() refuses anything without one.
fs.writeFileSync(path.join(repo, "public/framework/ai/2026/09/30/demo-card/page.jsonl"), "");

// ── a fake agent host: spawn/send recorded, nothing real started ───────────────────────
const sent = [];   // {role, text}
const agents = {
	live: new Map(),
	spawn(spec){
		const id = spec.id ?? `${spec.role}-${spec.name}`;
		const agent = { id, state: "working", session_id: null };
		agents.live.set(id, agent);
		return agent;
	},
	send(id, text){ sent.push({ id, text }); },
	stop(id){ agents.live.get(id).state = "stopped"; },
};

// Each test gets its OWN sessions.json (the public/ fixture dirs are read-only and shared) —
// otherwise one test's sessions would still be sitting in `map` when the next test's `load()`
// reads the same file back in, and a `create()` within the hour would silently RESUME them.
let n = 0;
function make(){
	const s = new Sessions({ repo, file: path.join(repo, `sessions-${++n}.json`) });
	s.load();
	s.servex = { agents };
	return s;
}

const last_sent = role => sent.filter(c => c.id.startsWith(`session-${role}`)).at(-1)?.text;
const lines = file => fs.readFileSync(file, "utf8").split("\n").filter(Boolean).map(l => JSON.parse(l));

// ── item 1: nav carries the card, and notes the fast assistant ─────────────────────────
check("nav() writes the card onto the line, and leaves a note for fast", () => {
	const s = make();
	const made = s.create({ path: "/a/" });
	s.nav({ session: made.session, from: "/a/", to: "/b/", card: "2026/09/30/demo-card" });
	const nav_line = lines(path.join(repo, "public", made.file.replace(/^\//, ""))).find(l => l.nav)?.nav;
	assert.equal(nav_line.to, "/b/");
	assert.equal(nav_line.card, "2026/09/30/demo-card");
	assert.match(s.map[made.session].notes.fast[0], /demo-card/);
});

check("nav() omits `card` when none was selected", () => {
	const s = make();
	const made = s.create({ path: "/a/" });
	s.nav({ session: made.session, from: "/a/", to: "/b/" });
	const nav_line = lines(path.join(repo, "public", made.file.replace(/^\//, ""))).find(l => l.nav)?.nav;
	assert.equal("card" in nav_line, false);
});

// ── item 2: pause start/end ─────────────────────────────────────────────────────────────
check("pause() writes phase, invisible (no `chat` key)", () => {
	const s = make();
	const made = s.create({ path: "/a/" });
	s.pause({ session: made.session, phase: "start" });
	s.pause({ session: made.session, phase: "end" });
	const phases = lines(path.join(repo, "public", made.file.replace(/^\//, ""))).filter(l => l.pause).map(l => l.pause.phase);
	assert.deepEqual(phases, ["start", "end"]);
});

check("pause() refuses a phase that isn't start/end", () => {
	const s = make();
	const made = s.create({ path: "/a/" });
	assert.throws(() => s.pause({ session: made.session, phase: "sideways" }), /start or end/);
	assert.deepEqual(PAUSE_PHASES, ["start", "end"]);
});

// ── item 6: selection stored on the line and prefixed to the assistants ────────────────
check("say()'s selection is kept on the chat line and prefixed to the fast assistant", () => {
	const s = make();
	const made = s.create({ path: "/a/" });
	const selection = { kind: "p", label: "this paragraph", text: "hello", selector: "main p" };
	s.say({ session: made.session, path: "/a/", text: "why this one?", via: "text", selection });
	const chat = lines(path.join(repo, "public", made.file.replace(/^\//, ""))).find(l => l.chat)?.chat;
	assert.deepEqual(chat.selection, selection);
	assert.match(last_sent("fast"), /^\[Selected: this paragraph \(main p\)\] \[on \/a\/\] why this one\?$/);
});

check("say() with no selection prefixes nothing", () => {
	const s = make();
	const made = s.create({ path: "/a/" });
	s.say({ session: made.session, path: "/a/", text: "plain", via: "text" });
	assert.equal(last_sent("fast"), "[on /a/] plain");
});

// ── item 3: a refinement goes to the card/path selected AT THE TIME, not now ───────────
check("line() attributes a refinement to the ORIGINAL owner line's path and card", () => {
	const s = make();
	const made = s.create({ path: "/a/" });
	const session = made.session;

	const at1 = s.say({ session, path: "/a/", text: "first thought", via: "text" }).at;
	s.nav({ session, from: "/a/", to: "/b/", card: "card-one" });
	const at2 = s.say({ session, path: "/b/", text: "second thought", via: "text" }).at;
	// The owner (or the reader) moves on AGAIN, to a third card, AFTER both thoughts were
	// said — a slow smart assistant must not let this leak backwards onto either refinement.
	s.nav({ session, from: "/b/", to: "/a/", card: "card-two" });
	assert.equal(s.map[session].path, "/a/", "the session's CURRENT location moved on");

	const r1 = s.line({ session, text: "refined one", re: at1, level: "clean" });
	const r2 = s.line({ session, text: "refined two", re: at2, level: "clean" });
	const written = lines(path.join(repo, "public", made.file.replace(/^\//, ""))).filter(l => l.chat?.level);

	const line1 = written.find(l => l.chat.at === r1.at).chat;
	const line2 = written.find(l => l.chat.at === r2.at).chat;
	assert.equal(line1.path, "/a/", "refinement 1 keeps the path the first thought was said on");
	assert.equal("card" in line1, false, "no card had been selected yet when the first thought was said");
	assert.equal(line2.path, "/b/", "refinement 2 keeps the path the second thought was said on");
	assert.equal(line2.card, "card-one", "refinement 2 gets the card selected THEN, not card-two (selected after)");
});

check("line() on a CARD SESSION always attributes its own card — nothing to look up", () => {
	const s = make();
	const made = s.create({ path: "/a/", card: "2026/09/30/demo-card" });
	const at1 = s.say({ session: made.session, path: "/a/", text: "hello", via: "text" }).at;
	const r = s.line({ session: made.session, text: "refined", re: at1, level: "edit" });
	const line = lines(path.join(repo, "public", made.file.replace(/^\//, ""))).find(l => l.chat?.at === r.at).chat;
	assert.equal(line.card, "2026/09/30/demo-card");
});

check("line() copies a refined line into its card's page.jsonl, the same object; an unrefined one stays out", () => {
	const s = make();
	const appended = [];
	s.servex = { agents, cards: { append: (id, obj) => { appended.push({ id, obj }); return Promise.resolve({ ok: true }); } } };
	const made = s.create({ path: "/a/" });
	const at1 = s.say({ session: made.session, path: "/a/", text: "hello", via: "text" }).at;
	s.nav({ session: made.session, from: "/a/", to: "/a/", card: "card-x" });
	const at2 = s.say({ session: made.session, path: "/a/", text: "on the card", via: "text" }).at;
	s.line({ session: made.session, text: "refined, no card", re: at1, level: "clean" });
	const r = s.line({ session: made.session, text: "refined on card", re: at2, level: "summary" });
	s.line({ session: made.session, text: "a plain smart reply" });
	assert.equal(appended.length, 1, "only the refined line said on a card is copied");
	assert.equal(appended[0].id, "card-x");
	const written = lines(path.join(repo, "public", made.file.replace(/^\//, ""))).find(l => l.chat?.at === r.at).chat;
	assert.deepEqual(appended[0].obj, { chat: written }, "the card gets the very same line");
});

// ── the 'para' marker (one-dictation, merge 9): a fast reply starting "(new paragraph)" ──
check("heard() writes a para marker when the fast reply starts '(new paragraph)', re = the thought's own owner line", () => {
	const s = make();
	const made = s.create({ path: "/a/" });
	const at1 = s.say({ session: made.session, path: "/a/", text: "first sentence", via: "text" }).at;
	const fast_id = s.map[made.session].fast;
	s.heard({ type: "result", text: "(new paragraph)" }, { id: fast_id });
	const written = lines(path.join(repo, "public", made.file.replace(/^\//, "")));
	const para = written.find(l => l.para)?.para;
	assert.ok(para, "a para line was written");
	assert.equal(para.re, at1);
	assert.ok(written.some(l => l.skip), "the now-empty remainder is logged as skipped, not drawn as a bubble");
	assert.equal(written.some(l => l.chat?.from?.kind === "assistant"), false, "no chat bubble from this fast turn");
});

check("heard() writes no para marker for an ordinary fast reply with no marker", () => {
	const s = make();
	const made = s.create({ path: "/a/" });
	s.say({ session: made.session, path: "/a/", text: "hi", via: "text" });
	const fast_id = s.map[made.session].fast;
	s.heard({ type: "result", text: "(listening)" }, { id: fast_id });
	const written = lines(path.join(repo, "public", made.file.replace(/^\//, "")));
	assert.equal(written.some(l => l.para), false);
});

check("a para marker's re is the FIRST owner line of a held voice thought, not the last", () => {
	const s = make();
	const made = s.create({ path: "/a/" });
	const at1 = s.say({ session: made.session, path: "/a/", text: "one", via: "voice", floor: "speaking" }).at;
	s.say({ session: made.session, path: "/a/", text: "two", via: "voice", floor: "speaking" });
	s.say({ session: made.session, path: "/a/", text: "three", via: "voice", floor: "done" });   // releases the held thought at once
	const fast_id = s.map[made.session].fast;
	s.heard({ type: "result", text: "(new paragraph)" }, { id: fast_id });
	const written = lines(path.join(repo, "public", made.file.replace(/^\//, "")));
	const para = written.filter(l => l.para).pop()?.para;
	assert.equal(para.re, at1);
});

// ── item 4: recent_project — every session of a project, any page or card ─────────────
check("recent_project() lists every session of one project, newest first, across folders", () => {
	const s = make();
	const a = s.create({ path: "/a/", host: "siteA.localhost" });
	const b = s.create({ path: "/b/", host: "siteA.localhost" });
	s.create({ path: "/a/", host: "siteB.localhost" });   // a different project: must not show up
	s.map[b.session].last_at = new Date(Date.now() + 1000).toISOString();   // b spoke more recently
	// `project_of()` lowercases the host, so this asks the same way a real caller would: by
	// HOST, not by guessing the exact casing `project_of()` settles on.
	const rows = s.recent_project({ host: "siteA.localhost" });
	assert.deepEqual(rows.map(r => r.session), [b.session, a.session]);
});

console.log(`Sessions.test.mjs: ${checks} checks passed`);
