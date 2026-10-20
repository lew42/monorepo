/* node Servex/Landed-merged.test.mjs — a landing line on an unmerged branch does not count as landed (todo 207).
 * A stub git repo: the branch is one commit ahead -> not landed; after a merge -> landed. Server/AIIndex.mjs is untouched. */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import LandingCheck from "../Server/LandingCheck.mjs";
import Landed from "./Landed.js";

const d = fs.mkdtempSync(path.join(os.tmpdir(), "landed-merged-"));
const g = (...a) => execFileSync("git", a, { cwd: d, windowsHide: true, stdio: "pipe" }).toString();
g("init", "-b", "michael/dev"); g("config", "user.email", "t@t"); g("config", "user.name", "t");
fs.writeFileSync(path.join(d, "a.txt"), "1"); g("add", "."); g("commit", "-m", "base");
g("checkout", "-b", "worktree/t1"); fs.writeFileSync(path.join(d, "b.txt"), "B"); g("add", "."); g("commit", "-m", "work");
g("checkout", "michael/dev");
LandingCheck.REPO = d;

const now = new Date().toISOString();
const dir = path.join(d, "task"); fs.mkdirSync(dir);
const lines = [{ assign: { session_id: "s-1", agent: "helper-t1", requested_at: now, branch: "worktree/t1", now: "starting" } },
	{ assign: { landed_at: now, outcome: "done" } }];
fs.writeFileSync(path.join(dir, "task.jsonl"), lines.map(l => JSON.stringify(l)).join("\n") + "\n");

assert.equal(Landed.logged(dir), true, "the log says landed");
assert.equal(Landed.of_dir(dir), false, "an unmerged branch is not landed");
const v = Landed.verdict(dir);
assert.equal(v.ahead, 1); assert.deepEqual(v.missing, ["b.txt"]);

g("merge", "--no-ff", "-m", "merge", "worktree/t1");
Landed.checks.clear();   // the 30 s cache
assert.equal(Landed.of_dir(dir), true, "after the merge it is landed");

const open = path.join(d, "open"); fs.mkdirSync(open);
fs.writeFileSync(path.join(open, "task.jsonl"), JSON.stringify(lines[0]) + "\n");
assert.equal(Landed.of_dir(open), false, "an open task is not landed");
console.log("ok  Landed: unmerged branch not landed, merged branch landed, open task open");
fs.rmSync(d, { recursive: true, force: true });
