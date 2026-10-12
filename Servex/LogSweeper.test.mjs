// node Servex/LogSweeper.test.mjs — runs the sweeper in a throwaway git repo.
// Proves: allowlisted logs are committed; a code file and another agent's STAGED file are not.
import fs from "fs";
import os from "os";
import path from "path";
import assert from "assert";
import { spawnSync } from "child_process";
import LogSweeper from "./LogSweeper.js";

const dir = fs.mkdtempSync(path.join(os.tmpdir(), "sweep-"));
const git = (...a) => spawnSync("git", a, { cwd: dir, encoding: "utf8" }).stdout.trim();
const put = (p, t) => { fs.mkdirSync(path.dirname(path.join(dir, p)), { recursive: true }); fs.appendFileSync(path.join(dir, p), t); };

git("init", "-q", "-b", "main");
git("config", "user.email", "t@t"); git("config", "user.name", "t");
const log = "public/framework/ai/2026-10-12/t/task.jsonl", code = "Servex/x.js", other = "public/framework/ai/2026-10-12/t/requirements.md";
put(log, '{"a":1}\n'); put(code, "1\n"); put(other, "1\n");
git("add", "-A"); git("commit", "-qm", "base");

put(log, '{"a":2}\n');                 // machine log changed
put("public/framework/ai/2026-10-12/new/spend.json", "{}\n");   // new untracked log
put(code, "2\n");                      // code changed: must stay
put(other, "2\n"); git("add", other);  // another agent's staged work: must stay staged

const s = new LogSweeper({ root: dir, branch: "main" });
assert.equal(s.sweep({ dry: true }).found, 2, "dry run sees exactly the two logs");
assert.equal(git("rev-list", "--count", "HEAD"), "1", "dry run commits nothing");
const r = s.sweep();
assert.equal(r.committed, 2);
assert.deepEqual(git("show", "--name-only", "--format=", "HEAD").split("\n").sort(), [log, "public/framework/ai/2026-10-12/new/spend.json"].sort());
assert.match(git("status", "--short"), /M\s+public\/framework\/ai\/2026-10-12\/t\/requirements\.md/, "staged work still staged");
assert.match(git("status", "--short"), /Servex\/x\.js/, "code untouched");
assert.equal(s.sweep().committed, 0, "idempotent");
assert.match(new LogSweeper({ root: dir, branch: "other" }).sweep().skipped, /not other/);
console.log("LogSweeper: ok");
