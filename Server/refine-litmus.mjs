#!/usr/bin/env node
/* refine-litmus.mjs — deliverable 7: "the first rung of the model ladder, machine-checked."
 *
 * Runs `ext/Refine/engine.js`'s `clean()` against THREE CHEAP models on ONE short real
 * prompt, and reports, for each: did it pass the mechanical diff-check (deliverable 2 —
 * no invented content), its cost, and its latency. No opinion needed — the diff-check
 * already decides pass/fail; ties go to the cheapest. This is the same idea
 * `Server/refine.mjs`'s own `--models` drafting step already uses for the STRUCTURED rung
 * (try several models, let a mechanical/judge pass pick) — just one rung earlier, on CLEAN,
 * and fully mechanical (no judge call needed here at all).
 *
 * Usage:
 *   node Server/refine-litmus.mjs <raw.txt | date:line>
 *
 * <date:line> is a 0-based line into .claude/prompts/<date>.jsonl's `.prompt.text`, tried in
 * THIS tree first, then the main tree (same two-tree lookup `Server/refine.mjs`'s own
 * `resolveRaw()` does, for the same reason: `.claude/prompts/` is git-ignored and
 * per-worktree, so a prompt typed in a different tree's session won't be here) — reimplemented
 * here in a smaller form rather than imported, because `refine.mjs` doesn't export it.
 *
 * THE THREE MODELS, PICKED FROM WHAT'S ALREADY WIRED, NOT INVENTED (the brief's own
 * instruction): `claude-haiku-4-5-20251001` is `Server/refine.mjs`'s own `MODELS.haiku` — the
 * cheap end of the ALREADY-RUNNING Claude ladder. `deepseek/deepseek-v4.1-flash` and
 * `openai/gpt-6-luna` are the two models `Servex/ext/openrouter/spike.mjs`'s own
 * `DEFAULT_MODELS` marks "// cheap" — this repo's own, already-proven-to-work OpenRouter
 * harness (see `Servex/ext/openrouter/readme.md`: "it's wired up now"), not a new provider
 * invented for this script. If no OpenRouter key is on this machine
 * (`%LOCALAPPDATA%\lew42\servex\openrouter.key`), those two are skipped and said so plainly —
 * Haiku alone still runs and still gets a verdict; a missing key is never a crash.
 *
 * HOW EACH MODEL IS ACTUALLY CALLED: `engine.js`'s `clean()` takes a `call` override —
 * the same `(prompt, {model, cwd}) => {answer, cost_usd}` shape `Server/ask-each.mjs`'s own
 * `askOnce` already has (that shape IS the reuse point: see `engine.js`'s own doc comment).
 * For the plain Claude model, `call` IS `askOnce`, unchanged. For an OpenRouter model (its id
 * has a "/" in it), this file's own `callOpenRouter()` runs the exact same `query()` loop
 * `askOnce` runs, with one addition: `options.env` set from
 * `Servex/ext/openrouter/provider.js`'s `env_for("openrouter")` — the same env swap
 * `Servex/agents/Agents.js` (`options()`, see its own `or_env` line) already does for every
 * OpenRouter-backed agent in this repo. `askOnce` itself was not touched (out of this task's
 * fence) and has no `env` parameter to pass through, which is the one reason this duplicates
 * ~15 lines of its message-reading loop instead of calling it — everything else (the prompt
 * text, the mechanical check, `engine.js`) is shared, not forked.
 *
 * Models run ONE AT A TIME, never in parallel — same reason `spike.mjs` gives: a shared
 * OpenRouter key's running-dollar-total can't tell two concurrent calls apart, and there is
 * no per-call cost figure to read instead (only the SDK's own `total_cost_usd`, which prices
 * an OpenRouter-proxied call off ANTHROPIC's price table — wrong, but the only number
 * available without the several-second polling `provider.js`'s own `real_turn_cost()` does;
 * flagged plainly in the output as approximate for a proxied call, not fixed here — a known,
 * named limitation, not a silent one). */

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { clean } from "../public/framework/ext/Refine/engine.js";
import { askOnce } from "./ask-each.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));

// ---- the three models (see doc comment above for where each id comes from) ----------------

const MODELS = [
	{ id: "claude-haiku-4-5-20251001", label: "haiku (Anthropic)" },
	{ id: "deepseek/deepseek-v4.1-flash", label: "deepseek (OpenRouter)" },
	{ id: "openai/gpt-6-luna", label: "gpt-6-luna (OpenRouter)" },
];

// ---- pulling one short real prompt, same <date:line> convention refine.mjs uses -----------

function repoRoot(){
	const r = spawnSync("git", ["rev-parse", "--show-toplevel"], { encoding: "utf8", windowsHide: true }).stdout.trim();
	return r || process.cwd();
}
function mainTreeRoot(root){
	const r = spawnSync("git", ["rev-parse", "--git-common-dir"], { cwd: root, encoding: "utf8", windowsHide: true });
	if (r.status !== 0 || !r.stdout.trim()) return null;
	return path.dirname(path.resolve(root, r.stdout.trim()));
}
function resolveRaw(input, root){
	const m = /^(\d{4}-\d{2}-\d{2}):(\d+)$/.exec(input);
	if (!m) return { text: fs.readFileSync(input, "utf8"), sourceFile: path.resolve(input) };
	const [, date, lineStr] = m;
	const line = Number(lineStr);
	const candidates = [path.join(root, ".claude/prompts", `${date}.jsonl`)];
	const mainRoot = mainTreeRoot(root);
	if (mainRoot && path.resolve(mainRoot) !== path.resolve(root)) candidates.push(path.join(mainRoot, ".claude/prompts", `${date}.jsonl`));
	let file, lines; const misses = [];
	for (const candidate of candidates){
		try { lines = fs.readFileSync(candidate, "utf8").split(/\r?\n/).filter(Boolean); file = candidate; break; }
		catch (e){ misses.push(`${candidate} (${e.code || e.message})`); }
	}
	if (!file) throw new Error(`refine-litmus.mjs: no ${date}.jsonl found — tried ${misses.join(" and ")}`);
	if (line < 0 || line >= lines.length) throw new Error(`refine-litmus.mjs: ${file} has ${lines.length} line(s), no line ${line}`);
	const obj = JSON.parse(lines[line]);
	const text = obj?.prompt?.text;
	if (typeof text !== "string" || !text.trim()) throw new Error(`refine-litmus.mjs: line ${line} of ${file} has no usable .prompt.text`);
	return { text, sourceFile: file };
}

// ---- the OpenRouter call path (see doc comment above — mirrors askOnce exactly, plus env) --

async function hasOpenRouterKey(){
	try { const { has_key } = await import("../Servex/ext/openrouter/provider.js"); return has_key(); }
	catch { return false; } // Servex/ext/openrouter not present in this checkout at all — skip, don't crash
}

async function callOpenRouter(prompt, { model, cwd }){
	const [{ query }, { env_for, KEY_PATH }] = await Promise.all([
		import("../Servex/node_modules/@anthropic-ai/claude-agent-sdk/sdk.mjs"),
		import("../Servex/ext/openrouter/provider.js"),
	]);
	const env = { ...process.env, ...env_for("openrouter") }; // passed as options.env, never mutates process.env — safe even if a sibling call were concurrent
	const q = query({ prompt, options: { model, cwd, permissionMode: "bypassPermissions", allowedTools: [], env } });
	let answer = "", result = null;
	for await (const message of q){
		if (message.type === "assistant")
			for (const block of message.message?.content ?? [])
				if (block.type === "text" && block.text.trim()) answer += (answer ? "\n\n" : "") + block.text;
		if (message.type === "result") result = message;
	}
	q.close?.();
	if (!result) throw new Error(`refine-litmus.mjs: no result from OpenRouter model ${model} (key at ${KEY_PATH}) — check the key is valid and the model id is still live on OpenRouter`);
	return { answer: result.result ?? answer, cost_usd: result.total_cost_usd ?? 0, duration_ms: result.duration_ms ?? 0 };
}

async function callModel(prompt, { model, cwd }){
	if (model.includes("/")) return callOpenRouter(prompt, { model, cwd });
	const r = await askOnce(prompt, { model, cwd }); // the plain Claude path — askOnce, unchanged
	return { answer: r.answer, cost_usd: r.cost_usd, duration_ms: r.duration_ms };
}

// ---- one model's run: clean() + deliverable 2's pass/fail -----------------------------------

async function runOneModel(modelEntry, rawText, cwd){
	const started = Date.now();
	let result, error = null;
	try {
		// `call` wraps `callModel` to also capture cost/latency for THIS run, since clean()
		// itself only returns the cleaned data, not the call's own cost/ms — the litmus report
		// needs those two numbers alongside the pass/fail verdict.
		let cost_usd = 0, duration_ms = 0;
		result = await clean(rawText, {
			model: modelEntry.id, cwd,
			call: async (prompt, opts) => {
				const r = await callModel(prompt, opts);
				cost_usd = r.cost_usd; duration_ms = r.duration_ms;
				return r;
			},
		});
		return {
			model: modelEntry.id, label: modelEntry.label,
			// Deliverable 2's own pass/fail: "mechanical" flags are exactly the cases the
			// diff-check rejected (an added/replaced content word, no glossary or self-correction
			// exception applied) — see engine.js's applyFaithfulnessCheck(). A model-reported "?"
			// flag (the model itself being honestly unsure) is NOT a faithfulness failure, so it
			// does not count against pass/fail here.
			pass: !result.flags.some(f => f.source === "mechanical"),
			mechanical_flags: result.flags.filter(f => f.source === "mechanical").length,
			model_flags: result.flags.filter(f => f.source === "model").length,
			misheard: result.misheard.length,
			strikes: result.strikes.length,
			cost_usd, duration_ms: duration_ms || (Date.now() - started),
			sample: result.text.slice(0, 160),
		};
	} catch (e){
		error = String(e?.message || e);
		return { model: modelEntry.id, label: modelEntry.label, pass: false, error, duration_ms: Date.now() - started };
	}
}

// ---- main -----------------------------------------------------------------------------------

async function main(){
	const input = process.argv[2];
	if (!input){
		console.error("usage: node Server/refine-litmus.mjs <raw.txt | date:line>");
		process.exit(1);
	}
	const root = repoRoot();
	const { text: rawText, sourceFile } = resolveRaw(input, root);
	console.log(`refine-litmus.mjs: read ${wordsOf(rawText).length} words from ${sourceFile}\n`);

	const haveKey = await hasOpenRouterKey();
	const models = MODELS.filter(m => m.id.includes("/") ? haveKey : true);
	if (!haveKey) console.log(`(no OpenRouter key at the usual path — skipping ${MODELS.filter(m => m.id.includes("/")).map(m => m.label).join(", ")}, running the rest)\n`);

	const results = [];
	for (const m of models){ // sequential on purpose — see doc comment ("never in parallel")
		console.log(`running ${m.label}...`);
		const r = await runOneModel(m, rawText, root);
		results.push(r);
		console.log(r.error ? `  error: ${r.error}` : `  ${r.pass ? "PASS" : "FAIL"} — $${r.cost_usd.toFixed(4)}, ${r.duration_ms}ms, ${r.mechanical_flags} mechanical flag(s), ${r.misheard} glossary fix(es), ${r.strikes} strike(s)`);
	}

	// Verdict: "no opinion needed — the diff-check already decides pass/fail; ties go to the
	// cheapest" (the brief). Among the ones that passed, cheapest wins; a tie on cost (to the
	// cent) breaks by latency, just so there's always exactly one named winner, never a shrug.
	const passed = results.filter(r => r.pass && !r.error);
	let verdict;
	if (!passed.length){
		verdict = "no model passed the mechanical diff-check — see the per-model detail above; do not pick a winner from a failing run";
	} else {
		const winner = [...passed].sort((a, b) => (a.cost_usd - b.cost_usd) || (a.duration_ms - b.duration_ms))[0];
		verdict = `${winner.label} wins — passed, cheapest at $${winner.cost_usd.toFixed(4)} (${winner.duration_ms}ms)`;
	}
	console.log(`\nVerdict: ${verdict}`);

	const out = {
		at: new Date().toISOString(), input, source_file: sourceFile.replaceAll("\\", "/"),
		raw_words: wordsOf(rawText).length, models: results, verdict,
	};
	const outPath = path.join(HERE, "refine-litmus-result.json");
	fs.writeFileSync(outPath, JSON.stringify(out, null, 2) + "\n");
	console.log(`wrote ${outPath}`);
}

const wordsOf = t => (String(t).trim().match(/\S+/g) || []);

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) main().catch(e => { console.error(String(e?.stack || e)); process.exitCode = 1; });
