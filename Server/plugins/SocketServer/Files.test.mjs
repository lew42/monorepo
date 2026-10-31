// The Files tab's writes over the dev socket: make a page, upload a file, set a file aside. Run from anywhere: `node Server/plugins/SocketServer/Files.test.mjs`
// Real parts: the dev server's own SocketServer with the Files plugin on a real http port, a real ws client, a real folder under public/data/
// (git-ignored), and the real PageFiles watcher, so "it appears in files.jsonl" is checked on the file the site reads. Faked: nothing.
//   1. page_add makes <name>/page.jsonl and the parent's files.jsonl lists it once; a bad or taken name is refused
//   2. an upload sent in three parts lands byte-identical, lists in files.jsonl, and leaves no half-written file
//   3. a name clash keeps both: photo.png, photo (2).png, photo (3).png, each with its own bytes
//   4. set_aside moves a file (and a child page) into _removed/, nothing is deleted, and files.jsonl says it is gone
//   5. a path that escapes the folder is refused, for every message, and nothing is written outside   (edge cases below it are optional)
//   6. Windows: the page's own files are protected whatever the capitals, and device names (CON, nul.txt, COM1...) cannot be file names
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
const { default: watch } = await import("../../watch.js");
const { WebSocket } = await import("ws");

const t = new Test("Files plugin: page_add, upload and set_aside over the socket");
const NAME = "files-test-" + process.pid, URL = `/data/${NAME}/`, DIR = path.join(ROOT, "public", "data", NAME);
const made_public_data = !fs.existsSync(path.join(ROOT, "public", "data"));
fs.mkdirSync(DIR, { recursive: true });
fs.writeFileSync(path.join(DIR, "page.js"), "export default {};\n");   // a page.js page keeps its list in files.jsonl, written by PageFiles
const OUTSIDE = fs.mkdtempSync(path.join(ROOT, "public", "data", "outside-"));   // beside the page, never touched by it
const FAR = fs.mkdtempSync(path.join(os.tmpdir(), "files-test-far-"));   // outside public/ altogether, for the symlink case

// The dev server's watcher that keeps files.jsonl (the boot walk is left out: it would touch real logs).
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
const rpc = (method, ...args) => new Promise(res => { const index = next++; waiting.set(index, res); ws.send(JSON.stringify({ method, args, index })); });

const sleep = ms => new Promise(r => setTimeout(r, ms));
async function until(fn, what, ms = 6000){
	const end = Date.now() + ms;
	while (Date.now() < end){ if (await fn()) return true; await sleep(25); }
	console.log("  (timed out waiting for: " + what + ")");
	return false;
}
const list_lines = () => fs.existsSync(path.join(DIR, "files.jsonl")) ? fs.readFileSync(path.join(DIR, "files.jsonl"), "utf8").split("\n").filter(Boolean).map(l => JSON.parse(l)) : [];
const listed = file => list_lines().filter(l => l.file === file && !l.gone).length;
const gone = file => list_lines().some(l => l.file === file && l.gone);
// This sandbox shares its inotify budget with other dev servers, so the watcher sometimes misses an event (ENOSPC). Wait for the real watcher;
// if it never reports, ask PageFiles to catch the folder up, which is the same code the watcher calls.
async function listed_soon(check, what){
	if (await until(check, what, 2000)) return true;
	console.log("  (watcher silent for: " + what + "; asking PageFiles to catch up)");
	page_files.settle(DIR);
	return check();
}

// Send a buffer the way the browser does: base64 parts of at most `size` bytes.
async function upload(dir_url, name, buffer, size = 40000){
	const parts = Math.max(1, Math.ceil(buffer.length / size));
	let last;
	for (let part = 0; part < parts; part++){
		last = await rpc("upload", dir_url, name, buffer.subarray(part * size, (part + 1) * size).toString("base64"), { part, of: parts });
		if (!last.ok) return last;
	}
	return last;
}
// Every file under a folder, with its bytes' hash: "nothing was deleted" is a comparison of two of these.
function snapshot(dir){
	const out = {};
	(function walk(d){
		for (const e of fs.readdirSync(d, { withFileTypes: true })){
			const full = path.join(d, e.name);
			if (e.name === "files.jsonl" || (e.name === "page.jsonl" && d === dir)) continue;   // the lists grow by design; what must survive is everything else
			e.isDirectory() ? walk(full) : out[path.relative(dir, full)] = crypto.createHash("sha1").update(fs.readFileSync(full)).digest("hex");
		}
	})(dir);
	return out;
}

try {
	// 1. A new page
	{
		const r = await rpc("page_add", URL, "kid", "Kid page");
		t.ok(r.ok, "page_add answers ok: " + JSON.stringify(r));
		t.ok(fs.existsSync(path.join(DIR, "kid", "page.jsonl")), "kid/page.jsonl was made");
		t.eq(JSON.parse(fs.readFileSync(path.join(DIR, "kid", "page.jsonl"), "utf8").split("\n")[0]).title, "Kid page", "line 1 of the new page holds its title");
		t.ok(await listed_soon(() => listed("kid/page.jsonl") > 0, "files.jsonl lists kid"), "the parent's files.jsonl lists the new page");
		await sleep(400);
		if (listed("kid/page.jsonl") !== 1) console.log("  files.jsonl:", JSON.stringify(list_lines()), "page.jsonl:", fs.readFileSync(path.join(DIR, "page.jsonl"), "utf8"));
		t.eq(listed("kid/page.jsonl"), 1, "and lists it exactly once");

		const taken = await rpc("page_add", URL, "kid", "Again");
		t.ok(taken.ok === false && /already exists/.test(taken.reason), "a name that is taken is refused with a sentence: " + taken.reason);
		const bad = await rpc("page_add", URL, "Bad Name", "x");
		t.ok(bad.ok === false && /a-z0-9-/.test(bad.reason), "a name with capitals and a space is refused: " + bad.reason);
		t.ok(!fs.existsSync(path.join(DIR, "Bad Name")), "and no folder was made for it");
	}

	// 2. An upload arrives byte for byte
	const png = crypto.randomBytes(100_000);   // three parts of 40,000
	{
		const r = await upload(URL, "photo.png", png);
		t.ok(r.ok && r.name === "photo.png", "the last part answers ok with the saved name: " + JSON.stringify(r));
		t.ok(Buffer.compare(fs.readFileSync(path.join(DIR, "photo.png")), png) === 0, "the file on disk is byte-identical to what was sent");
		t.ok(await listed_soon(() => listed("photo.png") > 0, "files.jsonl lists photo.png"), "files.jsonl lists the upload");
		t.ok(!fs.readdirSync(DIR).some(n => n.endsWith(".part")), "no half-written .part file is left");
		const empty = await upload(URL, "empty.txt", Buffer.alloc(0));
		t.ok(empty.ok && fs.statSync(path.join(DIR, "empty.txt")).size === 0, "an empty file uploads too");
	}

	// 3. A name clash keeps both
	{
		const second = crypto.randomBytes(5000), third = crypto.randomBytes(7000);
		const r2 = await upload(URL, "photo.png", second), r3 = await upload(URL, "photo.png", third);
		t.eq([r2.name, r3.name], ["photo (2).png", "photo (3).png"], "the clashing names become photo (2).png and photo (3).png");
		t.ok(Buffer.compare(fs.readFileSync(path.join(DIR, "photo.png")), png) === 0, "the first photo.png still has its own bytes");
		t.ok(Buffer.compare(fs.readFileSync(path.join(DIR, "photo (2).png")), second) === 0 && Buffer.compare(fs.readFileSync(path.join(DIR, "photo (3).png")), third) === 0, "each copy has the bytes it was sent");
		t.ok(r2.kept_both === true, "the answer says both were kept");
	}

	// 4. Set aside: moved, never deleted
	{
		await listed_soon(() => listed("photo (2).png") > 0, "files.jsonl lists photo (2).png before it goes");
		const before = snapshot(DIR);
		const r = await rpc("set_aside", URL, "photo (2).png");
		t.ok(r.ok, "set_aside answers ok: " + JSON.stringify(r));
		t.ok(!fs.existsSync(path.join(DIR, "photo (2).png")), "the file is no longer in the folder");
		const moved = fs.readdirSync(path.join(DIR, "_removed")).filter(n => n.startsWith("photo (2).png-"));
		t.eq(moved.length, 1, "one entry for it in _removed/");
		t.ok(moved.length && fs.existsSync(path.join(DIR, "_removed", moved[0], "photo (2).png")), "and its file is inside, under its own name");
		t.ok(await listed_soon(() => gone("photo (2).png"), "files.jsonl says photo (2).png is gone"), "files.jsonl records that it went");

		const kid = await rpc("set_aside", URL, "kid");
		t.ok(kid.ok, "a child page can be set aside: " + JSON.stringify(kid));
		t.ok(!fs.existsSync(path.join(DIR, "kid")) && fs.readdirSync(path.join(DIR, "_removed")).some(n => n.startsWith("kid-")), "the page folder is in _removed/ now");

		const after = snapshot(DIR);
		const hashes_after = Object.values(after);
		t.ok(Object.values(before).every(h => hashes_after.includes(h)), "every byte that was there before is still there (moved, not deleted)");
		t.ok(!(await rpc("set_aside", URL, "no-such-file")).ok, "setting aside something that is not there is refused");
	}

	// 5. Nothing escapes the folder
	{
		const outside_url = "/data/" + path.basename(OUTSIDE) + "/";
		const bytes = Buffer.from("x").toString("base64"), one = { part: 0, of: 1 };
		const attempts = [
			["upload, folder outside public/", () => rpc("upload", "/../", "evil.txt", bytes, one)],
			["upload, folder climbing out", () => rpc("upload", URL + "../" + path.basename(OUTSIDE) + "/", "evil.txt", bytes, one)],
			["upload, name with a slash", () => rpc("upload", URL, "../evil.txt", bytes, one)],
			["upload, name with a backslash", () => rpc("upload", URL, "..\\evil.txt", bytes, one)],
			["upload, a dot name", () => rpc("upload", URL, ".hidden", bytes, one)],
			["page_add, folder climbing out", () => rpc("page_add", URL + "../" + path.basename(OUTSIDE) + "/", "evil", "x")],
			["page_add, a name with a slash", () => rpc("page_add", URL, "../evil", "x")],
			["set_aside, a name with ..", () => rpc("set_aside", URL, "../" + path.basename(OUTSIDE))],
			["set_aside, the folder itself", () => rpc("set_aside", URL, "..")],
			["set_aside, the page's own log", () => rpc("set_aside", URL, "page.js")],
			["set_aside, a folder outside", () => rpc("set_aside", outside_url + "../", "x")],
		];
		for (const [what, go] of attempts){
			const r = await go();
			t.ok(r && r.ok === false && typeof r.reason === "string", `refused: ${what} (${r?.reason})`);
		}
		t.eq(fs.readdirSync(OUTSIDE), [], "nothing was written into the folder next door");
		t.ok(!fs.existsSync(path.join(ROOT, "public", "data", "evil.txt")) && !fs.existsSync(path.join(ROOT, "public", "evil.txt")), "nothing was written beside the page either");
		t.ok(fs.existsSync(path.join(DIR, "page.js")), "page.js is still where it was");
	}

	// 6. Windows and the page's own files (review finding "smaller findings": NTFS ignores capitals and has device names)
	{
		for (const name of ["Page.jsonl", "PAGE.JS", "Files.JSONL", "_REMOVED"]){
			const r = await rpc("set_aside", URL, name);
			t.ok(r.ok === false && /part of the page/.test(r.reason), `set_aside ${name} is refused as the page's own file, in any capitals (${r.reason})`);
		}
		const bytes = Buffer.from("x").toString("base64"), one = { part: 0, of: 1 };
		for (const name of ["CON", "nul.txt", "COM1.log", "lpt9", "Aux.tar.gz", "prn."]){
			for (const [verb, go] of [["upload", () => rpc("upload", URL, name, bytes, one)], ["set_aside", () => rpc("set_aside", URL, name)]]){
				const r = await go();
				t.ok(r.ok === false && /Windows|reserved/i.test(r.reason), `${verb} ${name} is refused as a Windows device name (${r.reason})`);
			}
		}
		for (const name of ["console.txt", "comet", "aux2.txt", "com10.txt", "nullable"]){
			const r = await rpc("upload", URL, name, bytes, one);
			t.ok(r.ok === true, `${name} is an ordinary name and uploads (${r.reason ?? "ok"})`);
		}
		t.ok(!fs.existsSync(path.join(DIR, "CON")) && !fs.existsSync(path.join(DIR, "nul.txt")), "and no device-named file was made");
	}

	// Optional edge cases
	{
		const old_max = Files.MAX_BYTES;
		Files.MAX_BYTES = 50_000;
		const big = await upload(URL, "big.bin", crypto.randomBytes(120_000));
		Files.MAX_BYTES = old_max;
		t.ok(big.ok === false && /too big|limit/.test(big.reason), "a file over the cap is refused with the limit in the sentence: " + big.reason);
		t.ok(!fs.existsSync(path.join(DIR, "big.bin")) && !fs.readdirSync(DIR).some(n => n.endsWith(".part")), "and leaves neither a file nor a .part behind");

		const a = await rpc("upload", URL, "late.txt", Buffer.from("a").toString("base64"), { part: 0, of: 2 });
		const skipped = await rpc("upload", URL, "late.txt", Buffer.from("c").toString("base64"), { part: 2, of: 3 });
		t.ok(a.ok && skipped.ok === false && /order|part/.test(skipped.reason), "a part sent out of order is refused: " + skipped.reason);
		t.ok(!fs.existsSync(path.join(DIR, "late.txt")), "and no file is made from a broken upload");

		// A disk that cannot make hard links (FAT, exFAT, some network drives): the upload is still saved, and still never overwrites.
		// Faked: fs.linkSync throws what such a disk throws (the sandbox's disk can link).
		{
			const real = fs.linkSync;
			fs.linkSync = () => { const e = new Error("operation not permitted"); e.code = "EPERM"; throw e; };
			try {
				const first = await rpc("upload", URL, "nolinks.txt", Buffer.from("one").toString("base64"), { part: 0, of: 1 });
				const second = await rpc("upload", URL, "nolinks.txt", Buffer.from("two").toString("base64"), { part: 0, of: 1 });
				t.ok(first.ok && second.ok && [first.name, second.name].join() === "nolinks.txt,nolinks (2).txt", "without hard links both uploads are saved under their own names: " + JSON.stringify([first, second]));
				t.ok(fs.existsSync(path.join(DIR, "nolinks.txt")) && fs.readFileSync(path.join(DIR, "nolinks.txt"), "utf8") === "one", "and the first file kept its bytes");
				t.ok(!fs.readdirSync(DIR).some(n => n.endsWith(".part")), "and no .part file is left");
			} finally { fs.linkSync = real; }
		}

		const link = path.join(DIR, "sneaky");
		try {
			fs.symlinkSync(FAR, link, "dir");
			const r = await rpc("upload", URL + "sneaky/", "evil.txt", Buffer.from("x").toString("base64"), { part: 0, of: 1 });
			t.ok(r.ok === false && fs.readdirSync(FAR).length === 0, "a symlink that leads outside is not followed: " + r.reason);
		} catch (e){ if (e.code !== "EPERM") throw e; }   // a platform that will not make symlinks has nothing to test
	}
} finally {
	unwatch();
	ws.close();
	await sleep(100);
	socket_server.wss.close();
	server.close();
	fs.rmSync(DIR, { recursive: true, force: true });
	fs.rmSync(OUTSIDE, { recursive: true, force: true });
	fs.rmSync(FAR, { recursive: true, force: true });
	if (made_public_data) fs.rmSync(path.join(ROOT, "public", "data"), { recursive: true, force: true });
}
t.done();
process.exit(process.exitCode ?? 0);
