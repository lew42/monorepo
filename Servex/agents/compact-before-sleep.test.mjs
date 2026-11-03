/* node Servex/agents/compact-before-sleep.test.mjs — compact before going dormant (the owner, 2026-10-23; doc/dormant.md).
 * A fake agent built from Agent.prototype: no process, no SDK. Checks the decision, the sleep → /compact → sleep
 * sequence, and who is left out. */
import assert from "node:assert";
import fs from "fs";
import os from "os";
import path from "path";

process.env.SERVEX_HOME = fs.mkdtempSync(path.join(os.tmpdir(), "servex-sleepcompact-"));
delete process.env.SERVEX_SLEEP_COMPACT_TOKENS; delete process.env.SERVEX_WINDOW_TOKENS;
const { Agents, SLEEP_COMPACT_TOKENS } = await import("./Agents.js");

let n = 0;
const t = (ok, what) => { assert.ok(ok, what); n++; };

function fake(over = {}){
	const events = [], turns = [], logs = [], slept = [];
	const a = Object.create(Agents.Agent.prototype);
	Object.assign(a, {
		id: "mastermind-x", role: "mastermind", state: "idle", turns: 3, context: 0, session_id: "s-1",
		queue: { items: [], closed: false, push(x){ this.items.push(x); turns.push(x); }, close(){ this.closed = true; } },
		query: { close(){} }, aborter: { abort(){} },
		turn: text => text, emit: e => events.push(e), log: l => logs.push(l), settle(){}, add_cost(){},
		host: { register(){}, servex: { global: { mark_slept: (ag, w) => slept.push([ag.id, w]) } } },
		...over });
	return { a, events, turns, logs, slept };
}

t(SLEEP_COMPACT_TOKENS === 100000, "the default sleep line is 100k");

{ // under the line: sleeps at once, no compaction
	const { a, turns } = fake({ context: 90000 });
	t(a.sleep_compact() === false, "90k: no compaction");
	t(a.sleep("idle") === true && a.state === "dormant" && turns.length === 0, "90k: straight to dormant");
}
{ // over the line: /compact first, then dormant
	const { a, turns, events, logs, slept } = fake({ context: 120000 });
	t(a.sleep_compact() === true, "120k mastermind: compact before sleep");
	t(a.sleep("idle") === false, "sleep() refuses while it compacts");
	t(a.state === "working" && turns[0] === "/compact" && a.compacting?.why === "sleep", "queued /compact, why=sleep");
	t(events.some(e => e.type === "compacting" && e.why === "sleep" && e.context === 120000), "logged compacting with the size before");
	a.context = 15000;   // what the compaction left
	a.compact_done({ queued_turn_count: 0 });
	t(logs.some(l => l.type === "compact" && l.why === "sleep" && l.before === 120000 && l.after === 15000), "compact line: before and after");
	t(a.state === "dormant", "then it sleeps");
	t(slept.length === 1 && slept[0][0] === "mastermind-x", "the dormant line goes through Global.mark_slept");
	t(events.filter(e => e.type === "dormant").length === 1, "exactly one sleep");
}
{ // a message that arrived during the compaction: it stays awake for that turn
	const { a } = fake({ context: 120000 });
	a.sleep("idle");
	a.compact_done({ queued_turn_count: 1 });
	t(a.state === "working", "a queued message keeps it awake");
}
{ // compacted since its last turn: not again, even if the summary is still big
	const { a, turns } = fake({ context: 130000, compacted_turn: 3 });
	t(a.sleep_compact() === false && a.sleep("idle") === true && turns.length === 0, "already compacted this turn: just sleeps");
}
{ // only the idle sleep: a landed task or the memory restart does not compact first
	const { a, turns } = fake({ context: 300000 });
	t(a.sleep("landed") === true && turns.length === 0, "landed: sleeps without compacting");
}
{ // left out: minions, the front desk, forks
	t(fake({ role: "minion", id: "minion-x", context: 900000 }).a.sleep_compact() === false, "minion: never");
	t(fake({ role: "master-assistant", id: "master-assistant", context: 900000 }).a.sleep_compact() === false, "front desk: never");
	t(fake({ role: "page-assistant", id: "assistant-x", context: 900000 }).a.sleep_compact() === false, "page assistant: never");
	t(fake({ context: 900000, one_shot: true }).a.sleep_compact() === false, "fork: never");
}
{ // other roles: the host default; half the window caps the line
	t(fake({ role: "reviewer", id: "reviewer-x", context: 110000 }).a.sleep_compact() === true, "a role with no compact_after: the 100k default");
	const small = fake({ role: "reviewer", id: "reviewer-x", context: 90000, host: { window_tokens: 160000 } }).a;
	t(small.sleep_compact() === true, "a 160k window: the line is 80k (half the window)");
	process.env.SERVEX_SLEEP_COMPACT_TOKENS = "200000";
	t(fake({ role: "reviewer", id: "reviewer-x", context: 150000 }).a.sleep_compact() === false, "env raises the default line");
	delete process.env.SERVEX_SLEEP_COMPACT_TOKENS;
}
{ // the memory restart forgets the old heap size (no repeat memory compactions)
	const { a } = fake({ context: 60000, rss_mb: 698 });
	a.awaken = function(){ this.state = "idle"; return this; };
	a.compacting = { why: "memory", before: 60000, rss_mb: 698, at: Date.now() };
	a.state = "working";
	a.compact_done({ queued_turn_count: 0 });
	t(a.rss_mb === null, "after a memory compaction rss_mb is cleared");
	t(a.oversized() === null, "so the next check does not compact again");
}
console.log(`compact-before-sleep: ${n} checks passed`);
