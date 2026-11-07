// A commit made with CLAUDE_CODE_SESSION_ID set lands one line in that session's record and carries a Session trailer;
// with no session: no line, one failure line, and the commit still succeeds. Run: node Server/CommitLog.test.mjs
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import Test from "../../public/framework/core/Test/Test.js";

const hooks = import.meta.dirname, id = "11111111-2222-4333-8444-555555555555";
const root = fs.mkdtempSync(path.join(os.tmpdir(), "commitlog-"));
const rec = path.join(root, "public/framework/ai/sessions/2026/11/06/session-11111111/session.jsonl");
fs.mkdirSync(path.dirname(rec), { recursive: true });
fs.writeFileSync(rec, JSON.stringify({ session: { id, kind: "vscode-tab", at: "2026-11-06T00:00:00Z" } }) + "\n");
const env = { ...process.env, COMMITLOG_ROOT: root, RECORD_ENTRY: "http://127.0.0.1:1/api/item" };
delete env.CLAUDE_CODE_SESSION_ID;
const git = (args, e) => execFileSync("git", args, { cwd: root, env: e, encoding: "utf8", windowsHide: true }).trim();
git(["init", "-q"], env); git(["config", "user.email", "t@t"], env); git(["config", "user.name", "t"], env);
const q = f => JSON.stringify(path.join(hooks, f).split(path.sep).join("/"));
fs.writeFileSync(path.join(root, ".git/hooks/post-commit"), `#!/bin/sh
node ${q("post-commit.mjs")}
exit 0
`, { mode: 0o755 });
fs.writeFileSync(path.join(root, ".git/hooks/commit-msg"), `#!/bin/sh
node ${q("commit-msg.mjs")} "$1"
exit 0
`, { mode: 0o755 });
const lines = () => fs.readFileSync(rec, "utf8").split("\n").filter(Boolean).map(l => JSON.parse(l));
const failures = path.join(root, "public/framework/ai/sessions/failures.jsonl");

const t = new Test("a commit is logged to its session and carries a Session trailer");
fs.writeFileSync(path.join(root, "a.txt"), "a");
git(["add", "a.txt"], env);
git(["commit", "-q", "-m", "first"], { ...env, CLAUDE_CODE_SESSION_ID: id });
const c = lines().find(l => l.commit)?.commit;
t.eq(c?.hash, git(["rev-parse", "HEAD"], env), "the line holds the full commit hash, nested under commit");
t.eq(c?.what, "first", "and the subject (SessionTimelineRows reads commit.hash and commit.what)");
t.eq(c?.files, ["a.txt"], "and the files it changed");
t.ok(/^Session: 11111111-2222-4333-8444-555555555555$/m.test(git(["log", "-1", "--format=%B"], env)), "the message has the Session trailer");

fs.writeFileSync(path.join(root, "b.txt"), "b");
git(["add", "b.txt"], env);
const n = lines().length;
git(["commit", "-q", "-m", "second"], env);
t.eq(lines().length, n, "no session: no line written");
t.ok(fs.readFileSync(failures, "utf8").split("\n").filter(Boolean).length >= 1, "no session: a failure line");
t.eq(git(["log", "-1", "--format=%s"], env), "second", "no session: the commit still succeeded");
fs.rmSync(root, { recursive: true, force: true });
t.done();
