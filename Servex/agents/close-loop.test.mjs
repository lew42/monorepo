// node Servex/agents/close-loop.test.mjs — Agent.close_loop on stub agents: a clean end with finished work completes the task, anything else wakes ONCE (never a loop), a stop wakes nobody.
import fs from "node:fs"; import os from "node:os"; import path from "node:path"; import assert from "node:assert";
import { Agents } from "./Agents.js"; import Task from "../../public/framework/core/Task/Task.js"; import CloseLoop from "../CloseLoop.js";
const Agent = Agents.Agent;
const jl = (...lines) => lines.map(l => JSON.stringify(l)).join("\n") + "\n";
const mk = lines => { const d = fs.mkdtempSync(path.join(os.tmpdir(), "cl-")); fs.writeFileSync(path.join(d, "task.jsonl"), jl(...lines)); return d; };
const state = d => Task.replay(CloseLoop.lines(path.join(d, "task.jsonl"))).state;
const open = [{ assign: { title: "t", requested_at: "2026-11-02T10:00:00-06:00" } }, { start: { at: "2026-11-02T10:00:01-06:00" } }];
const logs = [...open, { log: { at: "2026-11-02T10:05:00-06:00", msg: "read the files" } }];
const done = [...open, { commit: { at: "2026-11-02T10:09:00-06:00", sha: "abc1234", msg: "the change" } }];
const calls = { sent: [], events: [] };
const agent = (dir, extra = {}) => Object.assign(Object.create(Agent.prototype), { id: "minion-x", role: "minion", turns: 1, last_error: null, words: "Built it and committed.", task: { dir },
	host: { store: () => ({ append: async e => { calls.events.push(e); } }), live: new Map(), register: () => {} }, send(t, o){ calls.sent.push([t, o]); } }, extra);

// 1. clean end, an open task, a commit in the log: completed with the agent's last words as the outcome; nobody is woken
let dir = mk(done), a = agent(dir);
assert.equal(state(dir), "running");
assert.equal(a.close_loop(), "complete");
assert.equal(state(dir), "complete");
assert.match(fs.readFileSync(path.join(dir, "task.jsonl"), "utf8"), /Built it and committed\./);
assert.equal(calls.sent.length, 0);
assert.equal(a.close_loop(), null);   // closed now: nothing more

// 2. clean end, open task, no outcome: woken ONCE; the same agent ending again is not woken; a revived agent (flag only in the row) is not either
dir = mk(logs); a = agent(dir);
assert.equal(a.close_loop(), "wake"); assert.equal(calls.sent.length, 1); assert.equal(calls.sent[0][0], CloseLoop.WAKE);
assert.equal(a.close_loop(), null); assert.equal(a.close_loop(), null); assert.equal(calls.sent.length, 1);
const revived = agent(dir, { session_id: "s1", host: { store: () => ({ append: async () => {} }), live: new Map(), reg: () => ({ read: () => ({ "minion-x": { session_id: "s1", close_nagged: "2026-11-02T10:06:00-06:00" } }) }) } });
assert.equal(revived.close_loop(), null);
assert.equal(calls.sent.length, 1);
assert.equal(state(dir), "running");   // a wake does not close anything itself

// 2b. a mastermind that committed but logged no outcome is woken, not completed (it commits at every step and may be waiting on a review)
dir = mk(done); calls.sent.length = 0;
assert.equal(agent(dir, { id: "mastermind-x", role: "mastermind" }).close_loop(), "wake"); assert.equal(calls.sent.length, 1); assert.equal(state(dir), "running");

// 3. stopped (not woken): a finished task completes, an unfinished one gets one log line and stays open for StaleClose to read `unclosed`
dir = mk(done); assert.equal(agent(dir).close_loop(true), "complete"); assert.equal(state(dir), "complete");
dir = mk(logs); calls.sent.length = 0;
assert.equal(agent(dir).close_loop(true), "wake"); assert.equal(calls.sent.length, 0);
assert.match(fs.readFileSync(path.join(dir, "task.jsonl"), "utf8"), /task still open and no outcome logged/);
assert.equal(state(dir), "running");

// 4. nothing happens: error end, BLOCKED, children working, a fork, a task-less agent, a task waiting on purpose
assert.equal(agent(mk(done), { last_error: "429" }).close_loop(), null);
assert.equal(agent(mk(done), { words: "BLOCKED: need a key" }).close_loop(), null);
assert.equal(agent(mk(logs), { host: { live: new Map([["k", { parent: "minion-x", state: "working" }]]), store: () => ({ append: async () => {} }) } }).close_loop(), null);
assert.equal(agent(mk(done), { one_shot: true }).close_loop(), null);
assert.equal(agent(mk(done), { task: null }).close_loop(), null);
assert.equal(agent(mk([...logs, { wait: { at: "2026-11-02T10:06:00-06:00", on: "owner", what: "a look" } }])).close_loop(), null);

// 5. a landed worker is not woken by news: an FYI from a sibling or clarity agent goes to the task log; the owner, a tab, its parent, priority now and revive still wake it; a mastermind and an open task are never held back
const complete = [...done, { complete: { at: "2026-11-02T10:10:00-06:00", outcome: "ok", evidence: ["abc1234"] } }];
dir = mk(complete); a = agent(dir, { parent: "mastermind-p" });
assert.equal(a.landed_fyi("clarity: I rewrote your title", { from: "clarity-x" }), true);
assert.match(fs.readFileSync(path.join(dir, "task.jsonl"), "utf8"), /FYI from clarity-x \(task complete/);
for (const from of ["owner", "vscode-ab12", "mastermind-p", "voice-app"]) assert.equal(a.landed_fyi("q", { from }), false, from);
assert.equal(a.landed_fyi("q", { from: "clarity-x", priority: "now" }), false);
assert.equal(a.landed_fyi("q", { from: "clarity-x", revive: true }), false);
assert.equal(a.landed_fyi("q", {}), false);   // no sender: wakes
assert.equal(agent(dir, { role: "mastermind", id: "mastermind-x" }).landed_fyi("news", { from: "clarity-x" }), false);
assert.equal(agent(mk(logs)).landed_fyi("news", { from: "clarity-x" }), false);   // task still open: wakes
// send() returns early and pushes nothing for an FYI
dir = mk(complete); a = agent(dir, { send: Agent.prototype.send, state: "idle", queue: { push(){ throw new Error("must not push"); } }, emit(){}, watchdog_refusal: () => null });
assert.equal(a.send("merge news", { from: "minion-sibling" }), a);
assert.equal(a.state, "idle");
console.log("ok");
