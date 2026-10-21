#!/usr/bin/env node
// Server/session-query.mjs — find past sessions the way the Sessions dashboard does, and say what they cost.
// Doc: public/framework/ai/sessions/doc/data/record-spec.md ("Asking about past sessions")
//
//   node Server/session-query.mjs --tag transcription --since 2026-10-01 --json
//   node Server/session-query.mjs --system dictation --since 2026-10-02 --sort cost
//
// It asks DatedFiles.sessions.find, which reads the day composites `sessions/YYYY/MM/DD/index.json` (live or closed), one snapshot per session.
// A session is counted once, on the day of its last activity. Rows are capped (default 25) so an answer never floods a caller's context;
// the totals always cover EVERY match, not only the rows shown.
import path from "node:path";
import { fileURLToPath } from "node:url";
import DatedFiles from "./DatedFiles.mjs";

/** query({ since, until, tags, system, state, model, provider, parent, min_cost, text, sort, limit }) -> { count, shown, usd, claude_usd, openrouter_usd, rows }.
 *  The filter itself is DatedFiles.sessions.find (the one reader of the day indexes, Server/doc/dated-files.md); `snapshots` lets a test pass its own. */
export function query(args = {}, { snapshots } = {}){ return DatedFiles.sessions.find(args, snapshots); }

/** Plain text for a human or a model that did not ask for --json. */
export function format(result){
	const lines = [`${result.count} session(s) matched; Claude API-equivalent $${result.claude_api_equivalent_usd}, OpenRouter real $${result.openrouter_real_usd}${result.count > result.shown ? `; showing the first ${result.shown}` : ""}`];
	for (const r of result.rows) lines.push(`${r.day}  $${String(r.usd).padStart(7)}  ${String(r.model ?? "").padEnd(18)} ${r.id}  ${[r.category, ...r.tags].filter(Boolean).join(", ")}${r.core.length ? "  [" + r.core.join(" ") + "]" : ""}`);
	return lines.join("\n");
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)){
	const args = {}, argv = process.argv.slice(2);
	let json = false;
	for (let i = 0; i < argv.length; i++){
		const a = argv[i];
		if (a === "--json") json = true;
		else if (a === "--help" || a === "-h"){ console.log("usage: node Server/session-query.mjs [--since YYYY-MM-DD] [--until YYYY-MM-DD] [--tag a,b] [--system module|category] [--state active|idle|closed] [--model part] [--provider claude|openrouter] [--parent id] [--min-cost usd] [--text word] [--sort recent|oldest|cost] [--limit 25] [--json]"); process.exit(0); }
		else if (a.startsWith("--")){ args[a.slice(2).replaceAll("-", "_")] = argv[++i]; }
	}
	const result = query(args);
	console.log(json ? JSON.stringify(result) : format(result));
}
