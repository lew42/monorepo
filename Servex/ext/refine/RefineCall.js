import { query } from "@anthropic-ai/claude-agent-sdk";

/**
 * class RefineCall — ONE model call as its OWN NEW session (never resumed), with the lean
 * options `agents/tidy.js` uses (no tools, no MCP, no skills: a ~800-token prefix instead of ~50k,
 * which is the difference between $0.01 and $0.18 per call). The session is persisted, so it has a
 * page at `/framework/ai/sessions/<session_id>/`, and the call reports what it cost.
 *
 *   const r = await RefineCall.run(prompt, { model, system });
 *   r.answer; r.session_id; r.model; r.cost_usd; r.duration_ms; r.tokens   // plain data
 *
 * `RefineCall.run` has the `(prompt, {model}) -> {answer, cost_usd}` shape `engine.js clean()` and
 * `structure.js` take as `call`, so they run unchanged. Every finished call is also kept on
 * `RefineCall.recorded` while a `RefineCall.collect()` is open, so a route can list its runs.
 */
export default class RefineCall {

	static async run(prompt, { model = "claude-haiku-5-5", system, stage = "" } = {}){
		const t0 = Date.now();
		let answer = "", result = null, session_id = "";
		const q = query({ prompt, options: {
			model, tools: [], mcpServers: {}, strictMcpConfig: true, skills: [], settingSources: [],
			maxTurns: 1, thinking: { type: "disabled" }, effort: "low", permissionMode: "bypassPermissions",
			extraArgs: { "disable-slash-commands": null },
			...(system ? { systemPrompt: system } : {}),
		} });
		for await (const m of q){
			if (m.type === "system" && m.subtype === "init") session_id = m.session_id;
			if (m.type === "assistant") answer = (m.message?.content ?? []).filter(b => b.type === "text").map(b => b.text).join("") || answer;
			if (m.type === "result") result = m;
		}
		q.close?.();
		const u = result?.usage ?? {};
		const out = {
			stage, model, session_id,
			answer: (result?.result ?? answer ?? "").trim(),
			cost_usd: +(result?.total_cost_usd ?? 0).toFixed(5),
			duration_ms: Date.now() - t0,
			tokens: { in: (u.input_tokens ?? 0) + (u.cache_read_input_tokens ?? 0) + (u.cache_creation_input_tokens ?? 0), out: u.output_tokens ?? 0 },
		};
		RefineCall.sink?.push(out);
		return out;
	}

	/** Run `fn` while collecting every call it makes (calls are awaited inside it, one route at a time is fine). */
	static async collect(fn){
		const mine = [];
		const prev = RefineCall.sink;
		RefineCall.sink = mine;
		try { return [await fn(), mine]; }
		finally { RefineCall.sink = prev; }
	}
}
