/* node Servex/agents/crash-revive.test.mjs — Servex died and nobody was told: the next boot still brings back the agents that were open.
 * Three ways it dies: (1) no snapshot at all (a native fast-fail, a kill); (2) the exit handler ran first and stopped everyone,
 * which is what happened at 00:31 on 2026-11-02 and revived nobody; (3) a deliberate stop must stay stopped in both. */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const home = fs.mkdtempSync(path.join(os.tmpdir(), "servex-crash-"));
process.env.SERVEX_HOME = home;
process.env.SERVEX_REVIVE_GAP_S = "0";   // checks 1-3 want every agent reopened in the same pass; check 4 turns the stagger on
const { Agents } = await import("./Agents.js");

const open_task = path.join(home, "open"); fs.mkdirSync(open_task);
fs.writeFileSync(path.join(open_task, "task.jsonl"), JSON.stringify({ assign: { now: "x" } }) + "\n");
const landed_task = path.join(home, "landed"); fs.mkdirSync(landed_task);
fs.writeFileSync(path.join(landed_task, "task.jsonl"), JSON.stringify({ assign: { now: "x" } }) + "\n" + JSON.stringify({ complete: {} }) + "\n");

const hours_ago = h => new Date(Date.now() - h * 3600000).toISOString();
const row = (id, state, extra = {}) => ({ id, role: "mastermind", name: id, state, session_id: `sess-${id}`, started_at: "2026-10-22T10:00:00Z",
	boot: "OLD-1", pid: 1, revivable: true, cwd: home, task_dir: open_task, turns: 3, last_at: new Date().toISOString(), stopped_by: null, ...extra });

function boot(rows, snapshot, { gap_s, fail = [] } = {}){
	fs.rmSync(path.join(home, "restart-snapshot.json"), { force: true });
	const a = new Agents({ boot: Date.now().toString(36) + "-2" });
	a.reg().save(rows); a.reg().mark_boot("OLD-1");
	if (snapshot) fs.writeFileSync(a.reg().file("restart-snapshot.json"), JSON.stringify({ boot: "OLD-1", at: new Date().toISOString(), ...snapshot }));
	const told = {}, order = [];
	a.reopen = r => { if (fail.includes(r.id)) throw new Error("no cwd"); order.push(r.id); return { send: text => { told[r.id] = text; } }; };
	a.recent_log = () => false;
	return { out: a.revive(gap_s === undefined ? {} : { gap_s }), told, order, reg: a.reg(), agents: a };
}

// 1. a crash with no snapshot: working, long-idle (past the 30-minute window) with a live task, and the ones that must stay out
{
	const { out, told } = boot({
		working: row("working", "working"),
		long_idle: row("long_idle", "idle", { last_at: hours_ago(5) }),
		landed: row("landed", "idle", { last_at: hours_ago(5), task_dir: landed_task }),
		no_task: row("no_task", "idle", { last_at: hours_ago(5), task_dir: null }),
		not_revivable: row("not_revivable", "idle", { last_at: hours_ago(5), revivable: false }),
		owner_stopped: row("owner_stopped", "stopped", { stopped_by: "owner" }),
	});
	assert.deepEqual(out.revived.sort(), ["long_idle", "working"], "no snapshot: " + JSON.stringify(out));
	assert.match(told.working, /Servex crashed at about \d\d:\d\d mid-turn; resume/);
	assert.match(told.long_idle, /Servex crashed at about \d\d:\d\d; resume/);
}

// 2. the exit handler ran: snapshot written first (how: crash), the rows were then stopped by Servex itself (stopped_by null)
{
	const { out, told } = boot({
		working: row("working", "stopped"),
		idle: row("idle", "stopped", { last_at: hours_ago(5) }),
		owner_stopped: row("owner_stopped", "stopped", { stopped_by: "owner" }),
		stopped_before: row("stopped_before", "stopped"),   // stopped earlier, not in the snapshot
	}, { by: "shutdown", how: "crash", agents: [{ id: "working", state: "working" }, { id: "idle", state: "idle" }] });
	assert.deepEqual(out.revived.sort(), ["idle", "working"], "exit handler ran: " + JSON.stringify(out));
	assert.match(told.working, /Servex crashed at \d\d:\d\d mid-turn; resume/);
}

// 3. a planned restart still says restarted, and a stopped row not listed stays stopped
{
	const { out, told } = boot({ working: row("working", "working"), stopped: row("stopped", "stopped") },
		{ by: "mastermind-x", agents: [{ id: "working", state: "working" }] });
	assert.deepEqual(out.revived, ["working"]);
	assert.match(told.working, /Servex restarted at \d\d:\d\d \(asked by mastermind-x\) mid-turn/);
}

// 4. staggered: mid-turn agents first, one every gap; the first goes now, the rest later; a session that cannot reopen is buried, not lost silently
{
	const { out, told, order, reg } = boot({ idle_a: row("idle_a", "idle"), working: row("working", "working"), idle_b: row("idle_b", "idle"), broken: row("broken", "idle") },
		undefined, { gap_s: 0.1, fail: ["broken"] });
	assert.deepEqual(out.revived.sort(), ["broken", "idle_a", "idle_b", "working"], "all four are counted at once: " + JSON.stringify(out));
	assert.deepEqual(order, ["working"], "only the mid-turn agent is reopened in the first pass");
	await new Promise(r => setTimeout(r, 700));
	assert.equal(order[0], "working"); assert.deepEqual(order.slice(1).sort(), ["idle_a", "idle_b"], "the others follow: " + order);
	assert.ok(told.idle_a && told.idle_b && told.working, "every reopened agent was told");
	assert.equal(reg.read().broken.state, "gone", "a session that could not be reopened is marked gone");
	assert.match(reg.read().broken.ended, /could not be reopened/);
}

// 5. a second crash while the first boot's queue is still waiting: nobody still queued is lost (the reviewer's must-fix)
{
	const first = boot({ w: row("w", "stopped"), a: row("a", "stopped"), b: row("b", "stopped") },
		{ by: "shutdown", how: "crash", agents: [{ id: "w", state: "working" }, { id: "a", state: "idle" }, { id: "b", state: "idle" }] }, { gap_s: 30 });
	assert.deepEqual(first.order, ["w"], "only the first is reopened now");
	const snap = first.agents.snapshot({ by: "x" });
	assert.deepEqual(snap.agents.map(x => x.id).sort(), ["a", "b"], "the snapshot lists the agents still waiting (w was reopened, and the stub is not in the live map): " + JSON.stringify(snap.agents));
	const rows = first.reg.read();
	assert.equal(rows.a.boot, first.agents.boot, "a waiting row now belongs to the live boot"); assert.equal(rows.a.state, "idle");
	// the first Servex dies with no snapshot; the next boot (a second crash) must still bring all three back
	fs.rmSync(path.join(home, "restart-snapshot.json"), { force: true });
	const b2 = new Agents({ boot: (Date.now() + 1).toString(36) + "-3" }), told2 = {};
	b2.reopen = r => ({ send: text => { told2[r.id] = text; } }); b2.recent_log = () => false;
	const out2 = b2.revive({ gap_s: 0 });
	assert.deepEqual(out2.revived.sort(), ["a", "b", "w"], "second crash: " + JSON.stringify(out2));
}

// 6. stopped on purpose while it waits its turn: it is not reopened, and the snapshot stops listing it
{
	const { order, reg, agents } = boot({ w: row("w", "working"), keep: row("keep", "idle"), stopme: row("stopme", "idle") }, undefined, { gap_s: 0.1 });
	const rows = reg.read(); rows.stopme = { ...rows.stopme, stopped_by: "owner", state: "stopped" }; reg.save(rows);
	assert.ok(!agents.snapshot({ by: "x" }).agents.some(a => a.id === "stopme"), "the snapshot drops it");
	await new Promise(r => setTimeout(r, 500));
	assert.deepEqual(order.sort(), ["keep", "w"], "stopme is never reopened: " + order);
}

console.log("crash-revive: 23 checks passed");
process.exit(0);
