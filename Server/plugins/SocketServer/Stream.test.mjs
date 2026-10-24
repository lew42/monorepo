// The live-log trip, end to end in node, no browser: a line appended to a page.jsonl reaches a subscribed socket (Tail.js)
// and changes the page (the browser half, ext/JSONL/live.js:35 `Socket.prototype.jsonl` -> Reader.read -> Page.set).
// Run from the repo root: `node Server/plugins/SocketServer/Stream.test.mjs`
import fs from "node:fs";
import path from "node:path";
import { register } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
process.chdir(ROOT);   // Tail.js resolves "public" from the cwd
// Site-absolute imports ("/framework/…", what the browser files use) map to public/ — a loader hook of our own, so this test needs nothing from Servex/.
const PUBLIC_URL = pathToFileURL(path.join(ROOT, "public") + path.sep).href;
register("data:text/javascript," + encodeURIComponent(`export async function resolve(spec, ctx, next){ return next(spec.startsWith("/framework/") ? ${JSON.stringify(PUBLIC_URL)} + spec.slice(1) : spec, ctx); }`));

// What a browser tab would have: a localhost location (Store.open streams only there).
globalThis.location = new URL("http://localhost/");
globalThis.Element ??= class Element {};   // View.js reads Element.prototype at load (node: until worktree/qf-5 merges its guard)

const { default: Test } = await import("../../../public/framework/core/Test/Test.js");
const { default: Tail } = await import("./Tail.js");
const { default: Page } = await import("../../../public/framework/core/Page/Page.class.js");
const { default: Socket } = await import("../../../public/framework/dev/Socket/Socket.js");
await import("../../../public/framework/ext/JSONL/live.js");   // installs Socket.prototype.jsonl / jsonl_reset

const t = new Test("Server/SocketServer Tail -> browser tail -> Page");
const REL = "framework/core/Page/.stream-test-" + process.pid;
const DIR = path.join(ROOT, "public", REL), FILE = path.join(DIR, "page.jsonl");
const append = line => fs.appendFileSync(FILE, JSON.stringify(line) + "\n");

// One fake socket plays both ends: Tail calls socket.rpc(method, ...args) as the server; we hand each call to
// the real Socket.prototype.message the way the wire would (JSON in, `this[method](...args)`), as the browser.
const handlers = {};
const server_side = {
	on: (name, fn) => { handlers[name] = fn; },
	rpc: (method, ...args) => browser_side.message({ data: JSON.stringify({ method, args }) }),
};
const browser_side = Object.create(Socket.prototype);
browser_side.disabled = false;
browser_side.requests = [];
browser_side.send = ({ method, args }) => handlers["rpc:" + method]?.(args);
Socket.singleton = () => browser_side;

fs.mkdirSync(DIR, { recursive: true });
append({ title: "Streamed" });
append({ content: { add: { id: "one", type: "part-text", text: "first" } } });

try {
	Tail.setup(server_side);
	const t0 = performance.now();

	const page = await Page.jsonl("/" + REL + "/");
	t.ok(page instanceof Page, "a Page was built"); t.eq(page.title, "Streamed", "the page was built from line 1 of the file");
	t.eq([...page.content].map(x => x.id), ["one"], "the first subscribe replayed the lines already in the file");

	append({ content: { add: { id: "two", type: "part-text", text: "second" } } });
	Tail.changed(FILE);   // the dev server's file watcher makes this call on a real append
	t.eq([...page.content].map(x => x.id), ["one", "two"], "an appended line changed the page's content");

	append({ title: "Renamed" });
	Tail.changed(FILE);
	t.eq(page.title, "Renamed", "a second appended line changed the title");

	const ms = Math.round(performance.now() - t0);
	console.log(`stream trip: subscribe + 2 live lines in ${ms} ms`);
	t.ok(ms < 5000, "the whole trip took under 5 seconds");
	page.store?.close?.();
} finally { fs.rmSync(DIR, { recursive: true, force: true }); }

t.done();
process.exit(process.exitCode ?? 0);   // live.js leaves a fallback timer
