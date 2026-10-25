/* node Servex/agents/honest-completion.test.mjs — complete without evidence is refused (nothing written); with evidence it lands and
 * its caveats reach the parent's log (core/Task/doc/resolution.md, section 6). */
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { run_item } from "./page_tools.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const REL = "public/framework/ai/sessions/2026/10/16/.honest-test-" + process.pid;
const SESSION = path.join(ROOT, REL), TASK = path.join(SESSION, "child"), PARENT_LOG = path.join(SESSION, "session.jsonl"), FILE = path.join(TASK, "task.jsonl");
const URL = "/" + REL.slice("public/".length) + "/child/";
// A write answers {ok, ids, line, now}; the picture after it is a separate read (session-is-a-task item 12).
const call = async delta => { const r = await run_item({ path: URL, delta }, { caller: "t1" }); return r.ok && r.line ? { ...r, state: (await run_item({ path: URL }, { caller: "t1" })).state } : r; };
const lines = f => fs.readFileSync(f, "utf8").trim().split("\n").map(l => JSON.parse(l));

fs.mkdirSync(TASK, { recursive: true });
fs.writeFileSync(PARENT_LOG, JSON.stringify({ session: { id: "p1", kind: "test" } }) + "\n");
fs.writeFileSync(FILE, JSON.stringify({ assign: { slug: "child", title: "Child" } }) + "\n");
try {
	await call({ start: {} });
	const before = fs.readFileSync(FILE, "utf8");
	for (const bad of [{ complete: {} }, { complete: "done" }, { complete: { outcome: "x", evidence: [] } }]){
		const r = await call(bad);
		assert.equal(r.ok, false, "no evidence is refused");
		assert.match(r.why, /needs evidence/, "and says what to pass");
	}
	assert.equal(fs.readFileSync(FILE, "utf8"), before, "a refused complete writes no line");
	const r = await call({ complete: { outcome: "built", evidence: ["abc1234"], confidence: "medium", caveats: ["the mobile layout is untested"] } });
	assert.equal(r.ok, true);
	assert.equal(r.state.state, "complete", "with evidence it lands");
	const note = lines(PARENT_LOG).find(l => l.note);
	assert.ok(note && /mobile layout is untested/.test(note.note.msg) && /child/.test(note.note.msg), "the caveat reached the parent log");
	console.log("honest-completion.test.mjs: all checks passed");
} finally { fs.rmSync(SESSION, { recursive: true, force: true }); }
process.exit(0);
