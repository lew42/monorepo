/* node Servex/agents/wake-proof.mjs — a STOPPED agent answers a message.
 *
 * An idle agent holds ~250 MB, so the goal is that any idle agent can be
 * stopped at no cost. This shows why it can: a message to a stopped agent
 * reopens its session (same id, `resume`, its recorded spec) and is answered
 * with everything it knew before.
 *
 *   1. host A spawns a Haiku agent, which learns a word and finishes its turn.
 *      Its session id is in the registry BEFORE its first turn starts.
 *   2. host A stops it. `agent.send()` on the stopped instance still throws.
 *   3. `host.send(id, …)` wakes it: it answers with the word.
 *   4. It is stopped again, and a brand-new host B, which has only the
 *      registry row, sends it a message. It answers again.
 *
 * Its own registry dir in the OS temp dir. Saves its output to
 * public/framework/ai/2026-09-24/concurrency/wake-proof.txt. */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Agents } from "./Agents.js";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const OUT = process.env.PROOF_OUT ?? path.join(REPO, "public/framework/ai/2026-09-24/concurrency/wake-proof.txt");
const DIR = path.join(os.tmpdir(), "servex-wake-proof");
const HAIKU = "claude-haiku-4-5-20251001";

const lines = [];
const say = (...a) => { const s = a.join(" "); lines.push(s); console.log(s); };
const t0 = Date.now(), T = () => `${((Date.now() - t0) / 1000).toFixed(1)}s`;
const row = id => JSON.parse(fs.readFileSync(path.join(DIR, "registry.json"), "utf8"))[id];

fs.rmSync(DIR, { recursive: true, force: true });
say(`wake-proof — ${new Date().toISOString()} — ${HAIKU}\n`);

const a = new Agents({ registry_dir: DIR });
const agent = a.spawn({ role: "proof", name: "sleeper", model: HAIKU, effort: "low", setting_sources: [],
	allowed_tools: [], prompt: "Remember this word for later: ZEBRA-42. Reply only: OK." });
say(`[${T()}] spawned ${agent.id}; registry session_id before its first turn: ${row(agent.id).session_id ?? "none"}`);
let r = await a.wait(agent.id, 120);
say(`[${T()}] it said: ${r.words} · session from the SDK: ${agent.session_id} (${agent.session_id === row(agent.id).session_id ? "the one we minted" : "DIFFERENT"})`);

a.stop(agent.id);
say(`[${T()}] stopped it. state: ${a.live.get(agent.id).state}`);
try { agent.send("hello?"); say("  agent.send() on the stopped instance did NOT throw — wrong"); }
catch (e){ say(`  agent.send() on the stopped instance still throws: "${e.message}"`); }

a.send(agent.id, "What word did I ask you to remember? Answer with just the word.", { from: "proof" });
r = await a.wait(agent.id, 120);
const first = r.words;
const woke = a.live.get(agent.id);
say(`[${T()}] host A sent it a message → woken as ${woke.id} (resumed_from ${woke.resumed_from}); it answered: ${r.words}`);
a.stop(agent.id);

const b = new Agents({ registry_dir: DIR });
say(`\n[${T()}] host B: a new host, nothing live, registry row state "${row(agent.id).state}", spec ${JSON.stringify(row(agent.id).spec)}`);
b.send(agent.id, "One more time: what was the word? Just the word.", { from: "proof" });
r = await b.wait(agent.id, 120);
say(`[${T()}] host B woke ${agent.id} from the registry row alone; it answered: ${r.words}`);
b.stop(agent.id);

say(`\nboth answers name the word: host A ${/ZEBRA-42/.test(first)}, host B ${/ZEBRA-42/.test(r.words)} · total ${T()}`);
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, lines.join("\n") + "\n");
console.log(`saved → ${OUT}`);
setTimeout(() => process.exit(0), 1500);
