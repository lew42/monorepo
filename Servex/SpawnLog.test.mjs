/* node Servex/SpawnLog.test.mjs — a real child process is logged with its pid under the calling agent (start + exit), in the parent's log too for claude.exe, and with no agent in the `spawns` log. */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn, execFile } from "node:child_process";
import { promisify } from "node:util";

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "spawnlog-test-"));
process.env.SERVEX_HOME = path.join(tmp, "home");   // before home.js loads
await import("./Crumbs.js");                         // installs the child_process wrappers
const { default: SpawnLog } = await import("./SpawnLog.js");
const exec_file = promisify(execFile);   // after Crumbs, so it wraps the patched execFile

const task = path.join(tmp, "agent-task"), parent = path.join(tmp, "parent-task");
for (const d of [task, parent]){ fs.mkdirSync(d); fs.writeFileSync(path.join(d, "session.jsonl"), JSON.stringify({ session: { id: "x", at: 1 } }) + "\n"); }
const read = f => fs.existsSync(f) ? fs.readFileSync(f, "utf8").split("\n").filter(Boolean).map(l => JSON.parse(l)) : [];
const run = child => new Promise(done => child.on("exit", () => done()));
const pids = lines => lines.filter(l => "pid" in l), exits = lines => lines.filter(l => "pid_exit" in l);

// 1. inside an agent's context: a start line and an exit line, pid first, in that agent's log
const child = SpawnLog.within({ agent: "minion-t", session: "uuid-1", why: "shell", dir: task }, () => spawn("node", ["-e", "1"], { windowsHide: true }));
await run(child); await SpawnLog.flush();
let lines = read(path.join(task, "session.jsonl")).slice(1);
assert.equal(pids(lines).length, 1, "one start line");
assert.equal(Object.keys(pids(lines)[0])[0], "pid", "pid is the first key");
assert.equal(pids(lines)[0].pid, child.pid);
assert.equal(pids(lines)[0].agent, "minion-t"); assert.equal(pids(lines)[0].session, "uuid-1"); assert.equal(pids(lines)[0].why, "shell");
assert.match(pids(lines)[0].cmd, /^node -e 1/);
assert.ok(pids(lines)[0].started && !("at" in pids(lines)[0]), "the start line carries `started`, not `at`");
assert.ok(exits(lines)[0].ended && !("at" in exits(lines)[0]), "the exit line carries `ended`, not `at`");
assert.equal(exits(lines).length, 1, "one exit line");
assert.equal(exits(lines)[0].pid_exit, child.pid); assert.equal(exits(lines)[0].code, 0);
assert.equal(pids(lines).concat(exits(lines)).length, lines.length, "nothing else landed");
assert.ok(fs.readFileSync(path.join(task, "session.jsonl"), "utf8").includes(`"pid":${child.pid},`), 'the text is exactly "pid":N');
assert.ok(fs.readFileSync(path.join(task, "session.jsonl"), "utf8").includes(`"pid_exit":${child.pid},`), 'the exit text is "pid_exit":N');
console.log("PASS  agent context: start and exit lines in the agent's session log");

// 2. claude.exe: also in the parent's log
const claude = SpawnLog.within({ agent: "minion-t", why: "claude.exe", dir: () => task, parent_dir: () => parent }, () => spawn("node", ["-e", "1"], { windowsHide: true }));
await run(claude); await SpawnLog.flush();
assert.equal(pids(read(path.join(parent, "session.jsonl"))).length, 1, "the parent's log has the claude.exe start line");
assert.equal(exits(read(path.join(parent, "session.jsonl"))).length, 1, "and its exit line");
assert.equal(pids(read(path.join(task, "session.jsonl"))).length, 2, "the agent's own log has both children");
console.log("PASS  claude.exe lines land in the agent's log and its parent's");

// 3. promisified execFile (what Servex's own git/PowerShell calls use) is hooked too, and still resolves {stdout}
const out = await SpawnLog.within({ agent: "minion-t", why: "execfile", dir: task }, () => exec_file(process.execPath, ["-p", "40+2"], { windowsHide: true }));
assert.equal(out.stdout.trim(), "42"); await SpawnLog.flush();
assert.equal(pids(read(path.join(task, "session.jsonl"))).length, 3, "promisified execFile logged");
console.log("PASS  promisify(execFile) logged and still resolves {stdout}");

// 4. no agent: the `spawns` log; a quiet poll is skipped
const spawns = path.join(tmp, "home", "logs", "spawns.jsonl");
const bare = spawn("node", ["-e", "1"], { windowsHide: true }); await run(bare); await SpawnLog.flush();
const quiet = spawn("node", ["-e", "//Get-CimInstance Win32_Process"], { windowsHide: true }); await run(quiet); await SpawnLog.flush();
lines = read(spawns);
assert.equal(pids(lines).length, 1, "the unattributed spawn is in the spawns log, the quiet poll is not");
assert.equal(pids(lines)[0].pid, bare.pid); assert.equal(pids(lines)[0].agent, null);
assert.equal(exits(lines)[0].pid_exit, bare.pid);
console.log("PASS  no agent: spawns log; quiet polls skipped");

// 5. a context with no resolvable task dir falls back to the spawns log and never throws
const lost = SpawnLog.within({ agent: "ghost", why: "x", dir: () => { throw new Error("boom"); } }, () => spawn("node", ["-e", "1"], { windowsHide: true }));
await run(lost); await SpawnLog.flush();
assert.ok(pids(read(spawns)).some(l => l.pid === lost.pid), "no dir: the spawns log");
console.log("PASS  an agent with no task dir lands in spawns");

fs.rmSync(tmp, { recursive: true, force: true });
process.exit(0);
