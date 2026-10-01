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
		sleep(){ if (this.state !== "idle") return false; this.state = "dormant"; return true; },
		send(text, note){ if (this.state === "stopped") throw new Error("stopped"); if (this.state === "dormant"){ this.state = "idle"; this.awoken = (this.awoken ?? 0) + 1; } sent.push({ id: this.id, text, note }); return this; } });
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
	/* D7 (the owner's words, the recursive-pairs card): "the root assistant runs on Opus" —
	 * master() already spawns it on the architect model; this assertion was stale (said
	 * claude-sonnet-5/"fast tier"), a pre-existing mismatch found while touching this file
	 * for D3, not something this task's own edits changed. */
	t(master && master.model === "claude-opus-5-5" && master.effort === "medium", "master-assistant spawned, exact id, architect tier (D7: root assistant on Opus)");
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

// D3: the every-card feed is gone. A fresh prompt on any card is no longer
// forwarded (each page now hears its own); only a landing/block/error from a
// DIRECT CHILD of the root reaches the master, batched, at most one send per window.
{
	reset();
	const f = fake_servex();
	const g = new Global({ servex: f.servex }).install(); await g.ready;
	const hear = (card, line, info) => f.listeners.forEach(fn => fn(card, line, info));
	f.servex.layers = { root: id => id.split("/").length >= 4 ? id : null };   // a pair hears every root card

	// fresh prompts on cards a page pair hears: never forwarded any more
	hear("2026/09/24/a", { prompt: { text: "one" } }, { fresh: true });
	hear("2026/09/24/b/sub", { prompt: { text: "two" } }, { fresh: true });
	await wait(120);
	t(!f.sent.some(s => s.id === "master-assistant"), "fresh card prompts are no longer forwarded to the root");

	// a landing from an agent with no recorded parent (not a direct child): dropped
	hear("c", { message: { kind: "landed", by: "manager-c", text: "done, but not a direct child" } });
	await wait(120);
	t(!f.sent.some(s => s.id === "master-assistant"), "a non-child's landing is not forwarded");

	// a "reply" and a "task" kind: still never forwarded (HEARD dropped "task"; "reply" was never in it)
	f.servex.agents.live.set("task-mastermind-x", { id: "task-mastermind-x", state: "idle", parent: "dispatcher" });
	hear("c", { message: { kind: "reply", by: "task-mastermind-x", text: "ignored" } });
	hear("c", { message: { kind: "task", by: "task-mastermind-x", text: "queued, ignored" } });
	await wait(120);
	t(!f.sent.some(s => s.id === "master-assistant"), "kinds outside landed/blocked/error are never forwarded");

	// a landing from a DIRECT CHILD (parent: dispatcher, mastermind-servex's own spawn path today): forwarded
	hear("d", { message: { kind: "landed", by: "task-mastermind-x", text: "done" } });
	await wait(120);
	const to = f.sent.filter(s => s.id === "master-assistant");
	t(to.length === 1 && to[0].text === "card d, landed from task-mastermind-x: done" && to[0].note.from === "servex", "a direct child's landing reaches the root, from servex");

	// two events in one window still batch into one send
	f.servex.agents.live.set("task-mastermind-y", { id: "task-mastermind-y", state: "idle", parent: "mastermind-servex" });
	hear("e", { message: { kind: "blocked", by: "task-mastermind-y", text: "stuck" } });
	hear("f", { message: { kind: "error", by: "task-mastermind-y", text: "oops" } });
	await wait(120);
	const last = f.sent.filter(s => s.id === "master-assistant").pop();
	t(last.text === "card e, blocked from task-mastermind-y: stuck\ncard f, error from task-mastermind-y: oops", "two direct-child events batch into one send");

	// Idle stop, then a message resumes it by session id
	const master = f.servex.agents.live.get("master-assistant");
	master.session_id = "m-sid"; g.remember(master, "master");
	const mm = f.servex.agents.live.get("mastermind-servex");
	mm.session_id = "mm-sid"; g.remember(mm, "mastermind");
	g.sweep(Date.now() + g.dormant_ms + 1000);
	t(master.state === "dormant" && mm.state === "dormant", "master and mastermind go dormant when idle");
	const spawns = f.spawned.length;
	f.servex.agents.send("mastermind-servex", "hello", { from: "owner" });
	t(mm.awoken === 1 && f.sent.pop().text === "hello" && f.spawned.length === spawns, "a message awakens the same mastermind-servex object in place, no new spawn");
	hear("g", { message: { kind: "landed", by: "task-mastermind-x", text: "five" } });
	await wait(120);
	t(master.awoken === 1 && f.sent.filter(s => s.id === "master-assistant").pop().text.includes("five"), "batching awakens the dormant master");
	clearInterval(g.reap_timer);
}

// Fix items 1-2 (2026-09-29): the owner's PAGE-LESS prompts reach master-assistant,
// and a top-level page's manager (the REAL Layers' ids and layers.json) is a direct child.
{
	reset();
	const f = fake_servex();
	const g = new Global({ servex: f.servex }).install(); await g.ready;
	const hear = (card, line, info) => f.listeners.forEach(fn => fn(card, line, info));
	const to_master = () => f.sent.filter(s => s.id === "master-assistant");

	// no Layers at all: nobody else hears a prompt, so every one is page-less
	hear("2026/09/24/a", { prompt: { text: "no layers here" } }, { fresh: true });
	await wait(120);
	t(to_master().at(-1)?.text === "card 2026/09/24/a: no layers here" && to_master().at(-1).note.from === "owner", "with Layers off, a prompt reaches the root, from the owner");

	const { default: Layers } = await import("./Layers.js");
	const repo = fs.mkdtempSync(path.join(os.tmpdir(), "global-layers-"));
	const L = new Layers({ servex: f.servex, file: path.join(repo, "layers.json"), repo, watch(){} });
	L.load();
	f.servex.layers = L;
	for (const k of ["2026/09/24/fix-the-sidebar", "/framework/", "/framework/ux/Dictate/"]) L.record(k);
	const n = to_master().length;

	hear("2026/09/24/fix-the-sidebar", { prompt: { text: "a card's own words" } }, { fresh: true });
	hear("2026/09/24/fix-the-sidebar/wider", { prompt: { text: "a sub-card's words" } }, { fresh: true });
	hear("2026/09/24/fix-the-sidebar", { prompt: { text: "not fresh" } }, { fresh: false });
	hear("2026/09", { prompt: { text: "spoken on the month, no card" } }, { fresh: true });
	await wait(120);
	const got = to_master().slice(n).map(s => s.text).join(" | ");
	t(got === "card 2026/09: spoken on the month, no card", "only the page-less prompt reaches the root: " + JSON.stringify(got));

	// landings: a card's manager and a top-level page's manager are direct children (parent manager-root in layers.json);
	// a deeper page's manager (parent manager-ux) is not. Their LIVE parent is their own assistant, as Layers spawns them.
	for (const [id, parent] of [["manager-fix-the-sidebar", "assistant-fix-the-sidebar"], ["manager-framework", "assistant-framework"], ["manager-dictate", "assistant-dictate"]])
		f.servex.agents.live.set(id, f.add({ id, parent }));
	t(L.state.cards["2026/09/24/fix-the-sidebar"].parent === "manager-root" && L.state.cards["/framework/ux/Dictate/"].parent === "manager-ux", "the real recorded parents");
	t(g.direct_child("manager-fix-the-sidebar") && g.direct_child("manager-framework"), "a card's and a top-level page's manager are direct children");
	t(!g.direct_child("manager-dictate") && !g.direct_child("manager-root") && !g.direct_child("assistant-framework"), "a deeper page's manager, the root's own manager and an assistant are not");
	const m = to_master().length;
	hear("2026/09/24/fix-the-sidebar", { message: { kind: "landed", by: "manager-fix-the-sidebar", text: "sidebar shipped" } });
	hear("2026/09/24/fix-the-sidebar", { message: { kind: "landed", by: "manager-dictate", text: "a grandchild's landing" } });
	await wait(120);
	const landed = to_master().slice(m).map(s => s.text).join(" | ");
	t(landed === "card 2026/09/24/fix-the-sidebar, landed from manager-fix-the-sidebar: sidebar shipped", "manager-<card>'s landing reaches the root; the deeper one's does not: " + JSON.stringify(landed));
	// a STOPPED card manager is still a direct child: layers.json, not the live map, decides
	f.servex.agents.live.delete("manager-fix-the-sidebar");
	t(g.direct_child("manager-fix-the-sidebar"), "a stopped card manager still counts");

	const master = f.spawned.find(s => s.id === "master-assistant");
	t(["page_reply", "ask_manager", "card_reply"].every(k => master.allowed_tools.includes(`mcp__servex__${k}`)), "master-assistant can answer the page / and hand work to manager-root");
	t(master.model === "claude-opus-5-5", "master-assistant runs on the architect tier (Opus)");
	t(Array.isArray(master.setting_sources) && !master.setting_sources.length && master.sdk?.tools?.length === 0 && master.env?.ENABLE_CLAUDEAI_MCP_SERVERS === "false", "master-assistant starts lean, like a page assistant");
	fs.rmSync(repo, { recursive: true, force: true });
	clearInterval(g.reap_timer);
}

// D5: the same 15-minute reaper now also stops an idle task-mastermind (was:
// neither a worker nor `master_id`/`mastermind_id`, so sweep() skipped it
// entirely and it never stopped). Waking a stopped one by message is generic
// Agents.js behavior (`send` -> `wake` -> `reopen` by session id, outside this
// fence); the live proof on the private Servex exercises the real thing.
// TIMING REVISED (process-monitor, ask 2b, 2026-10-01): a task-mastermind is a
// one-off role now (`default_after`), so it sleeps the MOMENT it is found idle —
// it no longer waits out the 3-minute `dormant_ms` first.
{
	reset();
	const f = fake_servex();
	const g = new Global({ servex: f.servex }).install(); await g.ready;
	const tm = f.add({ id: "task-mastermind-recursive-pairs", role: "task-mastermind", state: "idle", parent: "dispatcher", turns: 3, session_id: "tm-sid" });
	f.servex.agents.live.set(tm.id, tm);
	g.sweep(Date.now());
	t(tm.state === "dormant", "an idle task-mastermind goes dormant the moment it is swept, not after the 3-minute dormant_ms (ask 2b: one-off roles default to 0)");
	t(f.logged.some(l => l.type === "dormant" && l.id === "task-mastermind-recursive-pairs"), "its dormancy is logged");
	clearInterval(g.reap_timer);
}

// The reaper. TIMING REVISED (process-monitor, ask 2b, 2026-10-01): one-off roles
// (minion, reviewer, task-mastermind) default to `dormant_after: 0` — they sleep the
// moment they are found idle, not "every role after the same 3-minute dormant_ms" as
// before. A plain role (manager, here) is unaffected: it still keeps dormant_ms.
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
	t(done.state === "dormant" && fresh.state === "dormant", "a one-off role (minion) sleeps the moment it is swept idle, turn-less or not — not after dormant_ms");
	t(f.logged.some(l => l.type === "dormant" && l.id === "minion-done"), "its dormancy is logged");
	t(mgr.state === "idle", "a plain role (manager) is NOT dormant yet: it still waits out the normal dormant_ms");
	t(busy.state === "working", "a working agent is kept");
	g.sweep(now + g.dormant_ms + 1);
	t(mgr.state === "dormant", "the plain role goes dormant once dormant_ms has actually passed");
	clearInterval(g.reap_timer);
}

// ask 2 (the RAM squeeze, 2026-10-01): free RAM under `tight_mb` shortens a PLAIN role's
// wait from the normal `dormant_ms` (3 min) to `dormant_tight_ms` (30 s); no reading yet
// from the process monitor keeps the normal timer; the flip is logged once each way, never
// on every check.
{
	reset();
	const f = fake_servex();
	const g = new Global({ servex: f.servex }).install(); await g.ready;
	const mgr = f.servex.agents.live.set("manager-tight", f.add({ id: "manager-tight", role: "manager", state: "idle", turns: 1 })).get("manager-tight");
	f.servex.processes = {};   // no reading yet
	g.check_tight();
	t(g.tight === false && g.wait_ms(mgr) === g.dormant_ms && g.dormant_ms === 180000, "no RAM reading yet: the normal 3-minute timer");
	f.servex.processes = { now: { free_mb: 8000 } };
	g.check_tight();
	t(g.tight === false, "plenty of free RAM: still the normal timer");
	f.servex.processes = { now: { free_mb: 5000 } };
	g.check_tight();
	t(g.tight === true && g.wait_ms(mgr) === g.dormant_tight_ms && g.dormant_tight_ms === 30000, "under 6 GB free (SERVEX_TIGHT_MB): the fast 30 s timer");
	t(f.logged.filter(l => l.type === "dormant-tight").length === 1, "logged once, on the flip into tight — not on every check");
	g.check_tight(); g.check_tight();
	t(f.logged.filter(l => l.type === "dormant-tight").length === 1, "still once: re-checking an unchanged tight state logs nothing more");
	f.servex.processes = { now: { free_mb: 8000 } };
	g.check_tight();
	t(g.tight === false && f.logged.filter(l => l.type === "dormant-tight").length === 2, "flipping back out of tight logs exactly once more");
	clearInterval(g.reap_timer);
}

// ask 2b (dormancy is per agent AND per request, revised 2026-10-01 16:20): the voice
// pair's own roles never auto-sleep, however long they sit idle — ending their session is
// some OTHER mechanism's job, never this sweep.
{
	reset();
	const f = fake_servex();
	const g = new Global({ servex: f.servex }).install(); await g.ready;
	const sf = f.servex.agents.live.set("session-fast-v1", f.add({ id: "session-fast-v1", role: "session-fast", state: "idle", turns: 5 })).get("session-fast-v1");
	g.sweep(Date.now());
	g.sweep(Date.now() + 10 * g.dormant_ms);   // miles past the normal timer
	t(sf.state === "idle", "session-fast never goes dormant on its own, however long it sits idle, in a live session");
	clearInterval(g.reap_timer);
}

// ask 2b: a per-request `dormant_after` (what `send_to_agent`'s own argument sets directly
// on the agent object — Servex/agents/tools.js, outside this fence) overrides the role's
// default, warming a one-off role for exactly as long as asked.
{
	reset();
	const f = fake_servex();
	const g = new Global({ servex: f.servex }).install(); await g.ready;
	const warm = f.servex.agents.live.set("minion-warm", f.add({ id: "minion-warm", role: "minion", state: "idle", turns: 1, dormant_after: 60 })).get("minion-warm");
	const now = Date.now();
	g.sweep(now);
	t(warm.state === "idle", "dormant_after: 60 overrides the one-off role's default (0): not dormant right away");
	g.sweep(now + 59000);
	t(warm.state === "idle", "still warm at 59 s");
	g.sweep(now + 61000);
	t(warm.state === "dormant", "dormant once its own 60 s have actually passed");
	clearInterval(g.reap_timer);
}

// ask 2b: never sleeps an agent with a live, working (or just-starting) CHILD — a reply is
// likely imminent, and sleeping now would only add resume latency to delivering it.
{
	reset();
	const f = fake_servex();
	const g = new Global({ servex: f.servex }).install(); await g.ready;
	const parent = f.servex.agents.live.set("manager-parent", f.add({ id: "manager-parent", role: "manager", state: "idle", turns: 2 })).get("manager-parent");
	const child = f.servex.agents.live.set("minion-child", f.add({ id: "minion-child", role: "minion", parent: "manager-parent", state: "working", turns: 1 })).get("minion-child");
	const now = g.last_active(parent, Date.now());   // seed its idle baseline now, while the child is already working
	g.sweep(now + g.dormant_ms + 1000);
	t(parent.state === "idle", "a parent with a live working child is never put dormant, even past dormant_ms");
	child.state = "idle";
	g.sweep(now + g.dormant_ms + 1000);
	t(parent.state === "dormant", "once the child is no longer working, the parent goes dormant on its own normal timer");
	clearInterval(g.reap_timer);
}

// The working cap: a new spawn waits while `working_cap` agents work; a wake and the front desk never wait
{
	reset();
	const f = fake_servex();
	const g = new Global({ servex: f.servex, cap: 30, min_free_mb: 10 });
	let working = 5;
	f.servex.agents.working = () => Array.from({ length: working });
	f.servex.agents.working_cap = 5;
	t(g.admit({ role: "minion", parent: "task-mastermind-x" }, 8000) === "working 5/5: waits for a working agent to end its turn", "the sixth working spawn is held");
	t(g.admit({ role: "minion", resume: "sid" }, 8000) === null, "a resume (a wake) is never held by the cap");
	t(g.admit({ role: "minion", resume: "sid", fork: true }, 8000) !== null, "a fork is a new process: held");
	t(g.admit({ role: "manager", id: "manager-x" }, 8000) === null && g.admit({ role: "assistant" }, 8000) === null, "the front desk is never held");
	working = 4;
	t(g.admit({ role: "minion" }, 8000) === null, "4 working: admitted");
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

{
	/* fresh-eyes review (second round), finding 5: master-assistant's own roles.js row must
	 * stay pinned to its pre-recursive-pairs posture, so a future re-alias into page-assistant's
	 * fast/bypass row (as briefly happened) is caught by a test, not just re-read by eye. */
	const { defaults, canonical } = await import("./roles.js");
	t(canonical("master-assistant") === "master-assistant", "master-assistant resolves to its own row, not an alias of page-assistant");
	const posture = defaults("master-assistant");
	t(posture.model === "claude-opus-5-5" && posture.effort === "high" && posture.permission_mode === "plan",
		`spawn_agent({role: "master-assistant"}) keeps its old posture: architect/high/plan (got ${JSON.stringify(posture)})`);
}

fs.rmSync(HOME, { recursive: true, force: true });
console.log(`global: ${n} checks passed`);
