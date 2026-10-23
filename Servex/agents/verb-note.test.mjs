/* node Servex/agents/verb-note.test.mjs — {"approve":"note"} through the item tool is written as {note} and takes effect (core/Task/doc/templates.md). */
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { run_item } from "./page_tools.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const REL = "public/framework/ai/sessions/2026/10/16/.verb-note-test-" + process.pid;
const DIR = path.join(ROOT, REL), FILE = path.join(DIR, "task.jsonl"), URL = "/" + REL.slice("public/".length) + "/";
const call = delta => run_item({ path: URL, delta }, { caller: "t1" });

fs.mkdirSync(DIR, { recursive: true });
fs.writeFileSync(FILE, JSON.stringify({ assign: { slug: "fixture", title: "Fixture" } }) + "\n");
try {
	await call({ wait: { on: "mastermind", what: "plan review" } });
	const r = await call({ approve: "looks good" });
	const last = fs.readFileSync(FILE, "utf8").trim().split("\n").map(l => JSON.parse(l)).filter(l => l.approve).at(-1);
	assert.equal(last.approve.note, "looks good", "a string approve is written as {note}");
	assert.equal(r.state.state, "idle", "and it takes effect: waiting -> accepted (idle); start is the agent's own call");
	console.log("verb-note.test.mjs: all checks passed");
} finally { fs.rmSync(DIR, { recursive: true, force: true }); }
process.exit(0);
