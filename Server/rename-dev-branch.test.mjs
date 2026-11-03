// node Server/rename-dev-branch.test.mjs — scratch repos with a bare origin: the dry run changes nothing, --apply renames the branch,
// rewrites live files, leaves records alone, leaves a dirty file uncommitted, and deletes origin's old branch. Why: git.md step 4.
import fs from "node:fs"; import os from "node:os"; import path from "node:path"; import assert from "node:assert";
import { execFileSync } from "node:child_process";
import Rename from "./rename-dev-branch.mjs";

const FROM = "michael/dev", TO = "compliance/dev";
const git = (cwd, ...a) => execFileSync("git", a, { cwd, windowsHide: true, stdio: "pipe" }).toString();
const write = (cwd, f, t) => { fs.mkdirSync(path.dirname(path.join(cwd, f)), { recursive: true }); fs.writeFileSync(path.join(cwd, f), t); };
const read = (cwd, f) => fs.readFileSync(path.join(cwd, f), "utf8");
const tmps = [], tests = []; let passed = 0;
const test = (name, fn) => tests.push([name, fn]);

function repo(){
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "rename-")); tmps.push(root);
	const origin = path.join(root, "origin.git"), main = path.join(root, "main");
	git(root, "init", "--bare", "-b", "main", origin); fs.mkdirSync(main);   // like GitHub: the default branch is main, so the dev branch can be deleted
	git(main, "init", "-b", FROM); git(main, "config", "user.email", "t@t"); git(main, "config", "user.name", "t");
	write(main, "Server/dev-branch.mjs", `export const DEV_BRANCH = "${FROM}";\n`);
	write(main, "Server/doc/worktrees.md", `Land on ${FROM}, then origin/${FROM}. Not michael/dev-extra or michael/devs.\r\n`);
	write(main, "public/framework/ai/sessions/2026/x/notes.md", `we merged into ${FROM}\n`);
	write(main, "public/framework/ai/log.jsonl", `{"b":"${FROM}"}\n`);
	write(main, "public/framework/doc/git.md", `plan: rename ${FROM}\n`);
	write(main, "CLAUDE.md", `the branch ${FROM}\n`);
	write(main, "live.md", `branch ${FROM}\n`); write(main, "dirty.md", `branch ${FROM}\n`);
	git(main, "add", "."); git(main, "commit", "-qm", "base");
	git(main, "remote", "add", "origin", origin); git(main, "push", "-q", "-u", "origin", FROM);
	return { root, origin, main };
}
const quiet = () => {};

test("the dry run reads only: manifest sorted into rewrite / by hand / history, nothing changed", () => {
	const { main } = repo();
	write(main, "dirty.md", `branch ${FROM} edited\n`);
	const before = git(main, "status", "--porcelain");
	const m = Rename.plan(main, FROM, TO);
	const kind = f => m.files.find(x => x.file === f)?.kind;
	assert.equal(kind("live.md"), "rewrite"); assert.equal(kind("Server/doc/worktrees.md"), "rewrite");
	assert.equal(kind("public/framework/ai/sessions/2026/x/notes.md"), "history"); assert.equal(kind("public/framework/ai/log.jsonl"), "history");
	assert.equal(kind("CLAUDE.md"), "by hand"); assert.equal(kind("public/framework/doc/git.md"), "by hand");
	assert.equal(m.files.find(x => x.file === "Server/doc/worktrees.md").count, 2, "michael/dev-extra and michael/devs are not the branch");
	assert.equal(m.files.find(x => x.file === "dirty.md").dirty, true);
	assert.deepEqual(m.problems, []);
	Rename.print(m, quiet);
	assert.equal(git(main, "status", "--porcelain"), before); assert.equal(git(main, "branch", "--show-current").trim(), FROM);
});

test("apply: branch renamed and pushed, live files rewritten and committed, records untouched, dirty file left uncommitted, old origin branch gone", () => {
	const { main, origin } = repo();
	write(main, "dirty.md", `branch ${FROM} edited\n`);
	const r = Rename.apply(Rename.plan(main, FROM, TO), { log: quiet });
	assert.ok(r.ok, JSON.stringify(r.steps));
	assert.equal(git(main, "branch", "--show-current").trim(), TO);
	assert.equal(read(main, "live.md"), `branch ${TO}\n`);
	assert.equal(read(main, "Server/doc/worktrees.md"), `Land on ${TO}, then origin/${TO}. Not michael/dev-extra or michael/devs.\r\n`, "CRLF kept, lookalikes kept");
	assert.equal(read(main, "Server/dev-branch.mjs"), `export const DEV_BRANCH = "${TO}";\n`);
	assert.equal(read(main, "public/framework/ai/sessions/2026/x/notes.md"), `we merged into ${FROM}\n`);
	assert.equal(read(main, "CLAUDE.md"), `the branch ${FROM}\n`); assert.equal(read(main, "public/framework/doc/git.md"), `plan: rename ${FROM}\n`);
	assert.equal(read(main, "dirty.md"), `branch ${TO} edited\n`);
	assert.match(git(main, "status", "--porcelain"), /^ M dirty\.md$/m, "the dirty file is still only a working-tree edit");
	assert.equal(git(main, "status", "--porcelain").trim().split("\n").length, 1, "nothing else is dirty");
	assert.equal(git(main, "rev-parse", TO).trim(), git(origin, "rev-parse", TO).trim(), "pushed");
	assert.equal(git(main, "rev-parse", "--abbrev-ref", `${TO}@{upstream}`).trim(), `origin/${TO}`);
	assert.ok(!git(origin, "branch", "--list", FROM).trim(), "origin's old branch is deleted");
	assert.ok(!fs.existsSync(path.join(main, ".merge.lock")), "lock released");
});

test("apply refuses while a merge holds .merge.lock, or when the target branch exists, and touches nothing", () => {
	const { main } = repo();
	fs.writeFileSync(path.join(main, ".merge.lock"), "{}");
	let m = Rename.plan(main, FROM, TO); assert.ok(m.problems.some(p => /merge.lock/.test(p)));
	assert.ok(!Rename.apply(m, { log: quiet }).ok); assert.equal(read(main, "live.md"), `branch ${FROM}\n`);
	fs.unlinkSync(path.join(main, ".merge.lock"));
	git(main, "branch", TO);
	m = Rename.plan(main, FROM, TO); assert.ok(m.problems.some(p => /already exists/.test(p)));
	assert.ok(!Rename.apply(m, { log: quiet }).ok); assert.equal(git(main, "branch", "--show-current").trim(), FROM);
});

test("origin's old branch with commits the new one lacks is kept, and the run says so", () => {
	const { main, origin, root } = repo();
	const other = path.join(root, "other"); git(root, "clone", "-q", "-b", FROM, origin, other); git(other, "config", "user.email", "o@o"); git(other, "config", "user.name", "o");
	write(other, "x.txt", "x\n"); git(other, "add", "."); git(other, "commit", "-qm", "x"); git(other, "push", "-q", "origin", FROM);
	git(main, "fetch", "-q", "origin");   // origin/michael/dev now has a commit the PC's branch does not
	const r = Rename.apply(Rename.plan(main, FROM, TO), { log: quiet });
	assert.ok(r.steps.some(s => /skipped/.test(s.note)), JSON.stringify(r.steps));
	assert.ok(git(origin, "branch", "--list", FROM).trim(), "old origin branch kept");
});

try { for (const [name, fn] of tests) { await fn(); passed++; console.log("ok -", name); } console.log(`${passed} passed`); }
finally { for (const t of tmps) fs.rmSync(t, { recursive: true, force: true }); }
