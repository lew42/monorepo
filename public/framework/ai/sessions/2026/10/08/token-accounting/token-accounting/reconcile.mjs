#!/usr/bin/env node
// reconcile.mjs — deliverable 2 of this task's requirements.md: pick 3 real sessions
// (one plain, one with sub-agents, one OpenRouter) and sum their REAL cost straight from
// the session-file transcripts (or, for OpenRouter, the real metered log), then compare
// that to what the existing ledger (an agent's own agent-<id>.jsonl "result" lines) says.
// Run: node public/framework/ai/sessions/2026/10/08/token-accounting/token-accounting/reconcile.mjs
//
// Compute, don't recall (CLAUDE.md law 7): every number below is read live off real files
// on this machine, nothing typed from memory.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { find_transcript, cost_of_transcript } from "../../../../../../../../../Server/session-cost.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../../../../../");
const LOGS = path.join(process.env.LOCALAPPDATA, "lew42", "servex", "logs");
const REGISTRY = path.join(process.env.LOCALAPPDATA, "lew42", "servex", "registry.json");

const r4 = n => Math.round(n * 10000) / 10000;

function agent_log_ledger_usd(agent_id){
	const file = path.join(LOGS, `agent-${agent_id}.jsonl`);
	if (!fs.existsSync(file)) return null;
	let last = 0, any = false;
	for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)){
		if (!line.trim()) continue;
		let o; try { o = JSON.parse(line); } catch { continue; }
		if (o.type !== "result" || typeof o.cost !== "number") continue;
		if (o.cost > 0 || o.turns > 0) any = true;
		last = o.cost >= last ? o.cost : last + o.cost;   // a drop = a restart banking the old total
	}
	return any ? r4(last) : null;
}

function registry(){
	const j = JSON.parse(fs.readFileSync(REGISTRY, "utf8"));
	const rows = Array.isArray(j) ? j : Object.values(j);
	return new Map(rows.map(r => [r.id, r]));
}

function or_log_usd(agent_id){
	const file = path.join(LOGS, "..", "logs", "openrouter.jsonl");
	// openrouter.jsonl lives beside the other agent logs
	const p = path.join(LOGS, "openrouter.jsonl");
	if (!fs.existsSync(p)) return null;
	let total = 0, n = 0;
	for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)){
		if (!line.trim()) continue;
		let o; try { o = JSON.parse(line); } catch { continue; }
		if (o.agent !== agent_id) continue;
		total += Number(o.cost_usd) || 0; n++;
	}
	return n ? r4(total) : null;
}

function report_claude(label, agent_id, session_id){
	const ledger = agent_log_ledger_usd(agent_id);
	const transcript_path = find_transcript(session_id);
	const transcript = transcript_path ? cost_of_transcript(transcript_path) : null;
	const gap = (transcript && ledger != null) ? r4(transcript.total_usd - ledger) : null;
	console.log(`\n=== ${label}: ${agent_id} (session ${session_id.slice(0, 8)}…) ===`);
	console.log(`  agent-log ledger (agent-${agent_id}.jsonl, "result" lines): ${ledger == null ? "none logged" : "$" + ledger}`);
	console.log(`  real transcript total (${transcript_path ? path.basename(path.dirname(transcript_path)) : "NOT FOUND"}): ${transcript ? "$" + transcript.total_usd : "none"}`);
	if (gap != null) console.log(`  gap (transcript − ledger): ${gap >= 0 ? "+" : ""}$${gap}${gap > 0.01 ? "  <-- ledger undercounts" : ""}`);
	return { label, agent_id, session_id, ledger_usd: ledger, transcript_usd: transcript?.total_usd ?? null, transcript_found: !!transcript_path, gap_usd: gap };
}

function report_subtree(label, root_id, root_session_id, reg){
	const root = report_claude(`${label} (root only)`, root_id, root_session_id);
	const kids = [...reg.values()].filter(r => r.parent === root_id);
	let kids_ledger = 0, kids_transcript = 0, kids_counted = 0;
	for (const k of kids){
		if (!k.session_id) continue;
		const ledger = agent_log_ledger_usd(k.id);
		const tpath = find_transcript(k.session_id);
		const t = tpath ? cost_of_transcript(tpath) : null;
		if (ledger != null) kids_ledger += ledger;
		if (t) { kids_transcript += t.total_usd; kids_counted++; }
	}
	console.log(`  ${kids.length} minions registered under this root; ${kids_counted} have a findable transcript`);
	console.log(`  minions' own ledger total:     $${r4(kids_ledger)}`);
	console.log(`  minions' own transcript total: $${r4(kids_transcript)}`);
	console.log(`  WHOLE TREE (root + minions), ledger basis:     $${r4((root.ledger_usd ?? 0) + kids_ledger)}`);
	console.log(`  WHOLE TREE (root + minions), transcript basis: $${r4((root.transcript_usd ?? 0) + kids_transcript)}`);
	return { ...root, kids: kids.length, kids_with_transcript: kids_counted, kids_ledger_usd: r4(kids_ledger), kids_transcript_usd: r4(kids_transcript) };
}

function report_openrouter(label, agent_id, session_id){
	const ledger = agent_log_ledger_usd(agent_id);   // the "cost" field the SDK result line logs
	const real = or_log_usd(agent_id);               // the real OpenRouter-metered $ (openrouter.jsonl)
	const gap = (real != null && ledger != null) ? r4(real - ledger) : null;
	console.log(`\n=== ${label}: ${agent_id} (OpenRouter, session ${session_id.slice(0, 8)}…) ===`);
	console.log(`  agent-log ledger ("cost" on each "result" line):    ${ledger == null ? "none" : "$" + ledger}`);
	console.log(`  real OpenRouter-metered total (openrouter.jsonl):   ${real == null ? "none" : "$" + real}`);
	if (gap != null) console.log(`  gap (real − ledger): ${gap >= 0 ? "+" : ""}$${gap}${gap > 0.001 ? "  <-- the result line's own \"cost\" field is stale (see findings.md, finding 2)" : ""}`);
	return { label, agent_id, session_id, ledger_usd: ledger, real_usd: real, gap_usd: gap };
}

const reg = registry();

console.log("RECONCILIATION — 3 real sessions, ledger vs. the real transcript/metered total");
console.log("(fix already applied before this run: find_transcript() case-sensitivity, Server/session-cost.mjs)");

const results = [];

// 1. Plain session — this very task's own mastermind, no sub-agents.
results.push(report_claude("1. Plain session", "task-mastermind-token-accounting", "b719daae-31dd-4850-8b9f-adac8a0034a2"));

// 2. A session WITH sub-agents — a root task-mastermind that spawned 192 minions.
results.push(report_subtree("2. Session with sub-agents", "task-mastermind-loose-ends", "c1880a80-ebd0-4a61-a394-0b94c2735d43", reg));

// 3. An OpenRouter session.
results.push(report_openrouter("3. OpenRouter session", "echo-57d98556", "39329a2b-bc00-4e48-9305-25f64c9100c8"));

fs.writeFileSync(path.join(HERE, "reconcile-result.json"), JSON.stringify(results, null, 2));
console.log("\nWritten: reconcile-result.json");
