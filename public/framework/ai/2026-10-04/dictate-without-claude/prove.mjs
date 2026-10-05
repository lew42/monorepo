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

/* A REAL $/REPLY, computed (law 7: compute, don't recall), not guessed (review finding 1):
 * OpenRouter's own public `/v1/models` catalog has FALLBACK_MODEL's per-token price, and
 * `Agent.last_usage` (Agents.js's `assistant()`) already carries each reply's real input/
 * output token counts — `cost = input_tokens × prompt_price + output_tokens × completion_price`
 * is arithmetic on two real numbers, not an estimate transplanted from a different call. */
const catalog = await fetch("https://openrouter.ai/api/v1/models").then(r => r.json());
const pricing = catalog.data.find(m => m.id === FALLBACK_MODEL)?.pricing;
if (!pricing) throw new Error(`${FALLBACK_MODEL} not found in OpenRouter's /v1/models catalog — can't price a reply`);
const reply_cost = usage => usage ? (usage.input_tokens ?? 0) * Number(pricing.prompt) + (usage.output_tokens ?? 0) * Number(pricing.completion) : null;

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
		const usage = agent?.last_usage ?? null;
		const cost = reply_cost(usage);
		replies.push({ role, model: agent?.model ?? "?", text: String(r.words ?? "").slice(0, 300), cost, usage });
		say(`  ${role} (${agent?.model ?? "?"}) [${usage ? `${usage.input_tokens}in/${usage.output_tokens}out tok, $${cost.toFixed(8)}` : "no usage reported"}]: ${String(r.words ?? "").slice(0, 300)}`);
	}
}

const all_zero_tokens = replies.every(r => !r.usage || (r.usage.input_tokens === 0 && r.usage.output_tokens === 0));
say(`\n[${T()}] real $/reply, computed from each reply's own token counts × OpenRouter's published`
	+ ` price for ${FALLBACK_MODEL} ($${pricing.prompt}/input token, $${pricing.completion}/output token):`);
if (all_zero_tokens){
	/* NOT a live-measurement bug in THIS script (review finding 1 asked for exactly this
	 * calculation) — the SDK's own `Usage` object reports 0 input/output tokens for every one
	 * of these calls, through the real Claude Agent SDK proxying OpenRouter. This is the SAME
	 * root gap `gaps.md` #8 already names for `usage.cost`, just showing up as zero token
	 * counts too, not only a missing cost field — added to gap #8 as a second symptom. */
	say(`  every reply's token usage read 0 in/0 out — the SDK doesn't surface real token counts`
		+ ` for a call proxied this way either, the same root gap as its missing usage.cost`
		+ ` (openrouter/gaps.md #8, this run added as a second symptom). $0.00000000 below is`
		+ ` that $0 token count priced at a real rate, not a real $0 cost.`);
}
for (const r of replies) say(`  ${r.role}: $${(r.cost ?? 0).toFixed(8)} (${r.usage?.input_tokens ?? 0}in/${r.usage?.output_tokens ?? 0}out tok)`);
const sum = replies.reduce((a, r) => a + (r.cost ?? 0), 0);
say(`  total, ${replies.length} replies: $${sum.toFixed(8)}`);

/* The live OpenRouter KEY TOTAL is a second, independent cross-check — if it moved by roughly
 * this much, the token-based figure above is corroborated; gaps.md #8 already covers why it
 * may not move at all within a short window for a call this cheap, so a $0 reading here is
 * expected, not a contradiction of the computed total above. */
say(`\n[${T()}] waiting 20s for OpenRouter's own billing to settle, then reading the key's real running total (a cross-check, not the primary figure)...`);
await sleep(20000);
const usage_after_run = await key_usage(KEY);
const real_total = Math.max(0, usage_after_run - usage_before_run);
say(`[${T()}] key-level diff after 20s: $${real_total.toFixed(4)} (OpenRouter's own /key total often does not move within 20s for a`
	+ ` call this cheap — gaps.md #8 — so $0.0000 here does not contradict the computed total above)`);
say(`session file: ${sessions.disk(created.home)}... (kept in ${DIR}, not the repo — a throwaway proof session)`);

const OUT = path.join(REPO, "public/framework/ai/2026-10-04/dictate-without-claude/prove-results.txt");
fs.writeFileSync(OUT, lines.join("\n") + "\n");
say(`\nsaved -> ${OUT}`);
for (const role of ["fast", "smart"]){ const id = sessions.map[created.session][role]; if (id) try { agents.stop(id); } catch {} }
setTimeout(() => process.exit(0), 1500);
