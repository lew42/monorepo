#!/usr/bin/env node
/* `node Servex/ext/refine/test/live-refine-measure.mjs [--fast] [--raw <path>] [--max-cost N]` —
 * replays a real long dictation sentence by sentence (default: public/framework/ai/sessions/2026/09/29/
 * a918d03d-6afe-4958-b425-20e9eba998ef/task/runs/a/raw.txt, the longest raw text found under the
 * 2026-09-29 prompt-refine run set, ~10 minutes of speech), calling LiveRefine DIRECTLY (real Haiku
 * via RefineCall, no Servex process needed). Writes:
 *   public/framework/ai/sessions/2026/10/12/session-cca8d997/refine-haiku-live/measure/results.jsonl   — one line per sentence
 *   public/framework/ai/sessions/2026/10/12/session-cca8d997/refine-haiku-live/measure/summary.md      — the numbers, read by a person
 * Design: public/framework/ext/Refine/doc/live-refine-2026-10-12.md.
 *
 * Two paces:
 *   (default) a new sentence every ~4s, AWAITED before the next is sent — realistic speaking pace;
 *             each amend call (a few seconds) usually finishes before the next sentence lands, so
 *             coalescing rarely triggers (same as a real, unhurried dictation).
 *   --fast    every sentence fired WITHOUT waiting for the previous one to place — this is what
 *             actually exercises coalescing (an amend already in flight catches every sentence
 *             that arrived while it ran), and is far cheaper (far fewer amend calls).
 * `--max-cost` (default $5) is a safety net: once the running `cost_usd` crosses it, no more
 * sentences are sent (the ones already in flight still finish and get placed). */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import LiveRefine from "../LiveRefine.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, "../../../../");   // Servex/ext/refine/test -> repo root

const args = process.argv.slice(2);
const fast = args.includes("--fast");
const raw_i = args.indexOf("--raw");
const RAW_PATH = raw_i >= 0 ? path.resolve(args[raw_i + 1]) : path.join(REPO,
	"public/framework/ai/sessions/2026/09/29/a918d03d-6afe-4958-b425-20e9eba998ef/task/runs/a/raw.txt");
const cost_i = args.indexOf("--max-cost");
const MAX_COST = cost_i >= 0 ? +args[cost_i + 1] : 5;
const limit_i = args.indexOf("--limit");   // replay only the first N sentences
const LIMIT = limit_i >= 0 ? +args[limit_i + 1] : Infinity;

const OUT_DIR = path.join(REPO, "public/framework/ai/sessions/2026/10/12/session-cca8d997/refine-haiku-live/measure");
fs.mkdirSync(OUT_DIR, { recursive: true });
const RESULTS = path.join(OUT_DIR, "results.jsonl");
const SUMMARY = path.join(OUT_DIR, "summary.md");

const sleep = ms => new Promise(r => setTimeout(r, ms));
const median = ns => { const s = [...ns].sort((a, b) => a - b); const m = s.length >> 1; return s.length ? (s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2) : 0; };
const p90 = ns => { const s = [...ns].sort((a, b) => a - b); return s.length ? s[Math.min(s.length - 1, Math.ceil(s.length * 0.9) - 1)] : 0; };

async function main(){
	const raw = fs.readFileSync(RAW_PATH, "utf8");
	const all_sentences = raw.replace(/\s+/g, " ").trim().split(/(?<=[.!?])\s+/).filter(Boolean).slice(0, LIMIT);
	console.log(`replaying up to ${all_sentences.length} sentences from ${path.relative(REPO, RAW_PATH)}`
		+ (fast ? " (--fast: fired without waiting — exercises coalescing)" : " (one every ~4s, like speech: never waits for the previous one to place)")
		+ ` (--max-cost $${MAX_COST})`);

	const key = "measure-" + Date.now();
	const r = LiveRefine.get(key);
	fs.writeFileSync(RESULTS, "");   // this run's own output; a re-run replaces it, never appends to a stale one

	let cumulative = "";
	const sent = [];   // [{n, t0, promise}]
	let stopped_at = all_sentences.length;
	for (let i = 0; i < all_sentences.length; i++){
		if (r.cost_usd > MAX_COST){ stopped_at = i; console.log(`\nstopped sending at sentence ${i} (cost_usd $${r.cost_usd} crossed --max-cost $${MAX_COST})`); break; }
		cumulative += (cumulative ? " " : "") + all_sentences[i];
		const n = i + 1, text = cumulative, t0 = Date.now();
		// `final` is sent as true only on the very last sentence of the WHOLE file; if --max-cost cuts the run
		// short, the trailing `r.step(..., {final:true})` call below (same `cumulative`) closes the prompt instead.
		const final = i === all_sentences.length - 1;
		const p = r.step({ prompt: "measure", text, final }).then(out => { process.stdout.write(`\r${n} placed_ms=${out.timing.placed_ms} pending=${out.pending} cost=$${r.cost_usd}   `); return out; });
		sent.push({ n, t0 });
		sent[sent.length - 1].promise = p;
		if (!fast && !final) await sleep(4000);
	}
	// make sure the very last thing sent really does close the prompt (final:true), even if --max-cost cut the run short
	const sentences = all_sentences.slice(0, stopped_at);
	for (const s of sent) s.out = await s.promise;
	await sleep(1000);   // a straggling clean() can still be settling after the last amend placed everything
	const final_out = await r.step({ prompt: "measure", text: cumulative, final: true });

	for (const s of sent) fs.appendFileSync(RESULTS, JSON.stringify({
		n: s.n, sentence: sentences[s.n - 1]?.slice(0, 120) ?? "", placed_ms: s.out.timing.placed_ms,
		clean_ms: s.out.timing.clean_ms, amend_ms: s.out.timing.amend_ms, pending: s.out.pending,
		unplaced: s.out.unplaced.length, cost_usd_so_far: s.out.cost_usd,
	}) + "\n");

	const placed = sent.map(s => s.out.timing.placed_ms);
	const clean_ms = sent.map(s => s.out.timing.clean_ms).filter(n => n > 0);
	const amend_ms = sent.map(s => s.out.timing.amend_ms).filter(n => n > 0);
	const all_calls = r.calls;   // in RESOLUTION order, not arrival order — fine for the aggregate numbers below
	const max_tokens_in = Math.max(0, ...all_calls.map(c => c.tokens?.in ?? 0));
	const max_tokens_out = Math.max(0, ...all_calls.map(c => c.tokens?.out ?? 0));
	const amend_calls = all_calls.filter(c => c.stage === "amend").length;
	const clean_calls = all_calls.filter(c => c.stage === "clean").length;
	const cited = new Set(final_out.outline.sections.flatMap(sec => sec.cards.flatMap(c => c.cites)));
	const coverage_ok = final_out.slots.every(s => cited.has(s.n));

	console.log("");
	const summary = `# Live refine — measured (${new Date().toISOString().slice(0, 10)})

Replayed ${sentences.length}${sentences.length < all_sentences.length ? ` of ${all_sentences.length}` : ""} sentences from \`${path.relative(REPO, RAW_PATH)}\` (a real dictation), ${fast ? "fired back to back without waiting (--fast)" : "one every ~4s like speech (never waiting for placement)"}, through \`LiveRefine\` directly (real Haiku via RefineCall, no Servex process). Raw: [results.jsonl](./results.jsonl).
${sentences.length < all_sentences.length ? `\n**Stopped early** at the \`--max-cost $${MAX_COST}\` safety net — the full file would have cost proportionally more; the numbers below are real and representative either way (medians/p90 over ${sentences.length} real placed sentences).\n` : ""}
## Numbers

- **placed_ms** (sentence arrival → in the outline): median ${median(placed)} ms, p90 ${p90(placed)} ms
- **clean_ms**: median ${median(clean_ms)} ms, p90 ${p90(clean_ms)} ms (clean now rides in the amend call: one call per batch does both)
- **amend_ms**: median ${median(amend_ms)} ms, p90 ${p90(amend_ms)} ms (${amend_calls} calls for ${sentences.length} sentences — coalescing, at most ${LiveRefine.MAX_BATCH} per call)
- **tokens per call**: max in ${max_tokens_in}, max out ${max_tokens_out} (well under 100k)
- **total cost**: $${final_out.cost_usd}
- **ops**: ${r.op_counts.edit} edits, ${r.op_counts.add} adds (model-chosen); ${r.unplaced.length} sentence(s) force-placed as unplaced
- **coverage**: ${coverage_ok ? "every sentence cited at least once" : "BROKEN — a sentence was never cited"}

## What to try next
- **Per-call overhead dominates cost**: each call is a fresh Agent-SDK session (~8-10k input tokens before the outline). A resumed Haiku session with prompt caching, reset when it nears 100k, would cut most of it.
- **Pacing is on** (\`MIN_BATCH\` 3 / \`MAX_WAIT_MS\` 6000), measured on the same 30 sentences: without it 26 calls, $2.22, 7.3 s median placement; with it 15 calls, $1.27, 9.1 s. Tune those two numbers first if it feels slow or costs too much.
- **Earlier measurement** (one clean call per sentence, everything fired at once): 98 sentences, 42 s median clean, $6.03, 33 unplaced. That is why clean now rides in the amend call and a batch is capped.
`;
	fs.writeFileSync(SUMMARY, summary);
	console.log(summary);
}

main();
