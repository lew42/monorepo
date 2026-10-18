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

for (const t of tmps) { try { git(t, "worktree", "prune"); } catch {} }
for (const t of tmps) fs.rmSync(t, { recursive: true, force: true });
console.log(`${passed} passed, 0 failed`);
