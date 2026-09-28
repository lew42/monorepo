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
const pservex = { cards, agents: pagents, log, mcp: { tool(def){ ptools.set(def.name, def); } },
	dashboard: { router: { get(p, ...h){ proutes.set("GET " + p, h.at(-1)); }, post(p, ...h){ proutes.set("POST " + p, h.at(-1)); }, options(){} } } };
const pfile = path.join(dir, "pages.json");
fs.writeFileSync(pfile, JSON.stringify({ cards: { [A]: { assistant: { id: "assistant-fix-the-sidebar", session_id: "old", cwd: repo }, manager: { id: "manager-fix-the-sidebar", session_id: null, cwd: repo } } } }));
const P = new Layers({ servex: pservex, file: pfile, repo, idle_ms: 1000, manager_idle_ms: 3000, max_assistants: 2,
	system(){ return "SYSTEM"; }, watch(){}, session_exists: () => true }).install();
const pspawns = () => pcalls.filter(c => c.verb === "spawn");
const pcall = (name, args, caller) => ptools.get(name).handler(args, { caller }).then(JSON.parse);
const chat = page => fs.readFileSync(path.join(repo, "public", page, "ai/chat.jsonl"), "utf8").trim().split("\n").map(l => JSON.parse(l));
const get_agents = page => { let b; proutes.get("GET /api/page-agents")({ query: { page } }, { json: x => { b = x; } }); return b; };
const DICT = "/framework/ux/Dictate/";

check("a pair for any page: ids from the last segment, root for /, each records its parent's manager", () => {
	const rec = P.record(DICT);
	assert.deepEqual([rec.assistant.id, rec.manager.id, rec.parent], ["assistant-dictate", "manager-dictate", "manager-ux"]);
	assert.equal(P.state.cards["/framework/ux/"].parent, "manager-framework");
	assert.equal(P.state.cards["/framework/"].parent, "manager-root");
	assert.deepEqual([P.state.cards["/"].assistant.id, P.state.cards["/"].manager.id, P.state.cards["/"].parent], ["assistant-root", "manager-root", null]);
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

const sent = P.page_ai({ page: "/framework/ux/Dictate", text: "make the mic button bigger", from: "owner" });
check("the first send on a plain page: the prompt lands in its chat and spawns its assistant, lean, with page_reply", () => {
	assert.deepEqual(sent, { ok: true, page: DICT, assistant: "assistant-dictate", manager: "manager-dictate" });
	const line = chat(DICT)[0].prompt;
	assert.deepEqual([line.text, line.by, typeof line.at], ["make the mic button bigger", "owner", "string"]);
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

P.page_ai({ page: "/", text: "what is running?" });
check("the root pair: assistant-root on the architect tier (Opus)", () => {
	const s = pspawns().at(-1).spec;
	assert.deepEqual([s.id, s.model], ["assistant-root", "claude-opus-5-5"]);
	assert.ok(fs.existsSync(path.join(repo, "public/ai/chat.jsonl")));
});

const root_reply = await pcall("page_reply", { page: "/notes/", text: "from the root" }, "assistant-root");
check("the root assistant may reply anywhere", () => assert.equal(root_reply.ok, true));

check("at most max_assistants live: the least recently used idle one is stopped first", () => {
	pagents.live.get("assistant-dictate").state = "idle";
	pagents.live.get("assistant-root").state = "idle";
	P.touched.set("assistant-dictate", Date.now() - 5000);   // older
	P.page_ai({ page: "/notes/", text: "a note" });
	assert.ok(pcalls.some(c => c.verb === "stop" && c.id === "assistant-dictate"));
	assert.ok(!pcalls.some(c => c.verb === "stop" && c.id === "assistant-root"));
	assert.equal(pspawns().at(-1).spec.id, "assistant-notes");
});

check("resumed on next use when under 30k and used within the hour", () => {
	P.page_ai({ page: DICT, text: "and blue" });
	const s = pspawns().at(-1).spec;
	assert.deepEqual([s.id, s.resume, s.prompt], ["assistant-dictate", "psess-1", undefined]);
	assert.equal(pcalls.at(-1).verb, "send");
	assert.equal(pcalls.at(-1).text, "and blue");
	assert.equal(pcalls.at(-1).note.reply_to, `page ${DICT}`);
});

check("fresh on next use when last used over an hour ago: the page's log, not a resume", () => {
	P.stop("assistant-dictate");
	P.state.cards[DICT].assistant.used_at = new Date(Date.now() - 2 * 3600e3).toISOString();
	P.page_ai({ page: DICT, text: "still there" });
	const s = pspawns().at(-1).spec;
	assert.equal(s.resume, undefined);
	assert.match(s.prompt, /^Page \/framework\/ux\/Dictate\/ — its chat log[\s\S]*make the mic button bigger[\s\S]*still there/);
	assert.ok(logged.some(e => e.event === "fresh" && e.id === "assistant-dictate" && /minutes ago/.test(e.reason)));
});

check("fresh on next use when its context was 30k or more", () => {
	pagents.live.get("assistant-dictate").context = 31000;
	P.sync(DICT);
	P.stop("assistant-dictate");
	P.page_ai({ page: DICT, text: "again" });
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
	P.page_ai({ page: "/notes/", text: "long talk" });
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
		P.page_ai({ page: "/notes/", text: "next thing" });
		const s = pspawns().at(-1).spec;
		assert.equal(s.resume, undefined);
		assert.match(s.prompt, /^\{"summary"[\s\S]*next thing/);
		assert.doesNotMatch(s.prompt, /long talk/);
	});
}

check("a send on a card's page goes into the card", () => {
	const before = logs.get(A).length;
	P.page_ai({ page: `/framework/ai/${A}/`, text: "via the drawer" });
	assert.equal(logs.get(A).length, before + 1);
	assert.equal(logs.get(A).at(-1).prompt.text, "via the drawer");
});

{
	const { execFileSync } = await import("node:child_process");
	const alt = path.join(dir, "alt-layers.json");
	const out = execFileSync(process.execPath, ["--input-type=module", "-e",
		`import L from ${JSON.stringify(new URL("./Layers.js", import.meta.url).href)}; console.log(new L().file)`],
		{ env: { ...process.env, SERVEX_LAYERS_FILE: alt }, encoding: "utf8", windowsHide: true }).trim();
	check("SERVEX_LAYERS_FILE moves the state file", () => assert.equal(out, alt));
}

fs.rmSync(dir, { recursive: true, force: true });
console.log(`layers: ${checks} checks passed`);
