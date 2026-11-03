#!/usr/bin/env node
/* Does OpenRouter cache Gemini prompts on the route Servex uses? About $0.10, about 1 minute.
 *
 *   node public/framework/ai/sessions/2026/10/02/servex-mastermind/or-cache-probe.mjs [model]
 *
 * Why (vscode-mastermind, 2026-10-03): two google/gemini-3.8-flash masterminds sent ~10.6M input
 * tokens each and were charged ~$17 together, about full input price, though the SDK reported
 * 9.2M cache-read tokens. Servex runs OpenRouter agents through the Claude Agent SDK with
 * ANTHROPIC_BASE_URL=https://openrouter.ai/api, so every request is Anthropic format
 * (/v1/messages) carrying Claude Code's own `cache_control` breakpoints. This probe sends the
 * SAME ~8k-token prefix twice on each route, then reads OpenRouter's own record of the second
 * call (/api/v1/generation): cached tokens, cache_discount, and the upstream that served it.
 *
 *   A  /v1/messages, cache_control on the system block   (what Servex sends today)
 *   B  /v1/messages, no cache_control                     (implicit caching only)
 *   C  /v1/messages, cache_control + provider pinned       (one upstream, so the cache can be hit)
 *   D  /v1/chat/completions, cache_control on a content part
 *   E  /v1/chat/completions, plain                         (implicit only)
 *
 * Reading the answer:
 *   - A shows cached tokens and a discount: caching works. The $17 came from something else
 *     (upstream switching, a prefix that changes every call, compaction). Check the reconcile's
 *     `providers` and per-request samples.
 *   - A shows none but C does: upstream switching. Fix: pin the provider for google/ models
 *     (C's body field; if the Anthropic route refuses it, an OpenRouter preset or a per-key
 *     provider setting).
 *   - A and C show none, but D or E do: the Anthropic-format route loses caching. Fix: route
 *     Gemini through a chat/completions proxy, or record "no caching on this route".
 *   - Nothing caches anywhere: OpenRouter can't cache this model for us. The alternative is the
 *     direct Google API (Gemini context caching, priced by Google per cached token per hour).
 * Writes or-cache-probe.json beside this file. */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const HOME = process.env.SERVEX_HOME || path.join(process.env.LOCALAPPDATA || path.join(os.homedir(), ".local", "share"), "lew42", "servex");
const key = fs.readFileSync(path.join(HOME, "openrouter.key"), "utf8").trim();
const model = process.argv[2] || "google/gemini-3.8-flash";
const sleep = ms => new Promise(r => setTimeout(r, ms));

// ~8k tokens of stable text: well above any provider's minimum for caching.
const PREFIX = Array.from({ length: 400 }, (_, i) => `Rule ${i + 1}: a Servex agent reads its brief, writes its plan, and reports on its card; rule number ${i + 1} is kept for the cache probe.`).join("\n");
const QUESTION = "Reply with the single word: ok.";

const routes = {
	A: { url: "https://openrouter.ai/api/v1/messages", body: () => ({ model, max_tokens: 8,
		system: [{ type: "text", text: PREFIX, cache_control: { type: "ephemeral" } }], messages: [{ role: "user", content: QUESTION }] }) },
	B: { url: "https://openrouter.ai/api/v1/messages", body: () => ({ model, max_tokens: 8,
		system: [{ type: "text", text: PREFIX }], messages: [{ role: "user", content: QUESTION }] }) },
	C: { url: "https://openrouter.ai/api/v1/messages", body: () => ({ model, max_tokens: 8,
		system: [{ type: "text", text: PREFIX, cache_control: { type: "ephemeral" } }], messages: [{ role: "user", content: QUESTION }],
		provider: { order: ["google-ai-studio"], allow_fallbacks: false } }) },
	D: { url: "https://openrouter.ai/api/v1/chat/completions", body: () => ({ model, max_tokens: 8, usage: { include: true },
		messages: [{ role: "system", content: [{ type: "text", text: PREFIX, cache_control: { type: "ephemeral" } }] }, { role: "user", content: QUESTION }] }) },
	E: { url: "https://openrouter.ai/api/v1/chat/completions", body: () => ({ model, max_tokens: 8, usage: { include: true },
		messages: [{ role: "system", content: PREFIX }, { role: "user", content: QUESTION }] }) },
};

async function call(route){
	const res = await fetch(route.url, { method: "POST", body: JSON.stringify(route.body()),
		headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", "anthropic-version": "2023-06-01" } });
	const text = await res.text();
	let body; try { body = JSON.parse(text); } catch { body = { raw: text.slice(0, 300) }; }
	return { status: res.status, id: body.id ?? null, usage: body.usage ?? null, error: res.ok ? null : (body.error?.message ?? body.raw ?? text.slice(0, 300)) };
}

async function generation(id){
	for (let i = 0; i < 8; i++){
		const res = await fetch(`https://openrouter.ai/api/v1/generation?id=${encodeURIComponent(id)}`, { headers: { Authorization: `Bearer ${key}` } }).catch(() => null);
		if (res?.ok){ const d = (await res.json())?.data; if (d) return d; }
		await sleep(2500);
	}
	return null;
}

const out = { at: new Date().toISOString(), model, routes: {} };
for (const [name, route] of Object.entries(routes)){
	const first = await call(route);
	await sleep(3000);
	const second = await call(route);
	const g1 = first.id ? await generation(first.id) : null, g2 = second.id ? await generation(second.id) : null;
	const pick = g => g && { provider: g.provider_name ?? null, cost: g.total_cost, prompt: g.native_tokens_prompt, cached: g.native_tokens_cached ?? null, discount: g.cache_discount ?? null };
	out.routes[name] = { status: [first.status, second.status], error: first.error ?? second.error, usage_second: second.usage, first: pick(g1), second: pick(g2) };
	const r = out.routes[name];
	console.log(`${name}  ${route.url.split("/v1/")[1]}  status ${r.status}  ${r.error ? `error: ${r.error}` : `2nd call: ${JSON.stringify(r.second)}  reported usage: ${JSON.stringify(r.usage_second)}`}`);
}
fs.writeFileSync(path.join(HERE, "or-cache-probe.json"), JSON.stringify(out, null, 2));
console.log(`\nwritten: ${path.join(HERE, "or-cache-probe.json")}`);
