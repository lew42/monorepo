/* known-answer.mjs — "is a cheap model's factual claim actually TRUE?", checked by code, not a
 * judge's opinion. (owner addition, 2026-10-02, to the model-weights brief: "Build small fact
 * tools in node ... Have cheap models analyse the same facts. Code checks their factual claims
 * against the tool output.")
 *
 * facts.mjs computes three ground-truth facts about a directory (naming mismatches, comment
 * density per file, which modules are missing a readme.md/doc/). This script turns each into a
 * QUESTION WITH A KNOWN ANSWER, hands a model the SAME raw data already inlined in the prompt
 * (never a tool call to go re-read the files itself — section 5b's "fewer requests" rule: a cheap
 * model is rate-limited per request, so one prompt with everything in it beats twenty), and scores
 * the model's own JSON answer against facts.mjs's own output: recall (did it find the real ones?)
 * and precision (did it invent any?).
 *
 * usage:
 *   node Servex/ext/openrouter/evals/known-answer.mjs --models deepseek/deepseek-v4.1-flash,openai/gpt-6-luna,google/gemini-3.8-flash --dir public/framework/ai/tests
 *   node Servex/ext/openrouter/evals/known-answer.mjs --models claude-sonnet-5 --dir public/framework/ai/tests   -- the reference/control run
 *
 * Each run appends one {"known_answer": {...}} line to results.jsonl (sibling file) — model,
 * question, recall, precision, cost_usd, ms. Nothing here touches the live site; it is plain text
 * in, plain text out, so there is no page to load and no browser needed.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { naming, comments, structure } from "./facts.mjs";
import { mcp, appendJSON, readJsonl, nowLocal, waitForRealTurn } from "./library.mjs";
import { provider_for } from "../provider.js";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../../../..");
const RESULTS_PATH = path.join(HERE, "known-answer-results.jsonl");
const OR_LOG_PATH = path.join(process.env.LOCALAPPDATA || path.join(process.env.HOME, "AppData/Local"), "lew42", "servex", "logs", "openrouter.jsonl");

/* ── the three questions, each with its own ground truth computed straight from facts.mjs — never
 * typed by hand, so if the rule in facts.mjs changes, the question's right answer changes with it
 * (CLAUDE.md law 7: compute, don't recall). ── */
function buildQuestions(dir){
	const n = naming(dir), c = comments(dir), s = structure(dir);
	return [
		{
			id: "naming",
			ask: `Here is a JSON list of every exported class found under ${dir}, each with its file path, class name and containing folder name:\n\n${JSON.stringify(n.rows, null, 1)}\n\nThe rule: a class "Thing" should live in a file "Thing.js" inside a folder named "Thing" (exceptions: a second class in the main file, or a sibling file "Thing.js" in a folder that is itself capitalised). List the file paths that BREAK this rule.`,
			truth: new Set(n.mismatches.map(m => m.split(":")[0].trim())),
		},
		{
			id: "comments",
			ask: `Here is a JSON list of every .js file under ${dir} with its line count and comment-line ratio:\n\n${JSON.stringify(c.rows.map(r => ({ file: r.file, lines: r.lines, comment_ratio: r.comment_ratio })), null, 1)}\n\nName the 3 files with the HIGHEST comment_ratio, highest first.`,
			truth: new Set(c.rows.slice(0, 3).map(r => r.file)),
			ordered: c.rows.slice(0, 3).map(r => r.file),
		},
		{
			id: "structure",
			ask: `Here is a JSON list of every module (a folder with a page.js) under ${dir}, with whether it has a readme.md and a doc/ folder:\n\n${JSON.stringify(s.rows.map(r => ({ module: r.module, has_readme: r.has_readme, has_doc: r.has_doc })), null, 1)}\n\nList the module paths that are MISSING a readme.md, a doc/ folder, or both.`,
			truth: new Set(s.incomplete),
		},
	];
}

function scoreAnswer(claimed, truth){
	const claimedSet = new Set((claimed || []).map(String));
	const tp = [...claimedSet].filter(x => truth.has(x)).length;
	const recall = truth.size ? tp / truth.size : (claimedSet.size === 0 ? 1 : 0);
	const precision = claimedSet.size ? tp / claimedSet.size : (truth.size === 0 ? 1 : 0);
	return { recall: +recall.toFixed(3), precision: +precision.toFixed(3), claimed: [...claimedSet], truth: [...truth] };
}

async function resolveCost(model, agentId, waitedCost){
	if (provider_for(model) !== "openrouter") return waitedCost ?? null;
	for (let i = 0; i < 15; i++){
		const lines = readJsonl(OR_LOG_PATH).filter(l => l.agent === agentId);
		if (lines.length) return +lines.reduce((s, l) => s + (Number(l.cost_usd) || 0), 0).toFixed(6);
		await new Promise(r => setTimeout(r, 2000));
	}
	return null;
}

async function runOne(model, question, runTag){
	const prompt = [
		`Answer ONE question with a factual list. Do not use any tool — everything you need is already in this prompt.`,
		question.ask,
		`Reply with ONLY a JSON array of strings (the file/module paths you found), nothing else — no markdown fence, no explanation. An empty array ("[]") is a valid answer if you find nothing.`,
	].join("\n\n");
	const name = `known-answer-${question.id}-${model.replace(/[^a-z0-9]+/gi, "-")}-${Date.now()}`;
	const spawned = await mcp("spawn_agent", { role: "minion", name, prompt, model, effort: "low", cwd: ROOT, permission_mode: "bypassPermissions" });
	if (!spawned.id) return { ok: false, why: spawned.raw || spawned.why || "spawn failed" };
	const t0 = Date.now();
	const waited = await waitForRealTurn(spawned, 180_000, 300_000);
	try { await mcp("stop_agent", { id: spawned.id }, 20000); } catch {}
	const ms = Date.now() - t0;
	const cost_usd = await resolveCost(model, spawned.id, waited?.cost);
	let claimed = null, parseError = null;
	try {
		const text = String(waited?.words ?? "").trim();
		const match = text.match(/\[[\s\S]*\]/); // tolerate a stray sentence around the array
		claimed = JSON.parse(match ? match[0] : text);
		if (!Array.isArray(claimed)) throw new Error("not an array");
	} catch (e) { parseError = String(e.message || e); }
	const score = claimed ? scoreAnswer(claimed, question.truth) : { recall: 0, precision: 0, claimed: null, truth: [...question.truth] };
	const row = { at: nowLocal(), run: name, question: question.id, model, effort: "low", ms, cost_usd,
		parse_ok: !!claimed, parse_error: parseError, ...score, raw_words: waited?.words ?? null };
	appendJSON(RESULTS_PATH, { known_answer: row });
	return row;
}

function parseArgs(argv){
	const flag = n => { const i = argv.indexOf(n); return i < 0 ? null : argv[i + 1]; };
	return {
		models: (flag("--models") || "").split(",").map(s => s.trim()).filter(Boolean),
		dir: flag("--dir") || "public/framework/ai/tests",
	};
}

async function main(){
	const { models, dir } = parseArgs(process.argv.slice(2));
	if (!models.length) throw new Error("--models a,b is required");
	const questions = buildQuestions(path.resolve(ROOT, dir));
	console.log(`known-answer.mjs: ${questions.length} question(s) x ${models.length} model(s) over ${dir}`);
	const rows = [];
	for (const model of models){
		for (const q of questions){
			process.stdout.write(`  ${q.id} / ${model} ... `);
			const row = await runOne(model, q);
			console.log(row.ok === false ? `SKIPPED (${row.why})` : `recall ${row.recall} precision ${row.precision} $${row.cost_usd ?? "?"} ${row.ms}ms`);
			rows.push(row);
		}
	}
	const prices = { "deepseek/deepseek-v4.1-flash": "cheap", "openai/gpt-6-luna": "cheap", "google/gemini-3.8-flash": "mid", "claude-sonnet-5": "reference" };
	console.log("\nmodel                          question    recall  precision  cost       ms      tier");
	for (const r of rows) if (r.ok !== false) console.log([
		r.model.padEnd(30), r.question.padEnd(11), String(r.recall).padEnd(7), String(r.precision).padEnd(10),
		String(r.cost_usd ?? "?").padEnd(10), String(r.ms).padEnd(7), prices[r.model] ?? "",
	].join(" "));
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) main().catch(e => { console.error(String(e?.stack || e)); process.exitCode = 1; });
