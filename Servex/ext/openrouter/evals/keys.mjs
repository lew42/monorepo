#!/usr/bin/env node
/* keys.mjs — Phase 17 ("keys to success, the benchmark corpus we already have").
 *
 * A model reads ONE of the owner's own past prompts and lists its KEYS TO SUCCESS: the primary
 * statements, to-dos, questions and decisions that have to happen for a good answer, whether the
 * answer is already known or not. Several models do the same prompt; a judge then MERGES keys
 * that mean the same thing under different wording, and gives each merged key a consensus
 * weight — the share of models that found something like it. Each model is then scored against
 * that consensus: recall (did it find the heavy keys?) and precision (did it also invent keys
 * nobody else saw?).
 *
 * Reuse, not a second harness (CLAUDE.md law 6): the spawn/wait/cost helpers below are the SAME
 * ones `library.mjs` uses for the test ladder (`mcp`, `nowLocal`, `appendJSON`, `readJsonl`,
 * `waitForRealTurn`, `resolveCost` — all exported from there now, imported here). The one new
 * thing this script needs that library.mjs doesn't: reading a model's own WORDS back (`rules.mjs`
 * already does this the same way — `wait_for_agent`'s `.words` is the model's final reply text,
 * because this is a one-shot question, not a file edit library.mjs's mechanical checks could grade).
 *
 * Where results land: each prompt is its own page, `public/framework/ai/tests/keys-to-success/
 * <id>/page.jsonl` (class `KeysTest.js`, the sibling of the ladder's `AITest.js` — same realm,
 * same "a test is a page" shape from Phase 10). `--extract` (the default, given `--models`)
 * appends one `{"key_run": {...}}` line per model per prompt; `--judge` reads every prompt's
 * key_runs, asks a Sonnet judge to merge them, and appends one `{"merge": {...}}` line plus one
 * `{"model_score": {...}}` line per model.
 *
 * Usage:
 *   node keys.mjs --models claude-sonnet-5,claude-opus-5-5 --effort medium   (extraction)
 *   node keys.mjs --judge                                                   (merge + score)
 *   node keys.mjs --only bigger --models ...                                (one prompt)
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { mcp, nowLocal, appendJSON, readJsonl, waitForRealTurn, resolveCost } from "./library.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../../../.."); // Servex/ext/openrouter/evals -> repo root
const TASK_DIR = path.join(ROOT, "public/framework/ai/2026-09-30/openrouter-harness/test-library");
const PROMPTS_PATH = path.join(TASK_DIR, "keys-prompts.jsonl");
const PAGES_DIR = path.join(ROOT, "public/framework/ai/tests/keys-to-success");

const slug = s => String(s).replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase();

function loadPrompts(only){
	return readJsonl(PROMPTS_PATH).filter(p => !only || p.id === only);
}

/* The one `{"key_run": {...}}`-shaped line already on a prompt's page.jsonl, newest per model
 * kept — the same "latest wins" rule every page.jsonl reader in this repo uses, so a re-run of a
 * model replaces its old extraction rather than piling up duplicates. */
function keyRunsFor(id){
	const lines = readJsonl(path.join(PAGES_DIR, id, "page.jsonl")).filter(l => l.key_run);
	const byModel = new Map();
	for (const { key_run } of lines) byModel.set(key_run.model, key_run);
	return [...byModel.values()];
}

function extractionPrompt(text){
	return `This is one of the owner's own real past prompts to an AI coding agent working on a web `
		+ `framework repository (not a test question — a genuine instruction). List its KEYS TO `
		+ `SUCCESS: the primary statements, to-dos, questions and decisions that must happen for a `
		+ `good answer, whether or not the answer is already known. Return ONLY a JSON array of short `
		+ `strings (each under about 10 words), most important first, at most 8 items — no markdown `
		+ `fences, no other text, nothing before or after it, just the raw JSON array.\n\nPROMPT:\n${text}`;
}

/* Pulls the first `[ ... ]` out of a reply — tolerates a stray code fence or a leading sentence a
 * model added despite being told not to (the same defensive parse `rules.mjs`'s own checks use). */
function parseJsonArray(text){
	const m = String(text ?? "").match(/\[[\s\S]*\]/);
	if (!m) return null;
	try { const a = JSON.parse(m[0]); return Array.isArray(a) ? a.filter(k => typeof k === "string" && k.trim()) : null; }
	catch { return null; }
}
function parseJsonObject(text){
	const m = String(text ?? "").match(/\{[\s\S]*\}/);
	if (!m) return null;
	try { return JSON.parse(m[0]); } catch { return null; }
}

/* ── one prompt, one model: extract its keys ── */

async function extractOne(p, model, effort){
	const runName = `keys-${p.id}-${slug(model)}-${effort}-${Date.now()}`;

	// role: "helper", not "minion" — a one-shot question with no repo work to do needs none of the
	// minion skill's readme-chain loading, and it shows in the bill: the SAME trivial prompt cost
	// $0.40 as a minion (medium effort) and $0.11 as a helper, measured before committing to this
	// shape (2026-10-01) — roughly 4x for context this task never uses. No task dir either: a
	// helper doesn't need one, and this script has nothing to write into a run folder anyway (its
	// only output is the reply text, parsed below).
	let spawned, waited, note = "";
	try {
		spawned = await mcp("spawn_agent", {
			role: "helper", name: `keys-${p.id}`, prompt: extractionPrompt(p.text), model, effort,
			permission_mode: "bypassPermissions"
		});
		if (!spawned.id) {
			const why = String(spawned.raw || spawned.why || "spawn_agent did not return an id");
			if (/spend|cap/i.test(why) && /refused/i.test(why)) return { skipped: true, prompt: p.id, model, effort, reason: why };
			throw new Error(why);
		}
		waited = await waitForRealTurn(spawned);
	} catch (e) {
		note = `run failed: ${String(e?.message || e).slice(0, 300)}`;
	} finally {
		if (spawned?.id) try { await mcp("stop_agent", { id: spawned.id }, 20000); } catch {}
	}

	const cost_usd = spawned?.id ? await resolveCost(model, spawned.id, waited?.cost) : null;
	const keys = parseJsonArray(waited?.words);
	if (!note) note = keys ? "" : `could not parse a JSON array from the reply: "${(waited?.words || "").slice(0, 200)}"`;

	const row = { at: nowLocal(), run: runName, prompt: p.id, model, effort, keys: keys ?? [], cost_usd, turns: waited?.turns ?? null, note };
	appendJSON(path.join(PAGES_DIR, p.id, "page.jsonl"), { key_run: row });
	return row;
}

/* ── one prompt: judge merges every model's keys, scores each model against the merge ── */

const JUDGE_MODEL = "claude-sonnet-5";

function judgePrompt(keyRuns){
	const listing = keyRuns.map(r => `${r.model}: ${JSON.stringify(r.keys)}`).join("\n");
	return `Several AI models each read the same real prompt and separately listed its "keys to `
		+ `success" (the primary statements, to-dos, questions and decisions a good answer must `
		+ `cover). Merge keys across models that mean the same thing even when worded differently — `
		+ `independent agreement should reinforce ONE merged key, not create two. For each merged `
		+ `key, give it a short canonical wording and a weight = (number of models whose list `
		+ `contained something equivalent to it) / ${keyRuns.length} (the total number of models `
		+ `below). Then, for EVERY original key from every model below, say which merged key id it `
		+ `maps to, or null if no other model found anything equivalent to it (a key only that model `
		+ `invented).\n\nModels and their raw keys:\n${listing}\n\n`
		+ `Reply with ONLY this JSON shape, no other text before or after it:\n`
		+ `{"merged":[{"id":"m1","key":"...","weight":0.67}, ...],`
		+ `"mapping":{"<model>":[{"raw":"...","merged_id":"m1"},{"raw":"...","merged_id":null}], ...}}`;
}

/* recall/precision stay out of the model's own hands — the judge only does the hard semantic
 * part (which keys are "the same idea"); the arithmetic here is exact and auditable. recall: of
 * all the weight on the table, how much did THIS model's list touch. precision: of the keys THIS
 * model actually wrote down, how many turned out to match something another list also said. */
function scoreModels(keyRuns, judged){
	const merged = judged.merged ?? [];
	const totalWeight = merged.reduce((s, m) => s + (m.weight ?? 0), 0);
	return keyRuns.map(r => {
		const mapped = judged.mapping?.[r.model] ?? [];
		const hitIds = new Set(mapped.filter(m => m.merged_id).map(m => m.merged_id));
		const recallWeight = merged.filter(m => hitIds.has(m.id)).reduce((s, m) => s + (m.weight ?? 0), 0);
		const recall = totalWeight > 0 ? +(recallWeight / totalWeight).toFixed(3) : null;
		const precision = mapped.length ? +(mapped.filter(m => m.merged_id).length / mapped.length).toFixed(3) : null;
		return { model: r.model, recall, precision };
	});
}

async function judgeOne(p){
	const keyRuns = keyRunsFor(p.id).filter(r => r.keys?.length);
	if (keyRuns.length < 2) return { prompt: p.id, skipped: "needs at least 2 models' extractions" };

	let spawned, waited, note = "";
	try {
		spawned = await mcp("spawn_agent", {
			role: "helper", name: `keys-judge-${p.id}`, prompt: judgePrompt(keyRuns), model: JUDGE_MODEL, effort: "medium",
			permission_mode: "bypassPermissions"
		});
		if (!spawned.id) throw new Error(spawned.raw || spawned.why || "spawn_agent did not return an id");
		waited = await waitForRealTurn(spawned);
	} catch (e) {
		note = `run failed: ${String(e?.message || e).slice(0, 300)}`;
	} finally {
		if (spawned?.id) try { await mcp("stop_agent", { id: spawned.id }, 20000); } catch {}
	}

	const judged = parseJsonObject(waited?.words);
	if (!judged?.merged) return { prompt: p.id, failed: note || "judge reply did not parse as the expected JSON" };

	appendJSON(path.join(PAGES_DIR, p.id, "page.jsonl"), { merge: judged });
	const scores = scoreModels(keyRuns, judged);
	for (const s of scores) appendJSON(path.join(PAGES_DIR, p.id, "page.jsonl"), { model_score: s });
	return { prompt: p.id, merged_keys: judged.merged.length, scores };
}

/* ── CLI ── */

function parseArgs(argv){
	const flag = name => { const i = argv.indexOf(name); return i < 0 ? null : argv[i + 1]; };
	const models = (flag("--models") || "").split(",").map(s => s.trim()).filter(Boolean);
	const effort = flag("--effort") || "medium";
	const only = flag("--only");
	const judge = argv.includes("--judge");
	return { models, effort, only, judge };
}

async function main(){
	const { models, effort, only, judge } = parseArgs(process.argv.slice(2));
	const prompts = loadPrompts(only);
	if (!prompts.length) throw new Error(only ? `no prompt "${only}" in ${PROMPTS_PATH}` : `no prompts found in ${PROMPTS_PATH}`);

	if (judge){
		for (const p of prompts){
			process.stdout.write(`judging ${p.id} ... `);
			const r = await judgeOne(p);
			console.log(r.skipped ? `skipped (${r.skipped})` : r.failed ? `FAILED (${r.failed})` : `${r.merged_keys} merged key(s), ${r.scores.length} model score(s)`);
		}
		return;
	}

	if (!models.length) throw new Error("--models a,b is required to extract keys (or pass --judge to merge and score what's already extracted)");
	console.log(`keys.mjs: ${prompts.length} prompt(s) x ${models.length} model(s), one agent at a time`);
	for (const p of prompts){
		for (const model of models){
			process.stdout.write(`  ${p.id} / ${model} ... `);
			const row = await extractOne(p, model, effort);
			if (row.skipped) console.log(`SKIPPED, not recorded (${row.reason})`);
			else console.log(row.keys.length ? `${row.keys.length} key(s), $${row.cost_usd ?? "?"}` : `no keys parsed (${row.note})`);
		}
	}
	console.log("\nNext: node Servex/ext/openrouter/evals/keys.mjs --judge   (merges keys across models, scores each one)");
}

main().catch(e => { console.error(e.stack || e); process.exit(1); });
