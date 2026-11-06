/* node Servex/TaskLoop-close.test.mjs — close_task with `outcome` writes one `complete` line before the close; without it the task is only stopped. */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const { default: TaskLoop } = await import("./TaskLoop.js");
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "taskloop-close-"));
const servex = { lifecycle: { closeout: async () => ({ ok: true, closed: [], left: [] }) } };
const loop = new TaskLoop({ root: dir, servex, quiet_min: 9999 });
const lines = d => fs.readFileSync(path.join(dir, d, "task.jsonl"), "utf8").trim().split("\n").map(l => JSON.parse(l));
const make = d => { fs.mkdirSync(path.join(dir, d), { recursive: true }); fs.writeFileSync(path.join(dir, d, "task.jsonl"), JSON.stringify({ assign: { now: "x" } }) + "\n"); };

make("landed");
const r = await loop.close_task({ dir: "landed", by: "t", outcome: "built it", evidence: "test ok" });
assert.equal(r.ok, true);
const l = lines("landed"), ci = l.findIndex(x => x.complete), ai = l.findIndex(x => x.assign?.closed_by);
assert.ok(ci > 0 && ai > ci, "complete line written before the close line");
assert.deepEqual(l[ci].complete.evidence, ["test ok"], "evidence string becomes a list");
assert.equal(l[ci].complete.outcome, "built it");

await loop.close_task({ dir: "landed", by: "t", outcome: "again" });
assert.equal(lines("landed").filter(x => x.complete).length, 1, "a second call does not write a second complete");

make("stopped");
await loop.close_task({ dir: "stopped", by: "t", why: "dropped" });
assert.equal(lines("stopped").filter(x => x.complete).length, 0, "no outcome: no complete line");

console.log("TaskLoop close_task outcome: ok");
try { fs.rmSync(dir, { recursive: true, force: true }); } catch {}
process.exit(0);
