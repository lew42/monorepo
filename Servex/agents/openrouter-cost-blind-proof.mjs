/* node Servex/agents/openrouter-cost-blind-proof.mjs — proves the fix for
 * openrouter-cost-blind (2026-10-04): a call priced straight off its own
 * response (`price()`), the fallback that no longer goes silent (`unpriced()`
 * + the 3-call gate), and the spawn pause (`Agents.spawn()`). No network, no
 * real SDK session — the same bare-prototype trick spend-gate-proof.mjs uses.
 * Exit 0 = every case behaved. */

import { Agents } from "./Agents.js";

const results = [];
const check = (name, ok, detail) => {
	results.push({ name, ok });
	console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail !== undefined ? " — " + JSON.stringify(detail) : ""}`);
};

function fakeAgent(overrides = {}){
	const gateLog = [], storeLog = [], askCalls = [], interruptCalls = [];
	const askHandler = args => { askCalls.push(args); return Promise.resolve({ ok: true, id: "c-1", ask: "q-1" }); };
	const agent = Object.assign(Object.create(Agents.Agent.prototype), {
		id: "a-1", model: "openai/gpt-6-luna", provider: "openrouter", state: "idle", role: "minion",
		task: { card: "c-1" },   // a card to ask, but no `dir` — gated_role() comes from provider+role here, not a task dir
		interrupt(){ interruptCalls.push(1); return Promise.resolve(); },
		host: {
			store: () => ({ append: async (_log, obj) => { storeLog.push(obj); return true; } }),
			register: () => {},
			servex: { mcp: { handlers: new Map([["card_ask", askHandler]]) }, inbox: { drop: () => {} }, say: () => {} }
		},
		...overrides
	});
	return { agent, gateLog, storeLog, askCalls, interruptCalls };
}

/* 1. price(): a response carrying its own usage.cost prices the call AT ONCE —
 *    no fetch, no poll. Two different ids accumulate; the same id twice counts once. */
{
	const { agent } = fakeAgent();
	agent.price("gen-1", { input_tokens: 10, output_tokens: 5, cost: 0.002 });
	agent.price("gen-2", { input_tokens: 20, output_tokens: 8, cost: 0.0035 });
	agent.price("gen-1", { input_tokens: 10, output_tokens: 5, cost: 0.002 });   // repeat id: no double count
	check("price() sums usage.cost across calls, synchronously, no duplicate",
		Math.abs(agent.metered_usd - 0.0055) < 1e-9, agent.metered_usd);
}

/* 2. unpriced(): one call Servex can't price is logged at once, never just left at $0
 *    with no trace — the exact defect report said "every failure is swallowed". */
{
	const { agent, storeLog } = fakeAgent();
	agent.unpriced("gen-x", "no OpenRouter key");
	check("unpriced() writes one spend-gate/unpriced line, not silence",
		storeLog.length === 1 && storeLog[0].type === "spend-gate" && storeLog[0].event === "unpriced", storeLog);
	check("gate_row() surfaces the running unpriced count", agent.gate_row()?.unpriced_calls === 1, agent.gate_row());
}

/* 3. 3 unpriced calls gate the agent exactly like an over-budget one — its spend is
 *    simply unknown, not necessarily high, but unknown is enough to pause it. */
{
	const { agent, askCalls } = fakeAgent({ state: "idle" });
	agent.unpriced("gen-1", "miss");
	agent.unpriced("gen-2", "miss");
	check("2 unpriced calls: not gated yet", agent.gate().gated === false && askCalls.length === 0);
	agent.unpriced("gen-3", "miss");
	check("3rd unpriced call gates the agent and asks the card", agent.gate().gated === true && askCalls.length === 1);
	check("...with the 'could not price' wording, not the dollar-amount one",
		/could not price/.test(askCalls[0]?.question ?? ""), askCalls[0]?.question);
}

/* 4. The spawn pause (Agents.spawn()): refused with the pause's own message while
 *    SERVEX_OPENROUTER_PAUSED isn't exactly "0" (the default on every fresh boot);
 *    once set to "0" the SAME spawn gets past the pause and fails for a DIFFERENT
 *    reason (spend_guard, with no key file in this test env) — proving the pause
 *    gate itself, not just "it still throws somehow". Neither case starts a real
 *    SDK session: both throw before `new Agent()`. */
{
	const host = Object.assign(Object.create(Agents.prototype), { live: new Map() });
	delete process.env.SERVEX_OPENROUTER_PAUSED;
	let err = null;
	try { host.spawn({ role: "mastermind", model: "openai/gpt-6-luna", name: "probe" }); } catch (e) { err = e; }
	check("unset SERVEX_OPENROUTER_PAUSED refuses an OpenRouter spawn (fails closed by default)",
		/paused/.test(err?.message ?? ""), err?.message);

	process.env.SERVEX_OPENROUTER_PAUSED = "0";
	err = null;
	try { host.spawn({ role: "mastermind", model: "openai/gpt-6-luna", name: "probe2" }); } catch (e) { err = e; }
	check("SERVEX_OPENROUTER_PAUSED=0 lifts the pause: the spawn now fails on something else entirely",
		err && !/paused/.test(err.message), err?.message);
	delete process.env.SERVEX_OPENROUTER_PAUSED;
}

const failed = results.filter(r => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);
