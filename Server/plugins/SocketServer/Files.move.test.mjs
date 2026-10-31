// The Files tab's rename and move over the dev socket: move_plan (a dry run), move_apply, move_undo. Run: `node Server/plugins/SocketServer/Files.move.test.mjs`
// Real parts: the dev server's own SocketServer with the Files plugin on a real http port, a real ws client, real folders under public/data/ (git-ignored,
// so `git mv` really does fail on them and the fallback is really used), the real PageFiles watcher, and the real Server/ModuleMove.mjs.
// Faked: nothing. The manifests go to a temp folder (Files.MOVES) so the repo's Server/moves/ stays clean.
//   1. rename a file; undo puts it back
//   2. rename a page (its folder): the dry run counts the links and moves nothing; apply rewrites the links in other files; undo restores every byte
//   3. move a page into another page: both parents' lists are right (old one says gone, new one lists it once)
//   4. a name clash refuses, for a file, a page and a plan, and nothing moves
//   5. nothing outside public/ can be reached, and the page's own files cannot be renamed or targeted
//   6. a parent that still names the page in a legacy `children: "a b"` string refuses the plan with a sentence
//   7. ModuleMove alone, in a temp folder that is not a git repo: apply and undo work without `git mv`, and a changed file stops an undo before it writes anything
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
process.chdir(ROOT);   // the plugins resolve "public" from the cwd

const { default: Test } = await import("../../../public/framework/core/Test/Test.js");
const { default: SocketServer } = await import("./SocketServer.js");
const { default: Files } = await import("./Files.js");
const { default: PageFiles } = await import("../PageFiles.js");
const { default: ModuleMove } = await import("../../ModuleMove.mjs");
const { default: watch } = await import("../../watch.js");
const { WebSocket } = await import("ws");

const t = new Test("Files plugin: rename and move a file or a page, with a dry run and an undo");
const NAME = "files-move-test-" + process.pid, URL = `/data/${NAME}/`, DIR = path.join(ROOT, "public", "data", NAME);
const made_public_data = !fs.existsSync(path.join(ROOT, "public", "data"));
const MOVES = fs.mkdtempSync(path.join(os.tmpdir(), "files-move-manifests-"));
Files.MOVES = MOVES;
fs.mkdirSync(DIR, { recursive: true });
fs.writeFileSync(path.join(DIR, "page.js"), "export default {};\n");   // a page.js page keeps its list in files.jsonl, written by PageFiles
const OUTSIDE = fs.mkdtempSync(path.join(ROOT, "public", "data", "outside-"));   // beside the page, never touched by it

const page_files = Object.create(PageFiles.prototype);
page_files.pending = new Map();
const unwatch = watch(file => page_files.event(file));

const server = http.createServer();
await new Promise(r => server.listen(0, "127.0.0.1", r));
SocketServer.Socket.use(Files);
const socket_server = new SocketServer({ server: { http: server } });
const ws = new WebSocket(`ws://127.0.0.1:${server.address().port}`);
await new Promise((res, rej) => { ws.on("open", res); ws.on("error", rej); });
const waiting = new Map();
let next = 0;
ws.on("message", data => { const m = JSON.parse(data.toString()); waiting.get(m.index)?.(m.response); });
// A message nobody answers (a verb that does not exist yet) ends as a refusal after 4 s instead of hanging the test.
const rpc = (method, ...args) => new Promise(res => {
	const index = next++, timer = setTimeout(() => res({ ok: false, reason: `no answer to ${method}` }), 4000);
	waiting.set(index, r => { clearTimeout(timer); res(r); });
	ws.send(JSON.stringify({ method, args, index }));
});

const sleep = ms => new Promise(r => setTimeout(r, ms));
const abs = (...p) => path.join(DIR, ...p);
const read = (...p) => fs.readFileSync(abs(...p), "utf8");
const lines_of = file => fs.existsSync(file) ? fs.readFileSync(file, "utf8").split("\n").filter(Boolean).map(l => { try { return JSON.parse(l); } catch { return {}; } }) : [];
// The list a folder shows: replay its log, the latest line per name wins (what PageListing.from does).
const shown = (...p) => { const now = new Map(); for (const { file, gone } of lines_of(abs(...p))) if (typeof file === "string") gone ? now.delete(file.split("/")[0]) : now.set(file.split("/")[0], file); return [...now.keys()].sort(); };
const file_lines = (log, file) => lines_of(abs(...log)).filter(l => l.file === file && !l.gone).length;

// Ask the real watcher; this sandbox shares its inotify budget with other dev servers, so if it stays silent, ask PageFiles to catch the folders up (the same code).
async function listed_soon(check, what, dirs){
	const end = Date.now() + 2000;
	while (Date.now() < end){ if (check()) return true; await sleep(25); }
	console.log("  (watcher silent for: " + what + "; asking PageFiles to catch up)");
	for (const d of dirs) page_files.settle(d);
	return check();
}

// Every file under a folder with its bytes' hash, lists left out (they grow by design): "undo restores exactly" is two of these being equal.
function snapshot(dir){
	const out = {};
	(function walk(d){
		for (const e of fs.readdirSync(d, { withFileTypes: true })){
			const full = path.join(d, e.name);
			if (e.name === "files.jsonl" || e.name === "page.jsonl") continue;
			e.isDirectory() ? walk(full) : out[path.relative(dir, full)] = crypto.createHash("sha1").update(fs.readFileSync(full)).digest("hex");
		}
	})(dir);
	return out;
}

// A page with something that points at it: a doc and a script elsewhere in the tree, one absolute link, one import.
const link_text = (page) => `See [the trip](${URL}${page}/) for details.\n`;
const import_text = (page) => `import "${URL}${page}/x.js";\nexport default {};\n`;
async function make_trip(){
	t.ok((await rpc("page_add", URL, "trip", "Trip")).ok, "set up: trip page made");
	fs.writeFileSync(abs("trip", "x.js"), "export default 1;\n");
	fs.writeFileSync(abs("trip", "note.txt"), "packing list\n");
	fs.writeFileSync(abs("notes.md"), link_text("trip"));
	fs.writeFileSync(abs("loader.js"), import_text("trip"));
}

try {
	// 1. Rename a file
	{
		fs.writeFileSync(abs("a.txt"), "hello a\n");
		await listed_soon(() => shown("files.jsonl").includes("a.txt"), "files.jsonl lists a.txt", [DIR]);
		const plan = await rpc("move_plan", URL, "a.txt", URL, "b.txt");
		t.ok(plan.ok && plan.kind === "file", "the plan for a file says it is a file: " + JSON.stringify(plan));
		t.ok(fs.existsSync(abs("a.txt")) && !fs.existsSync(abs("b.txt")), "a plan moves nothing");
		const done = await rpc("move_apply", URL, "a.txt", URL, "b.txt");
		t.ok(done.ok && typeof done.manifest === "string", "move_apply answers ok with a manifest name: " + JSON.stringify(done));
		t.ok(!fs.existsSync(abs("a.txt")) && read("b.txt") === "hello a\n", "the file has its new name and its bytes");
		t.ok(done.manifest && fs.existsSync(path.join(MOVES, done.manifest)), "the manifest is on disk in the moves folder");
		t.ok(await listed_soon(() => shown("files.jsonl").includes("b.txt") && !shown("files.jsonl").includes("a.txt"), "files.jsonl follows the rename", [DIR]), "the folder's list says a.txt went and b.txt came");
		const undone = await rpc("move_undo", done.manifest);
		t.ok(undone.ok && read("a.txt") === "hello a\n" && !fs.existsSync(abs("b.txt")), "undo puts the file back under its first name: " + JSON.stringify(undone));
	}

	// 2. Rename a page: dry run, apply, undo
	await make_trip();
	{
		const before = snapshot(DIR);
		const plan = await rpc("move_plan", URL, "trip", URL, "journey");
		t.ok(plan.ok && plan.kind === "page", "the plan for a page folder says page: " + JSON.stringify(plan).slice(0, 300));
		t.ok(plan.paths >= 2, `the plan counts the links that will change (${plan.paths}): the doc link and the import`);
		t.ok(plan.files >= 2, `and the files they sit in (${plan.files})`);
		t.ok(Array.isArray(plan.sample) && plan.sample.length > 0 && plan.sample.every(s => s.file && s.from && s.to), "and shows a sample of old to new");
		t.eq(snapshot(DIR), before, "a dry run changed no file");
		t.ok(fs.existsSync(abs("trip")) && !fs.existsSync(abs("journey")), "and moved no folder");

		const done = await rpc("move_apply", URL, "trip", URL, "journey");
		t.ok(done.ok, "apply answers ok: " + JSON.stringify(done).slice(0, 300));
		t.ok(!fs.existsSync(abs("trip")) && fs.existsSync(abs("journey", "x.js")) && read("journey", "note.txt") === "packing list\n", "the folder moved with its files (git mv is not possible on an untracked folder: the fallback ran)");
		t.eq(read("notes.md"), link_text("journey"), "the link in the doc now points at the new name");
		t.eq(read("loader.js"), import_text("journey"), "the import in the script now points at the new name");
		t.ok(await listed_soon(() => !shown("files.jsonl").includes("trip") && shown("files.jsonl").includes("journey"), "files.jsonl follows", [DIR]), "the parent's list says trip went and journey came");
		t.ok(!shown("page.jsonl").includes("trip") && shown("page.jsonl").includes("journey"), "the parent's page.jsonl (where page_add declared it) agrees");

		const undone = await rpc("move_undo", done.manifest);
		t.ok(undone.ok, "undo answers ok: " + JSON.stringify(undone));
		t.eq(snapshot(DIR), before, "after undo every file is back, byte for byte, links included");
		t.ok(await listed_soon(() => shown("files.jsonl").includes("trip") && !shown("files.jsonl").includes("journey"), "files.jsonl follows the undo", [DIR]), "and the lists say trip is back");
		const twice = await rpc("move_undo", done.manifest);
		t.ok(twice.ok === false && typeof twice.reason === "string", "undoing the same move twice is refused with a sentence: " + twice.reason);
	}

	// 3. Move a page into another page: both parents' lists are right
	{
		t.ok((await rpc("page_add", URL, "europe", "Europe")).ok, "set up: europe page made");
		const before = snapshot(DIR);
		const done = await rpc("move_apply", URL, "trip", URL + "europe/", "trip");
		t.ok(done.ok, "moving trip into europe answers ok: " + JSON.stringify(done).slice(0, 300));
		t.ok(fs.existsSync(abs("europe", "trip", "page.jsonl")) && !fs.existsSync(abs("trip")), "trip is now inside europe");
		t.eq(read("notes.md"), `See [the trip](${URL}europe/trip/) for details.\n`, "the doc link follows it into europe");
		t.ok(await listed_soon(() => !shown("files.jsonl").includes("trip") && !shown("page.jsonl").includes("trip"), "the old parent forgets trip", [DIR]), "the old parent's lists no longer show trip");
		t.ok(shown("europe", "page.jsonl").includes("trip"), "the new parent's list shows trip");
		await sleep(300);
		t.eq(file_lines(["europe", "page.jsonl"], "trip/page.jsonl"), 1, "and shows it exactly once");
		t.ok(shown("files.jsonl").includes("europe"), "europe is still listed in its own parent");

		const undone = await rpc("move_undo", done.manifest);
		t.ok(undone.ok, "undo answers ok: " + JSON.stringify(undone));
		t.eq(snapshot(DIR), before, "undo restores every file");
		t.ok(await listed_soon(() => shown("files.jsonl").includes("trip") && !shown("europe", "page.jsonl").includes("trip"), "lists follow the undo", [DIR, abs("europe")]), "and both parents' lists are right again");
	}

	// 4. A name clash refuses; nothing moves
	{
		fs.mkdirSync(abs("europe", "trip"));   // a folder with the name already there
		fs.writeFileSync(abs("europe", "trip", "page.jsonl"), JSON.stringify({ title: "Other trip" }) + "\n");
		const before = snapshot(DIR);
		const plan = await rpc("move_plan", URL, "trip", URL + "europe/", "trip");
		t.ok(plan.ok === false && /already/.test(plan.reason), "the plan says the name is taken: " + plan.reason);
		const done = await rpc("move_apply", URL, "trip", URL + "europe/", "trip");
		t.ok(done.ok === false && /already/.test(done.reason), "and so does apply: " + done.reason);
		t.eq(snapshot(DIR), before, "nothing moved and no link changed");
		fs.writeFileSync(abs("c.txt"), "c\n"); fs.writeFileSync(abs("d.txt"), "d\n");
		const file_clash = await rpc("move_apply", URL, "c.txt", URL, "d.txt");
		t.ok(file_clash.ok === false && /already/.test(file_clash.reason) && read("d.txt") === "d\n" && read("c.txt") === "c\n", "a file renamed onto another file is refused, both keep their bytes: " + file_clash.reason);
		const case_clash = await rpc("move_apply", URL, "c.txt", URL, "D.TXT");
		t.ok(case_clash.ok === false && /already/.test(case_clash.reason), "a name that differs only by capitals counts as taken (Windows and macOS): " + case_clash.reason);
		fs.rmSync(abs("europe", "trip"), { recursive: true });
	}

	// 5. Nothing escapes public/, and the page's own files are not targets
	{
		const outside = path.basename(OUTSIDE), before = snapshot(DIR);
		const attempts = [
			["destination folder climbs out of public/", () => rpc("move_apply", URL, "c.txt", URL + "../../../", "c.txt")],
			["destination folder is a sibling reached with ..", () => rpc("move_apply", URL, "c.txt", URL + "../" + outside + "/", "c.txt")],
			["source name with a slash", () => rpc("move_apply", URL, "../" + outside, URL, "x")],
			["new name with a slash", () => rpc("move_apply", URL, "c.txt", URL, "../escaped.txt")],
			["new name is a dot name", () => rpc("move_apply", URL, "c.txt", URL, ".hidden")],
			["a page folder moved out", () => rpc("move_apply", URL, "trip", URL + "../" + outside + "/", "trip")],
			["a plan outside public/", () => rpc("move_plan", "/../", "x", URL, "y")],
			["undo of a manifest outside the moves folder", () => rpc("move_undo", "../../package.json")],
			["undo of a manifest that is not there", () => rpc("move_undo", "nothing.json")],
			["rename the page's own page.js", () => rpc("move_apply", URL, "page.js", URL, "gone.js")],
			["rename onto page.jsonl", () => rpc("move_apply", URL, "c.txt", URL, "page.jsonl")],
			["rename onto a Windows device name", () => rpc("move_apply", URL, "c.txt", URL, "nul.txt")],
			["a page into itself", () => rpc("move_apply", URL, "trip", URL + "trip/", "inside")],
		];
		for (const [what, go] of attempts){
			const r = await go();
			t.ok(r && r.ok === false && typeof r.reason === "string", `refused: ${what} (${r?.reason})`);
		}
		t.eq(fs.readdirSync(OUTSIDE), [], "nothing was written into the folder next door");
		t.ok(!fs.existsSync(path.join(ROOT, "public", "data", "escaped.txt")) && !fs.existsSync(path.join(ROOT, "public", "escaped.txt")), "and nothing beside public/data either");
		t.eq(snapshot(DIR), before, "and nothing in the page changed");
	}

	// 6. A legacy `children: "…"` string in the parent's page.js names the page: the plan refuses
	{
		fs.mkdirSync(abs("legacy"));
		fs.writeFileSync(abs("legacy", "page.js"), 'export default { children: "alpha beta" };\n');
		fs.mkdirSync(abs("legacy", "alpha"));
		fs.writeFileSync(abs("legacy", "alpha", "page.js"), "export default {};\n");
		const before = snapshot(DIR);
		const plan = await rpc("move_plan", URL + "legacy/", "alpha", URL + "legacy/", "gamma");
		t.ok(plan.ok === false && /children/.test(plan.reason) && /page\.js/.test(plan.reason), "the plan refuses and names the children string in page.js: " + plan.reason);
		t.eq(snapshot(DIR), before, "and nothing moved");
	}

	// 7. ModuleMove alone: no git, no tracked folder. The fallback moves it; undo checks everything before it writes anything.
	{
		const repo = fs.mkdtempSync(path.join(os.tmpdir(), "module-move-"));
		try {
			fs.mkdirSync(path.join(repo, "public", "a", "kid"), { recursive: true });
			fs.mkdirSync(path.join(repo, "public", "b"), { recursive: true });
			fs.writeFileSync(path.join(repo, "public", "a", "kid", "k.js"), "export default 1;\n");
			fs.writeFileSync(path.join(repo, "public", "b", "use.js"), 'import "/a/kid/k.js";\nimport "/a/kid/k.js";\n');
			fs.writeFileSync(path.join(repo, "public", "b", "other.js"), 'import "/a/kid/k.js";\n');
			const manifest = path.join(repo, "m.json");
			new ModuleMove(repo, "public/a/kid", "public/b/kid").apply(manifest);
			t.ok(fs.existsSync(path.join(repo, "public", "b", "kid", "k.js")) && !fs.existsSync(path.join(repo, "public", "a", "kid")), "apply moves a folder that git does not track");
			t.eq(fs.readFileSync(path.join(repo, "public", "b", "use.js"), "utf8"), 'import "/b/kid/k.js";\nimport "/b/kid/k.js";\n', "and rewrites both links on one line");
			fs.writeFileSync(path.join(repo, "public", "b", "other.js"), "// someone edited this since\n");
			let message = ""; try { ModuleMove.undo(repo, manifest); } catch (e){ message = e.message; }
			t.ok(/no longer holds|changed/.test(message), "undo stops when a file changed since the move: " + message);
			t.eq(fs.readFileSync(path.join(repo, "public", "b", "use.js"), "utf8"), 'import "/b/kid/k.js";\nimport "/b/kid/k.js";\n', "and wrote nothing before stopping (use.js is untouched)");
			t.ok(fs.existsSync(path.join(repo, "public", "b", "kid")), "and the folder stayed where it is");
			fs.writeFileSync(path.join(repo, "public", "b", "other.js"), 'import "/b/kid/k.js";\n');
			ModuleMove.undo(repo, manifest);
			t.ok(fs.existsSync(path.join(repo, "public", "a", "kid", "k.js")) && fs.readFileSync(path.join(repo, "public", "b", "use.js"), "utf8") === 'import "/a/kid/k.js";\nimport "/a/kid/k.js";\n', "undo without git moves it back and restores the links");
		} finally { fs.rmSync(repo, { recursive: true, force: true }); }
	}
} finally {
	unwatch();
	ws.close();
	await sleep(100);
	socket_server.wss.close();
	server.close();
	fs.rmSync(DIR, { recursive: true, force: true });
	fs.rmSync(OUTSIDE, { recursive: true, force: true });
	fs.rmSync(MOVES, { recursive: true, force: true });
	if (made_public_data) fs.rmSync(path.join(ROOT, "public", "data"), { recursive: true, force: true });
}
t.done();
process.exit(process.exitCode ?? 0);
