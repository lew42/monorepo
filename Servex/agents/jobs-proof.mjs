/* jobs-proof.mjs — every job kind, started at once, answered as messages.
 *
 *   node Servex/agents/jobs-proof.mjs
 *
 * Its own Agents host (so nothing touches the running Servex's live map), and a
 * fake caller — an object with `.send()`, the way the Dispatcher sits in `live`.
 * Starts read, grep, watch, check and decide back to back, prints how long each
 * start_job took to RETURN (should be ~0 ms) and when its message ARRIVED, then
 * job_result for a caller that is not live. decide makes one real Sonnet call
 * (about a cent); its tokens and cost go to the concurrency task dir. */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Agents } from "./Agents.js";
import { start_job, job_result, job_tools } from "./jobs.js";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = "C:/Code/lew42/monorepo/public/framework/ai/2026-09-24/concurrency/jobs-proof.txt";
const host = new Agents();

/* The fake caller. */
const inbox = [];
const t0 = Date.now();
host.live.set("proof-caller", { id: "proof-caller", state: "idle",
	send(text, note){ inbox.push({ at: Date.now(), text, ...note }); } });

/* Scratch files: one the watch job follows, one that fails node --check. */
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "jobs-proof-"));
const watched = path.join(tmp, "server.log");
const broken = path.join(tmp, "broken.js");
fs.writeFileSync(watched, "booting\n");
fs.writeFileSync(broken, "const x = `unclosed;\n");

const specs = {
	read:   { files: ["readme.md", "Agents.js", "tools.js"], find: "wake_parent" },
	grep:   { pattern: "wake_parent", dir: HERE, glob: "*.js" },
	watch:  { file: watched, pattern: "listening on \\d+", timeout_s: 20 },
	check:  { files: ["Agents.js", "tools.js", "jobs.js", "registry.js", broken] },
	decide: { files: ["readme.md"], question: "In one sentence: what does wake_parent do, and when is it called?" }
};

const started = {};
for (const [kind, args] of Object.entries(specs)){
	const s = Date.now();
	const { job_id } = start_job(host, { kind, args, from: "proof-caller", base: HERE });
	started[job_id] = { kind, start: s, return_ms: Date.now() - s };
}
/* The thing the watch job is waiting for, a second later. */
setTimeout(() => fs.appendFileSync(watched, "listening on 8123\n"), 1000);

/* A caller that is NOT live: job_result is how it hears back. */
const { job_id: orphan } = start_job(host, { kind: "read", args: { glob: "*.md" }, from: "vscode-tab-not-live", base: HERE });

/* Wait (up to 90 s) for one message per job. */
while (inbox.length < 5 && Date.now() - t0 < 90000) await new Promise(r => setTimeout(r, 50));
const polled = await job_result(host, { job_id: orphan, wait_s: 10 });

const rows = Object.entries(started).map(([id, s]) => {
	const msg = inbox.find(m => m.from === id);
	return { id, kind: s.kind, return_ms: s.return_ms, done_ms: msg ? msg.at - s.start : null, message: msg?.text };
});
console.log("\nkind    return_ms  done_ms   message");
for (const r of rows) console.log(`${r.kind.padEnd(7)} ${String(r.return_ms).padStart(9)}  ${String(r.done_ms).padStart(7)}   ${r.message?.slice(0, 160)}`);
console.log(`\nnot-live caller: job_result(${orphan}) → ${polled.state}, ok ${polled.ok}, ${polled.ms} ms: ${polled.summary}`);

const decide = await job_result(host, { job_id: rows.find(r => r.kind === "decide").id });
const d = decide.result ?? {};
console.log(`decide: ${JSON.stringify(d.usage)} cost $${d.cost_usd} model_ms ${d.model_ms}`);

/* The tools really build, and a handler answers at once. */
const tools = job_tools(host);
const via_tool = JSON.parse(await tools.find(t => t.name === "start_job").handler({ kind: "check", args: { files: ["jobs.js"] } }));
console.log(`tools: ${tools.map(t => t.name).join(", ")}; start_job handler → ${via_tool.job_id}`);

const failures = [
	...rows.filter(r => r.done_ms == null).map(r => `${r.kind}: no message`),
	...rows.filter(r => r.return_ms > 50).map(r => `${r.kind}: returned in ${r.return_ms} ms`),
	!rows.find(r => r.kind === "check")?.message?.startsWith("failed:") && "check: the broken file should fail",
	!rows.find(r => r.kind === "watch")?.message?.includes("listening on 8123") && "watch: never saw the line",
	polled.state !== "done" && "job_result: not done",
	!d.answer && "decide: no answer"
].filter(Boolean);

const report = [
	`jobs-proof ${new Date().toISOString()} — Servex/agents/jobs-proof.mjs`,
	"",
	"kind    return_ms  done_ms",
	...rows.map(r => `${r.kind.padEnd(7)} ${String(r.return_ms).padStart(9)}  ${String(r.done_ms).padStart(7)}`),
	"",
	`decide model: claude-sonnet-5, no tools, settingSources []`,
	`decide question: ${specs.decide.question}`,
	`decide answer: ${d.answer}`,
	`decide tokens: input ${d.usage?.input} · output ${d.usage?.output} · cache_read ${d.usage?.cache_read} · cache_write ${d.usage?.cache_write}`,
	`decide cost: $${d.cost_usd} · wall ${d.model_ms} ms · sdk ${d.sdk_ms} ms`,
	"",
	`not-live caller: ${polled.state}, ${polled.ms} ms — ${polled.summary}`,
	`result: ${failures.length ? "FAIL — " + failures.join("; ") : "PASS"}`
].join("\n");
fs.writeFileSync(OUT, report + "\n");
console.log(`\n${failures.length ? "FAIL: " + failures.join("; ") : "PASS"} — written to ${OUT}`);
fs.rmSync(tmp, { recursive: true, force: true });
process.exit(failures.length ? 1 : 0);
