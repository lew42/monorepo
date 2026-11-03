/* node Servex/agents/verb-note.test.mjs — {"approve":"note"} through the item tool is written as given and takes effect (Task.replay_line passes the string to the verb) (core/Task/doc/templates.md). */
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { run_item } from "./page_tools.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const REL = "public/framework/ai/sessions/2026/10/16/.verb-note-test-" + process.pid;
const DIR = path.join(ROOT, REL), FILE = path.join(DIR, "task.jsonl"), URL = "/" + REL.slice("public/".length) + "/";
// A write answers {ok, ids, line, now}; the picture after it is a separate read (session-is-a-task item 12).
const call = async delta => { const r = await run_item({ path: URL, delta }, { caller: "t1" }); return r.ok && r.line ? { ...r, state: (await run_item({ path: URL }, { caller: "t1" })).state } : r; };

fs.mkdirSync(DIR, { recursive: true });
fs.writeFileSync(FILE, JSON.stringify({ assign: { slug: "fixture", title: "Fixture" } }) + "\n");
try {
	await call({ wait: { on: "mastermind", what: "plan review" } });
	const r = await call({ approve: "looks good" });
	const last = fs.readFileSync(FILE, "utf8").trim().split("\n").map(l => JSON.parse(l)).filter(l => l.approve).at(-1);
	assert.equal(last.approve, "looks good", "a string approve is written as given: Task's verb takes the note itself, the tool no longer rewrites it");
	assert.equal(r.state.data.verdict?.note, "looks good", "and the note reaches the verdict");
	assert.equal(r.state.state, "idle", "and it takes effect: waiting -> accepted (idle); start is the agent's own call");
	console.log("verb-note.test.mjs: all checks passed");
} finally { fs.rmSync(DIR, { recursive: true, force: true }); }
process.exit(0);
