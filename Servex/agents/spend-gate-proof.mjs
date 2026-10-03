/* node Servex/agents/spend-gate-proof.mjs — the spend-follows-results gate (Agents.js's
 * gate(), allowance_usd(), tool_started(), tool_results(), gate_check(), grant()) is pure
 * logic on Agents.Agent.prototype, so this proves it by calling those methods directly on a
 * bare object (`Object.assign(Object.create(Agents.Agent.prototype), {...})`), never a real
 * Claude session, never the network, never a real Servex — the same trick revive-guard-proof.mjs
 * and wake-proof.mjs use for the parts of Agents.js that don't need a live SDK call.
 *
 * Also proves the matched-pair fix in gate_check(): the `ask` call now carries `from: this.id`
 * and `kind: "spend-gate"` (so Cards.js's wake() can find this exact agent and act on its
 * answer directly, instead of texting every attached agent a line nothing reads).
 *
 * Exit 0 = every case behaved. */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { Agents } from "./Agents.js";

// Pin the gate's three dollar amounts so this proof never depends on whatever
// is in the real environment.
process.env.SERVEX_GATE_FIRST_USD = "2";
process.env.SERVEX_GATE_STEP_USD = "3";
process.env.SERVEX_GATE_CEILING_USD = "20";

const results = [];
const check = (name, ok, detail) => {
	results.push({ name, ok });
	console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail !== undefined ? " — " + JSON.stringify(detail) : ""}`);
};

/* A bare Agent: the real spend-gate methods come straight from the prototype; everything a
 * live agent would normally get from Servex (the host, a card, a session) is a plain stub that
 * just records what it was called with. */
function fakeAgent(overrides = {}){
	const gateLog = [], askCalls = [], inboxDrops = [], interruptCalls = [];
	const askHandler = args => { askCalls.push(args); return Promise.resolve({ ok: true, id: "c-1", ask: "q-1" }); };
	const agent = Object.assign(Object.create(Agents.Agent.prototype), {
		id: "a-1", model: "claude-sonnet-5", provider: "anthropic", state: "idle", role: "minion",
		task: { dir: "t", card: "c-1" },
		interrupt(){ interruptCalls.push(1); return Promise.resolve(); },
		host: {
			store: () => ({ append: async (_log, obj) => { gateLog.push(obj); return true; } }),
			register: () => {},
			servex: {
				mcp: { handlers: new Map([["card_ask", askHandler]]) },
				inbox: { drop: x => inboxDrops.push(x) },
				say: () => {}
			}
		},
		...overrides
	});
	return { agent, gateLog, askCalls, inboxDrops, interruptCalls };
}

/* 1. $2 (the default SERVEX_GATE_FIRST_USD) spent, no result yet, mid-turn ("working"): the
 *    gate interrupts once and asks (the card_ask-equivalent) once, with the right
 *    since_result_usd. The ask also carries `from` + `kind: "spend-gate"` — the fix this task
 *    makes, proved here because gate_check() is where it is wired. A second gate_check() while
 *    still gated must not ask again. */
{
	const { agent, gateLog, askCalls, interruptCalls } = fakeAgent({ cost: 2, state: "working" });
	agent.gate_check();
	check("$2 spent, no result, mid-turn: interrupt() called once", interruptCalls.length === 1);
	check("...and the card is asked exactly once", askCalls.length === 1);
	const gateEvent = gateLog.find(l => l.event === "gate");
	check("...with since_result_usd = $2 (nothing produced yet)", gateEvent?.since_result_usd === 2, gateEvent);
	check("...and the ask carries from: this.id + kind: spend-gate (the fix)",
		askCalls[0]?.from === "a-1" && askCalls[0]?.kind === "spend-gate", askCalls[0]);
	agent.gate_check();
	check("a second gate_check() while still gated does not ask again", askCalls.length === 1);
}

/* 2. A successful commit-shaped tool result unlocks $3 more allowance (SERVEX_GATE_STEP_USD);
 *    a FAILED one does not. */
{
	const { agent } = fakeAgent({ cost: 0, state: "idle" });
	const before = agent.allowance_usd();
	agent.tool_started({ id: "tu-1", name: "Bash", input: { command: "git commit -m 'x'" } });
	agent.tool_results({ message: { content: [{ type: "tool_result", tool_use_id: "tu-1", is_error: false }] } });
	const after = agent.allowance_usd();
	check("a successful git-commit tool result unlocks +$3 allowance", after - before === 3, { before, after });

	const before2 = agent.allowance_usd();
	agent.tool_started({ id: "tu-2", name: "Bash", input: { command: "git commit -m 'y'" } });
	agent.tool_results({ message: { content: [{ type: "tool_result", tool_use_id: "tu-2", is_error: true }] } });
	const after2 = agent.allowance_usd();
	check("a FAILED git-commit tool result does NOT unlock more allowance", after2 === before2, { before2, after2 });
}

/* 3. An open tool call (started, not yet returned) delays the interrupt: gate_check() sets
 *    g.due = true and does not call interrupt() while g.open.size is nonzero and the agent is
 *    "working". Once that call returns, tool_results() re-runs the gate and it fires then. */
{
	const { agent, interruptCalls, askCalls } = fakeAgent({ cost: 2, state: "working" });
	agent.tool_started({ id: "tu-open", name: "Read", input: { file_path: "/x" } });   // no matching tool_results yet
	agent.gate_check();
	check("an open tool call delays the interrupt: due=true, interrupt NOT called",
		agent.gate().due === true && interruptCalls.length === 0);
	check("...and the card is not asked yet either", askCalls.length === 0);
	agent.tool_results({ message: { content: [{ type: "tool_result", tool_use_id: "tu-open", is_error: false }] } });
	check("once the open call returns, the deferred gate fires: interrupt + ask both run",
		interruptCalls.length === 1 && askCalls.length === 1);
}

/* 4. ceiling_usd()/read_ceiling() picks up a `Budget: $N` line from the task's own brief file,
 *    and `budget_usd` (added to spawn_agent in this same task) overrides it. With neither, it
 *    falls back to the $20 default. */
{
	const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "spend-gate-proof-"));
	const brief = path.join(tmp, "requirements.md");
	fs.writeFileSync(brief, "# A task\n\nBudget: $15.\n\nmore words here.\n");

	const { agent: a1 } = fakeAgent({ task: { dir: "t", brief } });
	check("read_ceiling() reads Budget: $N from the brief file", a1.read_ceiling() === 15, a1.read_ceiling());

	const { agent: a2 } = fakeAgent({ task: { dir: "t", brief }, budget_usd: 7 });
	check("budget_usd overrides the brief's Budget: $N line", a2.read_ceiling() === 7, a2.read_ceiling());

	const { agent: a3 } = fakeAgent({ task: { dir: "t" } });   // no brief, no budget_usd
	check("no budget_usd and no brief: falls back to the $20 default", a3.read_ceiling() === 20, a3.read_ceiling());

	fs.rmSync(tmp, { recursive: true, force: true });
}

/* 5. grant(usd) raises allowance_usd() by that amount and clears g.gated, so a second
 *    gate_check() does not re-fire the card (the owner chose "Continue (+$5)"). */
{
	const { agent, askCalls } = fakeAgent({ cost: 2, state: "working" });
	agent.gate_check();
	check("gated and asked once before the grant", askCalls.length === 1 && agent.gate().gated === true);
	const before = agent.allowance_usd();
	agent.grant(5);
	check("grant(5) raises allowance by $5 and clears gated",
		agent.allowance_usd() - before === 5 && agent.gate().gated === false, { before, after: agent.allowance_usd() });
	agent.gate_check();
	check("after the grant, a second gate_check() does not ask again", askCalls.length === 1);
}

/* 6. tool_started() is a no-op for a role the gate doesn't cover (review.md finding 3): the
 *    front desk must never get the "40 reads" warning, and must never pay for the read-tracking
 *    it does for a gated work agent. */
{
	const { agent } = fakeAgent({ task: null, role: "assistant" });   // gated_role() is false: no task.dir, not an openrouter mastermind/minion
	for (let i = 0; i < 41; i++) agent.tool_started({ id: `r-${i}`, name: "Read", input: { file_path: "/x" } });
	check("tool_started() on an ungated role never counts reads", (agent.spend_gate?.reads ?? 0) === 0);
}

/* 7. Agents.grant(id, usd) — the HOST method the spend-gate card's "Continue" button calls
 *    (Cards.js's wake()) — must do two things review.md asked for: (a) actually tell the agent
 *    to go on, not just raise a number nobody reads; (b) revive the agent first when it has
 *    left `live` by the time the owner answers, instead of throwing "No agent …" and losing the
 *    Continue. Built on a minimal Agents-host stub, never a real SDK session. */
{
	const sent = [], granted = [];
	const liveAgent = { id: "a-live", state: "working", grant(usd){ granted.push(usd); }, send(text, note){ sent.push({ text, note }); } };
	const host = Object.create(Agents.prototype);
	Object.assign(host, {
		live: new Map([["a-live", liveAgent]]),
		holder(id){ return id; },
		reg(){ return { read: () => ({}) }; },
		blocked(){ return null; },
		store(){ return { append: async () => true }; },
	});
	host.grant("a-live", 5);
	check("grant() on a live agent raises its allowance", granted[0] === 5);
	check("...and sends it a Continue message (the fix: it was just sitting gated otherwise)",
		sent.length === 1 && /continue/i.test(sent[0].text) && sent[0].note?.revive === true, sent[0]);
}
{
	// The agent is NOT live (idle-swept, or a Servex restart) — grant() must revive it first,
	// the same door send() uses, instead of throwing and losing a late "Continue (+$5)".
	const granted = [], sent = [];
	const revived = { id: "a-gone", state: "idle", grant(usd){ granted.push(usd); }, send(text, note){ sent.push({ text, note }); } };
	const host = Object.create(Agents.prototype);
	Object.assign(host, {
		live: new Map(),   // nothing live
		holder(id){ return id; },
		reg(){ return { read: () => ({ "a-gone": { id: "a-gone", session_id: "s-1", cwd: process.cwd() } }) }; },
		blocked(){ return null; },   // the owner's own Continue click forces this open (force: true)
		wake(id){ check("grant() revives via wake() when the agent left live", id === "a-gone"); return revived; },
		store(){ return { append: async () => true }; },
	});
	host.grant("a-gone", 5);
	check("...and then grants + messages the revived instance", granted[0] === 5 && sent.length === 1);
}
{
	// blocked() refuses (e.g. the worktree is gone): grant() must not throw, just log and return null.
	const host = Object.create(Agents.prototype);
	Object.assign(host, {
		live: new Map(),
		holder(id){ return id; },
		reg(){ return { read: () => ({ "a-refused": { id: "a-refused" } }) }; },
		blocked(){ return { why: "cwd-gone", text: "its working directory no longer exists" }; },
		store(){ return { append: async () => true }; },
	});
	const out = host.grant("a-refused", 5);
	check("grant() on a refused revive returns null instead of throwing", out === null);
}

const failed = results.filter(r => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);
