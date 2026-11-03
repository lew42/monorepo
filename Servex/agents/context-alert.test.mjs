// node Servex/agents/context-alert.test.mjs — a child's context crossing 50% and 75% puts one line in its session log, and the parent's follow forwards it.
import assert from "node:assert"; import fs from "node:fs"; import os from "node:os"; import path from "node:path";
process.env.SERVEX_HOME = fs.mkdtempSync(path.join(os.tmpdir(), "servex-alert-"));
const { Agents } = await import("./Agents.js");
const Follow = (await import("../Follow.js")).default;
const dir = "public/framework/ai/sessions/_context-alert-test/c1", log = path.join(dir, "session.jsonl");
fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(log, "{\"assign\":{\"agent\":\"c1\"}}\n");
const events = [];
const mk = over => Object.assign(Object.create(Agents.Agent.prototype), { id: "c1", parent: "p", context: 0, task: { dir }, host: { window_tokens: 1000000 }, emit: e => events.push(e) }, over);
const lines = () => fs.readFileSync(log, "utf8").trim().split("\n").slice(1);
try {
	const a = mk();
	a.context = 499000; a.context_alert(); assert.equal(lines().length, 0, "under 50%: silent");
	a.context = 520000; a.context_alert(); a.context = 530000; a.context_alert(); assert.equal(lines().length, 1, "50% once");
	assert.match(lines()[0], /context 52% \(520,000 of 1,000,000 tokens\): c1/);
	a.context = 760000; a.context_alert(); assert.equal(lines().length, 2, "75% once");
	assert.deepEqual(events.map(e => e.pct), [50, 75]);
	assert.equal(Follow.worth_waking(lines()).length, 2, "the parent's follow forwards both");
	a.context = 100000; a.context_alert(); a.context = 510000; a.context_alert(); assert.equal(lines().length, 3, "a compaction re-arms 50%");
	mk({ parent: null, context: 900000 }).context_alert(); mk({ one_shot: true, context: 900000 }).context_alert();
	assert.equal(lines().length, 3, "no parent / one-shot fork: no line");
	console.log("context-alert: ok");
} finally { fs.rmSync("public/framework/ai/sessions/_context-alert-test", { recursive: true, force: true }); }
