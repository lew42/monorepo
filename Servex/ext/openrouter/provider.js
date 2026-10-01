/* provider.js — the OpenRouter half of the Claude Agent SDK proxy route.
 *
 * The trick (verified in spike.mjs, written up in readme.md): the SDK only ever
 * talks to "the Anthropic API", so pointing its base url at OpenRouter and
 * handing it an OpenRouter key instead of a Claude login makes the exact same
 * `query()` loop — tools, resume, streaming — run a non-Claude model. Nothing
 * else in Servex has to change for that part.
 *
 * Two things this module owns:
 *  - `env_for("openrouter")` — the four env vars that make the swap happen,
 *    read from a key file that is never in the repo.
 *  - `key_usage(key)` — OpenRouter's own running-dollar-total for a key, which
 *    is the one honest cost number for a proxied turn (the SDK's own
 *    `total_cost_usd` prices the turn off ANTHROPIC's table, under the wrong
 *    model name entirely — see readme.md point 3). */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

/* The owner's key never lives in the repo (CLAUDE.md: no secrets committed). */
export const KEY_PATH = path.join(
	process.env.LOCALAPPDATA || path.join(os.homedir(), "AppData", "Local"),
	"lew42", "servex", "openrouter.key"
);

/* Reads the key file, trimmed. Throws the one-line error every caller (the
 * spike, Agents.js, the test) shows verbatim and exits on. */
export function read_key(){
	let text;
	try { text = fs.readFileSync(KEY_PATH, "utf8"); }
	catch { throw new Error(`no OpenRouter key at ${KEY_PATH}`); }
	const key = text.trim();
	if (!key) throw new Error(`no OpenRouter key at ${KEY_PATH}`);
	return key;
}

/* `true` the cheap way — no key read, no throw — for a caller (spike.mjs, before
 * spending anything) that just wants to know whether to bother. */
export function has_key(){
	try { return !!fs.readFileSync(KEY_PATH, "utf8").trim(); }
	catch { return false; }
}

/* The env a spawned `claude` process needs to run through OpenRouter instead
 * of Anthropic. `ANTHROPIC_API_KEY` and `CLAUDE_CODE_OAUTH_TOKEN` are blanked
 * ON PURPOSE: either one present lets the CLI authenticate straight past the
 * base-url swap and bill the owner's Claude subscription instead (checked
 * against OpenRouter's own Claude Code integration docs, 2026-09-30). */
export function env_for(provider){
	if (provider !== "openrouter") return {};
	const key = read_key();
	return {
		ANTHROPIC_BASE_URL: "https://openrouter.ai/api",
		ANTHROPIC_AUTH_TOKEN: key,
		ANTHROPIC_API_KEY: "",
		CLAUDE_CODE_OAUTH_TOKEN: ""
	};
}

/* A model id with a `/` in it (`openai/gpt-6-luna`) is an OpenRouter slug;
 * every Claude id (`claude-sonnet-5`) has none. This is the one place that
 * rule lives, so a spawn that only passes `model` still ends up on the right
 * provider without having to say so. */
export const provider_for = model => (String(model ?? "").includes("/") ? "openrouter" : "anthropic");

/* GEMINI TOOL-SCHEMA GAP (spike.mjs, 2026-10-01): google/gemini-3.1-pro-preview
 * AND google/gemini-3.8-flash both 400 before any tool call —
 * tools[0].function_declarations[3].parameters.properties.query.properties.where.items.items
 * — because Gemini's strict function-calling validator demands every nested
 * array carry its own `items` schema, and the built-in ArtifactData tool's
 * `query.where` (an array of [field, operator, value] tuples) only declares
 * `prefixItems` on the inner array, no `items`. ArtifactData ships with the
 * SDK itself — outside this module's fence (Servex/ext/openrouter/*,
 * Servex/agents/Agents.js) — so there is no schema to patch here; the fix is
 * to not offer it to Gemini at all. Confirmed on two different Gemini models,
 * so this is Gemini's validator, not one model's quirk. */
export const disallowed_tools_for = model => (String(model ?? "").startsWith("google/") ? ["ArtifactData"] : []);

/* OpenRouter's running total for this key, in dollars — goes up by exactly
 * what a turn cost once that turn's billing settles (usually within a few
 * seconds; occasionally longer under load, per OpenRouter's docs).
 *
 * ⚠ This total is PER KEY, not per agent: if two OpenRouter agents run turns
 * on the same key at once, a before/after diff can't tell whose spend is
 * whose — Agents.js's refresh_or_cost() will mis-attribute cost between them.
 * Fine for now (today's usage is one agent at a time); a real fix needs
 * either a key per agent or OpenRouter exposing a per-request cost header. */
export async function key_usage(key){
	const res = await fetch("https://openrouter.ai/api/v1/key", { headers: { Authorization: `Bearer ${key}` } });
	if (!res.ok) throw new Error(`OpenRouter /key returned ${res.status}`);
	const body = await res.json();
	const usage = body?.data?.usage;
	if (typeof usage !== "number") throw new Error("OpenRouter /key response had no numeric data.usage");
	return usage;
}

/* The per-turn cost OpenRouter itself computed for one generation id. The SDK's
 * assistant `message.id` DOES turn out to be the OpenRouter generation id —
 * confirmed on gemini-3.8-flash's spike row (2026-10-01), though not every
 * model/run has shown it matching, so `real_turn_cost()` below tries this
 * first and falls back to a before/after `key_usage()` diff when it doesn't. */
export async function generation_cost(key, id){
	const res = await fetch(`https://openrouter.ai/api/v1/generation?id=${encodeURIComponent(id)}`,
		{ headers: { Authorization: `Bearer ${key}` } });
	if (!res.ok) throw new Error(`OpenRouter /generation returned ${res.status}`);
	const body = await res.json();
	const cost = body?.data?.total_cost;
	if (typeof cost !== "number") throw new Error("OpenRouter /generation response had no numeric data.total_cost");
	return cost;
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

/* THE ONE FUNCTION Agents.js and spike.mjs both call for "what did this turn
 * really cost" (review.md findings 2-4, 2026-10-01). Billing settles a few
 * seconds after a turn ends, not the instant it ends — a read taken right at
 * turn-end usually sees last turn's number, or $0 — so this polls instead of
 * reading once:
 *
 *  1. Try `generation_cost(key, message_id)` a few times, a few seconds apart.
 *     Exact, and per-agent (immune to the shared-key mix-up two concurrent
 *     OpenRouter agents would cause — see `key_usage()` above), so it's tried
 *     first whenever a message id is known.
 *  2. If it never resolves (no message id, or the generation record never
 *     showed up), fall back to a before/after `key_usage()` diff — the same
 *     wait has already given billing time to settle.
 *
 * Never throws — a dead network or a still-unsettled charge just means "don't
 * know yet", not "crash the agent"; the caller keeps its last cost. Runs in
 * the background (the caller never awaits it): ~10-20s total, but that time
 * is spent after the turn has already finished, never delaying it. */
export async function real_turn_cost({ key, message_id, usage_before, attempts = 6, interval_ms = 3000 }){
	try {
		// No message id yet (the baseline read before any turn has run, in start()):
		// nothing to poll for, so read once and return — no point waiting ~15s for
		// a generation that was never going to appear.
		if (message_id){
			for (let i = 0; i < attempts; i++){
				const cost = await generation_cost(key, message_id).catch(() => null);
				if (cost != null){
					const usage_now = await key_usage(key).catch(() => usage_before);
					return { cost, usage_now, source: "generation" };
				}
				if (i < attempts - 1) await sleep(interval_ms);
			}
		}
		const usage_now = await key_usage(key);
		if (typeof usage_before !== "number") return { cost: null, usage_now, source: "key_diff" };
		return { cost: Math.max(0, usage_now - usage_before), usage_now, source: "key_diff" };
	} catch { return null; }
}
