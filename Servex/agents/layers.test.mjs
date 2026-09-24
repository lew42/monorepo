/* node Servex/agents/layers.test.mjs — Layers.js against a fake servex: fake
 * cards, fake agents that record spawn/send/stop, a fake mcp and router, and a
 * state file in a scratch dir. No Claude session is started. */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import Layers from "./Layers.js";

let checks = 0;
const check = (name, fn) => { fn(); checks++; };

const dir = fs.mkdtempSync(path.join(os.tmpdir(), "layers-"));
const file = path.join(dir, "layers.json");

// ── fakes ────────────────────────────────────────────────────────────────
const logs = new Map();                       // card id -> lines
const listeners = [];
const cards = {
	canonical: id => (logs.has(id) ? id : null),
	transcript: id => (logs.get(id) ?? []).map(l => JSON.stringify(l)).join("\n"),
	append(id, line){ logs.get(id).push(line); },
	on(fn){ listeners.push(fn); return () => {}; },
	make(id){ logs.set(id, [{ class: "/framework/ai2/card.js", id, title: id }]); }
};
const prompt = (card, text) => {
	const p = { id: "p-" + Math.random().toString(36).slice(2), text, raw: text, on: card };
	logs.get(card).push({ prompt: p });
	for (const fn of listeners) fn(card, { prompt: p }, { fresh: true });
};

const calls = [];
let sid = 0;
const agents = {
	live: new Map(),
	spawn(spec){
		calls.push({ verb: "spawn", spec });
		const agent = { id: spec.id, model: spec.model, state: "working", session_id: spec.resume ?? `sess-${++sid}`, context: 50000 };
		agents.live.set(spec.id, agent);
		return agent;
	},
	send(id, text, note){ calls.push({ verb: "send", id, text, note }); },
	stop(id){ calls.push({ verb: "stop", id }); agents.live.get(id).state = "stopped"; }
};
const tools = new Map();
const mcp = { tool(def){ tools.set(def.name, def); } };
const routes = new Map();
const router = { get(p, ...h){ routes.set("GET " + p, h.at(-1)); }, post(p, ...h){ routes.set("POST " + p, h.at(-1)); }, options(){} };

const logged = [];
const log = { append: (name, e) => (logged.push({ name, ...e }), Promise.resolve()) };
const servex = { cards, agents, mcp, log, dashboard: { router } };
const gone = new Set();                       // session ids whose file was deleted
const layers = new Layers({ servex, file, idle_ms: 1000, system(){ return "SYSTEM"; }, watch(){},
	session_exists: slot => !gone.has(slot.session_id) }).install();
const spawns = () => calls.filter(c => c.verb === "spawn");
const call = (name, args, caller) => tools.get(name).handler(args, { caller }).then(JSON.parse);

const A = "2026/09/24/fix-the-sidebar", B = "2026/09/24/new-logo", A_SUB = A + "/wider";
cards.make(A); cards.make(B); cards.make(A_SUB);

// ── checks ───────────────────────────────────────────────────────────────
check("two cards -> two assistants", () => {
	prompt(A, "make the sidebar wider");
	prompt(B, "a new logo please");
	assert.equal(spawns().length, 2);
	assert.equal(spawns()[0].spec.id, "assistant-fix-the-sidebar");
	assert.equal(spawns()[1].spec.id, "assistant-new-logo");
	assert.equal(spawns()[0].spec.urgent, true);
	assert.match(spawns()[0].spec.prompt, /make the sidebar wider[\s\S]*Answer them\.$/);
	assert.equal(spawns()[0].spec.system, "SYSTEM");
});

check("first spawn is not also sent the prompt", () => assert.equal(calls.filter(c => c.verb === "send").length, 0));

check("session id recorded in the state file", () => {
	const saved = JSON.parse(fs.readFileSync(file, "utf8"));
	assert.equal(saved.cards[A].assistant.session_id, "sess-1");
	assert.equal(saved.cards[A].manager.id, "manager-fix-the-sidebar");
});

check("second prompt on the same card -> send, not spawn", () => {
	agents.live.get("assistant-fix-the-sidebar").state = "idle";
	prompt(A, "and darker");
	assert.equal(spawns().length, 2);
	const send = calls.at(-1);
	assert.deepEqual([send.verb, send.id, send.text, send.note.from, send.note.reply_to], ["send", "assistant-fix-the-sidebar", "and darker", "owner", `card ${A}`]);
});

check("a prompt on a sub-card reaches the root card's assistant", () => {
	prompt(A_SUB, "wider still");
	assert.equal(calls.at(-1).id, "assistant-fix-the-sidebar");
	assert.match(calls.at(-1).text, /on 2026\/09\/24\/fix-the-sidebar\/wider/);
});

check("idle past the limit -> stop", () => {
	agents.live.get("assistant-new-logo").state = "idle";
	layers.sweep(Date.now() + 5000);
	assert.ok(calls.some(c => c.verb === "stop" && c.id === "assistant-fix-the-sidebar"));
	assert.equal(JSON.parse(fs.readFileSync(file, "utf8")).cards[A].assistant.session_id, "sess-1");
});

check("new prompt after stop -> spawn with resume, same id, then send", () => {
	prompt(A, "back again");
	const s = spawns().at(-1).spec;
	assert.deepEqual([s.id, s.resume, s.prompt], ["assistant-fix-the-sidebar", "sess-1", undefined]);
	assert.equal(calls.at(-1).verb, "send");
	assert.equal(calls.at(-1).text, "back again");
});

let manager_calls;
await (async () => {
	const before = spawns().length;
	const first = await call("ask_manager", { card: A_SUB, text: "widen it to 320px" }, "assistant-fix-the-sidebar");
	agents.live.get("manager-fix-the-sidebar").state = "idle";
	const second = await call("ask_manager", { card: A, text: "and the footer" }, "assistant-fix-the-sidebar");
	manager_calls = { before, first, second };
})();

check("ask_manager twice -> one spawn then one send, same manager", () => {
	const { before, first, second } = manager_calls;
	assert.equal(spawns().length, before + 1);
	const s = spawns().at(-1).spec;
	assert.deepEqual([s.id, s.effort, s.parent, s.urgent], ["manager-fix-the-sidebar", "medium", "assistant-fix-the-sidebar", undefined]);
	assert.match(s.prompt, /^Load the `sub-mastermind` skill\. You are manager-fix-the-sidebar[\s\S]*widen it to 320px$/);
	assert.deepEqual([first.ok, first.manager, second.manager], [true, "manager-fix-the-sidebar", "manager-fix-the-sidebar"]);
	assert.equal(calls.at(-1).verb, "send");
	assert.match(calls.at(-1).text, /Request from assistant-fix-the-sidebar on 2026\/09\/24\/fix-the-sidebar: and the footer/);
});

check("assistant is not idle-stopped while its manager works", () => {
	agents.live.get("manager-fix-the-sidebar").state = "working";
	agents.live.get("assistant-fix-the-sidebar").state = "idle";
	const before = calls.length;
	layers.sweep(Date.now() + 60000);
	assert.ok(!calls.slice(before).some(c => c.verb === "stop" && c.id === "assistant-fix-the-sidebar"));
});

const refused = await call("card_set", { card: A, type: "task" }, "assistant-new-logo");
const allowed = await call("card_set", { card: A_SUB, type: "request", title: "Wider" }, "assistant-fix-the-sidebar");
check("card_set refused for another card's assistant, allowed on its own sub-card", () => {
	assert.equal(refused.ok, false);
	assert.equal(allowed.ok, true);
	assert.deepEqual(logs.get(A_SUB).slice(-2), [{ type: "request" }, { title: "Wider" }]);
});

check("recycle -> next spawn has no resume, starts from the last summary", () => {
	logs.get(A).push({ summary: { by: "x", text: "SUMMARY" } }, { message: { text: "after" } });
	layers.recycle("assistant-fix-the-sidebar");
	prompt(A, "fresh start");
	const s = spawns().at(-1).spec;
	assert.equal(s.resume, undefined);
	assert.match(s.prompt, /^\{"summary"[\s\S]*fresh start/);
	assert.doesNotMatch(s.prompt, /make the sidebar wider/);
});

const summary = await call("card_summary", { text: "we chose 320px" }, "manager-fix-the-sidebar");
check("card_summary appends and recycles once the turn ends", () => {
	assert.equal(summary.ok, true);
	assert.deepEqual(logs.get(A).at(-1), { summary: { by: "manager-fix-the-sidebar", text: "we chose 320px" } });
	agents.live.get("manager-fix-the-sidebar").state = "idle";
	layers.sweep();
	assert.equal(layers.state.cards[A].manager.session_id, null);
});

check("compact sends the compact order, priority next", () => {
	agents.live.get("assistant-new-logo").state = "idle";
	layers.compact("assistant-new-logo");
	assert.deepEqual([calls.at(-1).id, calls.at(-1).note.priority], ["assistant-new-logo", "next"]);
	assert.match(calls.at(-1).text, /^Compact now: call card_summary/);
});

check("/api/card-agents shape", () => {
	let body;
	routes.get("GET /api/card-agents")({ query: { card: A_SUB } }, { json: b => { body = b; } });
	assert.equal(body.length, 2);
	assert.deepEqual(Object.keys(body[0]), ["id", "role", "state", "model", "session_id", "context", "window", "pct"]);
	assert.deepEqual([body[0].id, body[0].role, body[0].window, body[0].pct], ["assistant-fix-the-sidebar", "assistant", 200000, 25]);
	assert.equal(body[1].role, "manager");
	let out;
	routes.get("POST /api/agent/:id/recycle")({ params: { id: "nobody" } }, { status(){ return this; }, json: b => { out = b; } });
	assert.equal(out.ok, false);
});

check("a name taken by another card gets -2", () => {
	const C = "2026/09/25/new-logo";
	cards.make(C);
	prompt(C, "another logo");
	assert.equal(spawns().at(-1).spec.id, "assistant-new-logo-2");
});

const { default: Dispatcher } = await import("./Dispatcher.js");
const posted = [];
const dispatcher = new Dispatcher({ servex: { ...servex, layers, log: { append: (name, e) => (posted.push(e), Promise.resolve()) } } });
await dispatcher.dispatch({ id: "t-1", card: B, brief: "draw three logos" });
check("Dispatcher hands a carded task to the card's manager", () => {
	assert.equal(spawns().at(-1).spec.id, "manager-new-logo");
	assert.match(spawns().at(-1).spec.prompt, /Request from dispatcher on 2026\/09\/24\/new-logo \(task t-1\): draw three logos$/);
	assert.deepEqual(posted.at(-1), { type: "task", id: "t-1", state: "working", now: "handed to manager-new-logo", by: "dispatcher" });
});

check("a deleted session -> logged, and the same id starts fresh from the card's log", () => {
	const id = "assistant-fix-the-sidebar", before = spawns().length;
	gone.add(agents.live.get(id).session_id);
	agents.live.get(id).state = "stopped";
	prompt(A, "still there?");
	const s = spawns().at(-1).spec;
	assert.equal(spawns().length, before + 1);
	assert.deepEqual([s.id, s.resume], [id, undefined]);
	assert.match(s.prompt, /still there\?[\s\S]*Answer them\.$/);
	assert.notEqual(calls.at(-1).verb, "send");
	assert.equal(logged.at(-1).event, "session-missing");
	assert.equal(logged.at(-1).id, id);
});

/* THE SPAWN GATE (Servex.admission()) returns a stand-in for a held spawn: no id,
 * no session, no `.send`, its state only through `card()`. A second Layers on a
 * gated fake: every spawn is held until the test fires `admitted`. */
check("a manager held at the spawn gate: one spawn, a queued answer, and every word delivered on admitted", () => {
	const held = [], sent = [], handlers = [];
	const REASON = "3 agents are running, the ceiling is 3";
	const gated = {
		live: new Map(),
		spawn(spec){ held.push(spec); return { id: null, queued: true, spec, card: () => ({ id: null, state: "queued", queued: true, position: held.length, reason: REASON }) }; },
		send(id, text, note){ sent.push({ id, text, note }); },
		wake(id){ throw new Error(`the real wake was reached for ${id}`); },
		stop(){}
	};
	const servex2 = { cards, agents: gated, mcp: { tool(){} }, log, dashboard: { router }, on(ev, fn){ if (ev === "admitted") handlers.push(fn); } };
	const L = new Layers({ servex: servex2, file: path.join(dir, "gated.json"), idle_ms: 1000, system(){ return "SYSTEM"; }, watch(){},
		session_exists: () => true }).install();
	const C = "2026/09/24/gate-card", M = "manager-gate-card";
	cards.make(C);

	assert.deepEqual(L.ask_manager({ card: C, text: "count the lines", from: "assistant-gate-card" }),
		{ ok: true, manager: M, state: "queued", reason: REASON });
	assert.equal(L.ask_manager({ card: C, text: "and the words", from: "assistant-gate-card" }).state, "queued");
	assert.equal(held.length, 1, "a second ask while held never spawns again");
	assert.match(held[0].prompt, /count the lines/, "the first request rides in the fresh spec's prompt");
	assert.ok(logged.some(e => e.event === "queued" && e.id === M && e.reason === REASON), "the hold is logged");

	// send_to_agent while held: Agents.send -> wake -> our door, never the real wake
	const door = gated.wake(M);
	assert.equal(door.card().state, "queued");
	door.send("from the assistant", { from: "assistant-gate-card" });
	assert.equal(sent.length, 0, "nothing is sent to a stand-in");

	const real = { id: M, state: "working", session_id: "sess-real" };
	gated.live.set(M, real);
	for (const h of handlers) h({ ...held[0] }, real);
	assert.equal(sent.length, 0, "a different spec object, even an equal one, is not ours");
	for (const h of handlers) h(held[0], real);
	assert.deepEqual(sent.map(s => s.text), [`Request from assistant-gate-card on ${C}: and the words`, "from the assistant"]);
	assert.equal(L.pending.size, 0);
	assert.equal(real.layers_fresh, true);
});

fs.rmSync(dir, { recursive: true, force: true });
console.log(`layers: ${checks} checks passed`);
