#!/usr/bin/env node
/**
 * PromptRecordsCompare — the same PromptRecords sentences + parts steps (PARTS_BRIEF, PromptRecords.ask) on two models,
 * over real prompts, read-only: it writes nothing but its own --out folder. Doc: public/framework/ai/doc/prompt-refinement-map.md
 *
 *   node Server/PromptRecordsCompare.mjs <prompts.jsonl> <out dir> [--ids 4d2d4974,73082125,…] [--models claude-haiku-5-5,claude-sonnet-5-5]
 */
import fs from "node:fs";
import path from "node:path";
import PromptRecords from "./PromptRecords.mjs";
import PromptAudit from "./PromptAudit.mjs";
import RefinedCard from "../public/framework/ext/Refine/RefinedCard.js";

const [file, out] = process.argv.slice(2);
const val = k => process.argv.includes(k) ? process.argv[process.argv.indexOf(k) + 1] : null;
const IDS = (val("--ids") ?? "4d2d4974,a9198354,86261a04,d3e202fd,73082125,9162c602,7b07a33b,c210bb26").split(",");
const MODELS = (val("--models") ?? "claude-haiku-5-5,claude-sonnet-5-5").split(",");

const raws = {};
for (const l of fs.readFileSync(file, "utf8").split("\n")) { if (!l) continue; const o = JSON.parse(l); if (o.stage === "raw" && o.text != null) raws[o.prompt] = o.text; }

const flat = ps => ps.flatMap(x => [x, ...flat(x.parts ?? [])]);
const results = [];
for (const id of IDS) {
	const text = Object.entries(raws).find(([k]) => k.startsWith(id))?.[1];
	if (!text) { console.log(`no prompt ${id}`); continue; }
	const sentences = RefinedCard.sentences(text);
	for (const model of MODELS) {
		try {
			const r = await PromptRecords.ask(`The prompt, sentence by sentence:\n${sentences.map((s, i) => `${i}: ${s}`).join("\n")}`, { model, system: PromptRecords.PARTS_BRIEF });
			const o = PromptAudit.json(r.text), all = flat(o.parts ?? []);
			const cited = new Set(all.flatMap(x => x.cites ?? []));
			const asks = all.filter(x => x.kind === "ask");
			const row = { prompt: id, chars: text.length, model, sentences: sentences.length, parts: all.length, top_parts: (o.parts ?? []).length,
				coverage: +(sentences.filter((_, i) => cited.has(i)).length / sentences.length).toFixed(3), asks: asks.length,
				ask_list: asks.map(x => ({ cites: x.cites, text: x.text })), usd: +r.usd.toFixed(4) };
			results.push(row);
			console.log(`${id} ${model.replace("claude-", "")}: ${row.sentences} sentences, ${row.parts} parts, coverage ${row.coverage}, ${row.asks} asks, $${row.usd}`);
		} catch (e) { console.log(`✗ ${id} ${model}: ${e.message}`); }
	}
}
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, "results.json"), JSON.stringify(results, null, 1));
for (const m of MODELS) console.log(m, "total $" + results.filter(r => r.model === m).reduce((a, r) => a + r.usd, 0).toFixed(3));
