// node Server/TaskDirs.test.mjs — the day-folder guard (2026-10-13): old addresses resolve into the store, nothing new
// is made under public/framework/ai/YYYY-MM-DD/, and no code hand-joins a day folder. Fixture repo in the OS temp dir.
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const real = path.resolve(here, "..");

// 1. the census over the REAL repo: no writer joins public/framework/ai with a date
const Real = (await import("./TaskDirs.mjs")).default;
const c = Real.census();
assert.deepEqual(c.writers, [], "code that hand-joins ai/<date>/: " + c.writers.join(", "));

// 2. a fixture store
const repo = fs.mkdtempSync(path.join(os.tmpdir(), "taskdirs-")), AI = path.join(repo, "public", "framework", "ai");
const task = path.join(AI, "sessions", "2026", "10", "13", "session-abcd1234", "parent", "my-slug");
fs.mkdirSync(task, { recursive: true }); fs.writeFileSync(path.join(task, "task.jsonl"), "{}\n");
process.env.LEDGER_ROOT = repo;
const T = (await import("./TaskDirs.mjs?fixture")).default;

assert.equal(T.locate("2026-10-13", "my-slug"), task, "a slug is found at any depth in its day");
assert.equal(T.locate("2026-10-13", "nope"), null);
assert.equal(T.redirect("/framework/ai/2026-10-13/my-slug/"), "/framework/ai/sessions/2026/10/13/session-abcd1234/parent/my-slug/", "a guessed old url redirects");
assert.equal(T.redirect("/framework/ai/2026-10-13/my-slug/task.jsonl"), "/framework/ai/sessions/2026/10/13/session-abcd1234/parent/my-slug/task.jsonl");
assert.equal(T.redirect("/framework/ai/2026-10-13/"), "/framework/ai/sessions/2026/10/13/", "a bare day goes to the store's day");
assert.equal(T.refuse(path.join(AI, "2026-10-13", "my-slug", "task.jsonl")), path.join(task, "task.jsonl"), "a findable old path is followed");
assert.throws(() => T.refuse(path.join(AI, "2026-10-13", "brand-new", "task.jsonl")), /retired day folder.*sessions\/2026\/10\/13/s, "a new old-shaped path is refused, naming the store");
assert.equal(T.refuse(path.join(AI, "doc", "x.md")), path.join(AI, "doc", "x.md"), "anything else passes");
assert.ok(!fs.existsSync(path.join(AI, "2026-10-13")), "no day folder was made");

fs.rmSync(repo, { recursive: true, force: true });
console.log(`TaskDirs: ok (census: ${c.days.length} day folders left, ${c.readers.length} readers redirected)`);
