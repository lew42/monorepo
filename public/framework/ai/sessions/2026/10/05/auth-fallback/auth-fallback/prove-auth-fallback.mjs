/* node public/framework/ai/sessions/2026/10/05/auth-fallback/auth-fallback/prove-auth-fallback.mjs — requirements.md
 * item 3: "Prove with a stubbed auth error."
 *
 * Nobody can make the real Claude login actually expire on demand, so this stubs the shape a
 * real auth failure arrives in, the same way prove-fallback.mjs (2026-10-04) stubbed a usage
 * refusal: `last_error` carrying the CLI's own words, read off the live agent by `woken()`
 * (Sessions.js's `result()` trace, Agents.js).
 *
 *   1. a false positive must NOT fire — the owner just asking "why did Claude log me out
 *      yesterday" is a normal reply, not a refusal.
 *   2. THE REAL CASE — a refused turn wakes as "done:", the actual reason only on last_error
 *      ("Invalid API key · Please run /login"). Must flip this role to FALLBACK_MODEL, post the
 *      "Claude logged out" line into the session, and post exactly ONE card to the AI inbox.
 *   3. a SECOND session's auth failure in the same run must NOT post a second card — "once,
 *      not per call" (requirements.md item 2).
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, "../../../../..");

const DIR = path.join(os.tmpdir(), "auth-fallback-proof");
fs.rmSync(DIR, { recursive: true, force: true });
fs.mkdirSync(DIR, { recursive: true });

// never touch the real session-backend.txt or the real ai/ cards tree
process.env.SERVEX_SESSION_BACKEND_PATH = path.join(DIR, "session-backend.txt");
process.env.SERVEX_SESSION_BACKEND = "claude";

const { Agents } = await import(pathToFileURL(path.join(REPO, "Servex/agents/Agents.js")).href);
const { default: Sessions, FALLBACK_MODEL, SESSION_BACKEND_PATH } = await import(pathToFileURL(path.join(REPO, "Servex/agents/Sessions.js")).href);
const { default: Cards } = await import(pathToFileURL(path.join(REPO, "Servex/cards/Cards.js")).href);

const lines = [];
const say = (...a) => { const s = a.join(" "); lines.push(s); console.log(s); };

const agents = new Agents({ registry_dir: DIR });
const cards_root = path.join(DIR, "ai");   // a scratch cards tree — never the real public/framework/ai
fs.mkdirSync(cards_root, { recursive: true });
const cards = new Cards({ agents, root: cards_root });
const sessions = new Sessions({ repo: REPO, file: path.join(DIR, "sessions.json") });
sessions.servex = { agents, cards, echo: null, projects: [] };
sessions.load();
sessions.hire();

function fresh_session(tag){
	const created = sessions.create({ path: "/framework/", host: `prove-${tag}.localhost`, fresh: true });
	const s = sessions.map[created.session];
	sessions.by_agent.set(`fake-${tag}`, { id: s.id, role: "fast" });
	s.fast = `fake-${tag}`;
	return s;
}

// ── 1. a false positive must not fire ───────────────────────────────────────
say(`1. a "done" wake that just MENTIONS logging out:`);
const s1 = fresh_session("case1");
sessions.woken("done: Claude logged you out yesterday because the laptop slept", { from: "fake-case1" });
say(`   fallback flag: ${JSON.stringify(s1.fallback)} (must be undefined — it was a normal reply, not a refusal)\n`);

// ── 2. THE REAL CASE: an auth failure on last_error ─────────────────────────
say(`2. THE REAL CASE — a refused turn wakes as "done:", the actual reason only on the live`);
say(`   agent's own last_error (an expired login / invalid key):`);
const s2 = fresh_session("case2");
sessions.write(s2, { chat: { at: new Date().toISOString(), session: s2.id, path: "/framework/",
	from: { kind: "owner" }, via: "text", text: "what time is it" } });
say(`   owner: "what time is it"`);
agents.live.set("fake-case2", { id: "fake-case2", last_error: "Invalid API key · Please run /login" });
sessions.woken("done: here is an unrelated answer the agent gave just before being refused", { from: "fake-case2" });

await new Promise(r => setImmediate(r));
await new Promise(r => setTimeout(r, 300));

say(`   fallback flag: ${JSON.stringify(s2.fallback)} (must be {fast:true})`);
say(`   session_model(s, "fast") now picks: ${sessions.session_model(s2, "fast")} (must be ${FALLBACK_MODEL})`);
const last = fs.readFileSync(sessions.disk(s2.file), "utf8").trim().split("\n").slice(-4);
say(`\n   last lines of this session's file (the owner's own notice):\n${last.join("\n")}`);

await new Promise(r => setTimeout(r, 300));   // let the card creation promise land
const list1 = await cards.list({ view: "all" });
say(`\n   cards after case 2: ${list1.length} (must be 1 — "Claude logged out — answering on OpenRouter")`);
say(`   card title: ${list1[0]?.title}`);

// ── 3. a second auth failure in the same run must not post a second card ───
// Isolated from case 2 the same way prove-fallback.mjs isolates its own cases: delete the
// global flip first, so this session is still independently "on Claude" and would otherwise
// fall back on its own — the only thing under test is the CARD, which must not repeat.
say(`\n3. a SECOND session's auth failure, same run — must NOT post a second card ("once, not per call"):`);
fs.rmSync(SESSION_BACKEND_PATH, { force: true });
const s3 = fresh_session("case3");
agents.live.set("fake-case3", { id: "fake-case3", last_error: "unauthorized (401)" });
sessions.woken("done: unrelated reply", { from: "fake-case3" });
await new Promise(r => setTimeout(r, 300));
say(`   fallback flag: ${JSON.stringify(s3.fallback)} (must be {fast:true} — it still falls back)`);
const list2 = await cards.list({ view: "all" });
say(`   cards after case 3: ${list2.length} (must still be 1 — no second card)`);

const OUT = path.join(REPO, "public/framework/ai/sessions/2026/10/05/auth-fallback/auth-fallback/prove-auth-fallback-results.txt");
fs.writeFileSync(OUT, lines.join("\n") + "\n");
say(`\nsaved -> ${OUT}`);
for (const s of [s2, s3]) try { agents.stop(s.fast); } catch {}
setTimeout(() => process.exit(0), 500);
