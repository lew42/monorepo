// node Server/git-hooks/post-commit.test.mjs
import assert from "node:assert";
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { spawnSync, execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join, dirname, isAbsolute } from "node:path";
import { fileURLToPath } from "node:url";
import { Agents } from "../../Servex/agents/Agents.js";

const HOOK = join(dirname(fileURLToPath(import.meta.url)), "post-commit.mjs");
const tmp = mkdtempSync(join(tmpdir(), "pc-test-"));
const git = (...a) => execFileSync("git", a, { cwd: tmp, encoding: "utf8", windowsHide: true }).trim();
git("init", "-q"); writeFileSync(join(tmp, "a.txt"), "1");
git("add", "a.txt"); git("-c", "user.name=t", "-c", "user.email=t@t", "commit", "-qm", "x");
const hash = git("rev-parse", "--short=12", "HEAD");
const task = join(tmp, "task.jsonl");
writeFileSync(task, '{"launch":{"x":1}}\n');
const run = env => spawnSync("node", [HOOK], { cwd: tmp, env: { ...process.env, SERVEX_TASK: "", ...env }, encoding: "utf8", windowsHide: true });
const commits = () => readFileSync(task, "utf8").split("\n").filter(l => l.includes('"commit"'));

let r = run({}); assert.equal(r.status, 0); assert.equal(commits().length, 0, "unset: none");
r = run({ SERVEX_TASK: task }); assert.equal(r.status, 0, r.stderr); assert.deepEqual(commits().map(l => JSON.parse(l).commit), [hash], "one line");
run({ SERVEX_TASK: task }); assert.equal(commits().length, 1, "no duplicate");
r = run({ SERVEX_TASK: join(tmp, "missing.jsonl") }); assert.equal(r.status, 0, "missing file exits 0");

const door = t => Agents.Agent.prototype.door.call({ id: "m", host: { mcp_url: "http://127.0.0.1:1/mcp" }, task: t });
const nohost = t => Agents.Agent.prototype.door.call({ id: "m", task: t, env: undefined });
const e = door({ dir: "public/framework/x" }).env.SERVEX_TASK;
assert.ok(isAbsolute(e) && e.endsWith("task.jsonl"), "absolute: " + e);
assert.ok(nohost({ dir: "public/framework/x" }).env.SERVEX_TASK, "no-url branch too");
assert.equal(door(undefined).env.SERVEX_TASK, process.env.SERVEX_TASK, "no task, none added");

rmSync(tmp, { recursive: true, force: true });
console.log("post-commit.test.mjs: ok");
