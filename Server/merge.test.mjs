// node Server/merge.test.mjs — scratch repos under os.tmpdir(): merge.mjs lands a NEW file tracked, and
// LandingCheck flags a new file left untracked. Why: Server/doc/review.md ("A merge never leaves a new file untracked").
import fs from "node:fs"; import os from "node:os"; import path from "node:path"; import assert from "node:assert";
import { execFileSync, spawnSync } from "node:child_process";
import LandingCheck from "./LandingCheck.mjs";

const MERGE = path.join(import.meta.dirname, "merge.mjs");
let passed = 0;
const test = (name, fn) => { fn(); passed++; console.log("ok -", name); };
const git = (cwd, ...a) => execFileSync("git", a, { cwd, windowsHide: true, stdio: "pipe" }).toString();
const write = (cwd, f, t) => { fs.mkdirSync(path.dirname(path.join(cwd, f)), { recursive: true }); fs.writeFileSync(path.join(cwd, f), t); };
const tmps = [];

/** A main repo on michael/dev with a.txt, and a worktree on `branch` with b/new.txt added and a.txt changed, committed. */
function scratch(branch){
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "mergetest-")); tmps.push(root);
	const main = path.join(root, "main"), wt = path.join(root, "wt");
	fs.mkdirSync(main);
	git(main, "init", "-b", "michael/dev"); git(main, "config", "user.email", "t@t"); git(main, "config", "user.name", "t");
	write(main, "a.txt", "1\n"); write(main, "other.txt", "x\n"); write(main, ".gitignore", ".merge-landed.json\n.merge.lock\n"); git(main, "add", "."); git(main, "commit", "-m", "base");
	git(main, "worktree", "add", "-b", branch, wt);
	write(wt, "a.txt", "2\n"); write(wt, "b/new.txt", "NEW\n"); git(wt, "add", "."); git(wt, "commit", "-m", "work");
	return { root, main, wt };
}
const merge = (wt, main) => spawnSync("node", [MERGE, wt, "--main", main, "--skip-smoke", "--no-review", "scratch-repo test"], { encoding: "utf8", windowsHide: true });
const tracked = (main, f) => git(main, "ls-files").split(/\r?\n/).includes(f);

test("a clean main: a new file and a changed file both land tracked, status clean", () => {
	const { main, wt } = scratch("worktree/one");
	const r = merge(wt, main);
	assert.equal(r.status, 0, r.stdout + r.stderr);
	assert.ok(tracked(main, "b/new.txt"), "new file in git ls-files");
	assert.equal(fs.readFileSync(path.join(main, "a.txt"), "utf8"), "2\n");
	assert.equal(git(main, "status", "--porcelain").trim(), "", "git status --porcelain is empty");
});

test("someone else's staged file in main: the new file is still staged, not left untracked", () => {
	const { main, wt } = scratch("worktree/two");
	write(main, "theirs.txt", "T\n"); git(main, "add", "theirs.txt");
	const r = merge(wt, main);
	assert.equal(r.status, 0, r.stdout + r.stderr);
	assert.ok(/left staged/.test(r.stdout), r.stdout);
	assert.ok(tracked(main, "b/new.txt"), "new file in git ls-files (index)");
	assert.ok(!/^\?\?/m.test(git(main, "status", "--porcelain")), "nothing untracked");
});

test("the main tree has an uncommitted edit to a landed file: three-way path still stages the new file", () => {
	const { main, wt } = scratch("worktree/three");
	fs.writeFileSync(path.join(main, "a.txt"), "1\n"); write(main, "other.txt", "x\ny\n");   // dirty, but not a landed file
	const r = merge(wt, main);
	assert.equal(r.status, 0, r.stdout + r.stderr);
	assert.ok(tracked(main, "b/new.txt"));
	assert.ok(!/^\?\?/m.test(git(main, "status", "--porcelain")));
});

test("LandingCheck: a new file left untracked on dev is reported as 'new file not on dev'", () => {
	const { main } = scratch("worktree/four");
	const wtb = "worktree/four";
	// land by diff, as merge.mjs does, but leave the new file out of the commit on purpose
	write(main, "a.txt", "2\n"); write(main, "b/new.txt", "NEW\n"); git(main, "add", "a.txt"); git(main, "commit", "-m", "applied by diff");
	assert.equal(git(main, "status", "--porcelain").trim(), "?? b/");
	const was = LandingCheck.REPO; LandingCheck.REPO = main;
	try {
		const v = LandingCheck.verify(wtb);
		assert.equal(v.landed, false); assert.deepEqual(v.missing, ["b/new.txt"]); assert.deepEqual(v.new_missing, ["b/new.txt"]);
		assert.match(LandingCheck.sentence(v), /new file not on dev: b\/new\.txt/);
		// the ledger merge.mjs writes BEFORE it commits must not vouch for a file that never got tracked
		const head = git(main, "rev-parse", wtb).trim();
		fs.writeFileSync(path.join(main, ".merge-landed.json"), JSON.stringify([{ branch: wtb, head, files: ["a.txt", "b/new.txt"] }]));
		const l = LandingCheck.verify(wtb);
		assert.equal(l.landed, false); assert.deepEqual(l.new_missing, ["b/new.txt"]);
		// tracking the file makes it pass again
		git(main, "add", "b/new.txt"); git(main, "commit", "-m", "tracked");
		assert.equal(LandingCheck.verify(wtb).landed, true);
	} finally { LandingCheck.REPO = was; }
});

/** Like scratch(), but the base holds t/x.mjs + t/x.test.mjs and the branch rewrites x.mjs (and optionally the test). */
function scratchTests(branch, { baseX, baseTest, branchX, branchTest }){
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "mergetest-")); tmps.push(root);
	const main = path.join(root, "main"), wt = path.join(root, "wt");
	fs.mkdirSync(main);
	git(main, "init", "-b", "michael/dev"); git(main, "config", "user.email", "t@t"); git(main, "config", "user.name", "t");
	write(main, "a.txt", "1\n"); write(main, "t/x.mjs", baseX); write(main, "t/x.test.mjs", baseTest);
	write(main, ".gitignore", ".merge-landed.json\n.merge.lock\npublic/\n"); git(main, "add", "."); git(main, "commit", "-m", "base");
	git(main, "worktree", "add", "-b", branch, wt);
	write(wt, "t/x.mjs", branchX); if (branchTest) write(wt, "t/x.test.mjs", branchTest);
	git(wt, "add", "."); git(wt, "commit", "-m", "work");
	return { root, main, wt };
}
const mergeT = (wt, main, env = {}) => spawnSync("node", [MERGE, wt, "--main", main, "--skip-smoke", "--no-review", "scratch-repo test"], { encoding: "utf8", windowsHide: true, env: { ...process.env, TESTRUNNER_TIMEOUT: "3000", ...env } });
const GOOD = "export const x = 1;\n", BAD = "export const x = 2;\n";
const CHECKS_ONE = "import { x } from './x.mjs'; if (x !== 1) { console.log('not ok - x is ' + x); process.exit(1); }\n";
const rows = main => { try { return fs.readFileSync(path.join(main, "public/framework/core/Test/results.jsonl"), "utf8").trim().split("\n").map(l => JSON.parse(l)); } catch { return []; } };

test("tests: passes on the base, fails on the branch -> refused, nothing lands; the base result is cached by sha", () => {
	const { main, wt } = scratchTests("worktree/t1", { baseX: GOOD, baseTest: CHECKS_ONE, branchX: BAD });
	const r = mergeT(wt, main);
	assert.equal(r.status, 1, r.stdout + r.stderr);
	assert.match(r.stderr, /refused: 1 test\(s\) pass on the merge base and fail on worktree\/t1[\s\S]*t\/x\.test\.mjs/);
	assert.equal(fs.readFileSync(path.join(main, "t/x.mjs"), "utf8"), GOOD, "nothing landed");
	const base = rows(main).filter(l => l.trigger === "merge-base");
	assert.equal(base.length, 1); assert.equal(base[0].ok, true); assert.match(base[0].sha, /^[0-9a-f]{40}$/);
	assert.ok(rows(main).some(l => l.trigger === "merge" && l.ok === false));
	const again = mergeT(wt, main);   // same base: the cached line answers, the base is not run a second time
	assert.equal(again.status, 1);
	assert.equal(rows(main).filter(l => l.trigger === "merge-base").length, 1, "base result reused");
	assert.equal(git(main, "status", "--porcelain").trim(), "", "no .merge-base checkout left behind");
});

test("tests: already failing on the base -> not refused, the branch lands", () => {
	const { main, wt } = scratchTests("worktree/t2", { baseX: BAD, baseTest: CHECKS_ONE, branchX: "export const x = 3;\n" });
	const r = mergeT(wt, main);
	assert.equal(r.status, 0, r.stdout + r.stderr);
	assert.match(r.stderr, /already failing on the base/);
	assert.equal(fs.readFileSync(path.join(main, "t/x.mjs"), "utf8"), "export const x = 3;\n");
});

test("tests: a timeout on the branch is no result, never a refusal", () => {
	const { main, wt } = scratchTests("worktree/t3", { baseX: GOOD, baseTest: CHECKS_ONE, branchX: GOOD + "// edited\n", branchTest: "setTimeout(() => {}, 60000);\n" });
	const r = mergeT(wt, main);
	assert.equal(r.status, 0, r.stdout + r.stderr);
	assert.match(r.stderr, /timed out on the branch/);
});

test("tests: --skip-tests runs nothing", () => {
	const { main, wt } = scratchTests("worktree/t4", { baseX: GOOD, baseTest: CHECKS_ONE, branchX: BAD });
	const r = spawnSync("node", [MERGE, wt, "--main", main, "--skip-smoke", "--skip-tests", "--no-review", "scratch-repo test"], { encoding: "utf8", windowsHide: true });
	assert.equal(r.status, 0, r.stdout + r.stderr);
	assert.equal(rows(main).length, 0);
});

for (const t of tmps) { try { git(t, "worktree", "prune"); } catch {} }
for (const t of tmps) fs.rmSync(t, { recursive: true, force: true });
console.log(`${passed} passed, 0 failed`);
