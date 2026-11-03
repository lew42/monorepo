/* Proof that Server/merge.mjs never runs `git merge` over uncommitted edits.
 * `node proof.mjs <merge.mjs> <scratch dir>` — builds a fresh throwaway repo for each case in <scratch dir>
 * (branch michael/dev, files A B C; a worktree branch that changes A and B), runs merge.mjs against it
 * with --main and --skip-smoke, and prints the dirty files' hashes before and after. Never touches the real repo. */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";

const [MERGE, SCRATCH] = process.argv.slice(2).map(p => path.resolve(p));
const run = (cmd, args, cwd) => spawnSync(cmd, args, { cwd, encoding: "utf8", windowsHide: true });
const git = (cwd, ...a) => { const r = run("git", ["-c", "user.name=proof", "-c", "user.email=proof@example.invalid", ...a], cwd); return r.stdout.trim(); };
const out = [];
const say = s => { out.push(s); console.log(s); };
const lines20 = tag => Array.from({ length: 20 }, (_, i) => `${tag} line ${i + 1}`).join("\n") + "\n";
const edit = (file, n, text) => { const l = fs.readFileSync(file, "utf8").split("\n"); l[n - 1] = text; fs.writeFileSync(file, l.join("\n")); };

function setup(name){
	const root = path.join(SCRATCH, name);
	fs.rmSync(root, { recursive: true, force: true });
	const main = path.join(root, "main"), wt = path.join(root, "wt");
	fs.mkdirSync(main, { recursive: true });
	git(main, "init", "-q", "-b", "michael/dev");
	for (const f of ["A", "B", "C"]) fs.writeFileSync(path.join(main, `${f}.txt`), lines20(f));
	git(main, "add", "."); git(main, "commit", "-q", "-m", "three files");
	git(main, "worktree", "add", "-q", "-b", "worktree/x", wt);
	edit(path.join(wt, "A.txt"), 2, "A line 2 — CHANGED BY THE BRANCH");
	edit(path.join(wt, "B.txt"), 5, "B line 5 — CHANGED BY THE BRANCH");
	git(wt, "commit", "-q", "-am", "branch changes A and B");
	return { main, wt };
}

/* every dirty file in main, with its content hash */
function dirt(main){
	const files = run("git", ["status", "--porcelain", "--untracked-files=all"], main).stdout.split("\n").filter(Boolean);   // untrimmed: the first column matters
	return files.map(l => `${l.slice(0, 2)} ${l.slice(3)} ${git(main, "hash-object", "--", l.slice(3)).slice(0, 12)}`).join("; ") || "(clean)";
}

function merge({ main, wt }){
	const r = run("node", [MERGE, wt, "--main", main, "--skip-smoke"], main);
	return { code: r.status, text: (r.stdout + r.stderr).trim().split("\n").filter(l => l.trim() && !l.includes("!!!")).map(l => "      | " + l).join("\n") };
}

const results = [];
function kase(label, prep, check){
	const repo = setup(label.split(":")[0]);
	prep?.(repo);
	const before = { dirt: dirt(repo.main), diff: git(repo.main, "diff"), head: git(repo.main, "rev-parse", "HEAD"), stash: git(repo.main, "stash", "list") };
	say(`\n${label}`);
	say(`  before: ${before.dirt}`);
	const m = merge(repo);
	say(`  merge.mjs exit ${m.code}\n${m.text}`);
	say(`  after:  ${dirt(repo.main)}`);
	const checks = check(repo, m, before);
	for (const [what, ok] of checks) say(`  ${ok ? "PASS" : "FAIL"}  ${what}`);
	results.push([label, checks.every(c => c[1])]);
}

const A = main => fs.readFileSync(path.join(main, "A.txt"), "utf8");

kase("a-clean: the main tree has no uncommitted edits", null, ({ main }, m, before) => [
	["exit 0", m.code === 0],
	["a merge commit landed (two parents)", git(main, "rev-list", "--parents", "-n1", "HEAD").split(" ").length === 3],
	["A and B carry the branch's lines", A(main).includes("CHANGED BY THE BRANCH") && fs.readFileSync(path.join(main, "B.txt"), "utf8").includes("CHANGED BY THE BRANCH")],
	["the tree is clean afterwards", dirt(main) === "(clean)"],
]);

kase("b-other-hunk: main has an uncommitted edit to A, in a different hunk", ({ main }) => edit(path.join(main, "A.txt"), 15, "A line 15 — THE OWNER'S UNCOMMITTED EDIT"), ({ main, wt }, m, before) => {
	let ledger = []; try { ledger = JSON.parse(fs.readFileSync(path.join(main, ".merge-landed.json"), "utf8")); } catch {}
	return [
		["exit 0", m.code === 0],
		["it said: applied over uncommitted edits, not committed", m.text.includes("applied over uncommitted edits, not committed: the owner commits")],
		["A keeps BOTH edits", A(main).includes("CHANGED BY THE BRANCH") && A(main).includes("THE OWNER'S UNCOMMITTED EDIT")],
		["B got the branch's edit", fs.readFileSync(path.join(main, "B.txt"), "utf8").includes("CHANGED BY THE BRANCH")],
		["nothing staged", git(main, "diff", "--cached", "--name-only") === ""],
		["no commit made (HEAD unchanged)", git(main, "rev-parse", "HEAD") === before.head],
		[".merge-landed.json records the branch head", ledger.some(e => e.head === git(wt, "rev-parse", "HEAD") && e.branch === "worktree/x")],
		["git stash list unchanged", git(main, "stash", "list") === before.stash],
	];
});

kase("c-same-lines: main has an uncommitted edit to the SAME line of A", ({ main }) => edit(path.join(main, "A.txt"), 2, "A line 2 — THE OWNER'S UNCOMMITTED EDIT"), ({ main }, m, before) => [
	["exit 4 (refused)", m.code === 4],
	["the main tree's diff is byte-identical before and after", git(main, "diff") === before.diff],
	["the dirty files' hashes are identical before and after", dirt(main) === before.dirt],
	["B was not touched either", !fs.readFileSync(path.join(main, "B.txt"), "utf8").includes("CHANGED BY THE BRANCH")],
	["HEAD unchanged, stash list unchanged", git(main, "rev-parse", "HEAD") === before.head && git(main, "stash", "list") === before.stash],
	["no .merge-landed.json", !fs.existsSync(path.join(main, ".merge-landed.json"))],
]);

kase("d-conflict: michael/dev committed its own change to A line 2; no dirt", ({ main }) => {
	edit(path.join(main, "A.txt"), 2, "A line 2 — COMMITTED ON michael/dev");
	git(main, "commit", "-q", "-am", "a conflicting commit");
}, ({ main }, m, before) => [
	["exit 4 (refused by merge-tree)", m.code === 4 && m.text.includes("conflicts with")],
	["merge-tree named A.txt", m.text.includes("A.txt")],
	["nothing touched: tree clean, HEAD unchanged, no MERGE_HEAD", dirt(main) === "(clean)" && git(main, "rev-parse", "HEAD") === before.head && !fs.existsSync(path.join(main, ".git", "MERGE_HEAD"))],
]);

/* 2026-09-25 (merge-file): an owner edit on the line right next to the branch's hunk. git apply refuses this
 * (its context lines no longer match); a three-way merge does not. */
kase("e-adjacent-line: main has an uncommitted edit to A line 3, directly under the branch's line 2", ({ main }) => edit(path.join(main, "A.txt"), 3, "A line 3 — THE OWNER'S UNCOMMITTED EDIT"), ({ main, wt }, m, before) => {
	return [
		["exit 0", m.code === 0],
		["A keeps BOTH edits (line 2 from the branch, line 3 from the owner)", A(main).split("\n")[1].includes("CHANGED BY THE BRANCH") && A(main).split("\n")[2].includes("THE OWNER'S UNCOMMITTED EDIT")],
		["A is exactly the base with line 2 from the branch and line 3 from the owner, nothing else", A(main) === lines20("A").replace("A line 2\n", "A line 2 — CHANGED BY THE BRANCH\n").replace("A line 3\n", "A line 3 — THE OWNER'S UNCOMMITTED EDIT\n")],
		["B got the branch's edit", fs.readFileSync(path.join(main, "B.txt"), "utf8").includes("CHANGED BY THE BRANCH")],
		["nothing staged", git(main, "diff", "--cached", "--name-only") === ""],
		["no commit made (HEAD unchanged)", git(main, "rev-parse", "HEAD") === before.head],
		["git stash list unchanged", git(main, "stash", "list") === before.stash],
	];
});

/* e0: the control on an untouched copy — prove git apply really refuses case e's starting state. */
{
	const { main } = setup("e0-apply-control");
	edit(path.join(main, "A.txt"), 3, "A line 3 — THE OWNER'S UNCOMMITTED EDIT");
	const patch = spawnSync("git", ["diff", "michael/dev...worktree/x"], { cwd: main, windowsHide: true }).stdout;
	const apply = spawnSync("git", ["apply", "--check", "-"], { cwd: main, input: patch, windowsHide: true, encoding: "utf8" });
	say(`\ne0-apply-control: case e's starting state, given to the OLD path (git apply --check)`);
	say(`  git apply --check exit ${apply.status}: ${apply.stderr.trim().split("\n").join(" / ")}`);
	say(`  ${apply.status !== 0 ? "PASS" : "FAIL"}  git apply refuses it, so case e could only pass with merge-file`);
	results.push(["e0-apply-control: git apply refuses case e", apply.status !== 0]);
}

/* f: the owner's file has CRLF line endings; the merged file must keep CRLF on every line. */
kase("f-crlf: main's A has CRLF line endings plus an owner edit in another hunk", ({ main }) => {
	edit(path.join(main, "A.txt"), 15, "A line 15 — THE OWNER'S UNCOMMITTED EDIT");
	fs.writeFileSync(path.join(main, "A.txt"), fs.readFileSync(path.join(main, "A.txt"), "utf8").replace(/\n/g, "\r\n"));
}, ({ main }, m, before) => {
	const a = A(main);
	return [
		["exit 0", m.code === 0],
		["A keeps BOTH edits", a.includes("CHANGED BY THE BRANCH") && a.includes("THE OWNER'S UNCOMMITTED EDIT")],
		["every line of A still ends in CRLF", !/[^\r]\n/.test(a) && a.endsWith("\r\n")],
		["nothing staged, HEAD and stash unchanged", git(main, "diff", "--cached", "--name-only") === "" && git(main, "rev-parse", "HEAD") === before.head && git(main, "stash", "list") === before.stash],
	];
});

/* Deliverable 2: the pool counts an applied head as merged. Reuses case b's repo. */
try {
	const { default: Pool } = await import(pathToFileURL(path.resolve(path.dirname(MERGE), "..", "Servex", "Pool.js")).href);
	const b = { main: path.join(SCRATCH, "b-other-hunk", "main"), wt: path.join(SCRATCH, "b-other-hunk", "wt") };
	const pool = Object.assign(Object.create(Pool.prototype), { main: b.main, base: "michael/dev" });
	const landed = await pool.landed({ path: b.wt });
	const cLanded = await pool.landed({ path: path.join(SCRATCH, "c-same-lines", "wt") });
	say(`\npool: Pool.landed() for case b's worktree = ${landed} (expected true); for case c's = ${cLanded} (expected false)`);
	results.push(["pool: applied head counts as merged", landed === true && cLanded === false]);
} catch (e) { say(`\npool check could not run: ${e.message}`); results.push(["pool check", false]); }

say("\nSUMMARY");
for (const [label, ok] of results) say(`  ${ok ? "PASS" : "FAIL"}  ${label}`);
fs.writeFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), "proof.txt"),
	`Proof: Server/merge.mjs on scratch repos (${new Date().toISOString()})\nmerge.mjs: ${MERGE}\n` + out.join("\n") + "\n");
process.exit(results.every(r => r[1]) ? 0 : 1);
