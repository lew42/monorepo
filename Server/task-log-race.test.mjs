/* task-log-race.test.mjs — proof of how record-file lines were lost, and that the fix holds.
 *   node Server/task-log-race.test.mjs   (exit 0 = all pass; MERGE_UNDER_TEST=<script> runs cases 2-3 against another merge.mjs, to prove they fail on the old one)
 * Mechanism (2026-10-13, doc: public/framework/ai/sessions/doc/commit-rule.md): a plain `git merge` in a DIRTY tree saves the
 * tree as a hidden WIP commit, `reset --hard`s it, and if the merge is refused runs `stash apply` to put it back. A live writer
 * that appends a line in that window makes the apply fail, so every uncommitted line stays only in the hidden commit.
 * The window is made deterministic here with a smudge filter: git runs it while `reset --hard` rewrites files, and it plays the live writer.
 *   1 GUILTY   plain git merge loses the appended lines (the case passes by SHOWING the loss)
 *   2 FIXED    Server/merge.mjs lands the same branch, same racer, and loses nothing
 *   3 CLEAN    Server/merge.mjs with no overlap leaves no hidden WIP commit behind (old code left one on every merge)
 *   4 GUARD    .claude/hooks/git-guard.mjs refuses a plain git merge in the main checkout */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const MERGE = process.env.MERGE_UNDER_TEST || path.join(HERE, "merge.mjs"), GUARD = path.join(HERE, "..", ".claude", "hooks", "git-guard.mjs");
const SCRATCH = fs.mkdtempSync(path.join(os.tmpdir(), "task-log-race-"));
const run = (cmd, args, cwd, extra = {}) => spawnSync(cmd, args, { cwd, encoding: "utf8", windowsHide: true, ...extra });
const git = (cwd, ...a) => run("git", ["-c", "user.name=t", "-c", "user.email=t@example.invalid", ...a], cwd);
let passed = 0, failed = 0;
const ok = (c, what) => { c ? passed++ : failed++; console.log(`${c ? "pass" : "FAIL"}  ${what}`); };
const read = f => fs.readFileSync(f, "utf8");
const LIVE = '{"live":"appended by another agent"}';

/* A repo with a.jsonl (the record file the racer appends to), code.txt, zz.jsonl (carries the racer filter, last in checkout order). */
function setup(name, { racer }) {
	const root = path.join(SCRATCH, name), main = path.join(root, "main"), wt = path.join(root, "wt");
	fs.mkdirSync(main, { recursive: true });
	git(main, "init", "-q", "-b", "michael/dev");
	fs.writeFileSync(path.join(main, "a.jsonl"), '{"n":1}\n');
	fs.writeFileSync(path.join(main, "zz.jsonl"), '{"z":1}\n');
	fs.writeFileSync(path.join(main, "code.txt"), Array.from({ length: 20 }, (_, i) => `line ${i + 1}`).join("\n") + "\n");
	fs.writeFileSync(path.join(main, "other.txt"), "other\n");
	fs.writeFileSync(path.join(main, ".gitattributes"), "zz.jsonl filter=race\n");
	git(main, "add", "."); git(main, "commit", "-q", "-m", "base");
	git(main, "worktree", "add", "-q", "-b", "worktree/x", wt);
	const edit = (dir, f, n, text) => { const l = read(path.join(dir, f)).split("\n"); l[n - 1] = text; fs.writeFileSync(path.join(dir, f), l.join("\n")); };
	if (racer) edit(wt, "code.txt", 3, "line 3 CHANGED BY THE BRANCH");   // OVERLAP case: main also has uncommitted edits to code.txt
	else fs.writeFileSync(path.join(wt, "other.txt"), "other, changed by the branch\n");   // CLEAN case: branch avoids every dirty file
	git(wt, "commit", "-q", "-am", "branch");
	// the main tree is dirty, like the live one: two uncommitted record appends and an edit to a line the branch did not touch
	fs.appendFileSync(path.join(main, "a.jsonl"), '{"n":2}\n');
	fs.appendFileSync(path.join(main, "zz.jsonl"), '{"z":2}\n');
	edit(main, "code.txt", 15, "line 15 EDITED IN MAIN");
	if (racer) {
		const racerJs = path.join(root, "racer.mjs").replace(/\\/g, "/");
		fs.writeFileSync(racerJs, `import fs from "node:fs"; fs.appendFileSync(${JSON.stringify(path.join(main, "a.jsonl"))}, ${JSON.stringify(LIVE + "\n")}); process.stdin.pipe(process.stdout);\n`);
		git(main, "config", "filter.race.smudge", `node "${racerJs}"`);
		git(main, "config", "filter.race.clean", "cat");
	}
	return { main, wt, root };
}
const hiddenWip = main => {   // dangling commits whose subject is git's "WIP on <branch>" save-state
	const r = git(main, "fsck", "--no-reflog", "--no-progress");
	return r.stdout.split("\n").filter(l => l.startsWith("dangling commit")).map(l => l.split(" ")[2]).filter(h => /^WIP on /.test(git(main, "log", "-1", "--format=%s", h).stdout));
};

// 1 GUILTY: the branch edits code.txt line 3, main has an uncommitted edit to code.txt line 15 -> overlap -> git refuses and restores.
{
	const { main } = setup("guilty", { racer: true });
	const before = hiddenWip(main).length;
	const m = git(main, "merge", "--no-ff", "--no-edit", "worktree/x");
	const a = read(path.join(main, "a.jsonl")), z = read(path.join(main, "zz.jsonl"));
	console.log("  git merge said:", (m.stdout + m.stderr).trim().split("\n").slice(-2).join(" | "));
	ok(hiddenWip(main).length > before, "guilty: a plain git merge parked the dirty tree in a hidden WIP commit");
	ok(!a.includes('{"n":2}') || !a.includes(LIVE) || !z.includes('{"z":2}'), "guilty: a plain git merge on a dirty tree LOST lines (the bug, reproduced)");
	console.log("  a.jsonl now:", JSON.stringify(a), " zz.jsonl now:", JSON.stringify(z));
}
// 2 FIXED: same repo, same racer, landed by merge.mjs
{
	const { main, wt } = setup("fixed", { racer: true });
	const m = run("node", [MERGE, wt, "--main", main, "--skip-smoke", "--no-review", "test"], main);
	console.log("  merge.mjs said:", (m.stdout + m.stderr).trim().split("\n").slice(-2).join(" | "));
	const a = read(path.join(main, "a.jsonl")), z = read(path.join(main, "zz.jsonl")), c = read(path.join(main, "code.txt"));
	ok(m.status === 0, "fixed: merge.mjs landed the branch");
	ok(a.includes('{"n":2}') && !a.includes(LIVE), "fixed: a.jsonl keeps its uncommitted line and the smudge never ran (nothing was reset)");
	ok(z.includes('{"z":2}'), "fixed: zz.jsonl keeps its uncommitted line");
	ok(c.includes("CHANGED BY THE BRANCH") && c.includes("EDITED IN MAIN"), "fixed: the branch change AND the main-tree edit are both in code.txt");
}
// 3 CLEAN: no overlap -> no git merge, so no hidden WIP commit and no lost line, even with a live append during the landing
{
	const { main, wt } = setup("clean", { racer: false });
		const before = hiddenWip(main).length;
	const m = run("node", [MERGE, wt, "--main", main, "--skip-smoke", "--no-review", "test"], main);
	console.log("  merge.mjs said:", (m.stdout + m.stderr).trim().split("\n").slice(-2).join(" | "));
	ok(m.status === 0, "clean: merge.mjs landed a branch that overlaps nothing dirty");
	ok(hiddenWip(main).length === before, "clean: no hidden WIP commit was left behind");
	ok(read(path.join(main, "a.jsonl")).includes('{"n":2}') && read(path.join(main, "zz.jsonl")).includes('{"z":2}'), "clean: both uncommitted record lines are still there");
	ok(read(path.join(main, "other.txt")).includes("changed by the branch"), "clean: the branch's file landed");
}
// 4 GUARD: the hook refuses a plain git merge in the main checkout, and still allows merge-base / --abort / a worktree
{
	const mainDir = "C:/Code/lew42/monorepo";
	const hook = cmd => run(process.execPath, [GUARD], undefined, { input: JSON.stringify({ tool_name: "Bash", cwd: mainDir, tool_input: { command: cmd } }), env: { ...process.env, CLAUDE_PROJECT_DIR: mainDir } }).status;
	ok(hook("git merge --no-ff worktree/x") === 2, "guard: `git merge` in the main checkout is blocked");
	ok(hook("git pull --rebase --autostash") === 2, "guard: `git pull --rebase --autostash` in the main checkout is blocked");
	ok(hook("git merge-base --is-ancestor a b") === 0 && hook("git merge --abort") === 0, "guard: merge-base and --abort stay allowed");
}
fs.rmSync(SCRATCH, { recursive: true, force: true, maxRetries: 3 });
console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
