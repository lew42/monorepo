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

function groupByModelEffort(list){
	const g = new Map();
	for (const r of list){
		const key = r.model + "|" + (r.effort ?? "");
		if (!g.has(key)) g.set(key, []);
		g.get(key).push(r);
	}
	return g;
}

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

function buildKind(kindId, label, list, { alreadyFinal } = {}){
	const final = alreadyFinal ? list : list.filter(reallyRan);
	const grouped = groupByModelEffort(final);
	const rowsOut = [];
	for (const [key, items] of grouped){
		const [model, effort] = key.split("|");
		const performance = weightedPerformance(items);
		const cost = mean(items.map(r => r.cost_usd));
		rowsOut.push({ model, effort: effort || null, n: items.length, performance, cost });
	}
	// Baseline for ×Claude: the Anthropic control's cost in this kind (any claude-* model, any effort).
	const baseline = rowsOut.find(r => r.model.startsWith("claude-"));
	for (const r of rowsOut){
		r.xClaude = baseline?.cost ? (r.cost != null ? +(r.cost / baseline.cost).toFixed(2) : null) : null;
		r.value = r.cost && r.performance != null ? +(r.performance / r.cost).toFixed(2) : null;
	}
	rowsOut.sort((a, b) => (b.value ?? -1) - (a.value ?? -1));
	const best = rowsOut.find(r => r.value != null) ?? null;
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
