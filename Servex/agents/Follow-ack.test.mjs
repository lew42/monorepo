/* node Servex/agents/Follow-ack.test.mjs — a turn started only by followed lines that ends with a short ack does not wake the parent (Agents.wake_parent's `quiet`); a real message, a long answer, BLOCKED or a landed task still do. */
import "./test-store.mjs";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const dir = fs.mkdtempSync(path.join(os.tmpdir(), "follow-ack-test-"));
process.env.SERVEX_HOME = dir;
const { Agents } = await import("./Agents.js");

class FakeAgent extends Agents.Agent {
	start(){ this.queue = new this.constructor.Queue(); this.aborter = { abort(){} }; this.query = { close(){} }; this.claude_pid = process.pid; this.session_id ??= "fake-" + Math.random().toString(36).slice(2); this.state = "idle"; if (this.prompt) this.queue.push(this.turn(this.prompt)); return this; }
}
class Host extends Agents { wake_parent(child, kind, opts){ (this.calls ??= []).push({ kind, quiet: !!opts?.quiet }); } }
Host.Agent = FakeAgent;
const host = new Host({ registry_dir: path.join(dir, "reg"), servex: { say(){} } });
const agent = host.spawn({ task: false, id: "mastermind-f", role: "mastermind", name: "f", parent: "session-p" });

Agents.Agent.prototype.emit.call(agent, { type: "result", ok: true });   // the spawn's own first turn ends first
function turn(messages, text){
	for (const from of messages) agent.send("x", { from });
	agent.emit({ type: "transcript", text });
	host.calls = [];
	Agents.Agent.prototype.emit.call(agent, { type: "result", ok: true });
	return host.calls;
}
const isquiet = c => c.length === 1 && c[0].quiet;

assert.ok(isquiet(turn(["servex-follow"], "nothing for me")), "short ack after a followed line is quiet");
assert.ok(!isquiet(turn(["servex-follow"], "x".repeat(300))), "a long answer wakes the parent");
assert.ok(!isquiet(turn(["servex-follow"], "BLOCKED: need a key")), "BLOCKED wakes the parent");
assert.ok(!isquiet(turn(["session-p"], "yes")), "an answer to a real message wakes the parent");
const done = text => { agent.emit({ type: "transcript", text }); host.calls = []; Agents.Agent.prototype.emit.call(agent, { type: "result", ok: true }); return host.calls; };
agent.send("f", { from: "servex-follow" }); agent.send("q", { from: "session-p" });   // a followed turn runs, a real question waits behind it
assert.ok(isquiet(done("ok")), "turn 1 (followed) is quiet");
agent.send("g", { from: "servex-follow" });   // another followed line arrives while the question's turn runs
assert.ok(!isquiet(done("yes")), "turn 2 (the real question) still wakes the parent");
assert.ok(isquiet(done("ok")), "then the followed line's turn is quiet");
agent.queue.push(agent.turn("/compact"));   // /compact is direct
assert.ok(!isquiet(done("compacted")), "a /compact turn is never quiet");
// the first prompt is a real message: a followed line arriving while the brief's turn runs does not make its short reply quiet
const briefed = host.spawn({ task: false, id: "mastermind-b", role: "mastermind", name: "b", parent: "session-p", prompt: "go" });
briefed.send("f", { from: "servex-follow" });
briefed.emit({ type: "transcript", text: "Spawned the minion." }); host.calls = [];
Agents.Agent.prototype.emit.call(briefed, { type: "result", ok: true });
assert.ok(!isquiet(host.calls), "the brief's own turn is not swallowed");

// the real wake_parent: quiet skips only the message to the parent
const sent = [];
class Real extends Agents { send(id, text){ sent.push({ id, text }); } }
Real.Agent = FakeAgent;
const real = new Real({ registry_dir: path.join(dir, "reg2"), servex: { say(){} } });
const child = { id: "mastermind-r", parent: "session-p", last_text: "nothing for me", cost: 1 };
real.wake_parent(child, "done", { quiet: true });
assert.equal(sent.length, 0, "quiet: the parent is not messaged");
real.wake_parent({ ...child, woke: false }, "done");
assert.equal(sent.length, 1, "not quiet: the parent is messaged");

// step 4 (one place per conversation, 2026-11-09): a REPEATED "done" to an EXTERNAL parent is not re-sent
real.external = { has: id => id === "voice-app" };
sent.length = 0;
const ext_child = { id: "mastermind-e", parent: "voice-app", last_text: "nothing changed", cost: 1 };
real.wake_parent({ ...ext_child, woke: false }, "done");
assert.equal(sent.length, 1, "the FIRST done to an external parent is sent");
real.wake_parent({ ...ext_child, woke: false }, "done");
assert.equal(sent.length, 1, "the SAME done again is skipped, not re-sent");
real.wake_parent({ ...ext_child, last_text: "something new happened", woke: false }, "done");
assert.equal(sent.length, 2, "a genuinely different done still goes through");
assert.equal(real._dup_done_skips, 1, "the skip is counted on the host, not logged per occurrence");
// the skip is ONLY the message — the task-dir inbox.jsonl line still happens, same as any other "done" (fix E: an earlier version's early `return` dropped it too)
const task_dir = fs.mkdtempSync(path.join(dir, "task-"));
fs.writeFileSync(path.join(task_dir, "task.jsonl"), "{}\n");
const parent_dir = path.dirname(task_dir);
real.task_dir_of = id => id === "voice-app" ? parent_dir : null;
const inbox_file = path.join(parent_dir, "inbox.jsonl");
const dup_child = { id: "mastermind-i", parent: "voice-app", last_text: "same inbox text", cost: 1, task: { dir: task_dir } };
real.wake_parent({ ...dup_child, woke: false }, "done");
const after_first = fs.readFileSync(inbox_file, "utf8").trim().split("\n").length;
real.wake_parent({ ...dup_child, woke: false }, "done");   // the duplicate: message skipped, but the inbox line must still append
const after_second = fs.readFileSync(inbox_file, "utf8").trim().split("\n").length;
assert.equal(after_second, after_first + 1, "a duplicate done still appends to the task's own inbox.jsonl — only the SEND to the parent is skipped");

console.log("Follow-ack: ok");
process.exit(0);
