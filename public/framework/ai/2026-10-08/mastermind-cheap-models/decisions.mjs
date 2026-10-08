/* decisions.mjs — reads this task's own spawns.jsonl (one line per spawn decision, written through
 * .claude/hooks/append.mjs — never by hand, per the task's requirements.md) and prints, per model,
 * the pass rate and the cost per PASSING task. This is deliverable 1 of mastermind-cheap-models
 * (public/framework/ai/2026-10-08/mastermind-cheap-models/requirements.md): "a script (not you
 * from memory) adds {actual_cost_usd, outcome, verified_how}" after the agent ends — this script
 * is the READ side of that; `record-outcome.mjs` (sibling) is the WRITE side.
 *
 * usage: node decisions.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SPAWNS_PATH = path.join(HERE, "spawns.jsonl");

function readJsonl(file){
	try { return fs.readFileSync(file, "utf8").split(/\r?\n/).filter(Boolean).map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean); }
	catch { return []; }
}

export function load(){
	const lines = readJsonl(SPAWNS_PATH).map(l => l.spawn).filter(Boolean);
	// latest-wins merge by agent id — a later {"spawn":{"agent":"x","actual_cost_usd":...}} line
	// (written by record-outcome.mjs once the agent ends) merges onto the same row, same pattern
	// as library.mjs's testRuns().
	const byAgent = new Map();
	for (const s of lines) byAgent.set(s.agent, { ...byAgent.get(s.agent), ...s });
	return [...byAgent.values()];
}

function main(){
	const spawns = load();
	const byModel = new Map();
	for (const s of spawns){
		const key = s.model || "unknown";
		if (!byModel.has(key)) byModel.set(key, []);
		byModel.get(key).push(s);
	}
	console.log("model                           spawned  scored  pass  pass_rate  total_$     $/passing_task");
	for (const [model, rows] of byModel){
		const scored = rows.filter(r => r.outcome != null);
		const passed = scored.filter(r => r.outcome === "pass");
		const totalCost = rows.reduce((s, r) => s + (Number(r.actual_cost_usd) || 0), 0);
		const passRate = scored.length ? (passed.length / scored.length) : null;
		const costPerPass = passed.length ? totalCost / passed.length : null;
		console.log([
			model.padEnd(31), String(rows.length).padEnd(8), String(scored.length).padEnd(7), String(passed.length).padEnd(5),
			(passRate != null ? (passRate * 100).toFixed(0) + "%" : "n/a (not yet scored)").padEnd(21),
			"$" + totalCost.toFixed(4),
			costPerPass != null ? "$" + costPerPass.toFixed(4) : "n/a",
		].join(" "));
	}
	if (!spawns.some(s => s.outcome != null)) console.log("\nNo spawn has an outcome yet — run record-outcome.mjs once an agent ends, or score the known-answer results directly (see known-answer-results.jsonl / page.jsonl `run` lines).");
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) main();
