/* node Servex/Heartbeat-landed.test.mjs — the heartbeat never wakes a landed agent (2026-10-17, doc/task-loop.md "The heartbeat").
 * No real agent, no real Servex: a fake servex records agents.send, and a bare Agent instance stands in for the spend check. */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const home = fs.mkdtempSync(path.join(os.tmpdir(), "heartbeat-landed-test-"));
process.env.SERVEX_HOME = home;
process.env.SERVEX_NO_BUDGET = "1";
const { default: Landed } = await import("./Landed.js");
const { default: Heartbeat, CHECK } = await import("./Heartbeat.js");
const { Agents, task_landed } = await import("./agents/Agents.js");

const now = new Date().toISOString();
const plant = (name, ...lines) => {
	const dir = path.join(home, name); fs.mkdirSync(dir, { recursive: true });
	fs.writeFileSync(path.join(dir, "task.jsonl"), lines.map(l => JSON.stringify(l)).join("\n") + "\n");
	return dir;
};
const launch = name => ({ assign: { session_id: "s-" + name, agent: "helper-" + name, requested_at: now, now: "starting" } });

/* 1. the rule: one answer, from Task.replay */
const cases = {
	finish: plant("finish", launch("finish"), { finish: { at: now, merged: "abc123", files: 4, checks: 12 } }),
	complete: plant("complete", launch("complete"), { complete: { at: now } }),
	landed_only: plant("landed-only", launch("landed-only"), { assign: { landed_at: now } }),
	closed: plant("closed", launch("closed"), { assign: { closed_by: "owner" } }),
	stopped: plant("stopped", launch("stopped"), { stop: { at: now, why: "enough" } }),
};
for (const [k, dir] of Object.entries(cases)) assert.equal(task_landed(dir), true, `${k} is landed`);
const open = plant("open", launch("open"), { log: { at: now, msg: "working" } });
const unmerged = plant("unmerged", launch("unmerged"), { complete: { at: now } });   // log says complete, branch not on michael/dev
const verdict = Landed.verdict.bind(Landed);
Landed.verdict = dir => dir === unmerged ? { landed: false, via: "test" } : verdict(dir);
assert.equal(task_landed(unmerged), false, "complete with an unmerged branch is not landed (todo 207)");
assert.equal(task_landed(open), false, "an open task is not landed");
assert.equal(Landed.legacy([{ assign: { landed_at: now } }]), "running", "the fallback still wants an outcome");
assert.equal(Landed.legacy([{ assign: { landed_at: now, outcome: "done" } }]), "complete");
console.log("ok  Landed: finish, complete, landed_at only, closed_by, stop all land; open does not");

/* 2. the heartbeat tick: an open task's owner is asked, a landed one never */
const sent = [], logged = [], live = new Map();
const servex = {
	say: m => logged.push(m), queue: [],
	task_loop: {
		find_task_files: () => [...Object.values(cases), plant("open2", launch("open2"), { log: { at: now } }), unmerged, plant("broke", launch("broke"), { log: { at: now } })].map(d => path.join(d, "task.jsonl")),
		slug: f => path.basename(path.dirname(f)),
		write_line: async (f, line) => fs.appendFileSync(f, JSON.stringify(line) + "\n"),
	},
	agents: {
		live, reg: () => ({ read: () => ({}) }), registry_list: () => [], successor: id => id,
		send: (id, text, note) => sent.push({ id, text, note }),
		watch(){}, stop(){},
	},
};
for (const name of ["finish", "complete", "landed-only", "closed", "stopped", "open2", "unmerged"]) live.set("helper-" + name, { id: "helper-" + name, state: "idle" });
live.set("helper-broke", { id: "helper-broke", state: "idle", watchdog_refusal: () => ({ why: "spend", text: "over budget" }) });
const hb = new Heartbeat({ servex, silent_ms: 1 });
hb.booted = 0;
await hb.tick();
const checked = sent.filter(s => s.text === CHECK).map(s => s.id);
assert.deepEqual(checked, ["helper-open2"], "only the open task's owner gets a status check (not the landed ones, not the over-budget one)");
assert.match(fs.readFileSync(path.join(home, "broke", "task.jsonl"), "utf8"), /"heartbeat":"refused"/, "the over-budget refusal is logged");
for (const dir of Object.values(cases)){
	const text = fs.readFileSync(path.join(dir, "task.jsonl"), "utf8");
	assert.equal((text.match(/"heartbeat":"skipped"/g) ?? []).length, 1, "one skipped line in " + path.basename(dir));
}
await hb.tick(); await hb.tick();
for (const dir of Object.values(cases)) assert.equal((fs.readFileSync(path.join(dir, "task.jsonl"), "utf8").match(/"heartbeat":"skipped"/g) ?? []).length, 1, "still one after more ticks");
assert.equal(sent.filter(s => s.text === CHECK && s.id !== "helper-open2").length, 0);
assert.match(fs.readFileSync(path.join(unmerged, "task.jsonl"), "utf8"), /status check not sent to helper-unmerged/, "complete-but-unmerged gets no check, one refused line");
console.log("ok  Heartbeat.tick: status check to the open task only; landed tasks get one `heartbeat: skipped, landed` line");

/* 3. the watchdog guard on the agent itself, and the spend gate on resumes */
const Agent = Agents.Agent;
const make = (extra = {}) => Object.assign(Object.create(Agent.prototype), { id: "helper-x", provider: "anthropic", cost: 0, state: "dormant", host: { store: () => ({ append: async () => {} }), servex: { say: m => logged.push(m) } } }, extra);
const landed = make({ task: { dir: cases.finish } });
assert.equal(landed.watchdog_refusal("servex-heartbeat")?.why, "landed");
assert.equal(landed.watchdog_refusal("servex-compact-nudge")?.why, "landed");
assert.equal(landed.watchdog_refusal("owner"), null, "a person's message is never refused here");
landed.send("Status check", { from: "servex-heartbeat" });
assert.equal(landed.state, "dormant", "a refused watchdog send does not wake a landed agent");
assert.equal(landed.nudge(), null, "no compact nudge for a landed agent");

const helper = make({ task: { dir: open }, budget_usd: 4, turn_cost: 0.7 });
const wakes = [];
for (let i = 1; i <= 6; i++){
	const no = helper.watchdog_refusal("servex-heartbeat");
	wakes.push(no ? `refused (${no.why})` : "woken");
	if (!no) helper.cost += 0.7;   // what the resume turn costs, counted like any turn
}
assert.deepEqual(wakes, ["woken", "woken", "woken", "woken", "woken", "refused (spend)"], "the sixth wake of a $4 helper is refused");
console.log("ok  Agent: " + wakes.join(", ") + `; spent $${helper.cost.toFixed(2)} of $4`);

/* 4. the real repo: the six helpers that were woken all day */
const base = path.resolve(import.meta.dirname, "../public/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim");
const six = ["bubbles-anchor", "sheet-double-mount", "sheet-handoff-proof", "dictate-wide", "readme-trim", "layout-check-path"];
if (fs.existsSync(path.join(base, six[0], "task.jsonl"))){
	for (const h of six) assert.equal(task_landed(path.join(base, h)), true, h + " is landed");
	console.log("ok  real repo: task_landed true for " + six.join(", "));
} else console.log("--  real repo dirs not in this checkout; run from the main tree to check the six");
fs.rmSync(home, { recursive: true, force: true });
