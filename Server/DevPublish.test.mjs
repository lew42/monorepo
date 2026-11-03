// node Server/DevPublish.test.mjs — scratch repos with a bare "origin" under os.tmpdir(): pull before pushing, one retry of a refused
// push, the merge commit names the task, and publish-to-main is off by default. Why: public/framework/doc/git.md (step 3).
import fs from "node:fs"; import os from "node:os"; import path from "node:path"; import assert from "node:assert";
import { execFileSync, spawnSync } from "node:child_process";
import DevPublish from "./DevPublish.mjs";
import { DEV_BRANCH } from "./dev-branch.mjs";

const MERGE = path.join(import.meta.dirname, "merge.mjs");
let passed = 0;
const tests = [];
const test = (name, fn) => tests.push([name, fn]);
const git = (cwd, ...a) => execFileSync("git", a, { cwd, windowsHide: true, stdio: "pipe" }).toString();
const write = (cwd, f, t) => { fs.mkdirSync(path.dirname(path.join(cwd, f)), { recursive: true }); fs.writeFileSync(path.join(cwd, f), t); };
const tmps = [];

/** origin (bare) + main (on DEV_BRANCH, pushed) + other (a second clone that can push to origin ahead of main). */
function repos(){
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "devpub-")); tmps.push(root);
	const origin = path.join(root, "origin.git"), main = path.join(root, "main"), other = path.join(root, "other");
	git(root, "init", "--bare", "-b", DEV_BRANCH, origin);
	fs.mkdirSync(main);
	git(main, "init", "-b", DEV_BRANCH); git(main, "config", "user.email", "t@t"); git(main, "config", "user.name", "t");
	write(main, "a.txt", "1\n"); write(main, "b.txt", "1\n"); git(main, "add", "."); git(main, "commit", "-m", "base");
	git(main, "remote", "add", "origin", origin); git(main, "push", "-u", "origin", DEV_BRANCH);
	git(root, "clone", "-b", DEV_BRANCH, origin, other); git(other, "config", "user.email", "o@o"); git(other, "config", "user.name", "o");
	return { root, origin, main, other };
}
const pushOther = (other, f, t) => { write(other, f, t); git(other, "add", "."); git(other, "commit", "-m", "from other: " + f); git(other, "push", "origin", DEV_BRANCH); };
const sha = (cwd, ref) => git(cwd, "rev-parse", ref).trim();

test("origin ahead: push_dev fast-forwards it in, then pushes", () => {
	const { origin, main, other } = repos();
	pushOther(other, "c.txt", "C\n");
	write(main, "dirty.txt", "x\n"); git(main, "add", "dirty.txt"); git(main, "reset", "-q");   // an untracked stray stays untouched
	const r = DevPublish.push_dev(main, DEV_BRANCH);
	assert.ok(r.ok, r.notes.join("; "));
	assert.ok(fs.existsSync(path.join(main, "c.txt")), "origin's file is in the main tree");
	assert.equal(sha(main, DEV_BRANCH), sha(origin, DEV_BRANCH));
	assert.ok(fs.existsSync(path.join(main, "dirty.txt")), "the stray is still there");
});

test("diverged but clean: origin's commit is merged in, my commit is pushed, both survive", () => {
	const { origin, main, other } = repos();
	pushOther(other, "c.txt", "C\n");
	write(main, "mine.txt", "M\n"); git(main, "add", "."); git(main, "commit", "-m", "mine");
	const r = DevPublish.push_dev(main, DEV_BRANCH);
	assert.ok(r.ok, r.notes.join("; "));
	assert.equal(sha(main, DEV_BRANCH), sha(origin, DEV_BRANCH));
	const files = git(origin, "ls-tree", "-r", "--name-only", DEV_BRANCH).split(/\r?\n/);
	assert.ok(files.includes("c.txt") && files.includes("mine.txt"), files.join());
	assert.equal(git(main, "rev-list", "--parents", "-n1", "HEAD").trim().split(" ").length, 3, "a merge commit");
});

test("diverged and conflicting: nothing is touched, the note names the files, push is not attempted", () => {
	const { origin, main, other } = repos();
	pushOther(other, "a.txt", "theirs\n");
	write(main, "a.txt", "mine\n"); git(main, "commit", "-qam", "mine");
	const before = sha(main, "HEAD"), originBefore = sha(origin, DEV_BRANCH);
	const r = DevPublish.push_dev(main, DEV_BRANCH);
	assert.ok(!r.ok);
	assert.match(r.notes.join("; "), /conflict in: a\.txt/);
	assert.equal(sha(main, "HEAD"), before); assert.equal(sha(origin, DEV_BRANCH), originBefore);
	assert.equal(git(main, "status", "--porcelain").trim(), "");
});

test("origin changed a file the main tree has uncommitted edits to: no merge, edits kept, tried again later", () => {
	const { main, other } = repos();
	pushOther(other, "b.txt", "theirs\n"); pushOther(other, "c.txt", "C\n");
	write(main, "mine.txt", "M\n"); git(main, "add", "."); git(main, "commit", "-m", "mine");   // diverge so a merge is needed
	write(main, "b.txt", "my uncommitted edit\n");
	const r = DevPublish.push_dev(main, DEV_BRANCH);
	assert.ok(!r.ok);
	assert.match(r.notes.join("; "), /uncommitted edits.*b\.txt/);
	assert.equal(fs.readFileSync(path.join(main, "b.txt"), "utf8"), "my uncommitted edit\n");
});

test("staged changes in the main tree: no merge commit that would sweep them in", () => {
	const { main, other } = repos();
	pushOther(other, "c.txt", "C\n");
	write(main, "mine.txt", "M\n"); git(main, "add", "."); git(main, "commit", "-m", "mine");
	write(main, "staged.txt", "S\n"); git(main, "add", "staged.txt");
	const r = DevPublish.push_dev(main, DEV_BRANCH);
	assert.ok(!r.ok);
	assert.match(r.notes.join("; "), /staged changes/);
	assert.equal(git(main, "diff", "--cached", "--name-only").trim(), "staged.txt");
});

test("a refused push is retried once: another clone slips a commit in between our fetch and our push", () => {
	const { origin, main, other } = repos();
	write(main, "mine.txt", "M\n"); git(main, "add", "."); git(main, "commit", "-m", "mine");
	const sh = p => p.replaceAll("\\", "/"), marker = sh(path.join(path.dirname(origin), "slipped"));
	// pre-push hook: the first time, another clone pushes to origin just before our push goes out, so ours is refused (non-fast-forward)
	fs.writeFileSync(path.join(main, ".git", "hooks", "pre-push"), `#!/bin/sh
if [ ! -f "${marker}" ]; then
  touch "${marker}"
  unset GIT_DIR GIT_INDEX_FILE GIT_WORK_TREE
  cd "${sh(other)}" && echo slip > slip.txt && git add slip.txt && git commit -qm slip && git push -q origin ${DEV_BRANCH}
fi
exit 0
`, { mode: 0o755 });
	const r = DevPublish.push_dev(main, DEV_BRANCH);
	assert.ok(r.ok, r.notes.join("; "));
	assert.match(r.notes.join("; "), /refused/, "says the first push was refused");
	assert.equal(sha(main, DEV_BRANCH), sha(origin, DEV_BRANCH));
	assert.ok(fs.existsSync(path.join(main, "slip.txt")), "the slipped-in commit was brought in");
});

test("a push that fails twice only warns: ok false, the commit stands", () => {
	const { origin, main } = repos();
	write(main, "mine.txt", "M\n"); git(main, "add", "."); git(main, "commit", "-m", "mine");
	fs.writeFileSync(path.join(origin, "hooks", "pre-receive"), "#!/bin/sh\necho no >&2\nexit 1\n", { mode: 0o755 });
	const r = DevPublish.push_dev(main, DEV_BRANCH);
	assert.ok(!r.ok);
	assert.match(r.notes.join("; "), /failed \(the merge stands\)/);
	assert.ok(git(main, "log", "-1", "--format=%s").includes("mine"));
});

test("merge_message names the task, not the branch", () => {
	assert.equal(DevPublish.merge_message("worktree/qf-5", "bold the session title"), "Merge qf-5: bold the session title");
	assert.equal(DevPublish.merge_message("task/x", ""), "Merge x");
});

test("merge.mjs names the task in the merge commit (--main runs never push, so the push is covered above)", () => {
	const { main } = repos();
	const wt = path.join(path.dirname(main), "wt");
	git(main, "worktree", "add", "-b", "worktree/qf-5", wt);
	write(wt, "a.txt", "2\n"); git(wt, "add", "."); git(wt, "commit", "-m", "bold the session title");
	const r = spawnSync("node", [MERGE, wt, "--main", main, "--skip-smoke", "--no-review", "scratch-repo test"], { encoding: "utf8", windowsHide: true });
	assert.equal(r.status, 0, r.stdout + r.stderr);
	assert.equal(git(main, "log", "-1", "--format=%s").trim(), "Merge qf-5: bold the session title");
	assert.match(r.stdout, /Merge qf-5: bold the session title/);
});

test("publish to main is off by default and the switch reads the setting file and the env var", () => {
	const old = process.env.MERGE_PUBLISH_MAIN; delete process.env.MERGE_PUBLISH_MAIN;
	try {
		assert.equal(DevPublish.publish_on(), false, "the shipped Server/publish.json says off");
		const f = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "devpub-set-")), "publish.json"); tmps.push(path.dirname(f));
		assert.equal(DevPublish.publish_on(f), false, "no file: off");
		fs.writeFileSync(f, '{"main": true}'); assert.equal(DevPublish.publish_on(f), true);
		process.env.MERGE_PUBLISH_MAIN = "0"; assert.equal(DevPublish.publish_on(f), false);
		process.env.MERGE_PUBLISH_MAIN = "1"; assert.equal(DevPublish.publish_on(path.join(path.dirname(f), "none.json")), true);
	} finally { if (old === undefined) delete process.env.MERGE_PUBLISH_MAIN; else process.env.MERGE_PUBLISH_MAIN = old; }
});

test("publish_main opens a pull request, merges it, moves the local main label (GitHub faked, origin is a local bare repo)", async () => {
	const { origin, main } = repos();
	write(main, "mine.txt", "M\n"); git(main, "add", "."); git(main, "commit", "-m", "mine"); git(main, "push", "origin", DEV_BRANCH);
	git(origin, "branch", "main", "HEAD~1");   // main is one commit behind dev
	git(main, "remote", "set-url", "origin", origin);
	const calls = [];
	const api = async (method, route, body) => {
		calls.push(method + " " + route);
		if (method === "POST") return { status: 201, json: { number: 7 } };
		if (method === "PUT") { git(origin, "update-ref", "refs/heads/main", DEV_BRANCH); return { status: 200, json: { merged: true } }; }
		return { status: 200, json: [] };
	};
	// slug() needs a github.com remote: use a url-rewrite so origin looks like github but fetches from the bare repo
	git(main, "config", `url.${origin}.insteadOf`, "https://github.com/t/t.git");
	git(main, "remote", "set-url", "origin", "https://github.com/t/t.git");
	const r = await DevPublish.publish_main(main, DEV_BRANCH, { api, wait: async () => {} });
	assert.ok(r.ok, r.notes.join("; "));
	assert.deepEqual(calls, ["POST /repos/t/t/pulls", "PUT /repos/t/t/pulls/7/merge"]);
	assert.equal(sha(main, "main"), sha(origin, "main"), "the local main label moved");
});

test("publish_main with nothing to publish makes no pull request", async () => {
	const { origin, main } = repos();
	git(origin, "branch", "main", DEV_BRANCH);
	git(main, "config", `url.${origin}.insteadOf`, "https://github.com/t/t.git");
	git(main, "remote", "set-url", "origin", "https://github.com/t/t.git");
	let called = false;
	const r = await DevPublish.publish_main(main, DEV_BRANCH, { api: async () => { called = true; return { status: 500, json: {} }; } });
	assert.ok(r.ok); assert.equal(called, false);
});

try {
	for (const [name, fn] of tests) { await fn(); passed++; console.log("ok -", name); }
	console.log(`${passed} passed`);
} finally { for (const t of tmps) fs.rmSync(t, { recursive: true, force: true }); }
