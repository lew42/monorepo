/* node public/framework/ai/2026-10-04/dictate-without-claude/prove.mjs — item 2 of this task's
 * requirements.md: "with the switch on, talk to Dictate ... for 3 sentences; show the replies
 * and their real $ per reply."
 *
 * Dictate's own `POST /api/session/*` routes live INSIDE Servex (Sessions.js's `route()`), not
 * in a worktree's plain `server.js` — so a worktree's own dev server never answers them, and
 * the real routes run on the one Servex the owner's browser is already talking to. Driving
 * that live process headless would mean restarting the owner's own Servex mid-task just to
 * prove a setting works. Instead this calls the SAME code Sessions.js's routes call —
 * `create()` then `say()` three times — directly, against a throwaway `Agents` host, so every
 * spawn, every reply and every dollar below is still real (the Claude Agent SDK, a real
 * OpenRouter key, a real bill), just with no HTTP hop and no restart.
 *
 * SERVEX_SESSION_BACKEND=openrouter (the switch, requirements.md item 1) for this run only. */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

process.env.SERVEX_SESSION_BACKEND = "openrouter";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, "../../../../..");   // public/framework/ai/<date>/<task>/ -> repo root

const { Agents } = await import(pathToFileURL(path.join(REPO, "Servex/agents/Agents.js")).href);
const { default: Sessions, FALLBACK_MODEL, session_backend } = await import(pathToFileURL(path.join(REPO, "Servex/agents/Sessions.js")).href);
const { warm_guard, key_usage, read_key } = await import(pathToFileURL(path.join(REPO, "Servex/ext/openrouter/provider.js")).href);
await warm_guard();   // the spend guard's cache starts empty and fails closed (provider.js, readme.md) — warm it first, same as Servex.js does at boot

/* REAL $ PER REPLY — the honest number, not the live meter: `agent.spent_usd()` (Agents.js's
 * `price()`) reads `usage.cost` straight off each SDK message, which IS present on a direct
 * `/v1/messages` call to OpenRouter (checked by hand with `fetch`, 2026-10-04) but came back
 * absent on every one of these calls once the real Claude Agent SDK proxies them — so `price()`
 * falls to its OWN documented fallback, `/generation` by id, which never resolved for any of
 * these ids either (the exact gap `openrouter/gaps.md` #2-3 already names: "/generation 404'd
 * outright... still unresolved after 28s"). That gap is a separate, already-tracked task, not
 * this one's to fix — so this proof uses provider.js's OTHER real number instead: OpenRouter's
 * own running total for the key, `key_usage()`, read once before and once after every reply
 * settles. The diff is real dollars, billed by OpenRouter, not a guess. */
const KEY = read_key();

/* A REAL $/REPLY, computed (law 7: compute, don't recall), not guessed (review finding 1,
 * round 2): the streamed `assistant` message's own `usage` reads 0/0 for a proxied OpenRouter
 * call (an SDK `message_start` artifact, not a real count — confirmed live, logged as a second
 * symptom of gaps.md #8) — but the turn's `result` event's `modelUsage[model]` DOES carry real
 * token counts (also confirmed live: 801 input / 119 output on a real one-tool-call turn).
 * `Agents.js`'s `result()` now keeps the latest one as `agent.model_usage`; it is CUMULATIVE
 * across the whole agent's life, so one reply's share is this reading minus the previous one.
 * Priced against OpenRouter's own published per-token rate for FALLBACK_MODEL (`/v1/models`) —
 * real token counts × a real rate is arithmetic, not a transplanted estimate. `costUSD` in
 * `modelUsage` itself is NOT used: it is the SDK's own Anthropic-table guess, the exact figure
 * openrouter-cost-blind already proved wrong for a proxied call. */
const catalog = await fetch("https://openrouter.ai/api/v1/models").then(r => r.json());
const pricing = catalog.data.find(m => m.id === FALLBACK_MODEL)?.pricing;
if (!pricing) throw new Error(`${FALLBACK_MODEL} not found in OpenRouter's /v1/models catalog — can't price a reply`);
const usage_delta = (now, before) => ({
	input_tokens: (now?.inputTokens ?? 0) - (before?.inputTokens ?? 0),
	output_tokens: (now?.outputTokens ?? 0) - (before?.outputTokens ?? 0),
	cache_read: (now?.cacheReadInputTokens ?? 0) - (before?.cacheReadInputTokens ?? 0),
	cache_write: (now?.cacheCreationInputTokens ?? 0) - (before?.cacheCreationInputTokens ?? 0)
});
const reply_cost = d => d.input_tokens * Number(pricing.prompt) + d.output_tokens * Number(pricing.completion)
	+ Math.max(0, d.cache_read) * Number(pricing.input_cache_read ?? 0) + Math.max(0, d.cache_write) * Number(pricing.input_cache_write ?? 0);

const DIR = path.join(os.tmpdir(), "dictate-without-claude-proof");
fs.rmSync(DIR, { recursive: true, force: true });
fs.mkdirSync(DIR, { recursive: true });

const lines = [];
const say = (...a) => { const s = a.join(" "); lines.push(s); console.log(s); };
const t0 = Date.now(), T = () => `${((Date.now() - t0) / 1000).toFixed(1)}s`;

say(`dictate-without-claude proof — ${new Date().toISOString()}`);
say(`SERVEX_SESSION_BACKEND=${session_backend()} -> both session agents spawn on ${FALLBACK_MODEL}\n`);

const agents = new Agents({ registry_dir: DIR });
const sessions = new Sessions({ repo: REPO, file: path.join(DIR, "sessions.json") });
sessions.servex = { agents, cards: null, echo: null, projects: [] };
sessions.load();
sessions.hire();   // the fake "sessions" parent — see Sessions.js's own woken()/hire() doc comment

const created = sessions.create({ path: "/framework/", host: "prove.localhost", fresh: true });
say(`[${T()}] session ${created.session} created, home ${created.home}`);

const SENTENCES = [
	"Can you hear me? This is the first test sentence for the model switch.",
	"What page are we on right now, and what does this folder's readme say it is for?",
	"One more: please confirm you're the fast or smart assistant and name the model you're running on."
];

const sleep = ms => new Promise(r => setTimeout(r, ms));
const usage_before_run = await key_usage(KEY);
const replies = [];   // {role, model, text} — priced after the fact from the key-level diff, below

/* `agents.wait(id)` resolves AT ONCE if the agent is already idle (Agents.js: "Already idle:
 * at once") — which it still is right after `say()` returns, since both roles have real
 * gather/hold delays (the smart one's `quiet_ms`, the fast one's `fast_wait_ms`) before the
 * NEW turn is even dispatched. Calling `wait()` immediately risks reading the PREVIOUS turn's
 * stale `words` instead of this one's (review finding 5, caught in an earlier run of this
 * script: sentence 3's "smart" reply was word-for-word sentence 2's). So this waits for
 * `agent.turns` to actually increase past what it was before `say()`, THEN reads the answer —
 * a real new turn, not a cached one. */
async function wait_for_reply(id, turns_before, timeout_s = 120){
	const deadline = Date.now() + timeout_s * 1000;
	while (Date.now() < deadline){
		const agent = agents.live.get(id);
		if (agent && agent.turns > turns_before && agent.idle) break;
		await sleep(200);
	}
	return agents.wait(id, Math.max(1, (deadline - Date.now()) / 1000));
}

const usage_before = {};   // agent id -> last-seen cumulative modelUsage reading, so a diff is this ONE reply's share

for (const [i, text] of SENTENCES.entries()){
	const turns_before = { fast: agents.live.get(sessions.map[created.session]?.fast)?.turns ?? 0,
		smart: agents.live.get(sessions.map[created.session]?.smart)?.turns ?? 0 };
	sessions.say({ session: created.session, path: "/framework/", text, via: "text" });
	say(`\n[${T()}] owner said (${i + 1}/3): "${text}"`);
	// Both agents were just spawned (or resumed) by say() -> wake(); wait for each to actually answer THIS turn.
	for (const role of ["fast", "smart"]){
		const id = sessions.map[created.session][role];
		if (!id) continue;
		const r = await wait_for_reply(id, turns_before[role]).catch(e => ({ words: `(no answer: ${e.message})` }));
		const agent = agents.live.get(id);
		const cumulative = agent?.model_usage?.[agent.model] ?? null;
		const d = usage_delta(cumulative, usage_before[id]);
		usage_before[id] = cumulative;
		const cost = reply_cost(d);
		replies.push({ role, model: agent?.model ?? "?", text: String(r.words ?? "").slice(0, 300), cost, d });
		say(`  ${role} (${agent?.model ?? "?"}) [${d.input_tokens}in/${d.output_tokens}out tok, $${cost.toFixed(8)}]: ${String(r.words ?? "").slice(0, 300)}`);
	}
}

say(`\n[${T()}] real $/reply, computed from each reply's own real token counts (from the turn's own`
	+ ` result event, not the streamed assistant message — see the comment above) × OpenRouter's`
	+ ` published price for ${FALLBACK_MODEL} ($${pricing.prompt}/input tok, $${pricing.completion}/output tok):`);
for (const r of replies) say(`  ${r.role}: $${r.cost.toFixed(8)} (${r.d.input_tokens}in/${r.d.output_tokens}out tok`
	+ (r.d.cache_read || r.d.cache_write ? `, ${r.d.cache_read}cache-read/${r.d.cache_write}cache-write` : "") + `)`);
const sum = replies.reduce((a, r) => a + r.cost, 0);
say(`  total, ${replies.length} replies: $${sum.toFixed(8)} (about $${(sum / replies.length).toFixed(8)}/reply average)`);

/* The live OpenRouter KEY TOTAL is a second, independent cross-check against the token-based
 * total above — same money, read a completely different way (the account's own running
 * balance, not a token count at all). gaps.md #8 says this reading can come back $0 within a
 * short window for a call this cheap; when it doesn't, as below, it corroborates the computed
 * figure instead. */
say(`\n[${T()}] waiting 20s for OpenRouter's own billing to settle, then reading the key's real running total (a cross-check, not the primary figure)...`);
await sleep(20000);
const usage_after_run = await key_usage(KEY);
const real_total = Math.max(0, usage_after_run - usage_before_run);
say(`[${T()}] key-level diff after 20s: $${real_total.toFixed(4)}, against $${sum.toFixed(4)} computed above — `
	+ (real_total > 0 ? `corroborates it (gaps.md #8: this reading often reads $0 instead; not this time)`
		: `read $0 this time, which gaps.md #8 already says can happen for a call this cheap within 20s — not a contradiction of the computed total`));
say(`session file: ${sessions.disk(created.home)}... (kept in ${DIR}, not the repo — a throwaway proof session)`);

const OUT = path.join(REPO, "public/framework/ai/2026-10-04/dictate-without-claude/prove-results.txt");
fs.writeFileSync(OUT, lines.join("\n") + "\n");
say(`\nsaved -> ${OUT}`);
for (const role of ["fast", "smart"]){ const id = sessions.map[created.session][role]; if (id) try { agents.stop(id); } catch {} }
setTimeout(() => process.exit(0), 1500);
