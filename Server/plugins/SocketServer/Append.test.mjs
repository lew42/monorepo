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
		ok(calls.at(-1).response === "append successful", "a string line that IS already-serialized JSON is still accepted");
	}
} finally {
	fs.rmSync(testDir, { recursive: true, force: true });
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
