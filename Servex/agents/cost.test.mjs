/* node Servex/agents/cost.test.mjs — an agent's cost is the SUM of its turns across sleep/awaken and a Servex restart.
 * Real Agents class; only start() is faked (no claude.exe), scratch SERVEX_HOME, no live Servex touched. */
import "./test-store.mjs";   // FIRST: points the session store at a scratch dir, so spawned fakes never land in the real one
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const dir = fs.mkdtempSync(path.join(os.tmpdir(), "agent-cost-test-"));
process.env.SERVEX_HOME = dir;
const { Agents } = await import("./Agents.js");

class FakeAgent extends Agents.Agent {
	start(){
		this.queue = new this.constructor.Queue(); this.aborter = { abort(){} }; this.query = { close(){} };
		this.proc_cost = 0;   // what the real start() does
		this.session_id ??= this.resume ?? "fake-session-1"; this.state = "idle";
		return this;
	}
}
const make = () => { const a = new Agents({ registry_dir: path.join(dir, "reg"), servex: { say(){} } }); a.constructor.Agent; return a; };
Agents.Agent = FakeAgent;
const turn = (agent, total) => agent.result({ total_cost_usd: total, num_turns: 1, queued_turn_count: 0 });
const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} !== ${b}`);

const host = make();
const a = host.spawn({ id: "cost-stub", role: "agent", cwd: dir, model: "claude-sonnet-5-5", prompt: null });
a.host = host;
turn(a, 0.10); turn(a, 0.25);            // two turns in one process: SDK totals 0.10 then 0.25
near(a.cost, 0.25); near(a.turn_cost, 0.15);
a.state = "idle"; a.awoken_at = 0; a.sleep("test"); a.awaken("test");   // new process: SDK total restarts at 0
turn(a, 0.05);                            // 0.05 in the new process
near(a.cost, 0.30);                       // 0.25 + 0.05, not 0.05
const row = host.reg().read()["cost-stub"];
near(row.cost, 0.30); assert.equal(row.turns, 3);
await new Promise(r => setTimeout(r, 300));   // let the single writer flush the log
near(host.logged_cost("cost-stub"), 0.30);    // the records alone give the same total
// a Servex restart: a fresh host reopens the row; the cost continues, never 0
const host2 = make();
const b = host2.reopen(host2.reg().read()["cost-stub"]);
near(b.cost, 0.30);
turn(b, 0.07); near(b.cost, 0.37);
console.log("cost.test.mjs: all checks passed", b.cost);
process.exit(0);
