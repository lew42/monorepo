#!/usr/bin/env node
// cheap-first-tradeoff.mjs — the owner's caveat (2026-10-07): "cheap agents reading
// hundreds of files can still cost a lot." Measures, from real transcripts, read-call
// count vs $ for the top-spending SONNET minions (the model a "quick lay of the land"
// agent would run on) — does a cheap model's own read volume actually show up as real $?
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { find_transcript, trace_of_transcript, cost_of_transcript } from "../../../../../Server/session-cost.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../../../../../");
const tree = JSON.parse(fs.readFileSync(path.join(ROOT, "public/framework/ai/sessions/spend-tree.json"), "utf8"));
const registry = JSON.parse(fs.readFileSync(path.join(process.env.LOCALAPPDATA, "lew42", "servex", "registry.json"), "utf8"));
const rows = Array.isArray(registry) ? registry : Object.values(registry);
const by_id = new Map(rows.map(r => [r.id, r]));

const sonnet_minions = tree.agents.filter(a => a.role === "minion" && a.model === "claude-sonnet-5" && (a.own_claude_usd ?? 0) > 1)
	.sort((a, b) => b.own_claude_usd - a.own_claude_usd).slice(0, 8);

console.log("Sonnet minion, real reads (Read+Grep+Glob+ToolSearch) vs its own $:\n");
let total_usd = 0, total_reads = 0;
for (const a of sonnet_minions){
	const row = by_id.get(a.id);
	const sid = row?.session_id;
	const tpath = sid && find_transcript(sid);
	if (!tpath) { console.log(`${a.id}: no transcript, skipped`); continue; }
	const { calls } = trace_of_transcript(tpath);
	const reads = calls.filter(c => /^(Read|Grep|Glob|ToolSearch)$/.test(c.tool)).length;
	console.log(`${a.id}: ${reads} read-shaped calls, $${a.own_claude_usd.toFixed(2)} total, $${(a.own_claude_usd / Math.max(1, reads)).toFixed(4)}/read-call`);
	total_usd += a.own_claude_usd; total_reads += reads;
}
console.log(`\nTotal: ${total_reads} read calls across these ${sonnet_minions.length} minions, $${total_usd.toFixed(2)} — $${(total_usd / Math.max(1, total_reads)).toFixed(4)}/read-call average.`);
