/* node Servex/agents/revive-guard-proof.mjs — nothing reopens an agent that
 * was stopped on purpose, whose task has landed, or whose directory is gone.
 * No claude process starts: `reopen` is replaced by a recorder, and the
 * registry lives in a temp dir. Exit 0 = every case behaved. */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { Agents, task_landed } from "./Agents.js";

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "revive-guard-"));
const cwd = path.join(tmp, "cwd"), gone = path.join(tmp, "deleted-worktree");
const open = path.join(tmp, "task-open"), landed = path.join(tmp, "task-landed"), bare = path.join(tmp, "task-bare");
for (const d of [cwd, open, landed, bare]) fs.mkdirSync(d);
fs.writeFileSync(path.join(open, "task.jsonl"), JSON.stringify({ assign: { agent: "m-open", now: "working" } }) + "\n");
fs.writeFileSync(path.join(landed, "task.jsonl"), [{ assign: { agent: "m-landed" } }, { assign: { landed_at: "2026-09-29T20:00:00-05:00", outcome: "done" } }].map(JSON.stringify).join("\n") + "\n");
fs.writeFileSync(path.join(bare, "task.jsonl"), [{ assign: { agent: "m-bare" } }, { landed_at: "2026-09-29T16:00:00-05:00", outcome: "done" }].map(JSON.stringify).join("\n") + "\n");

const host = new Agents({ registry_dir: tmp, log: { append: async () => {} } });
const reopened = [];
host.reopen = row => { reopened.push(row.id); return { id: row.id, send(){ return this; }, card: () => ({ id: row.id }) }; };
const row = (id, extra) => ({ id, role: "task-mastermind", state: "stopped", session_id: "s-" + id, cwd, revivable: true, ...extra });
host.reg().save({
	"m-open": row("m-open", { task_dir: open }),
	"m-landed": row("m-landed", { task_dir: landed }),
	"m-bare": row("m-bare", { task_dir: bare }),
	"m-orphan": row("m-orphan", { cwd: gone }),
	"m-gone-row": row("m-gone-row", { state: "gone", task_dir: open })
});

const results = [];
const check = (name, ok, detail) => { results.push({ name, ok, detail }); console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? " — " + detail : ""}`); };
const tries = (id, note) => { try { host.send(id, "hello", note); return null; } catch (e){ return e.message; } };

check("task_landed: assign landing line", task_landed(landed) === true);
check("task_landed: bare top-level landed_at", task_landed(bare) === true);
check("task_landed: open task", task_landed(open) === false);

let e = tries("m-open");
check("open task, stopped by Servex (not on purpose): a message wakes it", !e && reopened.includes("m-open"), e);
e = tries("m-landed");
check("landed task: a message does NOT wake it", !!e && !reopened.includes("m-landed"), e);
e = tries("m-bare");
check("bare landing line: not woken", !!e && !reopened.includes("m-bare"), e);
e = tries("m-orphan");
check("cwd gone: not woken, and the error names the missing directory", !!e && e.includes("no longer exists") && !e.includes("libc"), e);
e = tries("m-orphan", { revive: true });
check("cwd gone: not even with revive: true", !!e && !reopened.includes("m-orphan"), e);
e = tries("m-landed", { revive: true });
check("landed task, revive: true: woken on purpose", !e && reopened.includes("m-landed"), e);

host.stop("m-gone-row", { by: "mastermind-servex-7" });
const r = host.reg().read()["m-gone-row"];
check("stop_agent on a row with no live agent records stopped_by", r.stopped_by === "mastermind-servex-7", JSON.stringify({ state: r.state, stopped_by: r.stopped_by }));
reopened.length = 0;
e = tries("m-gone-row");
check("stopped on purpose (persisted in the registry): a message does NOT wake it", !!e && !reopened.length, e);

/* wake_parent: a child's done-notice to a parent stopped on purpose goes to the inbox only */
host.send_calls = 0; const real = host.send.bind(host); host.send = (...a) => { host.send_calls++; return real(...a); };
host.wake_parent({ id: "minion-x", parent: "m-gone-row", last_text: "done" }, "done");
check("wake_parent skips a parent stopped on purpose (read from the registry)", host.send_calls === 0);
host.send = real;

/* boot revive: previous boot's open rows, one landed, one orphaned, one open */
const boot = host.boot;
host.reg().save({
	"b-open": row("b-open", { state: "idle", boot: "prev", pid: 1, last_at: new Date().toISOString(), task_dir: open }),
	"b-landed": row("b-landed", { state: "idle", boot: "prev", pid: 1, last_at: new Date().toISOString(), task_dir: landed }),
	"b-orphan": row("b-orphan", { state: "working", boot: "prev", pid: 1, last_at: new Date().toISOString(), cwd: gone })
});
fs.writeFileSync(path.join(tmp, "boot.json"), JSON.stringify({ boot: "prev" }));
reopened.length = 0;
const out = host.revive();
check("boot revive reopens only the open-task agent", JSON.stringify(reopened) === '["b-open"]', JSON.stringify({ reopened, refused: out.refused }));
check("boot revive marks the landed and orphaned rows gone", ["b-landed", "b-orphan"].every(id => host.reg().read()[id].state === "gone"));

fs.rmSync(tmp, { recursive: true, force: true });
const failed = results.filter(r => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);
