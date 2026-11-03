// The real cost of one SDK session, from its own transcript: each assistant message's usage counted once (by message id),
// priced by Server/Transcripts.mjs. The SDK's total_cost_usd on a resumed session is cumulative, so summing it per turn overcounts.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import Transcripts from "../../../../../../../Server/Transcripts.mjs";

export function session_cost(session_id){
	const base = path.join(os.homedir(), ".claude", "projects");
	const dir = fs.readdirSync(base).find(d => fs.existsSync(path.join(base, d, session_id + ".jsonl")));
	if (!dir) return null;
	const seen = new Map();
	for (const raw of fs.readFileSync(path.join(base, dir, session_id + ".jsonl"), "utf8").split("\n")){
		if (!raw.includes('"usage"')) continue;
		let l; try { l = JSON.parse(raw); } catch { continue; }
		const m = l.message; if (!m?.usage || !m.id) continue;
		const u = m.usage;
		seen.set(m.id, { model: m.model, u: { input: u.input_tokens ?? 0, output: u.output_tokens ?? 0, cache_read: u.cache_read_input_tokens ?? 0,
			cache_creation: u.cache_creation_input_tokens ?? 0, cache_1h: u.cache_creation?.ephemeral_1h_input_tokens ?? 0 } });
	}
	let usd = 0, read = 0, out = 0;
	for (const { model, u } of seen.values()){ usd += Transcripts.cost(model, u); read += u.input + u.cache_read + u.cache_creation; out += u.output; }
	return { usd: +usd.toFixed(4), calls: seen.size, tokens_in: read, tokens_out: out };
}
if (process.argv[1]?.endsWith("cost.mjs")) console.log(session_cost(process.argv[2]));
