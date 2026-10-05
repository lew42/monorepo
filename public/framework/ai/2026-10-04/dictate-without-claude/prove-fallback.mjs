/* node public/framework/ai/2026-10-04/dictate-without-claude/prove-fallback.mjs — requirements.md
 * item 1's other half: "an automatic fallback when a Claude call is refused for usage limits."
 *
 * Nobody can make the real Claude account actually hit its usage limit on demand, so this
 * simulates the two shapes a real refusal actually arrives in (Agents.js's own `emit()` and
 * `wake_parent()`, traced for review round 7):
 *   1. a normal "done" wake that happens to MENTION "usage limit" must NOT flip the switch —
 *      a false positive here would move a session to OpenRouter every time the owner just
 *      asks a question about usage limits.
 *   2. THE REAL CASE: a session agent is never `one_shot`, so a refused turn still wakes as
 *      `done: <whatever it said before the refusal>` — Agents.js never sends `error:` for this.
 *      The actual reason lives on the live agent's own `last_error`. `woken()` must check that
 *      too, or the whole fallback never fires on a real cutoff (review round 7, finding 1).
 *   3. the RARE case Agents.js does send a real `error:` wake for (a session-level crash, not
 *      a refused turn) — kept working, and the one that respawns + resends for real below.
 * Real spawns throughout (openai/gpt-6-luna, a few cents at most). */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, "../../../../..");

const DIR = path.join(os.tmpdir(), "dictate-without-claude-fallback-proof");
fs.rmSync(DIR, { recursive: true, force: true });
fs.mkdirSync(DIR, { recursive: true });

/* The real refusal below is SUPPOSED to write `SESSION_BACKEND_PATH` (review finding 6: one
 * refusal should flip every future session too) — real behaviour, worth proving, but a test
 * must never touch the one file the OWNER's own live Servex reads. Point it at a throwaway
 * file instead (review finding 6's fix: `SESSION_BACKEND_PATH` reads this env var first). */
process.env.SERVEX_SESSION_BACKEND_PATH = path.join(DIR, "session-backend.txt");
process.env.SERVEX_SESSION_BACKEND = "claude";   // the default — every session below starts on Claude

const { Agents } = await import(pathToFileURL(path.join(REPO, "Servex/agents/Agents.js")).href);
const { default: Sessions, FALLBACK_MODEL, SESSION_BACKEND_PATH } = await import(pathToFileURL(path.join(REPO, "Servex/agents/Sessions.js")).href);
const { warm_guard } = await import(pathToFileURL(path.join(REPO, "Servex/ext/openrouter/provider.js")).href);
await warm_guard();

const lines = [];
const say = (...a) => { const s = a.join(" "); lines.push(s); console.log(s); };

const agents = new Agents({ registry_dir: DIR });
const sessions = new Sessions({ repo: REPO, file: path.join(DIR, "sessions.json") });
sessions.servex = { agents, cards: null, echo: null, projects: [] };
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
say(`1. a "done" wake that just MENTIONS usage limits:`);
const s1 = fresh_session("case1");
sessions.woken("done: once you hit the usage limit, Claude stops answering", { from: "fake-case1" });
say(`   fallback flag: ${JSON.stringify(s1.fallback)} (must be undefined — it was a normal reply, not a refusal)\n`);

/* Each of cases 2 and 3 deletes `session-backend.txt` first (review finding 6's own real
 * design is that ONE refusal flips it for good — so whichever case runs first will leave it
 * written, and the next one would otherwise see the global setting already "openrouter" and
 * correctly find nothing left to fall back FROM for its own brand-new session). Deleting it
 * isolates each case from the others; a real cutoff on the live site only ever has ONE order. */
// ── 2. the rare real error: wake — respawn + resend, for real ──────────────
say(`2. the rare session-crash shape Agents.js DOES send as "error:" — the one that actually`);
say(`   respawns and re-sends the owner's line below:`);
fs.rmSync(SESSION_BACKEND_PATH, { force: true });
const s2 = fresh_session("case2");
sessions.write(s2, { chat: { at: new Date().toISOString(), session: s2.id, path: "/framework/",
	from: { kind: "owner" }, via: "text", text: "what time is it" } });
say(`   owner: "what time is it"`);
sessions.woken("error: Claude AI usage limit reached. Your limit will reset at 3pm.", { from: "fake-case2" });

await new Promise(r => setImmediate(r));   // woken() defers its respawn one tick (review finding 4); let it run first
await new Promise(r => setTimeout(r, 300));

say(`   fallback flag: ${JSON.stringify(s2.fallback)} (must be {fast:true})`);
say(`   session_model(s, "fast") now picks: ${sessions.session_model(s2, "fast")} (must be ${FALLBACK_MODEL})`);

/* `woken()`'s respawn + resend is already in flight — `agents.wait()` is the real answer,
 * not the session file: a fast/smart agent's reply only becomes a `chat` LINE through
 * Servex's own event wiring (Agents.watch() -> push()), which this bare harness (no real
 * Servex) never runs. The agent object itself is still the source of truth either way. */
const r = await agents.wait(s2.fast, 30).catch(e => ({ words: `(no answer: ${e.message})` }));
say(`\n   the FRESH ${FALLBACK_MODEL} agent's reply to the owner's re-sent line ("what time is it"):\n     "${r.words}"`);
const last = fs.readFileSync(sessions.disk(s2.file), "utf8").trim().split("\n").slice(-4);
say(`\n   last lines of this session's file (the switch itself IS recorded there, for the owner to see):\n${last.join("\n")}`);

// ── 3. THE REAL CASE: done: wake, real reason only on last_error ───────────
say(`\n3. THE REAL CASE — a refused turn wakes as "done:", with the actual reason only on the live`);
say(`   agent's own last_error (what Agents.js's result() actually does for a non-one_shot agent):`);
fs.rmSync(SESSION_BACKEND_PATH, { force: true });
const s3 = fresh_session("case3");
agents.live.set("fake-case3", { id: "fake-case3", last_error: "Claude AI usage limit reached. Your limit will reset at 3pm." });
sessions.woken("done: here is an unrelated answer the agent gave just before being refused", { from: "fake-case3" });
say(`   fallback flag: ${JSON.stringify(s3.fallback)} (must be {fast:true} — this is the fix for review round 7, finding 1)`);

const OUT = path.join(REPO, "public/framework/ai/2026-10-04/dictate-without-claude/prove-fallback-results.txt");
fs.writeFileSync(OUT, lines.join("\n") + "\n");
say(`\nsaved -> ${OUT}`);
await new Promise(r => setTimeout(r, 1500));   // case 3's own woken() respawn is also in flight (setImmediate) — let it finish before stopping it
for (const s of [s2, s3]) try { agents.stop(s.fast); } catch {}
setTimeout(() => process.exit(0), 500);
