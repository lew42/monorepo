/* node Servex/agents/compact-nudge.test.mjs — the idle compaction nudge (doc/owner-2026-10-16-compaction.md).
 * Decisions only, on a fake agent built from Agent.prototype: no process, no SDK. */
import assert from "node:assert";
import fs from "fs";
import os from "os";
import path from "path";

process.env.SERVEX_HOME = fs.mkdtempSync(path.join(os.tmpdir(), "servex-nudge-"));
delete process.env.SERVEX_COMPACT_TOKENS; delete process.env.SERVEX_NUDGE_TOKENS;
const { Agents, NUDGE_GROWTH } = await import("./Agents.js");

let n = 0;
const t = (ok, what) => { assert.ok(ok, what); n++; };

function fake(over = {}){
	const sent = [], events = [];
	const a = Object.create(Agents.Agent.prototype);
	Object.assign(a, { id: "mastermind-x", role: "mastermind", state: "idle", turns: 3, context: 0, turn_ended_at: Date.now(),
		emit: e => events.push(e), send(text, note){ sent.push({ text, note }); this.state = "working"; return this; }, ...over });
	return { a, sent, events };
}

{ // below the role line (150k): nothing
	const { a } = fake({ context: 149000 });
	t(a.nudge() === null && a.oversized() === null, "under 150k: no nudge, no compact");
}
{ // over the role line: the nudge, never an auto /compact
	const { a, sent, events } = fake({ context: 160000 });
	t(a.oversized() === null, "160k is not a reason to auto-compact");
	t(a.nudge_send() === true, "160k idle: nudged");
	t(sent.length === 1 && sent[0].note.from === "servex-compact-nudge", "sent through send() with a servex-* from");
	t(/160,000 tokens \(16% of the window\), cache warm \(last turn 0 minutes ago\)\. You are idle\. Compact at your next natural break/.test(sent[0].text), sent[0].text);
	t(events[0].type === "compact_nudge" && events[0].context === 160000 && events[0].cache === "warm", "logged {type:compact_nudge, context, cache}");
	a.state = "idle";   // the nudge turn ends, context barely moved
	a.context = 163000;
	t(a.nudge() === null, "once per idle period: +3k does not re-nudge");
	a.context = 160000 + NUDGE_GROWTH;
	t(a.nudge() === null, "grew by 20k: not yet, the step is 5% of the window (50k on 1M)");
	a.context = 210000;
	t(a.nudge() !== null, "grew by 50k: the next step reminder");
}
{ // cold cache
	const { a } = fake({ context: 300000, turn_ended_at: Date.now() - 12 * 60000 });
	t(/cache cold \(last turn 12 minutes ago\)/.test(a.nudge()), "12 minutes ago reads cold");
}
{ // age is not a reason
	const { a } = fake({ context: 30000, started_at: new Date(Date.now() - 3 * 3600000).toISOString() });
	t(a.nudge() === null && a.oversized() === null, "3 hours old at 30k: nothing");
}
{ // others: host default 200k
	const { a } = fake({ role: "reviewer", id: "reviewer-x", context: 190000 });
	t(a.nudge() === null, "non-mastermind under 200k: no nudge");
	a.context = 210000;
	t(a.nudge() !== null && a.oversized() === null, "non-mastermind over 200k: nudge, not compact");
}
{ // ceiling and memory: the hard auto-compact, end of turn
	const { a } = fake({ context: 401000 });
	t(a.oversized() === "context", "over 400k: hard compact");
	const b = fake({ rss_mb: 600 }).a;
	t(b.oversized() === "memory", "over the memory line: hard compact");
	const c = fake({ context: 401000, compacted_turn: 3 }).a;
	t(c.oversized() === null, "once per turn: just compacted, not again");
}
{ // never: minions, standing agents, busy agents, forks
	t(fake({ role: "minion", id: "minion-x", context: 900000 }).a.nudge() === null, "minion: never nudged");
	t(fake({ role: "minion", id: "minion-x", context: 900000 }).a.oversized() === null, "minion: never compacted");
	t(fake({ id: "assistant-x", context: 500000 }).a.nudge() === null, "front desk: never nudged");
	t(fake({ context: 500000, state: "working" }).a.nudge() === null, "mid-turn: never nudged");
	t(fake({ context: 500000, one_shot: true }).a.nudge() === null, "fork: never nudged");
}
{ // the nudge turn's own result wakes no parent
	const { a } = fake({ context: 160000, parent: "boss", host: { watch(){}, wake_parent(){ woke.push(1); } }, log(){} });
	const woke = [];
	a.nudge_send();
	a.emit = Agents.Agent.prototype.emit;
	a.emit({ type: "result", ok: true });
	t(woke.length === 0 && a.nudge_pending === false, "the nudge answer wakes nobody");
	a.emit({ type: "result", ok: true });
	t(woke.length === 1, "the next real turn wakes its parent again");
}
{ // the agent's answer
	const { a } = fake();
	t(a.request_compact().ok && a.compact_requested === true, "compact_self sets the flag; the turn end acts on it");
}
console.log(`compact-nudge: ${n} checks passed`);
