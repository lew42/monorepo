// node Server/AIIndexStream.test.mjs — the scope lists: a day's first row adds the day, month and year; later rows add nothing; the backfill agrees with the live writer.
process.env.TZ = "America/Chicago";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import AIIndexStream from "./AIIndexStream.mjs";
import SessionScopes from "./SessionScopes.mjs";

const root = fs.mkdtempSync(path.join(os.tmpdir(), "scopes-test-")), lines = rel => fs.readFileSync(path.join(root, rel), "utf8").trim().split("\n").map(l => JSON.parse(l));
for (const [id, at] of [["a", "2026-10-24T12:00:00"], ["b", "2026-10-24T13:00:00"], ["c", "2026-10-25T12:00:00"], ["d", "2026-11-02T12:00:00"], ["e", "2027-01-02T12:00:00"]]) AIIndexStream.append(root, "session", { id }, at);
assert.deepEqual(lines("2026/10/index.jsonl"), [{ day: "2026/10/24" }, { day: "2026/10/25" }]);
assert.deepEqual(lines("2026/index.jsonl"), [{ month: "2026/10" }, { month: "2026/11" }]);
assert.deepEqual(lines("2027/index.jsonl"), [{ month: "2027/01" }]);
assert.deepEqual(lines("index.jsonl"), [{ year: "2026" }, { year: "2027" }]);
assert.equal(lines("2026/10/24/index.jsonl").length, 2);
assert.equal(SessionScopes.plan(root).length, 0, "the backfill finds nothing the live writer missed");
fs.rmSync(path.join(root, "2026/10/index.jsonl"));
assert.equal(SessionScopes.plan(root).length, 2, "a lost month list is rebuilt from its days");
console.log("AIIndexStream scopes: ok");
