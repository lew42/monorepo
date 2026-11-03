// Append.test.mjs — exercises the rpc:append handler directly (no real socket, no real server).
// usage (from the REPO ROOT — Append.js resolves "public" against process.cwd()):
//   node Server/plugins/SocketServer/Append.test.mjs        (exit 0 = all pass)
//
// Covers the 2026-10-02 change: every line is run through jsonl-schema.mjs's check() before
// anything is written. A good batch, a batch with one bad line (refuses the WHOLE batch, writes
// nothing), and a file with no schema (only has to be a JSON object).
//
// ⚠ The scratch files below live UNDER public/, which the live site watches — any write there
// fires a reload. The whole body runs inside try/finally so the scratch dir is always removed,
// even if an assertion-adjacent call throws, instead of leaving a stray folder behind on a crash
// (a review finding, 2026-10-02).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Append from "./Append.js";

let failed = 0, passed = 0;
const ok = (cond, what) => { cond ? passed++ : failed++; console.log(`${cond ? "pass" : "FAIL"}  ${what}`); };

const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(here, "..", "..", "..");
if (path.resolve(process.cwd()) !== ROOT) {
	console.error(`Append.test.mjs must run from the repo root (${ROOT}), not ${process.cwd()} — Append.js resolves "public" against the cwd.`);
	process.exit(1);
}

// A scratch dir UNDER public/ — Append.js's resolve() refuses anything outside it.
const testDir = path.join(ROOT, "public", "framework", "ai", "_append-test-tmp");
const rel = name => path.join("framework", "ai", "_append-test-tmp", name).split(path.sep).join("/");
const full = name => path.join(testDir, name);

const calls = [];
const fakeSocket = { on(){}, send: msg => calls.push(msg) };
const appender = new Append(fakeSocket);
const call = (file, lines) => { calls.length = 0; appender.append(file, lines, calls.length); return calls[0]; };

try {
	fs.mkdirSync(testDir, { recursive: true });

	// Both of these are named "task.jsonl" (the schema is keyed by BASENAME, so the name must
	// match exactly) but live in their own subdirs so the two cases don't collide.
	console.log("— a good batch against task.jsonl's schema —");
	{
		const file = rel("good/task.jsonl"); // never existed before this call
		const res = call(file, [{ assign: { step: 1 } }, { log: { at: "t", msg: "ok" } }]);
		ok(res.response === "append successful", "a good batch is written: " + JSON.stringify(res));
		const lines = fs.readFileSync(full("good/task.jsonl"), "utf8").trim().split("\n");
		ok(lines.length === 2 && lines.every(l => JSON.parse(l)), "both lines landed, both parse");
	}

	console.log("— one bad line refuses the whole batch —");
	{
		const file = rel("bad/task.jsonl"); // never existed before this call
		const res = call(file, [{ log: { at: "t", msg: "ok" } }, { bogus: {} }]);
		ok(res.response.startsWith("append refused:") && /flat line/.test(res.response), "the bad line's reason comes back: " + res.response);
		ok(!fs.existsSync(full("bad/task.jsonl")), "nothing partial was written — the file was never created");
	}

	console.log("— a file with no schema only has to be a JSON object —");
	{
		const file = rel("usage.jsonl"); // not in jsonl-schema.mjs's schemas
		const res = call(file, [{ whatever: 1, anything: "goes" }]);
		ok(res.response === "append successful", "an unknown-schema file accepts any plain object: " + JSON.stringify(res));
		ok(fs.readFileSync(full("usage.jsonl"), "utf8").trim() === '{"whatever":1,"anything":"goes"}', "the line landed as given");

		calls.length = 0;
		appender.append(file, ["not valid json at all"], 0);
		ok(/append refused/.test(calls[0].response), "a string line that isn't even valid JSON is refused, schema or not: " + calls[0].response);
		appender.append(file, ['{"already":"serialized"}'], 0);
		ok(/append refused/.test(calls.at(-1).response), "a string line, even serialized JSON, is refused: ONE shape is an array of objects (Append.js, 2026-10-02)");
	}

	// The outbox numbers every batch ({client, n}). Numbering alone must NOT skip the per-file schema: FsFile.append callers write
	// agent-style lines to schema'd files. Only a batch the Item system says is its own (`item: true`, Store.deliver) skips it,
	// because an Item's deltas ({"set":…}, {"tasks":{"add":…}}) are not agent verbs (review finding 5). (page.jsonl is open anyway.)
	console.log("— a numbered batch is still checked, unless it comes from an Item.Store —");
	{
		const numbered = (file, lines, meta) => { calls.length = 0; appender.append(file, lines, 0, meta); return calls[0]; };
		const board = rel("num/board.jsonl");
		const res = numbered(board, [{ nonsense: true }], { client: "t.a", n: 1 });
		ok(/^append refused: a flat line/.test(res.response), "FsFile.append's numbered batch to board.jsonl: the schema check runs: " + res.response);
		ok(!fs.existsSync(full("num/board.jsonl")), "and nothing was written");

		const task = rel("num/task.jsonl");
		const mine = numbered(task, [{ set: { a: 1 } }, { tasks: { add: { id: "k" } } }], { client: "t.a", n: 2, item: true });
		ok(mine.response === "append successful", "an Item.Store batch (item: true) with item deltas is written: " + mine.response);
		ok(fs.readFileSync(full("num/task.jsonl"), "utf8").trim().split("\n").length === 2, "both item lines landed");

	}
} finally {
	fs.rmSync(testDir, { recursive: true, force: true });
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
