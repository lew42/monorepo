// dedupe-truth.mjs: which transcript total matches the SDK's own billed cost?
// For finished Servex agents with a single run, compare:
//   ledger  = the SDK's total_cost_usd (last "result" line in agent-<id>.jsonl)
//   raw     = session-cost.mjs: price EVERY assistant line's usage
//   dedup   = price each message.id once (the last line carrying that id)
// Run: node dedupe-truth.mjs [max-agents]
import fs from "node:fs";
import path from "node:path";
import { find_transcript, cost_of_transcript, price_for } from "../../../../../Server/session-cost.mjs";

const LOGS = path.join(process.env.LOCALAPPDATA, "lew42", "servex", "logs");
const REG = path.join(process.env.LOCALAPPDATA, "lew42", "servex", "registry.json");
const j = JSON.parse(fs.readFileSync(REG, "utf8"));
const rows = (Array.isArray(j) ? j : Object.values(j)).filter(r => r.session_id && (!r.provider || r.provider === "claude"));

const lines = f => fs.readFileSync(f, "utf8").split(/\r?\n/).filter(Boolean).map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);

function dedup_usd(file){
	const by = new Map();
	for (const o of lines(file)){
		if (o.type !== "assistant" || !o.message?.usage) continue;
		by.set(o.message.id || o.uuid, o.message);   // last line of a message wins
	}
	let t = 0;
	for (const m of by.values()){
		const u = m.usage, p = price_for(m.model);
		t += ((u.input_tokens || 0) * p.in + (u.output_tokens || 0) * p.out + (u.cache_read_input_tokens || 0) * p.cache_read + (u.cache_creation_input_tokens || 0) * p.cache_write) / 1e6;
	}
	return t;
}

const out = [];
const max = Number(process.argv[2]) || 40;
for (const r of rows.reverse()){
	if (out.length >= max) break;
	const log = path.join(LOGS, `agent-${r.id}.jsonl`);
	if (!fs.existsSync(log)) continue;
	const results = lines(log).filter(o => o.type === "result" && typeof o.cost === "number");
	if (!results.length) continue;
	const costs = results.map(o => o.cost);
	if (costs.some((c, i) => i && c < costs[i - 1])) continue;   // skip restarted runs (total resets)
	const ledger = costs.at(-1);
	if (ledger < 0.2) continue;
	const tp = find_transcript(r.session_id);
	if (!tp) continue;
	const raw = cost_of_transcript(tp).total_usd, dd = dedup_usd(tp);
	out.push({ id: r.id, model: r.model, ledger: +ledger.toFixed(4), raw: +raw.toFixed(4), dedup: +dd.toFixed(4),
		raw_vs_ledger: +(raw / ledger).toFixed(3), dedup_vs_ledger: +(dd / ledger).toFixed(3) });
}
console.table(out);
const med = k => out.map(o => o[k]).sort((a, b) => a - b)[Math.floor(out.length / 2)];
console.log("n", out.length, "median raw/ledger", med("raw_vs_ledger"), "median dedup/ledger", med("dedup_vs_ledger"));
fs.writeFileSync(new URL("./dedupe-truth.json", import.meta.url), JSON.stringify(out, null, 1));
