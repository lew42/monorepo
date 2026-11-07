/* node Servex/Lineage.test.mjs — a sampled child of an agent's claude.exe gets a start line, then an end line when it is gone; SpawnLog-logged pids are skipped and inherited; the per-minute cap holds. */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "lineage-test-"));
process.env.SERVEX_HOME = path.join(tmp, "home");   // before home.js loads
const { default: Lineage } = await import("./Lineage.js");
const { default: SpawnLog } = await import("./SpawnLog.js");
const { default: Processes } = await import("./Processes.js");

const proc = (pid, ppid, name, cmd = name, born = 1000) => ({ pid, ppid, name, cmd, born });
const table = (...ps) => new Map(ps.map(p => [p.pid, p]));
const up = procs => p => { const q = procs.get(p.ppid); return q && q.born <= p.born ? q : null; };
const owners = new Map([[100, { agent: "minion-t", session: "uuid-1", dir: "/t/dir" }]]);
const run = (lin, procs, now) => lin.tick({ procs, up: up(procs), owners, self: 50, now });
const starts = w => w.filter(x => "pid" in x.line), ends = w => w.filter(x => "pid_exit" in x.line);

// 1. a first sample: the agent's bash and its grep get start lines; claude.exe itself, conhost and strangers do not
const lin = new Lineage();
let procs = table(proc(50, 1, "node.exe"), proc(100, 50, "claude.exe"), proc(101, 100, "bash.exe", "bash -c sleep 99"), proc(102, 101, "grep.exe", "grep foo"),
	proc(103, 101, "conhost.exe"), proc(300, 1, "Code.exe"), proc(301, 300, "chrome.exe"));
let w = run(lin, procs, 1_000_000);
assert.deepEqual(starts(w).map(x => x.line.pid).sort(), [101, 102], "bash and grep only");
const bash = starts(w).find(x => x.line.pid === 101).line;
assert.equal(Object.keys(bash)[0], "pid"); assert.equal(bash.agent, "minion-t"); assert.equal(bash.session, "uuid-1");
assert.equal(bash.why, "child of claude.exe"); assert.equal(bash.seen, "sample"); assert.ok(bash.started); assert.equal(bash.ppid, 100);
assert.equal(w[0].ctx.dir, "/t/dir");
console.log("PASS  new descendants of an agent's claude.exe get start lines; claude.exe, conhost and strangers do not");

// 2. the same sample again writes nothing; a gone process gets one end line with code null
assert.equal(run(lin, procs, 1_010_000).length, 0, "no second line for a pid already logged");
procs = table(proc(50, 1, "node.exe"), proc(100, 50, "claude.exe"), proc(300, 1, "Code.exe"), proc(301, 300, "chrome.exe"));
w = run(lin, procs, 1_020_000);
assert.deepEqual(ends(w).map(x => x.line.pid_exit).sort(), [101, 102]);
assert.equal(ends(w)[0].line.code, null); assert.equal(ends(w)[0].line.seen, "sample"); assert.ok(ends(w)[0].line.ended);
assert.equal(Object.keys(ends(w)[0].line)[0], "pid_exit");
assert.equal(run(lin, procs, 1_030_000).length, 0, "an end line is written once");
console.log("PASS  a gone process gets one end line (code null, seen sample)");

// 3. a pid born again under the same number is a new process
procs = table(proc(50, 1, "node.exe"), proc(100, 50, "claude.exe"), proc(101, 100, "node.exe", "node x.js", 2000));
assert.equal(starts(run(lin, procs, 1_040_000)).length, 1);
procs = table(proc(50, 1, "node.exe"), proc(100, 50, "claude.exe"), proc(101, 100, "bash.exe", "other", 3000));
w = run(lin, procs, 1_050_000);
assert.equal(ends(w).length, 1, "the old 101 ended"); assert.equal(starts(w).length, 1, "the new 101 started");
console.log("PASS  pid reuse is told apart by start time");

// 4. a pid SpawnLog logged is skipped, and its children inherit its agent and why; Servex's own children go to no agent
SpawnLog.logged.set(200, { agent: "minion-t", session: "uuid-1", why: "shell", dir: "/t/dir", ended: null });
procs = table(proc(50, 1, "node.exe"), proc(100, 50, "claude.exe"), proc(200, 50, "node.exe", "node srv.js"), proc(201, 200, "node.exe", "node child.js"), proc(51, 50, "whisper-server.exe"));
w = run(new Lineage(), procs, 2_000_000);
assert.deepEqual(starts(w).map(x => x.line.pid).sort(), [201, 51]);
assert.equal(starts(w).find(x => x.line.pid === 201).line.why, "child of shell");
assert.equal(starts(w).find(x => x.line.pid === 201).line.agent, "minion-t");
assert.equal(starts(w).find(x => x.line.pid === 51).line.agent, null); assert.equal(starts(w).find(x => x.line.pid === 51).line.why, "child of servex");
console.log("PASS  logged pids are skipped, their children inherit; Servex's own children have no agent");

// 5. the cap: only `cap` start lines per owner per minute, the rest are counted in one pid_dropped line; a new minute starts again
const capped = new Lineage({ cap: 3 });
procs = table(proc(50, 1, "node.exe"), proc(100, 50, "claude.exe"), ...[...Array(8).keys()].map(i => proc(500 + i, 100, "sleep.exe")));
w = run(capped, procs, 3_000_000);
assert.equal(starts(w).length, 3); assert.equal(w.filter(x => "pid_dropped" in x.line).length, 1); assert.equal(w.at(-1).line.pid_dropped, 5);
assert.equal(w.at(-1).line.cap, 3);
w = run(capped, procs, 3_010_000);
assert.equal(w.length, 0, "same minute: nothing more, nothing repeated");
w = run(capped, procs, 3_070_000);
assert.equal(starts(w).length, 3, "a new minute logs the next three");
console.log("PASS  per-owner per-minute cap, with the dropped count");

// 6. Processes.trace writes through SpawnLog into the agent's session log (and into `spawns` for an agent-less owner)
const dir = path.join(tmp, "task"); fs.mkdirSync(dir); fs.writeFileSync(path.join(dir, "session.jsonl"), JSON.stringify({ session: { id: "x", at: 1 } }) + "\n");
const live = new Map([["minion-t", { id: "minion-t", state: "working", claude_pid: 100, session_id: "uuid-1", task: { dir } }]]);
const pm = new Processes({ servex: { agents: { live, constructor: {} } } });
pm.procs = table(proc(50, 1, "node.exe"), proc(100, 50, "claude.exe", "claude --resume=aaaaaaaa-0000-0000-0000-000000000000"), proc(101, 100, "bash.exe", "bash"));
pm.trace(Date.now()); await SpawnLog.flush();
const log = fs.readFileSync(path.join(dir, "session.jsonl"), "utf8").split("\n").filter(Boolean).map(l => JSON.parse(l));
assert.ok(log.some(l => l.pid === 101 && l.agent === "minion-t" && l.seen === "sample" && l.by === "servex"), "the start line is in the agent's session log");
pm.procs = table(proc(50, 1, "node.exe"), proc(100, 50, "claude.exe"));
pm.trace(Date.now()); await SpawnLog.flush();
assert.ok(fs.readFileSync(path.join(dir, "session.jsonl"), "utf8").includes('"pid_exit":101,'), "and its end line");
console.log("PASS  Processes.trace writes sampled lines into the agent's session log");

fs.rmSync(tmp, { recursive: true, force: true });
process.exit(0);
