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

/* `true` the cheap way — no key read, no throw — for a caller (Agents.js'
 * `door()`) that just wants to know whether to bother. */
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

/* OpenRouter's running total for this key, in dollars — goes up by exactly
 * what a turn cost once that turn's billing settles (usually within a few
 * seconds; occasionally longer under load, per OpenRouter's docs). */
export async function key_usage(key){
	const res = await fetch("https://openrouter.ai/api/v1/key", { headers: { Authorization: `Bearer ${key}` } });
	if (!res.ok) throw new Error(`OpenRouter /key returned ${res.status}`);
	const body = await res.json();
	const usage = body?.data?.usage;
	if (typeof usage !== "number") throw new Error("OpenRouter /key response had no numeric data.usage");
	return usage;
}

/* The per-turn cost OpenRouter itself computed for one generation id. Use this
 * when the SDK's assistant `message.id` turns out to BE the OpenRouter
 * generation id (spike.mjs checks this once, live); otherwise fall back to a
 * before/after `key_usage()` diff, which works regardless. */
export async function generation_cost(key, id){
	const res = await fetch(`https://openrouter.ai/api/v1/generation?id=${encodeURIComponent(id)}`,
		{ headers: { Authorization: `Bearer ${key}` } });
	if (!res.ok) throw new Error(`OpenRouter /generation returned ${res.status}`);
	const body = await res.json();
	const cost = body?.data?.total_cost;
	if (typeof cost !== "number") throw new Error("OpenRouter /generation response had no numeric data.total_cost");
	return cost;
}

/* The one function Agents.js calls: "what did this turn really cost", given
 * the key-usage dollar figure read just before the turn started. Never
 * throws — a failed lookup (network hiccup, billing not settled yet) means
 * "don't know yet", not "crash the agent"; the caller keeps its last cost. */
export async function real_cost({ key, usage_before }){
	try {
		const now = await key_usage(key);
		return Math.max(0, now - usage_before);
	} catch { return null; }
}
