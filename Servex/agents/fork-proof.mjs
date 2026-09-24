/* node Servex/agents/fork-proof.mjs — fork_self, proven end to end.
 *
 * Agent A (Haiku) is given a long list of made-up facts, so its context is
 * worth caching. A itself calls `fork_self` through an IN-PROCESS MCP server
 * (tools.js `server(host)` — this standalone host has no HTTP /mcp) and asks
 * its fork a question that takes some thinking. While the fork works, the
 * owner asks A something else; A answers. Then the fork's answer arrives in A
 * as a message starting "fork answer:", and A reacts to it.
 *
 * Printed: how fast fork_self returned, when each answer landed, and the
 * fork's token usage — `cache_read_input_tokens` is the whole point. Saved to
 * public/framework/ai/2026-09-24/concurrency/proof.txt. Its own registry dir
 * (in the OS temp dir), so the real registry is never touched. */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Agents } from "./Agents.js";
import { server } from "./tools.js";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const OUT = process.env.PROOF_OUT ?? path.join(REPO, "public/framework/ai/2026-09-24/concurrency/proof.txt");
const HAIKU = "claude-haiku-4-5-20251001";

const lines = [];
const say = (...a) => { const s = a.join(" "); lines.push(s); console.log(s); };
const t0 = Date.now();
const T = () => `${((Date.now() - t0) / 1000).toFixed(1)}s`;
const wait = ms => new Promise(r => setTimeout(r, ms));

const host = new Agents({ registry_dir: path.join(os.tmpdir(), "servex-fork-proof") });
const at = {}, said = {}, results = {};

/* Time fork_self from the inside: when the handler was entered, when it returned. */
const fork = host.fork.bind(host);
host.fork = async spec => {
	at.fork_called = Date.now();
	const agent = await fork(spec);
	at.fork_returned = Date.now();
	at.fork_id = agent.id;
	say(`[${T()}] fork_self returned in ${at.fork_returned - at.fork_called} ms → ${agent.id}`);
	return agent;
};

host.watch = (e, agent) => {
	if (e.type === "transcript" && !e.meta) (said[agent.id] ??= []).push({ at: Date.now(), text: e.text });
	if (e.type === "tool") say(`[${T()}] ${agent.id} called ${e.name}`);
	if (e.type === "agent_msg" && !e.first) say(`[${T()}] → ${agent.id} got a message from ${e.from}: ${e.text.slice(0, 90).replace(/\n/g, " ")}…`);
	if (e.type === "result" && !e.stopped) (results[agent.id] ??= []).push({ ...e, at: Date.now() });
	if (e.type === "error") say(`[${T()}] ! ${agent.id} ${e.where}: ${e.text}`);
};

const FACTS = Array.from({ length: 150 }, (_, i) =>
	`Town ${i + 1} (${["Ash", "Birch", "Cedar", "Dune", "Elm", "Fern"][i % 6]}ford): depot holds ${(i * 37 + 11) % 97} crates of ${["salt", "rope", "tin", "wool", "flax"][i % 5]}, mayor ${["Ada", "Bo", "Cy", "Di", "Ed"][i % 5]} ${i + 1}.`
).join("\n");

const spawnA = () => host.spawn({
	role: "proof", name: "a", model: HAIKU, effort: "low", setting_sources: [],
	permission_mode: "bypassPermissions",
	mcp_servers: { servex: server(host, { caller: "proof-a" }) },
	allowed_tools: ["mcp__servex__fork_self"],
	prompt: "The secret word is PELICAN. Here are the facts you are keeping for the team:\n" + FACTS
		+ "\n\nDo exactly this, now:\n1. Call the fork_self tool ONCE with this question: \"Which five towns hold the most crates?"
		+ " List each with its count and goods, then give the total crates across all 150 towns, showing"
		+ " your running sum in steps of 25 towns.\"\n2. When the call returns, reply exactly: FORK REQUESTED"
		+ "\nAfter that, answer any message you get in one or two short sentences. When a message starts"
		+ " \"fork answer:\", say in one sentence which town tops the list."
});

say(`fork-proof — ${new Date().toISOString()} — model ${HAIKU}, effort low, no settings loaded`);
say(`A's context: the default system prompt + tools, and ${FACTS.length} characters of made-up facts.\n`);
const A = spawnA();
at.spawn = Date.now();

// Wait for A's fork_self call to have returned.
for (const end = Date.now() + 120000; !at.fork_returned && Date.now() < end;) await wait(100);
if (!at.fork_returned) { say("A never called fork_self."); process.exit(1); }

// While the fork runs, the owner asks A something unrelated.
await wait(300);
at.asked = Date.now();
host.send(A.id, "Quick one: what is the secret word?", { from: "owner", reply_to: "log agent-proof-a" });
say(`[${T()}] owner asked A a question while the fork is still working`);

// Anyone can also wait on the fork directly — what a VS Code tab would do.
const waited = host.wait(at.fork_id, 300).then(r => { at.waited = Date.now(); return r; });

// Done when A has answered the fork's wake: its turn count reaches 3 and it is idle.
for (const end = Date.now() + 300000; Date.now() < end; await wait(200)){
	const woke = (said[A.id] ?? []).some(s => at.fork_answer_in && s.at > at.fork_answer_in);
	if (!at.fork_answer_in && results[at.fork_id]) at.fork_answer_in = results[at.fork_id][0].at;
	if (woke && A.state === "idle") break;
}
const w = await waited;

const fr = results[at.fork_id]?.[0];
const afterAsk = (said[A.id] ?? []).find(s => s.at > at.asked && /pelican/i.test(s.text));
const afterFork = (said[A.id] ?? []).filter(s => at.fork_answer_in && s.at > at.fork_answer_in).pop();

say("\n=== what happened ===");
say(`A spawned                         at 0.0s`);
say(`A called fork_self                at ${((at.fork_called - at.spawn) / 1000).toFixed(1)}s; the call returned in ${at.fork_returned - at.fork_called} ms`);
say(`owner asked A the secret word     at ${((at.asked - at.spawn) / 1000).toFixed(1)}s`);
say(`A answered the owner              at ${afterAsk ? ((afterAsk.at - at.spawn) / 1000).toFixed(1) + "s: " + afterAsk.text.replace(/\n/g, " ").slice(0, 120) : "— (no answer mentioning PELICAN)"}`);
say(`the fork finished its answer      at ${fr ? ((fr.at - at.spawn) / 1000).toFixed(1) + "s" : "—"} (wait_for_agent on it returned at ${at.waited ? ((at.waited - at.spawn) / 1000).toFixed(1) + "s" : "—"}, state ${w?.state})`);
say(`A reacted to the fork answer      at ${afterFork ? ((afterFork.at - at.spawn) / 1000).toFixed(1) + "s: " + afterFork.text.replace(/\n/g, " ").slice(0, 160) : "—"}`);
say(`order: ${afterAsk && fr ? (afterAsk.at < fr.at ? "A answered the owner BEFORE the fork finished — it was never blocked" : "the fork finished first this run — A still answered the owner without waiting on it") : "incomplete"}`);

say("\n=== the fork's answer (what reached A, first 600 chars) ===");
say((w?.words ?? "—").slice(0, 600));

say("\n=== the fork's usage (its one result message) ===");
if (fr){
	const u = fr.usage;
	const total = u.input_tokens + u.cache_read_input_tokens + u.cache_creation_input_tokens;
	say(`input_tokens (uncached)       ${u.input_tokens}`);
	say(`cache_read_input_tokens       ${u.cache_read_input_tokens}  (${(100 * u.cache_read_input_tokens / total).toFixed(1)}% of the fork's input came from A's cache)`);
	say(`cache_creation_input_tokens   ${u.cache_creation_input_tokens}`);
	say(`output_tokens                 ${u.output_tokens}`);
	say(`fork cost                     $${(fr.cost ?? 0).toFixed(4)}   (A's whole session: $${A.cost.toFixed(4)})`);
	say(`fork duration                 ${fr.duration_ms} ms`);
}
const fork_agent = host.live.get(at.fork_id);
say(`\nfork state now: ${fork_agent?.state} (one-shot: it stopped itself) · forked_from ${fork_agent?.forked_from} · its own session ${fork_agent?.session_id}`);
say(`A's session ${A.session_id} — a different id, untouched by the fork. A holds ${A.context} tokens of context now.`);
say(`total run: ${T()}`);

A.stop();
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, lines.join("\n") + "\n");
console.log(`\nsaved → ${OUT}`);
setTimeout(() => process.exit(0), 1500);
