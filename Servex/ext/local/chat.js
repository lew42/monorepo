/* chat.js — one no-tools, one-shot call to a LOCAL model, for the chat page at
 * /framework/ai/local/. Same shape as `Servex/agents/tidy.js`'s `tidy()` (a
 * single `query()` turn, `maxTurns: 1`, no tools, no persisted session) — the
 * one new thing is the `env` override: a plain `query()` call otherwise
 * inherits Servex's own environment, which points at real Anthropic, so
 * without this override "ask a local model" would quietly bill the owner's
 * Claude subscription instead of ever reaching llama-server. */
import { query } from "@anthropic-ai/claude-agent-sdk";
import { env_for, is_local_model, available_models } from "./provider.js";

/* {model: "local/<slug>", text} -> {ok:true, text, model, ms} or {ok:false, why}.
 * `run_query` is swappable so a test can fake the model call, same as tidy.js. */
export async function local_chat({ model, text } = {}, { run_query = query } = {}){
	if (typeof text !== "string" || !text.trim()) return { ok: false, why: "text must be a non-empty string" };
	if (!is_local_model(model)) return { ok: false, why: `model must be a "local/<slug>" id, got ${JSON.stringify(model)}` };

	const t0 = Date.now();
	let out = "";
	try {
		for await (const m of run_query({ prompt: text, options: {
			/* Same minimal config as tidy.js — see its own comment on why. */
			model, tools: [], mcpServers: {}, strictMcpConfig: true, skills: [],
			settingSources: [], maxTurns: 1, persistSession: false,
			extraArgs: { "disable-slash-commands": null },
			env: { ...process.env, ...env_for("local") }
		} })){
			if (m.type === "result") out = m.result ?? out;
			else if (m.type === "assistant") out = (m.message?.content ?? []).filter(b => b.type === "text").map(b => b.text).join("") || out;
		}
	} catch (e){ return { ok: false, why: String(e.message || e) }; }

	if (!out.trim()) return { ok: false, why: "empty model reply" };
	return { ok: true, text: out.trim(), model, ms: Date.now() - t0 };
}

/* What the chat page's dropdown reads: every model slug a file actually
 * exists for right now, prefixed the way `local_chat()` and the proxy both
 * expect it (`local/<slug>`) — but the page shows the BARE slug (the prefix
 * is an implementation detail, not something worth printing in a dropdown). */
export const local_model_slugs = () => available_models();

export default local_chat;
