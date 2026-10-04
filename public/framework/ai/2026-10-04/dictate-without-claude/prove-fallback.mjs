/* node public/framework/ai/2026-10-04/dictate-without-claude/prove-fallback.mjs — requirements.md
 * item 1's other half: "an automatic fallback when a Claude call is refused for usage limits."
 *
 * Nobody can make the real Claude account actually hit its usage limit on demand, so this
 * simulates the one thing that matters: the exact wake message `Agents.js`'s `wake_parent()`
 * sends on a real refusal — `error: <the agent's last words>` (Agents.js ~line 1215/661) — and
 * proves `Sessions.js`'s `woken()` reacts to it correctly:
 *   1. a normal "done" wake that happens to MENTION "usage limit" must NOT flip the switch
 *      (review finding: a false positive here would move a session to OpenRouter every time
 *      the owner just asks a question about usage limits);
 *   2. a real "error:" refusal DOES flip it, respawns that one role fresh, and re-sends the
 *      owner's last line so the new agent actually answers instead of starting blank.
 * Real spawns throughout (openai/gpt-6-luna, a few cents at most). */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, "../../../../..");

const { Agents } = await import(pathToFileURL(path.join(REPO, "Servex/agents/Agents.js")).href);
const { default: Sessions, FALLBACK_MODEL } = await import(pathToFileURL(path.join(REPO, "Servex/agents/Sessions.js")).href);
const { warm_guard } = await import(pathToFileURL(path.join(REPO, "Servex/ext/openrouter/provider.js")).href);
await warm_guard();

process.env.SERVEX_SESSION_BACKEND = "claude";   // the default — this session starts on Claude

const DIR = path.join(os.tmpdir(), "dictate-without-claude-fallback-proof");
fs.rmSync(DIR, { recursive: true, force: true });
fs.mkdirSync(DIR, { recursive: true });

const lines = [];
const say = (...a) => { const s = a.join(" "); lines.push(s); console.log(s); };

const agents = new Agents({ registry_dir: DIR });
const sessions = new Sessions({ repo: REPO, file: path.join(DIR, "sessions.json") });
sessions.servex = { agents, cards: null, echo: null, projects: [] };
sessions.load();
sessions.hire();

const created = sessions.create({ path: "/framework/", host: "prove.localhost", fresh: true });
const s = sessions.map[created.session];
say(`session ${created.session} created`);

// Fake the plumbing wake() sets up for a real spawn, without spending on one yet.
sessions.by_agent.set("fake-fast-agent", { id: s.id, role: "fast" });
s.fast = "fake-fast-agent";

say(`\n1. a "done" wake that just MENTIONS usage limits:`);
sessions.woken("done: once you hit the usage limit, Claude stops answering", { from: "fake-fast-agent" });
say(`   fallback flag: ${JSON.stringify(s.fallback)} (must be undefined — it was a normal reply, not a refusal)`);

say(`\n2. the owner's line that's about to go unanswered, then the real refusal Claude sends:`);
sessions.write(s, { chat: { at: new Date().toISOString(), session: s.id, path: "/framework/",
	from: { kind: "owner" }, via: "text", text: "what time is it" } });
say(`   owner: "what time is it"`);
sessions.woken("error: Claude AI usage limit reached. Your limit will reset at 3pm.", { from: "fake-fast-agent" });
say(`   (Agents.js's own wake_parent() sends exactly this shape: "error: <the agent's last words>")`);

say(`\nfallback flag: ${JSON.stringify(s.fallback)} (must be {fast:true})`);
say(`session_model(s, "fast") now picks: ${sessions.session_model(s, "fast")} (must be ${FALLBACK_MODEL})`);

/* `woken()`'s respawn + resend is already in flight — `agents.wait()` is the real answer,
 * not the session file: a fast/smart agent's reply only becomes a `chat` LINE through
 * Servex's own event wiring (Agents.watch() -> push()), which this bare harness (no real
 * Servex) never runs. The agent object itself is still the source of truth either way. */
const r = await agents.wait(s.fast, 30).catch(e => ({ words: `(no answer: ${e.message})` }));
say(`\nthe FRESH ${FALLBACK_MODEL} agent's reply to the owner's re-sent line ("what time is it"):\n  "${r.words}"`);
const last = fs.readFileSync(sessions.disk(s.file), "utf8").trim().split("\n").slice(-4);
say(`\nlast lines of the session file (the switch itself IS recorded there, for the owner to see):\n${last.join("\n")}`);

const OUT = path.join(REPO, "public/framework/ai/2026-10-04/dictate-without-claude/prove-fallback-results.txt");
fs.writeFileSync(OUT, lines.join("\n") + "\n");
say(`\nsaved -> ${OUT}`);
try { agents.stop(s.fast); } catch {}
setTimeout(() => process.exit(0), 1000);
