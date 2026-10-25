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
	start(){ this.queue = new this.constructor.Queue(); this.aborter = { abort(){} }; this.query = { close(){} }; this.claude_pid = process.pid; this.session_id ??= "fake-" + Math.random().toString(36).slice(2); this.state = "idle"; return this; }
}
class Host extends Agents { wake_parent(child, kind, opts){ (this.calls ??= []).push({ kind, quiet: !!opts?.quiet }); } }
Host.Agent = FakeAgent;
const host = new Host({ registry_dir: path.join(dir, "reg"), servex: { say(){} } });
const agent = host.spawn({ task: false, id: "mastermind-f", role: "mastermind", name: "f", parent: "session-p" });

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
agent.send("f", { from: "servex-follow" }); agent.send("q", { from: "session-p" });   // a followed turn runs, a real question waits behind it
agent.emit({ type: "transcript", text: "ok" }); host.calls = [];
Agents.Agent.prototype.emit.call(agent, { type: "result", ok: true });
assert.ok(isquiet(host.calls), "the followed turn ahead of it is quiet");
agent.emit({ type: "transcript", text: "yes" }); host.calls = [];
Agents.Agent.prototype.emit.call(agent, { type: "result", ok: true });
assert.ok(!isquiet(host.calls), "the turn answering the real question is not swallowed");
assert.ok(isquiet(turn(["servex-follow"], "ok")), "then followed lines are quiet again");
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
console.log("Follow-ack: ok");
process.exit(0);
