// `node Server/unmerged.test.mjs` — unmerged() against a throwaway repo.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import assert from "node:assert/strict";
import { unmerged } from "./unmerged.mjs";
import { DEV_BRANCH } from "./dev-branch.mjs";

const dir = fs.mkdtempSync(path.join(os.tmpdir(), "unmerged-"));
const git = (...a) => execFileSync("git", a, { cwd: dir, encoding: "utf8", env: { ...process.env, GIT_AUTHOR_NAME: "t", GIT_AUTHOR_EMAIL: "t@t", GIT_COMMITTER_NAME: "t", GIT_COMMITTER_EMAIL: "t@t" } });
const write = (f, s) => { fs.mkdirSync(path.dirname(path.join(dir, f)), { recursive: true }); fs.writeFileSync(path.join(dir, f), s); };
git("init", "-q", "-b", DEV_BRANCH);
write("a.txt", "a\n"); git("add", "."); git("commit", "-qm", "base");

git("checkout", "-qb", "worktree/open-one"); write("one.txt", "1\n"); git("add", "."); git("commit", "-qm", "one");
git("checkout", "-q", DEV_BRANCH);
git("checkout", "-qb", "worktree/twin"); write("two.txt", "2\n"); git("add", "."); git("commit", "-qm", "two");
git("checkout", "-q", DEV_BRANCH); write("gap.txt", "g\n"); git("add", "."); git("commit", "-qm", "gap"); git("cherry-pick", "worktree/twin");   // same patch, new commit
git("checkout", "-qb", "worktree/merged"); write("m.txt", "m\n"); git("add", "."); git("commit", "-qm", "m");
git("checkout", "-q", DEV_BRANCH); git("merge", "-q", "--no-ff", "-m", "merge m", "worktree/merged");
write("public/framework/ai/sessions/2026/11/01/s/t1/task.jsonl", '{"assign":{"title":"x","branch":"worktree/open-one"}}\n');
write("public/framework/ai/sessions/2026/11/01/s/t2/task.jsonl", '{"assign":{"branch":"worktree/twin"}}\n{"log":{"text":"not complete yet"}}\n{"finish":{"outcome":"ok"}}\n');
write("public/framework/ai/sessions/2026/11/01/s/t3/task.jsonl", '{"log":{"text":"audit mentions worktree/open-one in passing"}}\n');
git("add", "."); git("commit", "-qm", "logs");

const rows = await unmerged({ cwd: dir });
const by = Object.fromEntries(rows.map(r => [r.branch, r]));
assert.deepEqual(Object.keys(by).sort(), ["worktree/open-one", "worktree/twin"], "merged branch is not listed");
assert.equal(by["worktree/open-one"].commits, 1);
assert.deepEqual(by["worktree/open-one"].files, ["one.txt"]);
assert.equal(by["worktree/open-one"].on_base, false);
assert.equal(by["worktree/twin"].on_base, true, "cherry-picked patch counts as on base");
assert.match(by["worktree/open-one"].task, /t1$/, "a log that only mentions a branch in text does not own it");
assert.equal(by["worktree/open-one"].state, "open");
assert.equal(by["worktree/twin"].state, "complete");
assert.equal((await unmerged({ cwd: dir, min_hours: 6 })).length, 0, "fresh commits are not old enough");
assert.equal((await unmerged({ cwd: dir, min_hours: 6, now: Date.now() + 7 * 3600e3 })).length, 2);
fs.rmSync(dir, { recursive: true, force: true });
console.log("unmerged: ok");
