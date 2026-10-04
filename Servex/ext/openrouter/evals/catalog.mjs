// Generator for the Models page's CATALOG table (public/framework/ai/system/models/) — one row
// per model we actually use or tested: provider, context window, $/M in/out/cached, our own test
// scores (docs/reasoning/refine, from the new-brain eval), seconds, tokens in/out on that same
// test, and what a typical minion's own token mix would cost on that model.
//
// This is a SECOND generator writing into the SAME file as models.mjs (law 6: one models list,
// one file) — it reads whatever models.mjs already wrote, adds/replaces only the "catalog" key,
// and leaves "kinds"/"ladder" (the value-per-task-kind analysis) untouched. Run it again any time
// public/framework/ai/2026-10-03/new-brain/eval-results*.json changes:
//
//   node Servex/ext/openrouter/evals/catalog.mjs
//
// Brief: public/framework/ai/2026-10-04/models-page/requirements.md
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../../../../"); // Servex/ext/openrouter/evals -> repo root
const NEW_BRAIN = path.join(ROOT, "public/framework/ai/2026-10-03/new-brain");
const OUT = path.join(ROOT, "public/framework/ai/system/models/models.json");

function readJson(file, fallback = null){
	try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch { return fallback; }
}
function mean(nums){
	const xs = nums.filter(n => n != null && !Number.isNaN(n));
	return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null;
}

// --- Anthropic's own list prices (the Claude control rows; OpenRouter's catalog quotes a newer
// model generation under these same short names, so Claude rows use Anthropic's own numbers, not
// OpenRouter's). Cache pricing: Anthropic bills a cache READ at 10% of the base input price and a
// 5-minute cache WRITE at 125% of it (https://docs.claude.com/en/docs/build-with-claude/prompt-caching,
// checked 2026-10-04). Context window: 200K tokens for all three, per Anthropic's model page. ---
const CLAUDE = {
	"claude-opus-5-5": { label: "Claude Opus", prompt: 4e-6, completion: 20e-6, context: 200000 },
	"claude-sonnet-5": { label: "Claude Sonnet", prompt: 2e-6, completion: 10e-6, context: 200000 },
	"claude-haiku-4-5-20251001": { label: "Claude Haiku", prompt: 1e-6, completion: 5e-6, context: 200000 },
};
for (const c of Object.values(CLAUDE)) c.cache_read = c.prompt * 0.1;

// --- Which eval-results file each tested model's row came from, so the catalog can say which
// provider actually served the call (OpenRouter's normal routing, or a pinned Groq/Google route). ---
const EVAL_FILES = [
	{ file: "eval-results.json", provider_hint: null },           // normal OpenRouter routing (OR_PROVIDER unset)
	{ file: "eval-results-groq.json", provider_hint: "Groq" },     // run with OR_PROVIDER=Groq
	{ file: "eval-results-gemini.json", provider_hint: "Google AI Studio" }, // run with OR_PROVIDER=Google AI Studio
];

function providerOf(model, hint){
	if (hint) return hint;
	if (model.startsWith("local/")) return "local";
	if (model.startsWith("anthropic/") || model.startsWith("claude-")) return "Claude (direct)";
	return "OpenRouter";
}

// One eval-results.json model entry -> the handful of numbers the catalog table shows.
function summarize(model, res){
	const docs = res.level_a ? res.level_a.correct / res.level_a.total : null;
	const reasoning = res.level_b ? res.level_b.correct / res.level_b.total : null;
	const refine = res.level_c ? res.level_c.avg_score / 100 : null;
	return {
		docs, reasoning, refine,
		seconds: res.total_ms != null ? +(res.total_ms / 1000).toFixed(1) : null,
		tokens_in: res.tokens_in ?? null,
		tokens_out: res.tokens_out ?? null,
		eval_cost_usd: res.total_cost_usd ?? null,
	};
}

// --- OpenRouter's live catalog: pricing (prompt/completion/cache-read) and context window, for
// every model this page needs. One fetch; a snapshot is kept beside this file so a later run with
// no network still has pricing (never typed by hand — Phase 8's rule holds: the page computes,
// never recalls). ---
const SNAPSHOT_FILE = path.join(HERE, "catalog-price-snapshot.json");
async function fetchCatalog(){
	try {
		const res = await fetch("https://openrouter.ai/api/v1/models");
		if (!res.ok) throw new Error("HTTP " + res.status);
		const body = await res.json();
		const out = {};
		for (const m of body.data ?? []){
			if (!m.pricing) continue;
			out[m.id] = {
				prompt: Number(m.pricing.prompt) || 0,
				completion: Number(m.pricing.completion) || 0,
				cache_read: m.pricing.input_cache_read != null ? Number(m.pricing.input_cache_read) : null,
				context: m.context_length ?? null,
			};
		}
		fs.writeFileSync(SNAPSHOT_FILE, JSON.stringify(out, null, "\t"));
		return out;
	} catch {
		return readJson(SNAPSHOT_FILE, {});
	}
}

// A typical minion's own token mix this week (the owner's dictated numbers, 2026-10-04): 11.3M
// tokens read, 99% of them served from cache, 43k tokens written. Applied to each model's own
// price, so the column answers "what would MY typical minion cost, on this model" — not a
// one-size number. A model with no published cache price is charged the full prompt rate for the
// "cached" share too, and the row says so (cache_priced: false) rather than pretending a discount
// that provider doesn't offer.
const MINION_READ_TOKENS = 11_300_000;
const MINION_CACHED_SHARE = 0.99;
const MINION_WRITE_TOKENS = 43_000;
function minionCost(price){
	if (!price) return { usd: null, cache_priced: false };
	const cached = MINION_READ_TOKENS * MINION_CACHED_SHARE;
	const uncached = MINION_READ_TOKENS * (1 - MINION_CACHED_SHARE);
	const cacheRate = price.cache_read ?? price.prompt;
	const usd = cached * cacheRate + uncached * price.prompt + MINION_WRITE_TOKENS * price.completion;
	return { usd: +usd.toFixed(4), cache_priced: price.cache_read != null };
}

const orCatalog = await fetchCatalog();

// --- Build one row per (model, source file) pair actually run. ---
const rows = [];
for (const { file, provider_hint } of EVAL_FILES){
	const data = readJson(path.join(NEW_BRAIN, file));
	if (!data?.results) continue;
	for (const [model, res] of Object.entries(data.results)){
		const price = orCatalog[model] ?? null;
		const context = price?.context ?? null;
		rows.push({
			model,
			label: model.split("/").pop(),
			provider: providerOf(model, provider_hint),
			context,
			price_in_per_m: price ? +(price.prompt * 1e6).toFixed(4) : (model.startsWith("local/") ? 0 : null),
			price_out_per_m: price ? +(price.completion * 1e6).toFixed(4) : (model.startsWith("local/") ? 0 : null),
			price_cache_in_per_m: price?.cache_read != null ? +(price.cache_read * 1e6).toFixed(4) : null,
			...summarize(model, res),
			typical_minion_usd: price ? minionCost(price).usd : (model.startsWith("local/") ? 0 : null),
			typical_minion_cache_priced: price ? minionCost(price).cache_priced : null,
		});
	}
}

// Add the three Claude control rows even though new-brain never calls them directly (they're the
// bar every other row is measured against on the "value per kind" table above this one).
for (const [model, c] of Object.entries(CLAUDE)){
	rows.push({
		model, label: c.label, provider: "Claude (direct)", context: c.context,
		price_in_per_m: +(c.prompt * 1e6).toFixed(2), price_out_per_m: +(c.completion * 1e6).toFixed(2),
		price_cache_in_per_m: +(c.cache_read * 1e6).toFixed(2),
		docs: null, reasoning: null, refine: null, seconds: null, tokens_in: null, tokens_out: null, eval_cost_usd: null,
		typical_minion_usd: minionCost({ prompt: c.prompt, completion: c.completion, cache_read: c.cache_read }).usd,
		typical_minion_cache_priced: true,
	});
}

const prior = readJson(OUT, {});
fs.writeFileSync(OUT, JSON.stringify({
	...prior,
	catalog: rows,
	catalog_generated_at: new Date().toISOString(),
	catalog_note: "price_in/out/cache are OpenRouter's /api/v1/models catalog, $ per million tokens; Claude rows use Anthropic's own list prices. docs/reasoning/refine are pass-rates (0..1) from the new-brain eval (public/framework/ai/2026-10-03/new-brain/). typical_minion_usd applies this week's median minion token mix (11.3M read, 99% cached, 43k written) to the model's own price.",
}, null, "\t"));
console.log("wrote", OUT, "— catalog:", rows.length, "rows");
