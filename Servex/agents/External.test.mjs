/* node Servex/agents/External.test.mjs — External.js against a fake `cards`, `mcp`
 * and `log`, but the REAL `Agents` host with a scratch registry dir, so this proves
 * the actual `Agents.send()` hook (this file's one line in someone else's file), not
 * a re-implementation of it. No Claude session is started. */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

let checks = 0;
const check = (name, fn) => { fn(); checks++; };

const dir = fs.mkdtempSync(path.join(os.tmpdir(), "external-test-"));
process.env.SERVEX_HOME = dir;   // home.js's place() reads this — the inbox lands under the scratch dir, never the real machine's
// ⚠ set BEFORE these two imports, and both must be DYNAMIC (`await import`) to honour that order:
// a top-of-file `import` is hoisted ahead of every other statement in this file, so a plain static
// import of Agents.js here would load home.js — and freeze its module-level `HOME` constant at the
// REAL machine's Servex home — before the line above ever ran. Caught 2026-09-28: the first version
// of this test wrote real lines into the LIVE Servex's `logs/inbox/`, cleaned up by hand afterward.
const { Agents } = await import("./Agents.js");
const { default: External } = await import("./External.js");

const agents = new Agents({ registry_dir: path.join(dir, "registry") });

// ── fakes: only what External.js actually calls ───────────────────────────
const CARDS = new Map();          // card id -> {by, id}
const listeners = [];
const cards = {
	on(fn){ listeners.push(fn); return () => {}; },
	canonical: id => (CARDS.has(id) ? id : null),
	async fold(id){ return CARDS.get(id) ?? null; }
};
const make_card = (id, by) => CARDS.set(id, { by, id });
const say = (card, text, extra = {}) => {
	const prompt = { id: "p-" + Math.random().toString(36).slice(2), text, on: card, ...extra };
	for (const fn of listeners) fn(card, { prompt }, { fresh: extra.fresh ?? true });
};

const tools = new Map();
const mcp = { tool(def){ tools.set(def.name, def); } };
const logged = [];
const log = { append: (name, e) => (logged.push({ name, ...e }), Promise.resolve()) };

const servex = { agents, cards, mcp, log };
const external = new External({ servex }).install();
const call = (name, args) => tools.get(name).handler(args, {});
const tick = () => new Promise(r => setTimeout(r, 20));   // let a fire-and-forget route() finish
const lines_of = id => fs.readFileSync(external.file(id), "utf8").trim().split("\n").filter(Boolean).map(l => JSON.parse(l));

// ── register ────────────────────────────────────────────────────────────
check("register_session is on the door and returns the row", () => {
	const out = JSON.parse(call("register_session", { id: "vscode-x", session_id: "sess-abc" }));
	assert.equal(out.id, "vscode-x");
	assert.equal(out.kind, "external");
	assert.equal(out.session_id, "sess-abc");
	assert.ok(out.registered_at);
});

check("register_session refuses with no id or no session_id", () => {
	assert.throws(() => external.register({ session_id: "s" }), /needs an `id`/);
	assert.throws(() => external.register({ id: "x" }), /needs `session_id`/);
});

check("list_agents sees it — the SAME registry row Agents.js reads for every real agent", () => {
	const row = agents.registry_list().find(r => r.id === "vscode-x");
	assert.ok(row, "vscode-x is listed");
	assert.equal(row.kind, "external");
	assert.equal(row.state, "external");
});

// ── deliver, through the real send() path ──────────────────────────────
check("Agents.send() to a registered external id delivers to its inbox instead of throwing", () => {
	const before = Date.now() - 1000;
	const out = agents.send("vscode-x", "hello from a sibling agent", { from: "mastermind-servex", reply_to: "log agent-host" });
	assert.equal(out.card().kind, "external");
	const lines = lines_of("vscode-x");
	assert.equal(lines.length, 1);
	assert.equal(lines[0].text, "hello from a sibling agent");
	assert.equal(lines[0].from, "mastermind-servex");
	assert.equal(lines[0].reply_to, "log agent-host");
	assert.ok(Date.parse(lines[0].at) >= before, "timestamped, and recent");
});

check("an id nobody registered still goes through wake() and throws, unchanged", () => {
	assert.throws(() => agents.send("nobody-here", "hi"), /No agent "nobody-here"/);
});

// ── card to creator ─────────────────────────────────────────────────────
await (async () => {
	make_card("2026/09/28/from-a-tab", "vscode-x");
	say("2026/09/28/from-a-tab", "build the thing we talked about");
	await tick();
})();
check("a fresh owner prompt on a card an external id created reaches its inbox", () => {
	const lines = lines_of("vscode-x");
	assert.equal(lines.length, 2);
	assert.equal(lines[1].text, "build the thing we talked about");
	assert.equal(lines[1].from, "owner");
	assert.equal(lines[1].reply_to, "card 2026/09/28/from-a-tab");
});

await (async () => {
	make_card("2026/09/28/not-a-tab", "assistant-something");
	say("2026/09/28/not-a-tab", "whatever");
	await tick();
})();
check("a card created by an id that never registered is silently skipped, not thrown", () => {
	assert.equal(lines_of("vscode-x").length, 2, "no new line landed anywhere for it");
	assert.throws(() => fs.readFileSync(external.file("assistant-something"), "utf8"), /ENOENT/);
});

await (async () => {
	say("2026/09/28/from-a-tab", "a cleaned-up reading of the same words", { fresh: false });
	await tick();
})();
check("a non-fresh prompt (a merge, not a new one) is not forwarded again", () => {
	assert.equal(lines_of("vscode-x").length, 2);
});

check("a card line with no `prompt` key is ignored outright", () => {
	for (const fn of listeners) fn("2026/09/28/from-a-tab", { message: { text: "not a prompt" } }, {});
	assert.equal(lines_of("vscode-x").length, 2);
});

fs.rmSync(dir, { recursive: true, force: true });
delete process.env.SERVEX_HOME;
console.log(`external: ${checks} checks passed`);
