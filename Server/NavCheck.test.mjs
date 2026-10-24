// node Server/NavCheck.test.mjs — NavCheck on throwaway fixtures: a refusal (an unlinked page), a pass (a linked one), and which added files count as pages.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import http from "node:http";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import NavCheck from "./NavCheck.mjs";
import Browser from "./Browser.mjs";

// 1. The page file -> url and the parent.
assert.equal(NavCheck.url_of("public/framework/ai/merge/page.js"), "/framework/ai/merge/");
assert.equal(NavCheck.url_of("public/live/page.jsonl"), "/live/");
assert.equal(NavCheck.url_of("public/framework/ai/Foo.js"), null);
assert.equal(NavCheck.parent_of("/framework/ai/merge/"), "/framework/ai/");

// 2. Which added files count: a real git repo, one commit apart.
const root = fs.mkdtempSync(path.join(os.tmpdir(), "navcheck-"));
const git = (...a) => spawnSync("git", a, { cwd: root, encoding: "utf8", windowsHide: true, env: { ...process.env, GIT_AUTHOR_NAME: "t", GIT_AUTHOR_EMAIL: "t@t", GIT_COMMITTER_NAME: "t", GIT_COMMITTER_EMAIL: "t@t" } });
const put = (rel, text = "x") => { const f = path.join(root, rel); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, text); };
git("init", "-q"); put("public/a/page.js"); git("add", "."); git("commit", "-q", "-m", "base");
put("public/b/page.js"); put("public/b/c/page.jsonl"); put("public/a/tasks/t1/page.js"); put("public/framework/ai/sessions/2026/10/20/s/page.js"); put("public/b/Thing.js");
git("add", "."); git("commit", "-q", "-m", "add");
assert.deepEqual(NavCheck.added(root, { range: "HEAD~1...HEAD" }), ["/b/", "/b/c/"], "new pages only: no tasks/ folders, no dated session folders, no plain .js files");
assert.equal(NavCheck.parent_page(root, "/b/c/"), "/b/");
assert.equal(NavCheck.parent_page(root, "/b/"), "/", "no ancestor page: the site root");
fs.rmSync(root, { recursive: true, force: true });

// 3. The click test, on a tiny server: /home/ links to /linked/, /bare/ links to nothing, /named/ only NAMES the child in text.
const pages = {
	"/home/": `<h1>Home</h1><nav><a href="/linked/">Linked</a></nav>`,
	"/bare/": `<h1>Bare</h1><p>Nothing to click here.</p>`,
	"/named/": `<h1>Named</h1><p>children: orphan</p>`,
};
const server = http.createServer((req, res) => { const body = pages[req.url]; res.writeHead(body ? 200 : 404, { "content-type": "text/html" }); res.end(body ?? "no"); });
await new Promise(r => server.listen(0, "127.0.0.1", r));
const base = `http://127.0.0.1:${server.address().port}`;
try {
	const pass = await NavCheck.check(base, [{ url: "/linked/", parent: "/home/" }], { wait: 1500 });
	assert.equal(pass[0].linked, true, "an a[href] to the page on its parent is a pass");
	assert.equal(NavCheck.refusal(pass), null, "a pass has no refusal text");

	const fail = await NavCheck.check(base, [{ url: "/orphan/", parent: "/bare/" }, { url: "/orphan/", parent: "/named/" }, { url: "/x/", parent: "/missing/" }], { wait: 1500 });
	assert.deepEqual(fail.map(r => r.linked), [false, false, false], "no link, a name in text, or a parent that does not load: all refused");
	const why = NavCheck.refusal(fail);
	assert.match(why, /3 new page\(s\) nobody can click to/);
	assert.match(why, /\/orphan\/ {2}<- not linked from \/bare\//);
	assert.match(why, /--no-nav "why"/);
	console.log("--- a refusal, as merge.mjs prints it ---\n" + why + "\n---");
} finally { server.close(); await Browser.close(); }
console.log("NavCheck: ok");
