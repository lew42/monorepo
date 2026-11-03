/* node Servex/Heartbeat-held.test.mjs — a task waiting on the owner (or paused) is not silent: no status checks (2026-10-23). */
import assert from "node:assert";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

process.env.SERVEX_HOME = fs.mkdtempSync(path.join(os.tmpdir(), "hb-held-"));
const { default: Heartbeat } = await import("./Heartbeat.js");

const dir = fs.mkdtempSync(path.join(os.tmpdir(), "hb-task-")), file = path.join(dir, "task.jsonl");
const write = lines => fs.writeFileSync(file, lines.map(l => JSON.stringify(l)).join("\n") + "\n");
const hb = Object.create(Heartbeat.prototype);
Object.assign(hb, { since: 0, servex: { agents: { registry_list: () => [], reg: () => ({ read: () => ({}) }) } } });

write([{ assign: { agent: "minion-queue", heartbeat: true, now: "build" } }, { start: {} }]);
assert.equal(hb.read(file).held, false, "a running task is watched");
write([{ assign: { agent: "minion-queue", heartbeat: true, now: "build" } }, { start: {} }, { wait: { on: "owner", what: "the look" } }]);
assert.equal(hb.read(file).held, true, "waiting on the owner: held, no status checks");
write([{ assign: { agent: "minion-queue", heartbeat: true, now: "build" } }, { start: {} }, { pause: {} }]);
assert.equal(hb.read(file).held, true, "paused: held");
console.log("Heartbeat-held: 3 checks passed");
