/* node Servex/Gate-loud.test.mjs — a queued spawn writes ONE `queued` line and, when it starts, ONE `started` line, to its parent's session log; a restored entry writes no second `queued`. Fake Servex, no real spawn. */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { register } from "node:module";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";
// a worktree has no Servex/node_modules; resolve a missing package from the main tree's copy (read-only, never linked)
const common = execFileSync("git", ["rev-parse", "--path-format=absolute", "--git-common-dir"], { cwd: import.meta.dirname, encoding: "utf8", windowsHide: true }).trim();
const from = pathToFileURL(path.join(common, "..", "Servex", "x.js")).href;
register("data:text/javascript," + encodeURIComponent(`export async function resolve(s,c,n){ try { return await n(s,c); } catch(e){ if (e.code==='ERR_MODULE_NOT_FOUND' && !/^[.\/]|^node:|^file:/.test(s)) return n(s,{...c,parentURL:${JSON.stringify(from)}}); throw e; } }`));
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "gate-loud-test-"));
process.env.SERVEX_HOME = path.join(tmp, "home");
const { default: Servex } = await import("./Servex.js");
const { default: SpawnLog } = await import("./SpawnLog.js");

const dir = path.join(tmp, "parent-task");
fs.mkdirSync(dir); fs.writeFileSync(path.join(dir, "session.jsonl"), JSON.stringify({ session: { id: "p", at: 1 } }) + "\n");
const read = () => fs.readFileSync(path.join(dir, "session.jsonl"), "utf8").split("\n").filter(Boolean).slice(1).map(l => JSON.parse(l));

const started = [];
const fake = {
	queue: [], log: { append: () => Promise.resolve() }, procmon: { commit_mb: 8200, commit_limit_mb: 10000 },
	agents: { live: new Map([["mastermind-p", { task: { dir } }]]), name: ({ role, name }) => `${role}-${name}`, spawn_now: spec => (started.push(spec.id), { id: spec.id, send(){} }) },
	reserve(spec){ return Servex.prototype.reserve.call(this, spec); },
	save_queue(){}, stale: () => false, next_ready(){ return this.queue.length ? 0 : -1; }, emit(){}, dispatcher: { queue: [] }, pool: null,
};

Servex.prototype.hold.call(fake, { role: "minion", name: "a", parent: "mastermind-p" }, "commit charge is 82%");
Servex.prototype.hold.call(fake, { role: "minion", name: "r", parent: "mastermind-p" }, "restored", { restored: true });
await SpawnLog.flush();
let lines = read();
assert.equal(lines.length, 1, "one queued line, none for the restored entry");
assert.deepEqual(lines[0].queued, { agent: "minion-a", reason: "commit charge is 82%", commit_pct: 82, page_file_mb: null });
assert.equal(lines[0].by, "servex"); assert.ok(lines[0].ts);
assert.equal(Object.keys(lines[0])[0], "queued");

fake.queue[0].at = new Date(Date.now() - 42_000).toISOString();
Servex.prototype.drain.call(fake);
await SpawnLog.flush();
lines = read();
const begun = lines.filter(l => l.started);
assert.deepEqual(started, ["minion-a", "minion-r"], "both entries started");
assert.equal(begun.length, 2, "one started line each");
assert.equal(begun[0].started.agent, "minion-a"); assert.ok(begun[0].started.waited_s >= 42 && begun[0].started.waited_s < 50);
assert.equal(lines.filter(l => l.queued).length, 1, "still one queued line");
console.log("Gate-loud: ok");
fs.rmSync(tmp, { recursive: true, force: true });
process.exit(0);
