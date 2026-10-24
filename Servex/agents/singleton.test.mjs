/* node Servex/agents/singleton.test.mjs — the AI system mastermind (the owner, 2026-10-23; roles/ai-system-mastermind.md):
 * one live session under one id, a fresh session on the wake after a day or past its token line, and the feedback inbox
 * that wakes it on the third repeat. Fake agents and a temp repo: no process, no SDK. */
import assert from "node:assert";
import fs from "fs";
import os from "os";
import path from "path";

process.env.SERVEX_HOME = fs.mkdtempSync(path.join(os.tmpdir(), "servex-singleton-"));
const { Agents, renew_why } = await import("./Agents.js");
const { singleton_id, renew_of, canonical, ROLES } = await import("./roles.js");
const { default: ModuleInbox } = await import("./ModuleInbox.js");

let n = 0;
const t = (ok, what) => { assert.ok(ok, what); n++; };
const ID = "ai-system-mastermind";

// roles.js
t(singleton_id(ID) === ID && singleton_id("mastermind") === null, "the role is a singleton; the generic mastermind is not");
t(renew_of(ID).hours === 24 && renew_of(ID).tokens === 100000, "renews after a day or past 100k tokens");
t(canonical("servex-mastermind") === ID, "the old role word is an alias");
t(ROLES.mastermind.readme === "mastermind" && ROLES[ID].readme === ID, "the generic mastermind loads roles/mastermind.md now");
t(fs.readFileSync(new URL("./roles/servex-mastermind.md", import.meta.url), "utf8").includes("ai-system-mastermind.md"), "the old readme path is a pointer");

// renew_why
const day = 24 * 3600e3, now = Date.now(), line = renew_of(ID);
t(renew_why(line, new Date(now - day - 1).toISOString(), 0, now) === "age", "a day old: age");
t(renew_why(line, new Date(now - 60e3).toISOString(), 100000, now) === "tokens", "past the token line: tokens");
t(renew_why(line, new Date(now - 60e3).toISOString(), 1000, now) === null, "young and small: resume");
t(renew_why(null, new Date(0).toISOString(), 1e9, now) === null, "a role with no renew line never renews");

// one live session: a second spawn sends to the live one
const agents = new Agents();
const sent = [];
const live = Object.assign(Object.create(Agents.Agent.prototype), { id: ID, role: ID, state: "idle", send: (text, note) => sent.push([text, note]) });
agents.live.set(ID, live);
const got = agents.spawn({ role: ID, prompt: "how are tasks indexed?", parent: "minion-x" });
t(got === live && sent.length === 1 && sent[0][0] === "how are tasks indexed?" && sent[0][1].from === "minion-x", "a second spawn reaches the live one, no -2");
t(!agents.live.has(ID + "-2"), "never a -2");

// a renewing role is never nudged or sleep-compacted, but the 400k safety ceiling still applies
{
	const a = Object.assign(Object.create(Agents.Agent.prototype), { id: ID, role: ID, state: "idle", turns: 3, context: 450000, host: {} });
	t(a.oversized() === "context", "the safety ceiling still applies to the AI system mastermind");
	t(a.sleep_compact() === false && a.nudge() === null, "no nudge, no compaction before sleep: it renews instead");
}
// after a restart: a singleton only in the registry is woken (resumed or renewed by wake()), not spawned blank
{
	const ag = new Agents(), woke = [];
	ag.reg = () => ({ read: () => ({ [ID]: { id: ID, role: ID, session_id: "s-old" } }) });
	ag.wake = id => { const w = { id, send: (text, note) => woke.push([text, note]) }; woke.push(id); return w; };
	const r = ag.spawn({ role: ID, prompt: "hello", parent: "minion-y" });
	t(r.id === ID && woke[0] === ID && woke[1][0] === "hello", "registry-only: wake(), then the prompt");
}

// renewal on wake
function dormant(over = {}){
	const events = [];
	const a = Object.assign(Object.create(Agents.Agent.prototype), {
		id: ID, role: ID, state: "dormant", session_id: "old-session", context: 120000, started_at: new Date(now - day - 5).toISOString(),
		host: { register(){}, whoami: (id, sid) => `You are ${id} (${sid}). ` }, emit: e => events.push(e), start(){ this.started = true; }, ...over });
	return { a, events };
}
{
	const { a, events } = dormant();
	a.awaken("minion-x");
	const r = events.find(e => e.type === "renew");
	t(r && r.why === "age" && r.replaces === "old-session" && a.session_id !== "old-session", "a day old: a fresh session under the same id");
	t(a.resume === null && a.minted === true && a.context === 0 && /fresh session of ai-system-mastermind/.test(a.prompt), "fresh: no resume, a new minted id, its first words point at the readmes");
	t(Date.now() - Date.parse(a.started_at) < 5000 && a.started, "started_at restarts the day; the process starts");
}
{
	const { a, events } = dormant({ started_at: new Date(now - 60e3).toISOString(), context: 50000 });
	a.awaken("x");
	t(!events.some(e => e.type === "renew") && a.resume === "old-session", "young: an ordinary resume");
}
{
	const { a, events } = dormant({ role: "mastermind" });
	a.awaken("x");
	t(!events.some(e => e.type === "renew"), "another role never renews");
}

// the feedback inbox
const repo = fs.mkdtempSync(path.join(os.tmpdir(), "fb-"));
fs.mkdirSync(path.join(repo, "public/framework/ai"), { recursive: true });
const box = new ModuleInbox("ai", { repo });
const first = box.add("task marked complete on hand-off", "/x", { fix: "only the worker's landing line completes", from: "minion-a" });
t(box.repeats(first.id) === 1 && box.wake_for(first) === null, "first time: logged, no wake");
const second = box.add("same again", "/y", { fix: "same", repeat_of: first.id });
t(box.repeats(second.id) === 2 && box.wake_for(second) === null, "second time: counted, no wake");
const third = box.add("and again", "/z", { fix: "same", repeat_of: first.id });
t(box.repeats(first.id) === 3 && box.wake_for(third) === "logged 3 times", "third time: wakes");
t(box.wake_for(box.add("broken link in readme", "/w", { fix: "point it at x", obvious: true })) === "obvious", "obvious: wakes the first time");
t(box.wake_for(box.add("an owner ask", "/v")) === null, "an ask with no fix is not feedback");
assert.throws(() => box.add("x", "/u", { fix: "y", repeat_of: "i-nope" }));
n++;
// the tool spawns (a singleton, so it reaches the live one) on the third
const spawned = [];
const [tool] = ModuleInbox.tools({ servex: { agents: { spawn: spec => spawned.push(spec) } } });
const real = ModuleInbox.resolve;
ModuleInbox.resolve = (m) => real(m, repo);
const out = JSON.parse(tool.handler({ module: "ai", essence: "fourth", source: "/q", fix: "same", repeat_of: first.id }, { caller: "minion-b" }));
ModuleInbox.resolve = real;
t(out.repeats === 4 && out.woke === null && spawned.length === 0, "the fourth repeat does not wake it again");
box.outcome(first.id, { state: "decided", note: "fixed in x", by: ID });
ModuleInbox.resolve = (m) => real(m, repo);
const back = JSON.parse(tool.handler({ module: "ai", essence: "fifth", source: "/q", fix: "same", repeat_of: first.id }, { caller: "minion-b" }));
ModuleInbox.resolve = real;
t(back.woke === ID && spawned[0].role === ID && /back after it was marked decided/.test(spawned[0].prompt) && /Suggested fix: same/.test(spawned[0].prompt), "a repeat after the outcome wakes it with the problem and fix");

console.log(`singleton: ${n} checks passed`);
