// node Server/ReadyToMerge.test.mjs — the ready-line forms, the row filters on a scratch repo, and the Merge refusals.
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { parseReady, readyRows, mergeBranch } from "./ReadyToMerge.mjs";

let n = 0; const ok = (c, m) => { assert.ok(c, m); n++; };
const eq = (a, b, m) => { assert.deepEqual(a, b, m); n++; };

// 1. parse forms seen in real records
eq(parseReady("ready: task/a at 86ba7a10d; review --status passes"), { branch: "task/a", sha: "86ba7a10d", what: "review --status passes" });
eq(parseReady("ready: worktree/qf-2 98771a0c3"), { branch: "worktree/qf-2", sha: "98771a0c3", what: "" });
eq(parseReady("ready: b 1234567 (worktree C:/x/y); did it").what, "did it");
eq(parseReady("ready: b at abcdef1."), { branch: "b", sha: "abcdef1", what: "" });
eq(parseReady("not ready: b 1234567"), null);

// 2. a scratch repo: base, one ready branch, one landed, one gone, one stale
const root = fs.mkdtempSync(path.join(os.tmpdir(), "rtm-"));
const g = (...a) => { const r = spawnSync("git", a, { cwd: root, encoding: "utf8" }); assert.equal(r.status, 0, r.stderr); return r.stdout.trim(); };
g("init", "-q", "-b", "michael/dev"); g("config", "user.email", "t@t"); g("config", "user.name", "t");
fs.writeFileSync(path.join(root, "a"), "1"); g("add", "."); g("commit", "-qm", "base");
const mk = (b, f) => { g("checkout", "-qb", b); fs.writeFileSync(path.join(root, f), "x"); g("add", "."); g("commit", "-qm", b); const s = g("rev-parse", "HEAD"); g("checkout", "-q", "michael/dev"); return s; };
const sha = mk("task/ready", "r"), landed = mk("task/landed", "l"); g("merge", "-q", "--no-edit", "task/landed");
const stale0 = mk("task/stale", "s"); g("checkout", "-q", "task/stale"); fs.writeFileSync(path.join(root, "s2"), "x"); g("add", "."); g("commit", "-qm", "more"); g("checkout", "-q", "michael/dev");
const day = new Date().toISOString().slice(0, 10).split("-");
const dir = path.join(root, "public/framework/ai/sessions", ...day, "sess", "task1"); fs.mkdirSync(dir, { recursive: true });
const rec = path.join(dir, "session.jsonl");
const L = o => JSON.stringify(o) + "\n";
fs.writeFileSync(rec, L({ assign: { title: "Scratch task" } }) + L({ log: { at: "2026-10-23T01:00:00Z", msg: `ready: task/ready at ${sha.slice(0, 9)}; did the thing` } })
	+ L({ log: { at: "2026-10-23T01:00:00Z", msg: `ready: task/landed ${landed.slice(0, 9)}` } }) + L({ log: { at: "2026-10-23T01:00:00Z", msg: "ready: task/gone abcdef1" } })
	+ L({ log: { at: "2026-10-23T01:00:00Z", msg: `ready: task/stale ${stale0.slice(0, 9)}` } }));
const rows = readyRows({ root, repo: root });
eq(rows.map(r => r.branch).sort(), ["task/ready", "task/stale"], "landed and gone are dropped");
const r1 = rows.find(r => r.branch === "task/ready");
ok(r1.title === "Scratch task" && r1.what === "did the thing" && r1.review === "not reviewed" && r1.stale === false && r1.worktree === null);
ok(rows.find(r => r.branch === "task/stale").stale === true);
ok(r1.task_url.startsWith("/framework/ai/sessions/") && r1.task_url.endsWith("/task1/"));

// 3. the Merge refusals (a stub runner: nothing real is merged)
const calls = [];
const run = (c, a, cwd) => { calls.push(a); return { status: 0, stdout: "landed\n", stderr: "" }; };
ok(mergeBranch("task/nope", { root, repo: root, run }).why.includes("not on the ready list"));
ok(mergeBranch("task/stale", { root, repo: root, run }).why.includes("moved past"));
ok(mergeBranch("task/ready", { root, repo: root, run }).why.includes("no worktree"), "no worktree, no merge");
ok(calls.length === 0, "merge.mjs never ran on a refusal");
// with a worktree row: runs only merge.mjs, logs on success, shows a refusal
const wt = [{ ...r1, worktree: "/w/x", record: "session.jsonl" }]; const logged = [];
const good = mergeBranch("task/ready", { rows: () => wt, repo: root, run, log: (row, m) => logged.push(m) });
ok(good.ok && good.out === "landed" && calls.length === 1 && calls[0][0].endsWith("merge.mjs") && calls[0][1] === "/w/x");
ok(logged[0] === `merged: task/ready ${sha.slice(0, 9)} by the owner (Merge button)`);
const bad = mergeBranch("task/ready", { rows: () => wt, repo: root, run: () => ({ status: 1, stdout: "", stderr: "review needed" }), log: () => assert.fail("must not log") });
ok(!bad.ok && bad.out === "review needed");
fs.rmSync(root, { recursive: true, force: true });
console.log(`ReadyToMerge.test: ${n} checks pass`);
