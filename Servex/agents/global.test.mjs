/* node Servex/agents/global.test.mjs — Claims, brief(), and Global against a fake
 * Servex. Everything it writes goes to a scratch SERVEX_HOME, never the real one. */
import assert from "node:assert";
import fs from "fs";
import os from "os";
import path from "path";

const HOME = fs.mkdtempSync(path.join(os.tmpdir(), "servex-global-"));
process.env.SERVEX_HOME = HOME;
process.env.SERVEX_MASTER_BATCH_MS = "50";
delete process.env.SERVEX_NO_ASSISTANT;

const { Claims } = await import("./claims.js");
const { brief, remember_focus } = await import("./brief.js");
const { default: Global } = await import("./Global.js");

let n = 0;
const t = (ok, what) => { assert.ok(ok, what); n++; };
const wait = ms => new Promise(r => setTimeout(r, ms));

/* A fake agent host: spawn honours `id` and `resume`, as the concurrency branch's does. */
function fake_servex({ registry = {}, live = [] } = {}){
	const spawned = [], sent = [], logged = [], tools = new Map(), listeners = [];
	const agent = spec => ({ ...spec, state: spec.state ?? "idle", turns: spec.turns ?? 0,
		stop(){ this.state = "stopped"; },
		send(text, note){ if (this.state === "stopped") throw new Error("stopped"); sent.push({ id: this.id, text, note }); return this; } });
	const agents = {
		live: new Map(), policy: { rules: () => [], refused: [] },
		reg: () => ({ read: () => registry }),
		spawn(spec){ const a = agent(spec); spawned.push(spec); this.live.set(a.id, a); return a; },
		get(id){ const a = this.live.get(id); if (!a) throw new Error(`No agent ${id}`); return a; },
		send(id, text, note){ return this.get(id).send(text, note); }
	};
	for (const spec of live) agents.live.set(spec.id, agent(spec));
	return { spawned, sent, logged, tools, listeners, add: agent, servex: {
		agents, checks: [],
		log: { append: async (name, entry) => { logged.push({ name, ...entry }); return { ok: true, entry }; }, tail: async () => [] },
		mcp: { tool: def => tools.set(def.name, def) },
		dashboard: { router: { get(){} } },
		cards: { on: fn => listeners.push(fn), canonical: id => id },
		say(){}
	} };
}
const reset = () => { for (const f of ["claims.json", "global.json"]) fs.rmSync(path.join(HOME, f), { force: true }); };

// Claims
{
	reset();
	const agents = { live: new Map([["manager-a", { state: "idle" }], ["manager-b", { state: "idle" }]]) };
	const c = new Claims({ agents, file: path.join(HOME, "claims.json") });
	t(c.claim({ thing: "Sidebar width", agent: "manager-a", card: "a" }).ok, "first claim");
	const no = c.claim({ topic: "sidebar  WIDTH", agent: "manager-b", card: "b" });
	t(!no.ok && no.holder === "manager-a" && no.card === "a", "second agent refused (topic still accepted as the thing)");
	t(no.why === "Sidebar width is already being changed by manager-a on card a. Ask mastermind-servex before starting.", "refusal wording");
	agents.live.get("manager-a").state = "stopped";
	t(c.list()[0].stale === true, "stopped holder is stale");
	t(c.claim({ topic: "sidebar width", agent: "manager-b", card: "b" }).ok, "stale claim taken over");
	c.claim({ topic: "other", agent: "manager-b", card: "b" });
	t(c.release_all("manager-b").released === 2 && c.list().length === 0, "release_all");
}

// a claim names the THING: blue and red on the site header are one key
{
	reset();
	const agents = { live: new Map([["manager-blue", { state: "idle" }], ["manager-red", { state: "idle" }]]) };
	const c = new Claims({ agents, file: path.join(HOME, "claims.json") });
	const blue = c.claim({ thing: "site header", change: "blue", agent: "manager-blue", card: "2026/09/24/blue" });
	t(blue.ok && blue.key === "site-header", "the key is the thing only");
	const red = c.claim({ thing: "Site Header", change: "red", agent: "manager-red", card: "2026/09/24/red" });
	t(!red.ok && red.holder === "manager-blue" && red.change === "blue", "another change to the same thing is refused");
	t(red.why === "site header is already being changed by manager-blue on card 2026/09/24/blue (blue). Ask mastermind-servex before starting.", "refusal names the holder's change");
	const row = c.list()[0];
	t(row.thing === "site header" && row.change === "blue" && !("topic" in row), "list shows thing and change");
	fs.writeFileSync(path.join(HOME, "claims.json"), JSON.stringify({ "old-row": { topic: "old row", agent: "manager-blue", card: "x" } }));
	t(c.list()[0].thing === "old row" && c.claim({ thing: "old row", agent: "manager-red" }).ok === false, "an old topic row still reads as its thing");
}

// brief() stays one screen
{
	const { servex } = fake_servex();
	for (let i = 0; i < 40; i++) servex.agents.live.set(`manager-${i}`, { id: `manager-${i}`, role: "manager", state: "idle" });
	servex.agents.live.set("minion-x", { id: "minion-x", role: "minion", state: "working" });
	servex.claims = new Claims({ agents: servex.agents, file: path.join(HOME, "claims.json") });
	for (let i = 0; i < 20; i++) servex.claims.claim({ topic: `t${i}`, agent: `manager-${i}`, card: `c${i}` });
	remember_focus("Ship the layers.");
	const text = brief(servex);
	t(text.split("\n").length <= 25, "brief under 25 lines with 40 agents");
	t(!text.includes("minion-x") && text.includes("Ship the layers."), "brief skips minions, shows focus");
	t(typeof brief(null) === "string", "brief never throws");
	reset();
}

// Global spawns master-assistant with that exact id, and a fresh mastermind when nothing is recorded
{
	reset();
	const f = fake_servex();
	const g = new Global({ servex: f.servex }).install(); await g.ready;
	const master = f.spawned.find(s => s.id === "master-assistant");
	t(master && master.model === "claude-sonnet-5" && master.effort === "medium", "master-assistant spawned, exact id, fast tier");
	const mm = f.spawned.find(s => s.id === "mastermind-servex");
	t(mm && !mm.resume && mm.prompt === "You are on duty. Answer nothing now." && mm.model === "claude-opus-5-5", "fresh mastermind only when nothing recorded");
	t(["claim_topic", "release_topic", "list_claims", "set_focus"].every(k => f.tools.has(k)), "four tools registered");
	t(f.servex.checks.length === 1, "admission check pushed");
	clearInterval(g.reap_timer);
}

// A live mastermind-servex: nothing spawned for it
{
	reset();
	const f = fake_servex({ live: [{ id: "mastermind-servex", role: "mastermind", state: "idle" }] });
	const g = new Global({ servex: f.servex }).install(); await g.ready;
	t(!f.spawned.some(s => s.id === "mastermind-servex"), "live mastermind: no spawn");
	clearInterval(g.reap_timer);
}

// Only a registry row with a session id (and no cwd): resumed under the same id, in the repo root
{
	reset();
	const f = fake_servex({ registry: { "mastermind-servex": { id: "mastermind-servex", session_id: "sid-1" } } });
	const g = new Global({ servex: f.servex }).install(); await g.ready;
	const mm = f.spawned.find(s => s.id === "mastermind-servex");
	t(mm && mm.resume === "sid-1" && !mm.prompt, "registry session resumed, no prompt");
	t(path.resolve(mm.cwd) === path.resolve(path.join(import.meta.dirname, "../..")), "no cwd in the row: the repo root");
	clearInterval(g.reap_timer);
}

// A second boot with global.json's session id: resume, same id
{
	reset();
	fs.writeFileSync(path.join(HOME, "global.json"), JSON.stringify({ mastermind: { session_id: "sid-2", cwd: "C:/x" } }));
	const f = fake_servex();
	const g = new Global({ servex: f.servex }).install(); await g.ready;
	const mm = f.spawned.find(s => s.id === "mastermind-servex");
	t(mm && mm.resume === "sid-2" && mm.cwd === "C:/x", "global.json session resumed under the same id");
	clearInterval(g.reap_timer);
}

// Three prompts within the window reach the master as ONE send; kinds filtered
{
	reset();
	const f = fake_servex();
	const g = new Global({ servex: f.servex }).install(); await g.ready;
	const hear = (card, line, info) => f.listeners.forEach(fn => fn(card, line, info));
	hear("a", { prompt: { text: "one" } }, { fresh: true });
	hear("b", { prompt: { text: "two" } }, { fresh: true });
	hear("c", { prompt: { text: "three" } }, { fresh: true });
	hear("c", { message: { kind: "reply", by: "x", text: "ignored" } });
	await wait(120);
	const to = f.sent.filter(s => s.id === "master-assistant");
	t(to.length === 1 && to[0].text === "card a: one\ncard b: two\ncard c: three" && to[0].note.from === "owner", "three prompts, one send");
	hear("a", { message: { kind: "landed", by: "manager-a", text: "done" } });
	await wait(120);
	const last = f.sent.filter(s => s.id === "master-assistant").pop();
	t(last.text === "card a, landed from manager-a: done" && last.note.from === "servex", "landing heard, from servex");

	// Idle stop, then a message resumes it by session id
	const master = f.servex.agents.live.get("master-assistant");
	master.session_id = "m-sid"; g.remember(master, "master");
	const mm = f.servex.agents.live.get("mastermind-servex");
	mm.session_id = "mm-sid"; g.remember(mm, "mastermind");
	g.sweep(Date.now() + g.idle_ms + 1000);
	t(master.state === "stopped" && mm.state === "stopped", "master and mastermind stopped when idle");
	f.servex.agents.send("mastermind-servex", "hello", { from: "owner" });
	const back = f.spawned.filter(s => s.id === "mastermind-servex").pop();
	t(back.resume === "mm-sid" && f.sent.pop().text === "hello", "a message resumes mastermind-servex");
	hear("a", { prompt: { text: "four" } }, { fresh: true });
	await wait(120);
	t(f.spawned.filter(s => s.id === "master-assistant").pop().resume === "m-sid", "batching resumes the master");
	clearInterval(g.reap_timer);
}

// The reaper
{
	reset();
	const f = fake_servex();
	const g = new Global({ servex: f.servex }).install(); await g.ready;
	const a = spec => f.servex.agents.live.set(spec.id, f.add(spec)).get(spec.id);
	const done = a({ id: "minion-done", role: "minion", state: "idle", turns: 1 });
	const fresh = a({ id: "minion-fresh", role: "minion", state: "idle", turns: 0 });
	const busy = a({ id: "helper-busy", role: "helper", state: "working", turns: 2 });
	const mgr = a({ id: "manager-x", role: "manager", state: "idle", turns: 3 });
	const now = Date.now();
	g.sweep(now);
	t(done.state === "idle", "not reaped before reap_ms");
	g.sweep(now + g.reap_ms + 1);
	t(done.state === "stopped" && f.logged.some(l => l.type === "reaped" && l.id === "minion-done"), "idle finished minion reaped and logged");
	t(fresh.state === "idle" && busy.state === "working" && mgr.state === "idle", "no turn, working, or manager: kept");
	clearInterval(g.reap_timer);
}

// The admission check: memory, then a ceiling a live parent's child skips
{
	reset();
	const f = fake_servex();
	const g = new Global({ servex: f.servex, cap: 30, min_free_mb: 4096 });
	t(g.admit({}, 1000) === "only 1000 MB of memory is free; waiting for 4096 MB", "memory check");
	for (let i = 0; i < 30; i++) f.servex.agents.live.set(`p${i}`, f.add({ id: `p${i}`, state: "idle" }));
	t(g.admit({}, 8000) === "30 agents are running, the ceiling is 30", "ceiling");
	t(g.admit({ parent: "p3" }, 8000) === null, "30 idle parents, one of their children is still admitted");
	t(g.admit({ parent: "p3" }, 100) !== null, "a child never skips the memory check");
}

// mastermind-servex held at the spawn gate: one spawn, messages wait, delivered on admitted
{
	reset();
	const f = fake_servex(), handlers = [], held = [];
	const REASON = "only 10 MB of memory is free; waiting for 4096 MB";
	f.servex.on = (ev, fn) => { if (ev === "admitted") handlers.push(fn); };
	const spawn = f.servex.agents.spawn.bind(f.servex.agents);
	f.servex.agents.spawn = spec => spec.role !== "mastermind" ? spawn(spec)
		: (held.push(spec), { id: null, queued: true, spec, card: () => ({ id: null, state: "queued", queued: true, position: 1, reason: REASON }) });
	f.servex.agents.wake = id => { throw new Error(`the real wake was reached for ${id}`); };
	const g = new Global({ servex: f.servex }).install(); await g.ready;
	clearInterval(g.reap_timer);
	t(held.length === 1 && g.held?.spec === held[0], "boot: mastermind-servex queued, held by its spec object");
	t(g.mastermind() === g.held.agent && held.length === 1, "asked again while held: the same stand-in, no second spawn");
	const door = f.servex.agents.send("mastermind-servex", "two cards collide", { from: "manager-a" });
	t(door.card().state === "queued" && door.card().reason === REASON, "a message while held gets the queued card back");
	t(f.servex.agents.wake("mastermind-servex").queued === true, "wake is routed to the held door");
	t(!f.sent.length, "nothing is sent to a stand-in");
	const real = f.add({ id: "mastermind-servex", role: "mastermind", state: "working", session_id: "s-mm" });
	f.servex.agents.live.set(real.id, real);
	for (const h of handlers) h({ ...held[0] }, real);
	t(!f.sent.length && g.held, "an equal but different spec object is not ours");
	for (const h of handlers) h(held[0], real);
	t(!g.held && f.sent.length === 1 && f.sent[0].text === "two cards collide" && f.sent[0].note.from === "manager-a", "admitted: the held message is delivered");
	t(JSON.parse(fs.readFileSync(path.join(HOME, "global.json"), "utf8")).mastermind.session_id === "s-mm", "admitted: its session id is remembered");
}

fs.rmSync(HOME, { recursive: true, force: true });
console.log(`global: ${n} checks passed`);
