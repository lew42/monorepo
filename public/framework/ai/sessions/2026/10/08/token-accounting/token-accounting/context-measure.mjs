#!/usr/bin/env node
// context-measure.mjs — measures, from a REAL session transcript, how much of a
// session's $ is repeated context (cache reads) vs new work (fresh input + output),
// how that share grows as the session gets longer, and whether a gap (an idle agent,
// a Servex restart) breaks the cache (a cache_write spike where a cache_read was
// expected). Owner's ask, 2026-10-07: "verify from the session files... 12 tool calls
// over a 100k window is ~1.2M cache-read tokens."
//
// Run: node public/framework/ai/sessions/2026/10/08/token-accounting/token-accounting/context-measure.mjs <session-id>
import { find_transcript, cost_of_transcript } from "../../../../../../../../../Server/session-cost.mjs";

const id = process.argv[2];
if (!id) { console.error("usage: node context-measure.mjs <session-id>"); process.exit(2); }
const path = find_transcript(id);
if (!path) { console.error("no transcript found for", id); process.exit(1); }
const { by_prompt, total_usd, usd_breakdown } = cost_of_transcript(path);

console.log(`session ${id.slice(0, 8)}… — ${by_prompt.length} priced turns, $${total_usd} total\n`);
console.log("Repeated-context share of the whole session's $:");
console.log(`  cache_read $${usd_breakdown.cache_read} (${(usd_breakdown.cache_read / total_usd * 100).toFixed(1)}%)  <- re-reading old context, every turn`);
console.log(`  cache_write $${usd_breakdown.cache_write} (${(usd_breakdown.cache_write / total_usd * 100).toFixed(1)}%)  <- priming new context into the cache`);
console.log(`  fresh input $${usd_breakdown.in} (${(usd_breakdown.in / total_usd * 100).toFixed(1)}%)  <- genuinely new tokens this turn`);
console.log(`  output      $${usd_breakdown.out} (${(usd_breakdown.out / total_usd * 100).toFixed(1)}%)  <- the model's own words`);

// Context size over time: cache_read + cache_write + input ≈ what this turn re-sent.
// Growth per turn, sampled every N turns so a 4000-turn session still prints readably.
const N = Math.max(1, Math.floor(by_prompt.length / 40));
console.log(`\nContext size per turn (sampled every ${N} turns) — input+cache_read+cache_write tokens:`);
let prev_gap_flag = "";
let last_ts = null;
for (let i = 0; i < by_prompt.length; i++){
	const g = by_prompt[i];
	const ctx = g.input + g.cache_read + g.cache_write;
	const ts = Date.parse(g.at);
	let gap_min = null;
	if (last_ts != null && Number.isFinite(ts)) gap_min = (ts - last_ts) / 60000;
	last_ts = Number.isFinite(ts) ? ts : last_ts;
	// A cache MISS signature: cache_write is a large share of this turn's context when the
	// turn before it should have made it a cache_read instead (the context didn't shrink).
	const miss = g.cache_write > 0 && g.cache_read === 0 && i > 0;
	if (i % N === 0 || miss || (gap_min != null && gap_min > 10)){
		const flag = [miss ? "CACHE-MISS" : "", gap_min != null && gap_min > 10 ? `gap ${gap_min.toFixed(0)}m` : ""].filter(Boolean).join(" ");
		console.log(`  turn ${i + 1}: ctx=${ctx.toLocaleString()} (read=${g.cache_read.toLocaleString()} write=${g.cache_write.toLocaleString()} in=${g.input}) $${g.usd}${flag ? "  <- " + flag : ""}`);
	}
}

// Cost per turn vs turn number, linear-fit slope: is $/turn flat (cache working) or growing
// (every turn re-pricing a bigger and bigger window)?
const first10 = by_prompt.slice(0, 10).reduce((n, g) => n + g.usd, 0) / Math.min(10, by_prompt.length);
const last10 = by_prompt.slice(-10).reduce((n, g) => n + g.usd, 0) / Math.min(10, by_prompt.length);
console.log(`\nAvg $/turn, first 10 turns: $${first10.toFixed(4)}  |  last 10 turns: $${last10.toFixed(4)}  (${(last10 / (first10 || 0.0001)).toFixed(1)}x)`);
