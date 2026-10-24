// node Server/ReadyToMerge.test.mjs — the ready-line forms, the row filters on a scratch repo, and the Merge refusals.
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { parseReady, readyRows, mergeBranch, plainGate, gateOf } from "./ReadyToMerge.mjs";

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
ok(rows.find(r => r.branch === "task/stale").latest === null, "no worktree, nothing to check");
ok(r1.latest === null, "a fresh row is not gated");
ok(r1.task_url.startsWith("/framework/ai/sessions/") && r1.task_url.endsWith("/task1/"));

// 3. the Merge refusals (a stub runner: nothing real is merged)
const calls = [];
const run = (c, a, cwd) => { calls.push(a); return { status: 0, stdout: "landed\n", stderr: "" }; };
ok((await mergeBranch("task/nope", { root, repo: root, run })).why.includes("not on the ready list"));
ok((await mergeBranch("task/stale", { root, repo: root, run })).why.includes("moved past"));
ok((await mergeBranch("task/ready", { root, repo: root, run })).why.includes("no worktree"), "no worktree, no merge");
ok(calls.length === 0, "merge.mjs never ran on a refusal");
// with a worktree row: runs only merge.mjs, logs on success, shows a refusal
const wt = [{ ...r1, worktree: "/w/x", record: "session.jsonl" }]; const logged = [];
const good = await mergeBranch("task/ready", { rows: () => wt, repo: root, run, log: (row, m) => logged.push(m) });
ok(good.ok && good.out === "landed" && calls.length === 1 && calls[0][0].endsWith("merge.mjs") && calls[0][1] === "/w/x");
ok(logged[0] === `merged: task/ready ${sha.slice(0, 9)} by the owner (Merge button)`);
const bad = await mergeBranch("task/ready", { rows: () => wt, repo: root, run: () => ({ status: 1, stdout: "", stderr: "review needed" }), log: () => assert.fail("must not log") });
ok(!bad.ok && bad.out === "review needed");

// 4. a branch that moved past its ready sha (2026-10-23, merge-latest): the review gate decides, not the owner
const wtDir = path.join(root, "..", path.basename(root) + "-wt"); g("worktree", "add", "-q", wtDir, "task/stale");
const staleHead = g("rev-parse", "task/stale");
const passing = readyRows({ root, repo: root, gate: () => ({ ok: true }) }).find(r => r.branch === "task/stale");
ok(passing.stale && passing.latest.ok === true && passing.latest.sha === staleHead.slice(0, 9), "stale + gate ok = Merge latest is offered");
const failing = readyRows({ root, repo: root, gate: () => ({ ok: false, why: "The newest review is of an older commit." }) }).find(r => r.branch === "task/stale");
ok(failing.latest.ok === false && failing.latest.why.includes("older commit"), "stale + gate fails = the reason is given");
const mc = [];
const mrun = (c, a) => { mc.push(a); return { status: 0, stdout: "landed", stderr: "" }; };
const gOk = { root, repo: root, gate: () => ({ ok: true }), run: mrun }, gBad = { root, repo: root, gate: () => ({ ok: false, why: "Nobody has reviewed this branch yet." }), run: mrun };
ok((await mergeBranch("task/stale", gOk)).why.includes("Merge latest"), "no head named: refused, points at Merge latest");
ok((await mergeBranch("task/stale", { ...gOk, head: "deadbeef0" })).why.includes("moved again"), "a head the card did not show is refused");
const refusedBad = await mergeBranch("task/stale", { ...gBad, head: staleHead.slice(0, 9) });
ok(!refusedBad.ok && refusedBad.why.includes("Nobody has reviewed") && mc.length === 0, "a failing head is refused and merge.mjs never ran");
const goodLatest = await mergeBranch("task/stale", { ...gOk, head: staleHead.slice(0, 9), log: (row, m) => mc.logged = m });
ok(goodLatest.ok && mc.length === 1 && path.resolve(mc[0][1]) === path.resolve(wtDir) && mc.logged.includes(staleHead.slice(0, 9) + " by the owner (Merge latest button)"), "a passing head merges, logged as Merge latest");

// 5. gate wording, and a gate that cannot answer
ok(plainGate("refused: worktree/x is size light and has no review; run: node Server/review.mjs a b") === "Nobody has reviewed this branch yet.");
ok(plainGate("refused: worktree/x's review is stale; run: node Server/review.mjs a b").includes("not been reviewed"));
ok(plainGate("refused: worktree/x's review has an unanswered finding (reviewed: 2 unanswered: #1, #3). An answer is …").includes("(#1, #3)"));
ok(plainGate("refused: worktree/x changes a page but a/shots/ has no screenshot at 400, 1920px; re-run: node …").includes("400, 1920px"));
ok(gateOf(root, wtDir).ok === false && gateOf(root, wtDir).why.includes("did not answer"), "no merge.mjs to ask = not ok, said so");
g("worktree", "remove", "--force", wtDir);
fs.rmSync(root, { recursive: true, force: true });
console.log(`ReadyToMerge.test: ${n} checks pass`);
