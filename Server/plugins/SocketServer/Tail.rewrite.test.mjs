// Tail: a reader whose cursor points into a REWRITTEN log is told to reset, never sent a torn fragment or lines
// it already has (research/.../lessons/sync-protocol.md, R4). Four ways a log changes under a reader:
//   A. shorter — the file is simply cut back below the reader's offset
//   B. same size — an early line's text changes in place (Runtime.safe_write fixing a url), nothing appended
//   C. longer (compaction) — clear() truncates to empty, then a bigger edit lands before the watcher fires
//   D. longer (migration) — Server/page-files-migrate.mjs's own shape: another folder's lines prepended
//   + a rename-over (fs.renameSync replacing the file, what Runtime.safe_write itself does under the hood)
// Run from anywhere: `node Server/plugins/SocketServer/Tail.rewrite.test.mjs`
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
const { default: Runtime } = await import("./Runtime.js");

const t = new Test("Server/SocketServer Tail: a rewritten log resets its reader, never a torn or repeated line");
const REL = "framework/core/Item/.tail-rewrite-test-" + process.pid;
const DIR = path.join(ROOT, "public", REL);

// A server-side socket that records what Tail sends it, same shape as Tail.test.mjs.
const make_socket = url_path => {
	const handlers = {}, got = [];
	return { got, handlers, on: (name, fn) => { handlers[name] = fn; }, rpc: (method, ...args) => got.push({ method, args }), sub(from = 0){ handlers["rpc:subscribe"]([url_path, from]); } };
};
const resets = s => s.got.filter(f => f.method === "jsonl_reset").length;
const frames = s => s.got.filter(f => f.method === "jsonl").length;
const last_lines = s => { const f = s.got.filter(f => f.method === "jsonl").at(-1); return f ? f.args[1].map(l => JSON.parse(l)) : null; };

fs.mkdirSync(DIR, { recursive: true });
try {
	// A. shorter: the reader's cursor ends up past the end of the (now cut back) file.
	{
		const FILE = path.join(DIR, "a.jsonl"), URL_PATH = "/" + REL + "/a.jsonl";
		fs.writeFileSync(FILE, `{"n":1}\n{"n":2}\n{"n":3}\n`);
		const s = make_socket(URL_PATH); Tail.setup(s); s.sub(0);
		t.eq(resets(s), 0, "A: the first subscribe just reads the 3 lines");

		fs.writeFileSync(FILE, `{"n":1}\n`);   // cut back below the reader's offset
		Tail.changed(FILE);
		t.eq(resets(s), 1, "A (shorter): the reader is reset, not left pointing past the end of the file");
	}

	// B. same size: an early (already-read) line's text changes in place — the gap check alone cannot see this
	// (every line boundary after it is untouched), so this is the one case only the byte-window proof catches.
	{
		const FILE = path.join(DIR, "b.jsonl"), URL_PATH = "/" + REL + "/b.jsonl";
		fs.writeFileSync(FILE, `{"url":"/old/path"}\n{"n":2}\n`);
		const s = make_socket(URL_PATH); Tail.setup(s); s.sub(0);
		t.eq(last_lines(s).length, 2, "B: the first subscribe reads both lines");

		// Runtime.safe_write's own shape: a tmp file, then a rename over the original — "/old/path" -> "/new/path"
		// is the same length, so the file's total size, and every line boundary, is unchanged.
		Runtime.safe_write(FILE, `{"url":"/new/path"}\n{"n":2}\n{"n":3}\n`);
		Tail.changed(FILE);
		t.eq(resets(s), 1, "B (same size, rename-over): a same-length rewrite of an already-read line is still caught");
		s.sub(0);
		t.eq(last_lines(s), [{ url: "/new/path" }, { n: 2 }, { n: 3 }], "B: the resubscribe reads the corrected lines once each, nothing twice");
	}

	// C. longer, compaction racing an edit (R4 case A): clear() truncates to empty, then a bigger line lands
	// before the watcher runs — never a torn fragment of whatever was read in between.
	{
		const FILE = path.join(DIR, "c.jsonl"), URL_PATH = "/" + REL + "/c.jsonl";
		fs.writeFileSync(FILE, `{"n":1}\n{"n":2}\n{"n":3}\n`);
		const s = make_socket(URL_PATH); Tail.setup(s); s.sub(0);

		const before = frames(s);
		fs.writeFileSync(FILE, "");
		fs.appendFileSync(FILE, `{"n":99,"longer":"a line nothing like what used to be at this same byte range"}\n`);
		Tail.changed(FILE);
		t.eq(resets(s), 1, "C (longer, compaction): the reader is reset, never handed a torn fragment");
		t.eq(frames(s), before, "C: the reset carries no lines of its own (no new jsonl frame until the resubscribe)");
		s.sub(0);
		t.eq(last_lines(s), [{ n: 99, longer: "a line nothing like what used to be at this same byte range" }], "C: the resubscribe reads exactly the new content, once");
	}

	// D. longer, a migration merges another folder's lines in front (R4 case B, page-files-migrate.mjs's own
	// shape: "old lines + newer" — here, the OTHER folder's line is the one that lands in front).
	{
		const FILE = path.join(DIR, "d.jsonl"), URL_PATH = "/" + REL + "/d.jsonl";
		fs.writeFileSync(FILE, `{"o":1}\n`);
		const s = make_socket(URL_PATH); Tail.setup(s); s.sub(0);
		const already_read = fs.readFileSync(FILE, "utf8");

		fs.writeFileSync(FILE, `{"moved":"from another folder"}\n` + already_read + `{"o":2}\n{"o":3}\n`);
		Tail.changed(FILE);
		t.eq(resets(s), 1, "D (longer, migration): a folder merge that inserts lines in FRONT resets the reader, not a torn fragment of what moved in front of it");
		s.sub(0);
		t.eq(last_lines(s), [{ moved: "from another folder" }, { o: 1 }, { o: 2 }, { o: 3 }], "D: the resubscribe reads every line once, in file order");
	}
} finally { fs.rmSync(DIR, { recursive: true, force: true }); }

t.done();
process.exit(process.exitCode ?? 0);
