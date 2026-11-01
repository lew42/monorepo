// Tail: every socket keeps its own offset, so a second subscriber never steals a line from the first (the lost update,
// seat e's race.mjs), and a reader already past a frame's start applies only the lines it has not read (the double apply).
// Run from anywhere: `node Server/plugins/SocketServer/Tail.test.mjs`
import fs from "node:fs";
import path from "node:path";
import { register } from "node:module";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
process.chdir(ROOT);   // Tail.js resolves "public" from the cwd
register("../../../Servex/agents/site-hooks.mjs", import.meta.url);
globalThis.location = new URL("http://localhost/");

const { default: Test } = await import("../../../public/framework/core/Test/Test.js");
const { default: Tail } = await import("./Tail.js");
const { default: Socket } = await import("../../../public/framework/dev/Socket/Socket.js");
const { stream } = await import("../../../public/framework/ext/JSONL/live.js");

const t = new Test("Server/SocketServer Tail: one offset per socket; no line lost, none applied twice");
const REL = "framework/core/Item/.tail-test-" + process.pid;
const DIR = path.join(ROOT, "public", REL), FILE = path.join(DIR, "x.jsonl"), URL_PATH = "/" + REL + "/x.jsonl";
const append = line => fs.appendFileSync(FILE, JSON.stringify(line) + "\n");

// A server-side socket that records what Tail sends it.
const socket = () => {
	const handlers = {}, got = [];
	return { got, handlers, on: (name, fn) => { handlers[name] = fn; }, rpc: (method, ...args) => got.push({ method, args }), sub(from = 0){ handlers["rpc:subscribe"]([URL_PATH, from]); } };
};
const lines_of = s => s.got.filter(f => f.method === "jsonl").flatMap(f => f.args[1]).map(l => JSON.parse(l).n);

fs.mkdirSync(DIR, { recursive: true });
try {
	// 1. The lost update. A subscribes; a line is appended; B subscribes from 0 BEFORE the watcher fires; then it fires.
	append({ n: 1 });
	const a = socket(), b = socket();
	Tail.setup(a); Tail.setup(b);
	a.sub(0);
	t.eq(lines_of(a), [1], "A's subscribe reads the file so far");
	append({ n: 2 });
	b.sub(0);
	t.eq(lines_of(b), [1, 2], "B's subscribe from 0 reads both lines");
	Tail.changed(FILE);
	t.eq(lines_of(a), [1, 2], "A still gets line 2 when the watcher fires (one shared offset lost it)");
	t.eq(lines_of(b), [1, 2], "B gets nothing twice");
	append({ n: 3 });
	Tail.changed(FILE);
	t.eq([lines_of(a), lines_of(b)], [[1, 2, 3], [1, 2, 3]], "the next append reaches both, once");
	const frame = a.got.at(-1).args;
	t.eq([typeof frame[3], frame[4]?.length], ["number", 1], "a frame says where it began and where each line ends");

	// 2. The double apply, in one tab: reader 1 is at the end of line 1; reader 2 asks for the file from 0 on the same socket,
	// and that frame (lines 1-3, from 0) reaches both readers. Reader 1 must read only lines 2 and 3.
	const sent = [];
	const browser = Object.create(Socket.prototype);
	browser.disabled = false; browser.requests = [];
	browser.send = frame => sent.push(frame);
	Socket.singleton = () => browser;
	const reader = offset => ({ url: URL_PATH, offset, got: [], parse: text => text.split("\n").map(l => JSON.parse(l)), read(entries){ this.got.push(...entries.map(e => e.n)); }, load: async () => {} });
	const one_end = Buffer.byteLength(JSON.stringify({ n: 1 }) + "\n");
	const r1 = reader(one_end), r2 = reader(0);
	stream(r1, () => {}); stream(r2, () => {});
	const server = socket(); Tail.setup(server); server.sub(0);
	const [path_, lines, offset, from, ends] = server.got.at(-1).args;
	browser.jsonl(path_, lines, offset, from, ends);
	t.eq(r2.got, [1, 2, 3], "the reader that asked from 0 reads every line");
	t.eq(r1.got, [2, 3], "the reader already past line 1 reads only lines 2 and 3, never line 1 again");
	browser.jsonl(path_, lines, offset);   // an older server: no `ends`; nothing new for either reader (both are at the end)
	t.eq([r1.got.length, r2.got.length], [2, 3], "a frame no reader is behind is not read again");
} finally { fs.rmSync(DIR, { recursive: true, force: true }); }

t.done();
process.exit(process.exitCode ?? 0);   // live.js leaves a fallback timer
