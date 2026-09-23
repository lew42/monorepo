/* node Servex/agents/demo.mjs — the proof, runnable by anyone.
 *
 * A Haiku agent is spawned on a long counting job and its tokens stream into
 * this terminal as they arrive. Once it is genuinely mid-sentence a message
 * from somebody else cuts in; the agent reads the envelope and can say who
 * sent it. A second agent joins, both are listed, the first is set counting
 * again and interrupted, and each agent's own JSONL is tailed. Last, the
 * permission question: an agent runs `node --version` and writes the answer.
 *
 * Nothing is mocked. Every number at the end was measured by this run. */

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import agents from "./Agents.js";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const PROOF = path.join(REPO, "public/framework/ai/2026-09-22/agent-host/proof-node-version.txt").replace(/\\/g, "/");
const HAIKU = "claude-haiku-4-5-20251001";
const COUNT = "Count slowly from 1 to 300. One number per line, and after each number"
	+ " write one short sentence about that number. Keep going until you reach 300, unless"
	+ " somebody sends you a message telling you otherwise.";
const SMALL = { model: HAIKU, effort: "low", setting_sources: [], allowed_tools: [] };

const wait = ms => new Promise(r => setTimeout(r, ms));
const at = {}, tokens = {}, tick = {}, said = {}, events = {};
let echo = true;

/* The host's one watch seam is the whole UI of this demo. */
agents.watch = (e, agent) => {
	events[agent.id] = (events[agent.id] ?? 0) + 1;
	if (e.type === "delta"){
		if (agent.id === "minion-counter") at.first_delta ??= Date.now();
		tokens[agent.id] = (tokens[agent.id] ?? 0) + 1;
		tick[agent.id] = Date.now();
		if (echo && agent.id === "minion-counter") process.stdout.write(e.text);
	}
	if (e.type === "transcript" && !e.meta) (said[agent.id] ??= []).push(e.text);
	if (e.type === "tool") console.log(`\n  · ${agent.id} used ${e.name} — ${e.input}`);
	if (e.type === "error") console.log(`\n  ! ${agent.id} ${e.where}: ${e.text}`);
};

/* Really talking — the CLI takes a couple of seconds to start, so "mid-run"
 * means after the first token, never after a stopwatch. */
const flowing = async (id, ms = 90000) => {
	tokens[id] = 0;
	for (const end = Date.now() + ms; Date.now() < end; await wait(100)) if (tokens[id]) return true;
	return false;
};

/* Really finished. The turn's own `result.result` is NOT reliably the last
 * thing the agent said — a turn cancelled by a `now` message hands its partial
 * text to the NEXT result — so the honest gate is: idle, and quiet for a while. */
const settled = async (id, quiet = 2000, ms = 180000) => {
	const agent = agents.get(id);
	for (const end = Date.now() + ms; Date.now() < end; await wait(200))
		if (agent.state === "idle" && Date.now() - (tick[id] ?? 0) > quiet) return true;
	return false;
};

/* You sent something: wait for the answer to START, then for it to FINISH. A
 * turn takes a couple of seconds to spin up, and "idle and quiet" is briefly
 * true in that gap — settle alone reads the silence before the answer as the
 * answer, and every reply after it is one behind. */
const answered = async id => { await flowing(id); return settled(id); };

console.log("=== 1. spawn a Haiku agent; its tokens arrive here as it thinks ===\n");
at.spawn = Date.now();
const one = agents.spawn({ ...SMALL, role: "minion", name: "counter", prompt: COUNT });
await flowing(one.id);
await wait(1500);

console.log("\n\n=== 2. cut into it mid-sentence, from somebody else ===");
agents.send(one.id, "stop at ten and say who told you to", {
	from: "mastermind-servex", reply_to: "log agent-host", priority: "now"
});
said[one.id] = [];
await answered(one.id);
echo = false;
/* A cancelled turn still hands its partial text over, so BOTH arrive: what it had
 * managed to count, and what it said once the message landed. Print both. */
said[one.id].forEach(t => console.log(`\n  it said: ${JSON.stringify(t.slice(-140))}`));

said[one.id] = [];
agents.send(one.id, "Name the sender of that message and where its answer goes.", { from: "demo" });
await answered(one.id);
const who = said[one.id].join(" ");
at.named = /mastermind-servex/i.test(who) && /agent-host/i.test(who);
console.log(`\n  asked who sent it: ${JSON.stringify(who.slice(0, 200))}`);

console.log("\n=== 3. a second agent, and the registry ===");
const two = agents.spawn({ ...SMALL, role: "minion", name: "watcher", visibility: "owner",
	prompt: "Reply with exactly: watching." });
console.table(agents.list());

console.log("\n=== 4. set it counting again, then interrupt ===\n");
echo = true;
agents.send(one.id, COUNT, { from: "demo" });
await flowing(one.id);
await wait(1500);
tokens[one.id] = 0;
at.interrupt = Date.now();
await agents.interrupt(one.id);
await wait(2500);
echo = false;
at.after = tokens[one.id];
console.log(`\n\n  ${at.after} tokens arrived after interrupt(); it is "${one.state}".`);
console.log(`  Pick it up in a terminal with:  claude --resume ${one.session_id}`);

console.log("\n=== 5. the permission question, answered ===");
const three = agents.spawn({ ...SMALL, role: "minion", name: "prover", cwd: REPO,
	permission_mode: "bypassPermissions", allowed_tools: ["Bash", "Write"],
	prompt: `Run \`node --version\` with Bash, then Write that exact version string to ${PROOF}.`
		+ ` Reply with the version and nothing else.` });
await answered(three.id);
console.log(`  ${PROOF}\n  holds: ${await readFile(PROOF, "utf8").then(s => JSON.stringify(s.trim()), e => `NOT WRITTEN — ${e.code}`)}`);

console.log("\n=== 6. each agent's own JSONL ===");
for (const agent of [one, two, three]){
	const lines = await readFile(agent.file(), "utf8").then(s => s.trim().split("\n"), () => []);
	console.log(`\n${agent.file()}\n  ${events[agent.id]} events this run, ${lines.length} in the file`
		+ ` · ${[...new Set(lines.map(l => JSON.parse(l).type))].join(", ")}`);
	lines.slice(-2).forEach(l => console.log("  " + l.slice(0, 200)));
}

console.log("\n=== measured ===");
console.log(`  spawn → first token       ${at.first_delta - at.spawn}ms`);
console.log(`  tokens after interrupt    ${at.after}`);
console.log(`  envelope read back        ${at.named ? "yes — it named mastermind-servex and agent-host" : "NO"}`);
console.log(`  cost of this whole run    $${agents.list().reduce((n, a) => n + a.cost, 0).toFixed(4)}`);

[one, two, three].forEach(a => agents.stop(a.id));
await wait(1500);
process.exit(0);
