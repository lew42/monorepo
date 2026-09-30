/* node Servex/agents/layers.test.mjs — Layers.js against a fake servex: fake
 * cards, fake agents that record spawn/send/stop, a fake mcp and router, and a
 * state file in a scratch dir. No Claude session is started. */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import Layers from "./Layers.js";

process.env.SERVEX_PROMPT_QUIET_MS = "0";     // the checks below expect each prompt at once; the pause is proven by pause-proof.mjs in the servex-mastermind task

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
		const agent = { id: spec.id, model: spec.model, state: "working", session_id: spec.resume ?? `sess-${++sid}`, context: 5000, turns: 0 };
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

/* A fake Sessions (the ext/Session pair): just enough of its public shape —
 * `map`, `project`, `project_of`, `resume_ms`, `resume`, `create`, `say` — for
 * Layers' `session_for` helper to drive without starting a real Claude session.
 * Shared by every fake servex below: it is plain state, not filesystem-bound,
 * so the same fake proves both the card path (item 3) and the page path (item 2). */
const session_calls = [];                      // every say(): {session, path, text, via}
const sessions_map = {};
let ssid = 0;
const fake_sessions = {
	map: sessions_map,
	project_of(){ return "proj"; },
	project(s){ return s.project ?? "proj"; },
	resume_ms: 3600000,
	resume({ session }){
		const s = sessions_map[session];
		return { ok: true, session: s.id, home: s.home, file: s.file, resumed: true };
	},
	create({ path, card } = {}){
		const id = "vsess-" + (++ssid);
		const s = { id, home: card ? `/framework/ai/${card}/` : path, file: `${(card ? `/framework/ai/${card}/` : path)}ai/${id}.jsonl`,
			project: "proj", at: new Date().toISOString(), last_at: new Date().toISOString() };
		sessions_map[id] = s;
		return { ok: true, session: id, home: s.home, file: s.file, resumed: false };
	},
	say({ session, path, text, via }){
		const s = sessions_map[session];
		if (s) s.last_at = new Date().toISOString();
		session_calls.push({ session, path, text, via });
		return { ok: true, at: new Date().toISOString(), answered_by: [] };
	}
};

const logged = [];
const log = { append: (name, e) => (logged.push({ name, ...e }), Promise.resolve()) };
const servex = { cards, agents, mcp, log, dashboard: { router }, sessions: fake_sessions };
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
	// no longer anchored at `^`: a fresh manager's prompt now opens with its readme chain first (readme-chain.js).
	assert.match(s.prompt, /Load the `sub-mastermind` skill\. You are manager-fix-the-sidebar[\s\S]*widen it to 320px$/);
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

const pid = (card, text) => logs.get(card).find(l => l.prompt?.text === text).prompt.id;
const P1 = pid(A, "make the sidebar wider"), P2 = pid(A, "and darker");
const amend = (card, args, caller = "assistant-fix-the-sidebar") => call("amend_bubble", { card, ...args }, caller);
const good = await amend(A, { of: [P1, P2], sections: [{ text: "Make the sidebar wider", from: [P1] }, { text: "And darker.", from: [P2] }, { text: "## Sidebar" }] });
const short = await amend(A, { of: [P1], sections: [{ text: "wide", from: [P1] }] });
const wrong = await amend(A, { of: [P1], sections: [{ text: "Make the sidebar wider", from: [P1] }] }, "assistant-new-logo");
const unknown = await amend(A, { of: ["p-nope"], sections: [{ text: "x" }] });
const outside = await amend(A, { of: [P1], sections: [{ text: "And darker.", from: [P2] }] });
check("amend_bubble: accepted appends one refined line", () => {
	assert.equal(good.ok, true);
	const line = logs.get(A).at(-1);
	assert.deepEqual([line.type, line.of, line.by, line.text], ["refined", [P1, P2], "assistant-fix-the-sidebar", "Make the sidebar wider\n\nAnd darker.\n\n## Sidebar"]);
});
check("amend_bubble: refuses too short, wrong card, unknown id, from outside of", () => {
	const len = logs.get(A).length;
	assert.deepEqual([short.ok, wrong.ok, unknown.ok, outside.ok], [false, false, false, false]);
	assert.match(short.error, /shorter than 60%/);
	assert.match(wrong.error, /own card/);
	assert.match(unknown.error, /not a prompt id/);
	assert.match(outside.error, /not in `of`/);
	assert.equal(logs.get(A).length, len);
});

check("recycle -> next spawn has no resume, starts from the last summary", () => {
	logs.get(A).push({ summary: { by: "x", text: "SUMMARY" } }, { message: { text: "after" } });
	layers.recycle("assistant-fix-the-sidebar");
	prompt(A, "fresh start");
	const s = spawns().at(-1).spec;
	assert.equal(s.resume, undefined);
	// no longer anchored at `^`: same readme-chain prefix as above.
	assert.match(s.prompt, /\{"summary"[\s\S]*fresh start/);
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
	assert.deepEqual([body[0].id, body[0].role, body[0].window, body[0].pct], ["assistant-fix-the-sidebar", "assistant", 200000, 3]);
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

/* ONE-DICTATION (2026-09-30): the owner's own words on a card now feed the
 * global session pair, not assistant-<card>. Every other route into a card
 * (an agent's own prompt, a manager's) still reaches the old assistant. */
const owner_prompt = (card, text) => {
	const p = { id: "p-" + Math.random().toString(36).slice(2), text, raw: text, on: card, by: "owner" };
	logs.get(card).push({ prompt: p });
	for (const fn of listeners) fn(card, { prompt: p }, { fresh: true });
};
const agent_prompt = (card, text, by) => {
	const p = { id: "p-" + Math.random().toString(36).slice(2), text, raw: text, on: card, by };
	logs.get(card).push({ prompt: p });
	for (const fn of listeners) fn(card, { prompt: p }, { fresh: true });
};

const CARD_OWNER = "2026/09/26/dictation-owner";
cards.make(CARD_OWNER);
const before_owner_spawns = spawns().length, before_owner_sends = calls.filter(c => c.verb === "send").length;
owner_prompt(CARD_OWNER, "let's fix the header next");
check("an owner's prompt on a card feeds the global session, not assistant-<card>: nothing is spawned or sent to it", () => {
	assert.equal(spawns().length, before_owner_spawns, "no new assistant for the card");
	assert.equal(calls.filter(c => c.verb === "send").length, before_owner_sends, "the old assistant is never sent to either");
	const sent = session_calls.at(-1);
	assert.equal(sent.path, `/framework/ai2/${CARD_OWNER}/`);
	assert.equal(sent.via, "text");
	assert.match(sent.text, /let's fix the header next$/);
});

const second_owner_send = session_calls.length;
owner_prompt(CARD_OWNER, "and blue");
check("a second owner prompt on the same card reuses the same global session (one per project)", () => {
	assert.equal(session_calls.length, second_owner_send + 1);
	assert.equal(session_calls.at(-1).session, session_calls.at(-2).session);
});

const before_agent_spawns = spawns().length;
agent_prompt("2026/09/24/new-logo", "a tweak from the assistant itself", "assistant-new-logo");
check("a prompt from an agent (by != owner) still reaches assistant-<card>, unchanged", () => {
	assert.equal(spawns().length, before_agent_spawns, "assistant-new-logo already exists: send, not spawn");
	const send = calls.at(-1);
	assert.deepEqual([send.verb, send.id, send.text], ["send", "assistant-new-logo", "a tweak from the assistant itself"]);
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
	const miss = logged.findLast(e => e.event === "session-missing");
	assert.equal(miss?.id, id);
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

/* PAGE PAIRS AND THE LIFECYCLE (recursive-pairs, 2026-09-28): a third Layers on
 * a scratch repo with two real page dirs, a fresh fake agent host, and the
 * lifecycle numbers shrunk so one sweep crosses them. */
const repo = path.join(dir, "repo");
fs.mkdirSync(path.join(repo, "public/framework/ux/Dictate"), { recursive: true });
fs.mkdirSync(path.join(repo, "public/notes"), { recursive: true });
const pcalls = [];
let psid = 0;
const pagents = {
	live: new Map(),
	spawn(spec){
		pcalls.push({ verb: "spawn", spec });
		const agent = { id: spec.id, model: spec.model, state: "working", session_id: spec.resume ?? `psess-${++psid}`, context: 5000, turns: 0 };
		pagents.live.set(spec.id, agent);
		return agent;
	},
	send(id, text, note){ pcalls.push({ verb: "send", id, text, note }); },
	stop(id){ pcalls.push({ verb: "stop", id }); pagents.live.get(id).state = "stopped"; }
};
const ptools = new Map(), proutes = new Map();
/* A fake Global: `master()` is the ONE root assistant, on the architect tier. */
const pglobal = { starts: 0, master(){
	const live = pagents.live.get("master-assistant");
	if (live && live.state !== "stopped") return live;
	this.starts++;
	const a = { id: "master-assistant", model: "claude-opus-5-5", state: "idle", session_id: "master-sess", context: 8000, turns: 0 };
	pagents.live.set(a.id, a);
	return a;
} };
const pservex = { cards, agents: pagents, log, global: pglobal, mcp: { tool(def){ ptools.set(def.name, def); } }, sessions: fake_sessions,
	dashboard: { router: { get(p, ...h){ proutes.set("GET " + p, h.at(-1)); }, post(p, ...h){ proutes.set("POST " + p, h.at(-1)); }, options(){} } } };
const pfile = path.join(dir, "pages.json");
fs.writeFileSync(pfile, JSON.stringify({ cards: { "/": { parent: null, assistant: { id: "assistant-root", session_id: "stale", cwd: repo }, manager: { id: "manager-root", session_id: null, cwd: repo } }, [A]: { assistant: { id: "assistant-fix-the-sidebar", session_id: "old", cwd: repo }, manager: { id: "manager-fix-the-sidebar", session_id: null, cwd: repo } } } }));
const P = new Layers({ servex: pservex, file: pfile, repo, idle_ms: 1000, manager_idle_ms: 3000, max_assistants: 2,
	system(){ return "SYSTEM"; }, watch(){}, session_exists: () => true }).install();
const pspawns = () => pcalls.filter(c => c.verb === "spawn");
const pcall = (name, args, caller) => ptools.get(name).handler(args, { caller }).then(JSON.parse);
const chat = page => fs.readFileSync(path.join(repo, "public", page, "ai/chat.jsonl"), "utf8").trim().split("\n").map(l => JSON.parse(l));
const get_agents = page => { let b; proutes.get("GET /api/page-agents")({ query: { page } }, { json: x => { b = x; } }); return b; };
const DICT = "/framework/ux/Dictate/";
/* What page_ai used to do for a page's OWN assistant, in one step (persist the
 * prompt to the page's chat, then hand it to the listener): page_ai no longer
 * does this — it feeds the session pair instead (below) — but `heard()` and
 * everything it opens is left in place, so this drives it directly the same
 * way page_ai used to, to prove that engine itself still works. */
const drive = (page, text) => {
	const prompt = { id: "p-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), text, at: new Date().toISOString(), by: "owner" };
	P.append_chat(page, { prompt });
	return P.heard(page, prompt);
};

check("a pair for any page: ids from the last segment, root for /, each records its parent's manager", () => {
	const rec = P.record(DICT);
	assert.deepEqual([rec.assistant.id, rec.manager.id, rec.parent], ["assistant-dictate", "manager-dictate", "manager-ux"]);
	assert.equal(P.state.cards["/framework/ux/"].parent, "manager-framework");
	assert.equal(P.state.cards["/framework/"].parent, "manager-root");
	assert.deepEqual([P.state.cards["/"].assistant.id, P.state.cards["/"].manager.id, P.state.cards["/"].parent], ["master-assistant", "manager-root", null]);
	assert.equal(pspawns().length, 0, "recording a pair spawns nothing");
});

check("an existing card record keeps its ids and session, and gains parent manager-root", () => {
	const rec = P.record(A);
	assert.deepEqual([rec.assistant.id, rec.assistant.session_id, rec.parent], ["assistant-fix-the-sidebar", "old", "manager-root"]);
	assert.equal(P.context(`/framework/ai/${A_SUB}/`), A, "a card's own page is that card");
});

check("opening a page spawns nothing: /api/page-agents answers [] before the first send", () => {
	assert.deepEqual(get_agents("/notes/"), []);
	assert.equal(pspawns().length, 0);
});

check("POST /api/page-ai refuses a bad path, an empty text and a page that does not exist", () => {
	assert.equal(P.page_ai({ page: "../etc/", text: "x" }).status, 400);
	assert.equal(P.page_ai({ page: "/notes/../../x/", text: "x" }).status, 400);
	assert.equal(P.page_ai({ page: "/notes/", text: " " }).status, 400);
	assert.equal(P.page_ai({ page: "/no/such/page/", text: "hi" }).status, 404);
	assert.equal(pspawns().length, 0);
});

/* ONE-DICTATION (2026-09-30): POST /api/page-ai used to write into the page's own
 * chat and spawn that page's own assistant (the per-directory assistant the owner
 * asked to retire — "I don't want two user interfaces"). It now feeds the one
 * global session/project pair instead, the same fast/smart pair the ✦ sheet and
 * the drawer's AI tab already use. */
const ctx = [{ kind: "p", label: "this paragraph", text: "old wording", selector: "main p" }];
const sent = P.page_ai({ page: "/framework/ux/Dictate", text: "make the mic button bigger", context: ctx });
check("page_ai feeds the global session, folding selected elements into the text, and spawns no page assistant", () => {
	assert.deepEqual(Object.keys(sent).sort(), ["file", "ok", "page", "session"]);
	assert.deepEqual([sent.ok, sent.page], [true, DICT]);
	assert.equal(pspawns().length, 0, "page_ai itself spawns nothing");
	const said = session_calls.at(-1);
	assert.equal(said.session, sent.session);
	assert.equal(said.path, DICT);
	assert.equal(said.via, "text");
	assert.match(said.text, /^\[Selected: this paragraph \(main p\)\]\nold wording\n\nmake the mic button bigger$/);
});

const second = P.page_ai({ page: "/notes/", text: "and this one too" });
check("one global session per project: a second page_ai call, on a different page, reuses the same session", () => {
	assert.equal(second.session, sent.session);
	assert.equal(session_calls.at(-1).path, "/notes/");
});

/* The engine that USED to be reached through page_ai (open/spawn/resume/stale/
 * checkpoint/recycle, `heard()`) is left in place — nothing else in this suite
 * reaches it for a PAGE anymore, since page_ai was its only live caller and it now
 * always goes through the session pair instead. It is driven DIRECTLY below
 * (the `drive()` helper above, what `page_ai` used to do internally) to prove the
 * engine itself still works, the same way it still does for a CARD (the first
 * block of this file, whose non-owner prompts still reach assistant-<card>). */
const sent2 = drive(DICT, "make the mic button bigger");
check("heard() still opens a page's own assistant directly, lean, with page_reply", () => {
	const s = pspawns().at(-1).spec;
	assert.equal(s.id, "assistant-dictate");
	assert.match(s.prompt, /make the mic button bigger[\s\S]*page_reply\(\{page: "\/framework\/ux\/Dictate\/"[\s\S]*Answer them\.$/);
	assert.deepEqual(s.setting_sources, []);
	for (const t of ["take_worktree", "return_worktree", "list_claims", "page_reply"]) assert.ok(s.allowed_tools.includes(`mcp__servex__${t}`), t);
	assert.equal(s.model, "claude-sonnet-5");
	assert.equal(pcalls.filter(c => c.verb === "send").length, 0, "a fresh spawn is not also sent the prompt");
});

const reply = await pcall("page_reply", { page: DICT, text: "Bigger it is." }, "assistant-dictate");
const stray = await pcall("page_reply", { page: "/notes/", text: "hello" }, "assistant-dictate");
check("page_reply lands in the page's chat; another page is refused", () => {
	assert.equal(reply.ok, true);
	assert.deepEqual([chat(DICT).at(-1).message.by, chat(DICT).at(-1).message.text], ["assistant-dictate", "Bigger it is."]);
	assert.equal(stray.ok, false);
	assert.match(stray.error, /own card or page/);
});

check("/api/page-agents: the card-agents row shape for the page", () => {
	const rows = get_agents(DICT);
	assert.deepEqual(rows.map(r => [r.id, r.role, r.state]), [["assistant-dictate", "assistant", "working"], ["manager-dictate", "manager", "none"]]);
	assert.deepEqual(Object.keys(rows[0]), ["id", "role", "state", "model", "session_id", "context", "window", "pct"]);
});

drive("/", "what is running?");
check("one root assistant: heard() on / still reaches master-assistant (Global's, Opus); Layers spawns no assistant-root", () => {
	assert.equal(pglobal.starts, 1, "Global started it once");
	assert.ok(!pspawns().some(c => c.spec.id === "assistant-root" || c.spec.id === "master-assistant"), "Layers spawned neither");
	const to = pcalls.filter(c => c.verb === "send" && c.id === "master-assistant");
	assert.deepEqual([to.length, to[0].text, to[0].note.reply_to], [1, "what is running?", "page /"]);
	assert.equal(pagents.live.get("master-assistant").model, "claude-opus-5-5");
	assert.deepEqual(get_agents("/").map(r => [r.id, r.role]), [["master-assistant", "assistant"], ["manager-root", "manager"]]);
	assert.equal(P.recycle("master-assistant").ok, false, "its lifecycle is Global's");
});
drive("/", "and again");
check("a second heard() on / goes to the same master-assistant, not a new start", () => {
	assert.equal(pglobal.starts, 1);
	assert.equal(pcalls.filter(c => c.verb === "send" && c.id === "master-assistant").at(-1).text, "and again");
});
P.ask_manager({ card: "/", text: "look into it", from: "master-assistant" });
check("the root's manager is manager-root, its runtime parent master-assistant", () => {
	const m = pspawns().at(-1).spec;
	assert.deepEqual([m.id, m.parent], ["manager-root", "master-assistant"]);
	P.stop("manager-root");
});

const root_reply = await pcall("page_reply", { page: "/notes/", text: "from the root" }, "master-assistant");
check("the root assistant may reply anywhere", () => assert.equal(root_reply.ok, true));

check("at most max_assistants live: the least recently used idle one is stopped first", () => {
	pagents.live.get("assistant-dictate").state = "idle";
	pagents.live.get("master-assistant").state = "idle";
	P.touched.set("assistant-dictate", Date.now() - 5000);   // older
	P.touched.set("master-assistant", Date.now() - 9000);    // oldest, but not Layers' to count
	P.max_assistants = 1;                                     // Dictate alone fills it: the root does not count
	drive("/notes/", "a note");
	P.max_assistants = 2;
	assert.ok(pcalls.some(c => c.verb === "stop" && c.id === "assistant-dictate"));
	assert.ok(!pcalls.some(c => c.verb === "stop" && c.id === "master-assistant"), "the root assistant is Global's: never counted, never stopped here");
	assert.equal(pspawns().at(-1).spec.id, "assistant-notes");
});

check("resumed on next use when under 30k and used within the hour", () => {
	drive(DICT, "and blue");
	const s = pspawns().at(-1).spec;
	assert.deepEqual([s.id, s.resume, s.prompt], ["assistant-dictate", "psess-1", undefined]);
	assert.equal(pcalls.at(-1).verb, "send");
	assert.equal(pcalls.at(-1).text, "and blue");
	assert.equal(pcalls.at(-1).note.reply_to, `page ${DICT}`);
});

check("fresh on next use when last used over an hour ago: the page's log, not a resume", () => {
	P.stop("assistant-dictate");
	P.state.cards[DICT].assistant.used_at = new Date(Date.now() - 2 * 3600e3).toISOString();
	drive(DICT, "still there");
	const s = pspawns().at(-1).spec;
	assert.equal(s.resume, undefined);
	// no longer anchored at `^`: a fresh page assistant now opens with its readme chain first (readme-chain.js).
	assert.match(s.prompt, /Page \/framework\/ux\/Dictate\/ — its chat log[\s\S]*make the mic button bigger[\s\S]*still there/);
	assert.ok(logged.some(e => e.event === "fresh" && e.id === "assistant-dictate" && /minutes ago/.test(e.reason)));
});

check("fresh on next use when its context was 30k or more", () => {
	pagents.live.get("assistant-dictate").context = 31000;
	P.sync(DICT);
	P.stop("assistant-dictate");
	drive(DICT, "again");
	assert.equal(pspawns().at(-1).spec.resume, undefined);
	assert.ok(logged.some(e => e.event === "fresh" && /31000 tokens/.test(e.reason)));
});

check("idle: an assistant stops after its limit, a manager only after its own longer one", () => {
	P.ask_manager({ card: DICT, text: "do it", from: "assistant-dictate" });
	const m = pspawns().at(-1).spec;
	assert.deepEqual([m.id, m.parent], ["manager-dictate", "assistant-dictate"]);
	assert.match(m.prompt, /You are manager-dictate, the manager of page \/framework\/ux\/Dictate\/\. Your parent is manager-ux/);
	for (const id of ["assistant-dictate", "manager-dictate"]) pagents.live.get(id).state = "idle";
	const t = Date.now();
	P.touched.set("assistant-dictate", t); P.touched.set("manager-dictate", t);
	const before = pcalls.length;
	P.sweep(t + 1500);
	const stopped = pcalls.slice(before).filter(c => c.verb === "stop").map(c => c.id);
	assert.ok(stopped.includes("assistant-dictate") && !stopped.includes("manager-dictate"));
	P.sweep(t + 3500);
	assert.ok(pcalls.some(c => c.verb === "stop" && c.id === "manager-dictate"));
});

check("past the fresh line: one checkpoint request, then recycled once that turn ends, then fresh from the summary", () => {
	drive("/notes/", "long talk");
	const a = pagents.live.get("assistant-notes");
	a.state = "idle"; a.context = 45000; a.turns = 3;
	P.sweep();
	const ask = pcalls.at(-1);
	assert.deepEqual([ask.id, ask.note.priority], ["assistant-notes", "next"]);
	assert.match(ask.text, /^Checkpoint: your context is 45000 tokens/);
	const asks = pcalls.length;
	P.sweep();
	assert.equal(pcalls.length, asks, "asked once, not every sweep");
	assert.ok(P.state.cards["/notes/"].assistant.session_id, "not recycled before the checkpoint turn ends");
});
{
	const a = pagents.live.get("assistant-notes");
	await pcall("card_summary", { text: "CHECKPOINT: notes are about X" }, "assistant-notes");
	P.recycling.delete("assistant-notes");   // prove the turn count alone recycles it
	a.turns = 4; a.state = "idle";
	P.sweep();
	check("the checkpointed assistant is recycled and restarts fresh from its checkpoint line", () => {
		assert.equal(P.state.cards["/notes/"].assistant.session_id, null);
		assert.equal(chat("/notes/").at(-1).summary.text, "CHECKPOINT: notes are about X");
		drive("/notes/", "next thing");
		const s = pspawns().at(-1).spec;
		assert.equal(s.resume, undefined);
		// no longer anchored at `^`: the recycled assistant now opens with its readme chain first (readme-chain.js).
		assert.match(s.prompt, /\{"summary"[\s\S]*next thing/);
		assert.doesNotMatch(s.prompt, /long talk/);
	});
}

/* ONE-DICTATION (2026-09-30): page_ai no longer special-cases a card's own page —
 * every page_ai call now feeds the global session (proved above), and a card's
 * OWN page (`/framework/ai/<card>/`) is not one of the two real directories this
 * scratch repo has, so it 404s like any other missing page. The owner's words on
 * a card itself reach the session a different way now (item 3, the first block
 * of this file: `owner_prompt()` on the shared `cards` fake, never through
 * page_ai at all). */
check("page_ai on a card's own page is just a page path: 404 here, since this scratch repo never made that directory", () => {
	const before = logs.get(A).length;
	assert.equal(P.page_ai({ page: `/framework/ai/${A}/`, text: "via the drawer" }).status, 404);
	assert.equal(logs.get(A).length, before, "never written to the card");
});

{
	const { execFileSync } = await import("node:child_process");
	const alt = path.join(dir, "alt-layers.json");
	const out = execFileSync(process.execPath, ["--input-type=module", "-e",
		`import L from ${JSON.stringify(new URL("./Layers.js", import.meta.url).href)}; console.log(new L().file)`],
		{ env: { ...process.env, SERVEX_LAYERS_FILE: alt }, encoding: "utf8", windowsHide: true }).trim();
	check("SERVEX_LAYERS_FILE moves the state file", () => assert.equal(out, alt));
}

{
	const { ASSISTANT_TEXT } = await import("./Layers.js");
	const text = Layers.prototype.system.call({ servex: {} });
	check("one assistant text: Layers reads .claude/skills/every-prompt/page-assistant.md, and card-assistant.md is gone", () => {
		assert.match(ASSISTANT_TEXT.replace(/\\/g, "/"), /\.claude\/skills\/every-prompt\/page-assistant\.md$/);
		assert.ok(text.startsWith(fs.readFileSync(ASSISTANT_TEXT, "utf8")));
		assert.ok(!fs.existsSync(new URL("./card-assistant.md", import.meta.url)));
		assert.doesNotMatch(text, /no file-read tool|no general repo tools/);
	});
	check("the text names only tools the assistant has: every mcp tool it names is in its allowed list", () => {
		const s = P.spec("/notes/", "assistant");
		const card = P.spec(A, "assistant");
		const has = new Set([...s.allowed_tools, ...card.allowed_tools].map(t => t.replace("mcp__servex__", "")));
		const named = new Set([...fs.readFileSync(ASSISTANT_TEXT, "utf8").split("## If you are a VS Code tab")[0].matchAll(/`([a-z_]+)(?:\(|`)/g)].map(m => m[1])
			.filter(n => /_/.test(n) && !["page_path", "from_url"].includes(n)));
		for (const n of named) assert.ok(has.has(n), `page-assistant.md names ${n}, which no assistant has`);
	});
}

fs.rmSync(dir, { recursive: true, force: true });
console.log(`layers: ${checks} checks passed`);
