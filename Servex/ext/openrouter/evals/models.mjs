// Generator for the Models page (public/framework/ai/system/models/). Reads the two sources of
// truth — results.jsonl (rule tests + probes) and public/framework/ai/tests/*/page.jsonl (the
// AITest library minion-test-library is building) — and writes models.json beside the page. The
// page never computes a number itself, it only shows what this script found. Run it again any
// time either source grows:
//
//   node Servex/ext/openrouter/evals/models.mjs
//
// Brief: public/framework/ai/2026-09-30/openrouter-harness/models-page/requirements.md
// (Phase 8 the page, Phase 9/10 the "how thinking works" note, Phase 11 test weighting.)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../../../../"); // Servex/ext/openrouter/evals -> repo root
const RESULTS = path.join(ROOT, "Servex/ext/openrouter/evals/results.jsonl");
const TESTS_DIR = path.join(ROOT, "public/framework/ai/tests");
const OUT_DIR = path.join(ROOT, "public/framework/ai/system/models");
const OUT = path.join(OUT_DIR, "models.json");

function readJsonl(file){
	if (!fs.existsSync(file)) return [];
	return fs.readFileSync(file, "utf8").split(/\r?\n/).filter(Boolean)
		.map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
}
function mean(nums){
	const xs = nums.filter(n => n != null && !Number.isNaN(n));
	return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null;
}

// --- Source 1: results.jsonl (the rule-tests harness and the probe-tasks harness). ---
const results = readJsonl(RESULTS).map(l => l.probe).filter(Boolean);

// A run never really happened — the spawn was refused or threw before any agent ran — if it has
// no turn and no settled cost. Its "pass" numbers are leftover shape, not a real result.
const reallyRan = r => r.turns != null && r.turns > 0 && r.cost_usd != null;

// Five sub-tests (rule-claude-md, rule-readme-chain, rule-tools, rule-append, rule-fence). The
// harness reruns the same model × effort × test more than once — a broken-routing attempt, then
// the fixed rerun; a $0 cost line, then the backfilled real one — so "the newest line per
// model × effort × test wins" (the parent's own rule for this harness): dedupe on that triple,
// not on the run's own (unique, never-reused) name.
const ruleRows = results.filter(r => typeof r.probe === "string" && r.probe.startsWith("rule-"));
const newestByTest = new Map();
for (const r of ruleRows){
	const key = r.model + "|" + (r.effort ?? "") + "|" + r.probe;
	const prev = newestByTest.get(key);
	if (!prev || r.at > prev.at) newestByTest.set(key, r);
}
const ruleFinal = [...newestByTest.values()];

// --- Source 2: public/framework/ai/tests/<slug>/page.jsonl — minion-test-library's AITest
// library. Line 1 is the test's own header ({class, title, kind, skills, rung, confidence, …});
// every line after it is one run (model, effort, pass, score, reasoning, cost_usd, ms, note,
// credit, criteria_scores — Amendment 6). Nothing there yet is not an error: this generator just
// has less to show until that minion lands rung-1/rung-2 data. ---
const testHeaders = new Map(); // slug -> header object
const testRuns = []; // every run, tagged with its test's slug
if (fs.existsSync(TESTS_DIR)){
	for (const slug of fs.readdirSync(TESTS_DIR)){
		const lines = readJsonl(path.join(TESTS_DIR, slug, "page.jsonl"));
		if (!lines.length) continue;
		testHeaders.set(slug, lines[0]);
		for (const line of lines.slice(1)){
			const [, body] = Object.entries(line)[0] ?? [];
			if (body && typeof body === "object" && "model" in body) testRuns.push({ ...body, testId: slug });
		}
	}
}

// Amendment 6: "is the test a good test?" — `great`/`ok`/`fail` is the old shape; `credit` (0..1,
// the judge's partial-credit score) is the new one. Fall back when a run has no credit yet.
function creditOf(r){
	if (r.credit != null) return r.credit;
	if (r.score === "great") return 1;
	if (r.score === "ok") return 0.5;
	if (r.score === "terrible" || r.score === "fail") return 0;
	if (Array.isArray(r.pass)) return mean(r.pass);
	return typeof r.pass === "number" ? r.pass : (r.pass ? 1 : 0);
}

// Spearman rank correlation, -1..1. Ties get the average rank (the simple, good-enough version).
function spearman(pairs){
	if (pairs.length < 4) return null; // "fewer than 4 models means null — not enough runs"
	const rank = xs => {
		const sorted = [...xs].map((v, i) => [v, i]).sort((a, b) => a[0] - b[0]);
		const r = new Array(xs.length);
		for (let i = 0; i < sorted.length;){
			let j = i; while (j < sorted.length && sorted[j][0] === sorted[i][0]) j++;
			const avg = (i + j - 1) / 2 + 1; // average rank, 1-based
			for (let k = i; k < j; k++) r[sorted[k][1]] = avg;
			i = j;
		}
		return r;
	};
	const xs = pairs.map(p => p[0]), ys = pairs.map(p => p[1]);
	const rx = rank(xs), ry = rank(ys);
	const n = pairs.length, mx = mean(rx), my = mean(ry);
	let num = 0, dx2 = 0, dy2 = 0;
	for (let i = 0; i < n; i++){ const dx = rx[i] - mx, dy = ry[i] - my; num += dx * dy; dx2 += dx * dx; dy2 += dy * dy; }
	const denom = Math.sqrt(dx2 * dy2);
	return denom ? num / denom : null;
}

// Amendment 6 point 2–4: discrimination (does this test's credit track each model's OVERALL
// strength — its mean credit over every OTHER test?), weight = discrimination × confidence,
// floored at 0 when discrimination is negative. A test with no discrimination yet (< 4 models, or
// no credit data at all) gets weight 1 — plain, unweighted — rather than silently zeroing it out.
const testWeight = new Map();
for (const slug of testHeaders.keys()){
	const ownRuns = testRuns.filter(r => r.testId === slug);
	const models = [...new Set(ownRuns.map(r => r.model))];
	const pairs = [];
	for (const model of models){
		const ownCredit = mean(ownRuns.filter(r => r.model === model).map(creditOf));
		const otherRuns = testRuns.filter(r => r.testId !== slug && r.model === model);
		const strength = mean(otherRuns.map(creditOf));
		if (ownCredit != null && strength != null) pairs.push([ownCredit, strength]);
	}
	const discrimination = spearman(pairs);
	const confidence = testHeaders.get(slug)?.confidence ?? 1;
	testWeight.set(slug, discrimination == null ? 1 : Math.max(0, discrimination) * confidence);
}

// A run that never recorded its effort (a harness gap, not a third configuration) merges into
// the SAME model's other rows rather than sitting alone as its own "effort: —" row — otherwise
// one model shows up twice for what was really one setting. Reassign it to whichever effort that
// model ran most elsewhere; a model with ONLY effort-less runs is left alone (nothing to merge into).
function mergeMissingEffort(list){
	const byModel = new Map();
	for (const r of list){
		if (!byModel.has(r.model)) byModel.set(r.model, []);
		byModel.get(r.model).push(r);
	}
	const out = [];
	for (const items of byModel.values()){
		const withEffort = items.filter(r => r.effort);
		const withoutEffort = items.filter(r => !r.effort);
		if (withEffort.length && withoutEffort.length){
			const counts = new Map();
			for (const r of withEffort) counts.set(r.effort, (counts.get(r.effort) ?? 0) + 1);
			const effort = [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
			out.push(...withEffort, ...withoutEffort.map(r => ({ ...r, effort })));
		} else {
			out.push(...items);
		}
	}
	return out;
}

function groupByModelEffort(list){
	const g = new Map();
	for (const r of list){
		const key = r.model + "|" + (r.effort ?? "");
		if (!g.has(key)) g.set(key, []);
		g.get(key).push(r);
	}
	return g;
}

// §1: ×Sonnet — the owner's ask is a PRICE ratio (list $/token), not a cost-of-this-run ratio, so
// it holds steady across kinds and doesn't wobble with how many tokens one run happened to use.
// Claude rows: Anthropic's own published list prices. OpenRouter rows: openrouter.ai's public
// /api/v1/models pricing (checked 2026-10-01; prompt/completion $ per token). Blended at a plain
// 1:1 prompt:completion average — this is a relative ranking number, not a cost estimate.
const ANTHROPIC_PRICE_PER_TOKEN = { // { prompt, completion } in $/token, Anthropic's list prices
	"claude-opus-5": { prompt: 15e-6, completion: 75e-6 },
	"claude-sonnet-5": { prompt: 3e-6, completion: 15e-6 },
	"claude-haiku-4-5-20251001": { prompt: 1e-6, completion: 5e-6 },
};
// Fallback snapshot of OpenRouter's public pricing (fetched 2026-10-01) in case the live fetch
// below can't reach the network when this generator runs; refreshed automatically when it can.
const OPENROUTER_PRICE_SNAPSHOT = {
	"openai/gpt-6-luna": { prompt: 1e-7, completion: 5e-7 },
	"deepseek/deepseek-v4.1-flash": { prompt: 1.5543e-8, completion: 3.96e-7 },
	"google/gemini-3.8-flash": { prompt: 7.5e-7, completion: 3.75e-6 },
	"google/gemini-3.1-pro-preview": { prompt: 2e-6, completion: 1.2e-5 },
};
async function fetchOpenRouterPrices(){
	try{
		const res = await fetch("https://openrouter.ai/api/v1/models");
		if (!res.ok) return OPENROUTER_PRICE_SNAPSHOT;
		const body = await res.json();
		const out = {};
		for (const m of body.data ?? []){
			if (!m.pricing) continue;
			const prompt = Number(m.pricing.prompt), completion = Number(m.pricing.completion);
			if (Number.isFinite(prompt) && Number.isFinite(completion)) out[m.id] = { prompt, completion };
		}
		return Object.keys(out).length ? out : OPENROUTER_PRICE_SNAPSHOT;
	} catch {
		return OPENROUTER_PRICE_SNAPSHOT;
	}
}
function blended(p){ return p ? (p.prompt + p.completion) / 2 : null; }

// Weighted mean of each run's credit, weighted by its test's weight (1 for rule tests and probes,
// which have no discrimination/confidence of their own yet).
function weightedPerformance(items){
	let num = 0, den = 0;
	for (const r of items){
		const w = r.testId ? (testWeight.get(r.testId) ?? 1) : 1;
		const c = creditOf(r);
		if (c == null) continue;
		num += c * w; den += w;
	}
	return den ? num / den : null;
}

const openrouterPrices = await fetchOpenRouterPrices();
const SONNET_RATE = blended(ANTHROPIC_PRICE_PER_TOKEN["claude-sonnet-5"]);
function xSonnetOf(model){
	const rate = blended(ANTHROPIC_PRICE_PER_TOKEN[model] ?? openrouterPrices[model]);
	return rate && SONNET_RATE ? +(rate / SONNET_RATE).toFixed(2) : null;
}

// A row "passes" a kind when it actually gets the work right at least some of the time — a
// configuration that scores 0 every time (the log-line control, today) is not a value leader, it
// is a broken check, and the owner asked that it never get named "best" on the strength of being
// merely the only thing in the list.
const passes = r => r.performance != null && r.performance > 0;

function buildKind(kindId, label, list, { alreadyFinal } = {}){
	const final = mergeMissingEffort(alreadyFinal ? list : list.filter(reallyRan));
	const grouped = groupByModelEffort(final);
	const rowsOut = [];
	for (const [key, items] of grouped){
		const [model, effort] = key.split("|");
		const performance = weightedPerformance(items);
		const cost = mean(items.map(r => r.cost_usd));
		rowsOut.push({ model, effort: effort || null, n: items.length, performance, cost });
	}
	for (const r of rowsOut){
		r.xSonnet = xSonnetOf(r.model);
		r.value = r.cost && r.performance != null ? +(r.performance / r.cost).toFixed(2) : null;
	}
	rowsOut.sort((a, b) => (b.value ?? -1) - (a.value ?? -1));
	const best = rowsOut.filter(passes).find(r => r.value != null) ?? null;
	return { kind: kindId, label, rows: rowsOut, best: best && { model: best.model, effort: best.effort, value: best.value } };
}

const kinds = [
	buildKind("rules", "Rule adherence — 5 house rules (CLAUDE.md law, readme chain, tool IDs, append.mjs, the fence)", ruleFinal, { alreadyFinal: true }),
	buildKind("page-blog", "Probe: write a blog post page from a one-line brief", results.filter(r => r.probe === "page-blog")),
	buildKind("log-line", "Probe: log one line to today's task", results.filter(r => r.probe === "log-line")),
];

// One more kind per distinct `kind` the test library declares (new-page, quick-fix, planning,
// broken-page, …) — empty today, fills in as minion-test-library lands runs.
const libraryKinds = [...new Set([...testHeaders.values()].map(h => h.kind).filter(Boolean))];
for (const kindId of libraryKinds){
	const slugs = [...testHeaders.entries()].filter(([, h]) => h.kind === kindId).map(([s]) => s);
	const list = testRuns.filter(r => slugs.includes(r.testId));
	kinds.push(buildKind(kindId, kindId, list, { alreadyFinal: true }));
}

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(OUT, JSON.stringify({
	generated_at: new Date().toISOString(),
	weighting_note: "Each test is weighted by how well it separates strong models from weak ones.",
	kinds,
}, null, "\t"));
console.log("wrote", OUT, "—", kinds.map(k => `${k.kind}: ${k.rows.length} rows`).join(", "));
