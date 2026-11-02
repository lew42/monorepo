/* node Servex/agents/crash-revive.test.mjs — Servex died and nobody was told: the next boot still brings back the agents that were open.
 * Three ways it dies: (1) no snapshot at all (a native fast-fail, a kill); (2) the exit handler ran first and stopped everyone,
 * which is what happened at 00:31 on 2026-11-02 and revived nobody; (3) a deliberate stop must stay stopped in both. */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const home = fs.mkdtempSync(path.join(os.tmpdir(), "servex-crash-"));
process.env.SERVEX_HOME = home;
const { Agents } = await import("./Agents.js");

const open_task = path.join(home, "open"); fs.mkdirSync(open_task);
fs.writeFileSync(path.join(open_task, "task.jsonl"), JSON.stringify({ assign: { now: "x" } }) + "\n");
const landed_task = path.join(home, "landed"); fs.mkdirSync(landed_task);
fs.writeFileSync(path.join(landed_task, "task.jsonl"), JSON.stringify({ assign: { now: "x" } }) + "\n" + JSON.stringify({ complete: {} }) + "\n");

const hours_ago = h => new Date(Date.now() - h * 3600000).toISOString();
const row = (id, state, extra = {}) => ({ id, role: "mastermind", name: id, state, session_id: `sess-${id}`, started_at: "2026-10-22T10:00:00Z",
	boot: "OLD-1", pid: 1, revivable: true, cwd: home, task_dir: open_task, turns: 3, last_at: new Date().toISOString(), stopped_by: null, ...extra });

function boot(rows, snapshot){
	fs.rmSync(path.join(home, "restart-snapshot.json"), { force: true });
	const a = new Agents({ boot: Date.now().toString(36) + "-2" });
	a.reg().save(rows); a.reg().mark_boot("OLD-1");
	if (snapshot) fs.writeFileSync(a.reg().file("restart-snapshot.json"), JSON.stringify({ boot: "OLD-1", at: new Date().toISOString(), ...snapshot }));
	const told = {};
	a.reopen = r => ({ send: text => { told[r.id] = text; } });
	a.recent_log = () => false;
	return { out: a.revive(), told, reg: a.reg() };
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

console.log("crash-revive: 9 checks passed");
process.exit(0);
