// fit-rates.mjs: for single-model finished Servex agents, find the scalar k so that
// ledger(SDK total_cost_usd) = k * dedup(units at in=1,out=out/in ratio,...) per model.
import fs from "node:fs"; import path from "node:path";
import { find_transcript } from "../../../../../Server/session-cost.mjs";
const D = path.join(process.env.LOCALAPPDATA, "lew42", "servex");
const j = JSON.parse(fs.readFileSync(path.join(D, "registry.json"), "utf8"));
const rows = (Array.isArray(j) ? j : Object.values(j)).filter(r => r.session_id && (!r.provider || r.provider === "claude") && /^claude/.test(r.model || ""));
const L = f => fs.readFileSync(f, "utf8").split(/\r?\n/).filter(Boolean).map(l => { try { return JSON.parse(l) } catch { return null } }).filter(Boolean);
const res = {};
for (const r of rows.reverse()){
	const log = path.join(D, "logs", `agent-${r.id}.jsonl`); if (!fs.existsSync(log)) continue;
	const c = L(log).filter(o => o.type === "result" && typeof o.cost === "number").map(o => o.cost);
	if (!c.length || c.some((x, i) => i && x < c[i-1]) || c.at(-1) < 0.3) continue;
	const tp = find_transcript(r.session_id); if (!tp) continue;
	const by = new Map(); for (const o of L(tp)) if (o.type === "assistant" && o.message?.usage) by.set(o.message.id || o.uuid, o.message);
	const models = new Set([...by.values()].map(m => m.model)); if (models.size !== 1) continue;
	const m = [...models][0]; let i = 0, o2 = 0, cr = 0, cw = 0;
	for (const x of by.values()){ const u = x.usage; i += u.input_tokens||0; o2 += u.output_tokens||0; cr += u.cache_read_input_tokens||0; cw += u.cache_creation_input_tokens||0; }
	// units with in=1: out*5, read*.1, write*2
	const units = (i + o2*5 + cr*.1 + cw*2)/1e6;
	(res[m] ||= []).push(+(c.at(-1)/units).toFixed(3));
}
for (const [m, v] of Object.entries(res)) console.log(m, v.length, "implied in-price per M:", v.sort((a,b)=>a-b).join(" "));
