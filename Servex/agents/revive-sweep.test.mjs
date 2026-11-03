/* node Servex/agents/revive-sweep.test.mjs — the boot sweep brings back every agent that was open, even one whose first task landed. */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const home = fs.mkdtempSync(path.join(os.tmpdir(), "servex-sweep-"));
process.env.SERVEX_HOME = home;
const { Agents } = await import("./Agents.js");

const task = path.join(home, "task"); fs.mkdirSync(task);
fs.writeFileSync(path.join(task, "task.jsonl"), JSON.stringify({ assign: { now: "x" } }) + "\n" + JSON.stringify({ landed_at: "2026-10-22T20:00:00-05:00" }) + "\n");
const row = (id, state, extra = {}) => ({ id, role: "mastermind", name: id, state, session_id: `sess-${id}`, started_at: "2026-10-22T10:00:00Z",
	boot: "OLD-1", pid: 1, revivable: true, cwd: home, task_dir: task, turns: 3, last_at: new Date().toISOString(), ...extra });

const a = new Agents({ boot: Date.now().toString(36) + "-2" });
const reg = a.reg();
reg.save({ working: row("working", "working"), queued: row("queued", "idle", { turns: 0, session_id: null }),
	orphan: row("orphan", "idle", { turns: 0, session_id: null, task_dir: null }), stopped: row("stopped", "idle", { stopped_by: "owner" }) });
reg.mark_boot("OLD-1");
const reopened = [];
const fresh = {};
a.reopen = r => { reopened.push(r.id); fresh[r.id] = r.session_id === undefined; return { send(){ } }; };
a.recent_log = () => true;
const out = a.revive();
assert.deepEqual(reopened.sort(), ["queued", "working"].sort(), "working and queued rows, both with a LANDED task, are reopened: " + JSON.stringify(out));
assert.ok(!out.gone.includes("working") && !out.gone.includes("queued"));
assert.ok(fresh.queued && !fresh.working, "the never-started row starts fresh; the working row resumes its session");
assert.ok(out.gone.includes("orphan") && /not revived/.test(reg.read().orphan.ended), "a never-started row with no task folder is buried, the reason on its row");
console.log("revive-sweep: 4 checks passed");
process.exit(0);
