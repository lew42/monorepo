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
import { fileURLToPath } from "node:url";

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

/* The same `GET /key` call, but the four fields the spend guard needs (owner's
 * $50-credit brief, Phase 2, 2026-10-01): `usage` (all-time total, key_usage()'s
 * own number), `usage_daily` (today's spend — OpenRouter resets this itself at
 * UTC midnight), `limit` (the key's hard ceiling, $100, no reset) and
 * `limit_remaining` (credits actually left, $50 to start). Any of the three new
 * fields coming back non-numeric is read as "not reported", not an error —
 * `evaluate_guard()` below treats a missing field as "can't rule it out". */
export async function key_status(key){
	const res = await fetch("https://openrouter.ai/api/v1/key", { headers: { Authorization: `Bearer ${key}` } });
	if (!res.ok) throw new Error(`OpenRouter /key returned ${res.status}`);
	const body = await res.json();
	const d = body?.data ?? {};
	if (typeof d.usage !== "number") throw new Error("OpenRouter /key response had no numeric data.usage");
	const num = v => typeof v === "number" ? v : null;
	return { usage: d.usage, usage_daily: num(d.usage_daily), usage_weekly: num(d.usage_weekly), limit: num(d.limit), limit_remaining: num(d.limit_remaining) };
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
export async function real_turn_cost({ key, message_id, message_ids, usage_before, attempts = 8, interval_ms = 3000 }){
	/* A turn is usually MANY model calls (a review: 45), each its own generation —
	 * so its cost is the SUM over every assistant message id in the turn, not the
	 * last one (cross-family review, 2026-10-01: the last-id-only figure undercounted). */
	const ids = [...new Set([...(message_ids ?? []), ...(message_id ? [message_id] : [])])];
	const costs = new Map();
	/* No model calls, no cost. The key-total diff below is the WHOLE key's spend since
	 * this agent's last reading, so for a turn with no calls of its own (a start(), a
	 * wake) it was every OTHER agent's spend: ~$2.84 of a GPT mastermind's turn was
	 * booked to an idle free-model minion this way (2026-10-01). */
	if (!ids.length){
		const usage_now = await key_usage(key).catch(() => null);
		return { cost: 0, usage_now, source: "no_calls", calls: 0 };
	}
	try {
		for (let i = 0; ids.length && i < attempts; i++){
			await Promise.all(ids.filter(id => !costs.has(id)).map(async id => {
				const c = await generation_cost(key, id).catch(() => null);
				if (c != null) costs.set(id, c);
			}));
			if (costs.size === ids.length) break;
			if (i < attempts - 1) await sleep(interval_ms);
		}
		const usage_now = await key_usage(key).catch(() => null);
		if (ids.length && costs.size === ids.length)
			return { cost: [...costs.values()].reduce((a, b) => a + b, 0), usage_now, source: "generation", calls: ids.length };
		if (typeof usage_before !== "number" || typeof usage_now !== "number") return { cost: null, usage_now, source: "key_diff", calls: ids.length };
		return { cost: Math.max(0, usage_now - usage_before), usage_now, source: "key_diff", calls: ids.length };
	} catch { return null; }
}

/* THE SPEND GUARD (requirements.md Phase 2, item 1 — the owner's $50 OpenRouter
 * credit, 2026-10-01: "it could easily go in a day if we're careless").
 * `Agents.spawn()` needs a yes/no answer SYNCHRONOUSLY, once per spawn, with no
 * network call on the hot path — so the real `/key` read happens on a 30s
 * background timer, and spawn() only ever reads whatever that timer last found. */
/* THE PACE (owner, Phases 7-8, 2026-10-01): the monthly OpenRouter budget ÷ 4 is the
 * week's budget, metered like the Claude windows. Spend may run at most one day ahead
 * of the clock: used ≤ week × (elapsed + 1/7). It's a pace, not a wall: raise
 * SERVEX_OR_MONTHLY_USD when a model earns it. OpenRouter resets usage_weekly on
 * Monday 00:00 UTC. The daily cap is only a runaway backstop, so one bad day can't
 * empty the week. */
export const OR_MONTHLY_USD = Number(process.env.SERVEX_OR_MONTHLY_USD) || 50;
export const OR_WEEKLY_CAP_USD = OR_MONTHLY_USD / 4;
export const OR_DAILY_CAP_USD = Number(process.env.SERVEX_OR_DAILY_CAP) || OR_WEEKLY_CAP_USD / 2;

/* AN AUTHORISED BURST (owner, 2026-10-01): env vars only reach Servex through the keeper,
 * which a `--restart` never restarts, so a one-off raise lives in a file beside the key,
 * re-read on every guard check: {"extra_usd": 10, "until": "<ISO>", "why": "..."}. It adds
 * `extra_usd` to both today's cap and this week's allowed spend, and stops counting by
 * itself at `until` — nobody has to remember to undo it. */
export const OR_BURST_PATH = path.join(path.dirname(KEY_PATH), "openrouter-burst.json");
export function burst_usd(now = Date.now()){
	try {
		const b = JSON.parse(fs.readFileSync(OR_BURST_PATH, "utf8"));
		return now < Date.parse(b.until) ? Math.max(0, Number(b.extra_usd) || 0) : 0;
	} catch { return 0; }
}
const WEEK_MS = 7 * 86400e3;
/* How far into the OpenRouter week (from Monday 00:00 UTC), 0..1. */
export function week_elapsed(now = Date.now()){
	const d = new Date(now);
	const monday = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
	return Math.min(1, (now - monday) / WEEK_MS);
}
const OR_GUARD_CACHE_MS = 30_000;
let or_guard_status = null;       // last successful key_status() reading
let or_guard_checked_at = 0;

/* The snapshot the dashboard reads (ext/AITask/dashboard.js merges this into the
 * same usage_rail() meter the Claude session/weekly windows already use — one
 * component, not a second one). Written next to usage.json so both live under
 * the same "ai" directory a reader already knows to look in. */
const USAGE_SNAPSHOT = path.join(fileURLToPath(new URL(".", import.meta.url)),
	"../../../public/framework/ai/openrouter-usage.json");

function write_usage_snapshot(status){
	try {
		if (!status) return;   // a failed read leaves the last good snapshot up, not a blank one
		const midnight = new Date(); midnight.setUTCHours(24, 0, 0, 0);   // OpenRouter resets usage_daily at UTC midnight
		const monday = new Date(midnight); monday.setUTCDate(monday.getUTCDate() + ((8 - monday.getUTCDay()) % 7));
		const pct = (used, cap) => typeof used === "number" ? Math.round(used / cap * 100) : 0;
		const snapshot = { utilization: { limits: [{
			kind: "openrouter_weekly", group: "weekly", percent: pct(status.usage_weekly, OR_WEEKLY_CAP_USD), resets_at: monday.toISOString(),
			usage_weekly: status.usage_weekly, cap: OR_WEEKLY_CAP_USD, monthly: OR_MONTHLY_USD, usage_daily: status.usage_daily
		}] },
		// The balance itself (owner, 2026-10-03: "a local file that's always up to date with the OpenRouter
		// balance, so any minion can read it"). Real dollars, from /key, refreshed every 30 s.
		balance: { used_total: status.usage, limit: status.limit, remaining: status.limit_remaining, at: new Date().toISOString() } };
		fs.mkdirSync(path.dirname(USAGE_SNAPSHOT), { recursive: true });
		fs.writeFileSync(USAGE_SNAPSHOT, JSON.stringify(snapshot, null, 2));
	} catch {}   // the dashboard just keeps showing the last snapshot — never worth crashing over
}

async function refresh_or_guard(){
	try { or_guard_status = await key_status(read_key()); }
	catch { or_guard_status = null; }   // FAILS CLOSED: no reading = every openrouter spawn refused
	or_guard_checked_at = Date.now();
	write_usage_snapshot(or_guard_status);
}

/* LAZY on purpose: merely IMPORTING this module (which Agents.js does always,
 * so every Servex test that imports Agents.js does too) must never fire a real
 * network call. The 30s timer only starts the first time something actually
 * asks `spend_guard()` a question — i.e. the first real openrouter spawn
 * attempt — and `.unref()`'d so it can never be the reason a short-lived
 * script (spike.mjs, a test) stays alive after its own work is done. */
let or_guard_timer = null;
function ensure_or_guard_timer(){
	if (or_guard_timer) return;
	or_guard_timer = setInterval(refresh_or_guard, OR_GUARD_CACHE_MS);
	or_guard_timer.unref();
}

/* The decision itself, pulled out as a PURE function (no network, no cache,
 * no clock) so it can be tested directly against a made-up reading instead of
 * a live OpenRouter account. `cap` defaults to the module's own
 * `OR_DAILY_CAP_USD` but takes an override for a test's own numbers. */
export function evaluate_guard(status, cap = OR_DAILY_CAP_USD, weekly_cap = OR_WEEKLY_CAP_USD, elapsed = week_elapsed(), extra = 0){
	if (!status) return { ok: false,
		reason: "OpenRouter spend can't be checked right now (no key, or the last /key read failed) — retry in a few seconds" };
	if (typeof status.usage_daily === "number" && status.usage_daily >= cap)
		return { ok: false, reason: `today's OpenRouter spend ($${status.usage_daily.toFixed(2)}) is at or over the $${cap}/day cap` };
	const allowed = weekly_cap * Math.min(1, elapsed + 1 / 7) + extra;
	if (typeof status.usage_weekly === "number" && status.usage_weekly >= allowed)
		return { ok: false, reason: `this week's OpenRouter spend ($${status.usage_weekly.toFixed(2)}) is ahead of pace: $${allowed.toFixed(2)} of the $${weekly_cap}/week budget is allowed by now (one day ahead of the clock; resets Monday 00:00 UTC)` };
	if (typeof status.limit_remaining === "number" && status.limit_remaining < 1)
		return { ok: false, reason: `OpenRouter credit left ($${status.limit_remaining.toFixed(2)}) is under $1` };
	return { ok: true, reason: null };
}

/* What `Agents.spawn()` actually calls: the cached reading, evaluated. Starts
 * the background timer on first call; a stale cache (>30s old, including "no
 * reading yet" on the very first call ever) also kicks an immediate refresh
 * for the NEXT call to see — this call still answers from whatever is cached
 * right now (failing closed if that's nothing), so a spawn is never slowed
 * down waiting on the network. */
export function spend_guard(){
	ensure_or_guard_timer();
	if (Date.now() - or_guard_checked_at > OR_GUARD_CACHE_MS) refresh_or_guard();
	const extra = burst_usd();
	return evaluate_guard(or_guard_status, OR_DAILY_CAP_USD + extra, OR_WEEKLY_CAP_USD, week_elapsed(), extra);
}

/* WARMING THE GUARD AT BOOT (review follow-up, 2026-10-01): without this, the
 * first openrouter spawn after every Servex restart finds an empty cache
 * (`or_guard_status` starts `null`) and fails closed — correct behavior, but
 * needlessly so, since nothing has actually gone wrong. `Agents.spawn()` stays
 * synchronous on purpose (a dozen-plus callers across the codebase call it
 * without `await`, so making it async is the "major surgery" CLAUDE.md says to
 * ask before, not a one-line fix) — so instead of making spawn() wait on a
 * live read, Servex's own startup calls this ONCE, before any agent could
 * possibly spawn, so the cache is already warm by the time a spawn needs it.
 *
 * A no-op with no key file (nothing to read, and `read_key()` would just throw
 * inside `refresh_or_guard` — harmless, but there's no reason to make a doomed
 * network attempt on every boot of every worktree that happens not to have the
 * owner's real key). If the read itself fails (network down, bad key, etc.)
 * the cache stays `null` and the FIRST real spawn attempt still fails closed,
 * now with the "retry in a few seconds" reason `evaluate_guard()` gives a null
 * status — exactly the fallback the review asked for when spawn() can't await. */
export async function warm_guard(){
	if (!has_key()) return;
	ensure_or_guard_timer();
	await refresh_or_guard();
}
