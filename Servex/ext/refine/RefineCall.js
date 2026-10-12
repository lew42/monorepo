import { query } from "@anthropic-ai/claude-agent-sdk";
import { read_key, has_key, spend_guard } from "../openrouter/provider.js";
import { session_backend } from "../../agents/Sessions.js";

/**
 * class RefineCall — ONE model call as its OWN NEW session (never resumed), with the lean
 * options `agents/tidy.js` uses (no tools, no MCP, no skills: a ~800-token prefix instead of ~50k,
 * which is the difference between $0.01 and $0.18 per call). The session is persisted, so it has a
 * page at `/framework/ai/sessions/<session_id>/`, and the call reports what it cost.
 *
 *   const r = await RefineCall.run(prompt, { model, system });
 *   r.answer; r.session_id; r.model; r.cost_usd; r.duration_ms; r.tokens   // plain data
 *
 * A model with a `/` (an OpenRouter slug, e.g. `openai/gpt-6-luna`) is one plain chat-completion instead: no session,
 * the cost is OpenRouter's own `usage.cost` (about $0.00003 a call against $0.01 to $0.07 on Claude), and when OpenRouter
 * is down or refuses the spend guard it answers on `FALLBACK` (Claude Haiku) so Refine never stops (ai/doc/models.md).
 *
 * `RefineCall.run` has the `(prompt, {model}) -> {answer, cost_usd}` shape `engine.js clean()` and
 * `structure.js` take as `call`, so they run unchanged. Every finished call is also kept on
 * `RefineCall.recorded` while a `RefineCall.collect()` is open, so a route can list its runs.
 */
export default class RefineCall {

	static FALLBACK = "claude-haiku-5-5";
	static OPENROUTER = "openai/gpt-6-luna";

	/** The model every clean/refine call uses: Haiku, unless session-backend.txt says `openrouter`
	 *  (the owner's switch for when Claude tokens run out; read per call, no restart). ai/doc/models.md */
	static model(){ return session_backend() === "openrouter" ? RefineCall.OPENROUTER : RefineCall.FALLBACK; }

	static async run(prompt, { model = "claude-haiku-5-5", system, stage = "" } = {}){
		if (String(model).includes("/")){
			try { const out = await RefineCall.run_or(prompt, { model, system, stage }); RefineCall.sink?.push(out); return out; }
			catch (e){ const out = await RefineCall.run(prompt, { model: RefineCall.FALLBACK, system, stage }); out.fallback_from = model; out.fallback_why = String(e.message ?? e).slice(0, 160); return out; }
		}
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

	static async run_or(prompt, { model, system, stage = "" }){
		if (!has_key()) throw new Error("no OpenRouter key");
		const guard = spend_guard();
		if (!guard.ok) throw new Error(guard.reason);
		const t0 = Date.now();
		const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
			method: "POST", headers: { Authorization: `Bearer ${read_key()}`, "Content-Type": "application/json" },
			body: JSON.stringify({ model, max_tokens: 4000, reasoning: { effort: "low" }, usage: { include: true },
				messages: [...(system ? [{ role: "system", content: system }] : []), { role: "user", content: prompt }] }),
			signal: AbortSignal.timeout(60000),
		});
		const j = await res.json().catch(() => ({}));
		const answer = j?.choices?.[0]?.message?.content;
		if (!res.ok || typeof answer !== "string") throw new Error(j?.error?.message ?? `OpenRouter ${res.status}`);
		return { stage, model, session_id: "", answer: answer.trim(), cost_usd: +(j.usage?.cost ?? 0).toFixed(5), duration_ms: Date.now() - t0,
			tokens: { in: j.usage?.prompt_tokens ?? 0, out: j.usage?.completion_tokens ?? 0 } };
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
