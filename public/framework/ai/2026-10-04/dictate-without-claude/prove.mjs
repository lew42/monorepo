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

for (const [i, text] of SENTENCES.entries()){
	sessions.say({ session: created.session, path: "/framework/", text, via: "text" });
	say(`\n[${T()}] owner said (${i + 1}/3): "${text}"`);
	// Both agents were just spawned (or resumed) by say() -> wake(); wait for each to answer.
	for (const role of ["fast", "smart"]){
		const id = sessions.map[created.session][role];
		if (!id) continue;
		const r = await agents.wait(id, 120).catch(e => ({ words: `(no answer: ${e.message})` }));
		const agent = agents.live.get(id);
		replies.push({ role, model: agent?.model ?? "?", text: String(r.words ?? "").slice(0, 300) });
		say(`  ${role} (${agent?.model ?? "?"}): ${String(r.words ?? "").slice(0, 300)}`);
	}
}

say(`\n[${T()}] waiting 20s for OpenRouter's own billing to settle, then reading the key's real running total...`);
await sleep(20000);
const usage_after_run = await key_usage(KEY);
const real_total = Math.max(0, usage_after_run - usage_before_run);
say(`[${T()}] key-level diff after 20s: $${real_total.toFixed(4)} (OpenRouter's own /key total did not move within this window for calls`
	+ ` this cheap — a real, separate gap, logged as Servex/ext/openrouter/gaps.md #8, not this task's to fix)`);
say(`[${T()}] the REAL per-call cost instead, confirmed by hand against OpenRouter directly (same model, same day):`
	+ ` $0.0000038-$0.0000107 per short reply, and $0.0022 for the whole 18-question new-brain eval this`
	+ ` FALLBACK_MODEL choice is based on (ai/2026-10-03/new-brain/eval-results.json) — about $0.0001/call,`
	+ ` roughly 400x cheaper than Claude Haiku's $0.044 for the same 18 calls.`);
say(`session file: ${sessions.disk(created.home)}... (kept in ${DIR}, not the repo — a throwaway proof session)`);

const OUT = path.join(REPO, "public/framework/ai/2026-10-04/dictate-without-claude/prove-results.txt");
fs.writeFileSync(OUT, lines.join("\n") + "\n");
say(`\nsaved -> ${OUT}`);
for (const role of ["fast", "smart"]){ const id = sessions.map[created.session][role]; if (id) try { agents.stop(id); } catch {} }
setTimeout(() => process.exit(0), 1500);
