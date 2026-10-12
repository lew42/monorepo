// run-eval.mjs — runs questions.json (generate-questions.mjs's output) against the three local
// models through Servex's local proxy (http://127.0.0.1:8998, OpenAI-shaped — same endpoint
// public/framework/ai/sessions/2026/10/04/new-brain/new-brain/harness.mjs calls). $0 real cost: this never touches
// an Anthropic or OpenRouter key. Writes results.jsonl as it goes (one line per answer) so
// progress can be read while it's still running, and a final report.json summary at the end.
//
// Runs one model fully (all 5 levels) before switching to the next, because the GPU holds only
// one model at a time (Servex/ext/local/provider.js) and switching mid-run would thrash it.
//
// node run-eval.mjs [--models qwen2.5-coder,gemma-4-e4b,gemma-3-4b] [--limit-per-level 30]
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../../../../..");
const PROXY = "http://127.0.0.1:8998/v1/chat/completions";

const args = process.argv.slice(2);
function flag(name, def){ const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : def; }
const MODELS = flag("models", "qwen2.5-coder,gemma-4-e4b,gemma-3-4b").split(",");
const LIMIT = Number(flag("limit-per-level", 0)) || Infinity;

const questions = JSON.parse(fs.readFileSync(path.join(HERE, "questions.json"), "utf8"));
const resultsPath = path.join(HERE, "results.jsonl");
const reportPath = path.join(HERE, "report.json");

const fileCache = new Map();
function readFile(rel){
	if (fileCache.has(rel)) return fileCache.get(rel);
	let text = "";
	try { text = fs.readFileSync(path.join(ROOT, rel), "utf8"); } catch (e) { text = `[could not read ${rel}: ${e.message}]`; }
	fileCache.set(rel, text);
	return text;
}

async function callLocal(model, prompt){
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), 45000);
	const t0 = Date.now();
	try {
		const res = await fetch(PROXY, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			signal: controller.signal,
			body: JSON.stringify({
				model, temperature: 0, max_tokens: 80,
				messages: [{ role: "user", content: prompt }]
			})
		});
		if (!res.ok) return { ok: false, error: `HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`, ms: Date.now() - t0 };
		const data = await res.json();
		return { ok: true, text: data.choices?.[0]?.message?.content ?? "", ms: Date.now() - t0 };
	} catch (e){
		return { ok: false, error: e.message, ms: Date.now() - t0 };
	} finally { clearTimeout(timer); }
}

// Local models run with a 32k-token context (llama-server default here). A couple of the
// framework's own files (Page.class.js) are long enough that two or three of them together
// overflow that — caught live in the smoke test (two HTTP 400 "exceeds context size" errors).
// Cap each file's text so a question never blows the window; a question whose answer sits
// past the cap is simply a harder question for the model, same as handing a person page 1
// of a long file and not page 40.
const FILE_CHAR_CAP = 9000;
function buildPrompt(q){
	const files = q.context_files.map(f => {
		let text = readFile(f);
		if (text.length > FILE_CHAR_CAP) text = text.slice(0, FILE_CHAR_CAP) + "\n... [truncated]";
		return `--- ${f} ---\n${text}`;
	}).join("\n\n");
	let instruction;
	if (q.type === "boolean") instruction = `Answer with exactly one word: "true" or "false". No explanation.`;
	else if (q.type === "multiple_choice") instruction = `Answer with EXACTLY one of these, verbatim, nothing else: ${q.choices.map(c => `"${c}"`).join(", ")}.`;
	else instruction = `Answer with just the value itself — a name or a number — nothing else, no sentence.`;
	return `Here is the source code of one or more files from a JavaScript framework.\n\n${files}\n\nQuestion: ${q.question}\n${instruction}`;
}

function normalize(s){ return String(s ?? "").trim().toLowerCase().replace(/^["'.]+|["'.]+$/g, ""); }

function grade(q, raw){
	const norm = normalize(raw);
	if (q.type === "boolean"){
		const said = /\btrue\b/.test(norm) ? true : (/\bfalse\b/.test(norm) ? false : null);
		return said === q.answer;
	}
	if (q.type === "multiple_choice"){
		const expected = normalize(q.answer);
		return norm === expected || norm.startsWith(expected + " ") || norm.startsWith(expected + ".") || norm.startsWith(expected + ",");
	}
	// value: exact match after normalize, OR the normalized answer appears as a whole word/number in a short reply
	if (normalize(q.answer) === norm) return true;
	const words = norm.split(/[^a-z0-9]+/).filter(Boolean);
	return words.includes(normalize(q.answer)) && norm.length <= 40;
}

async function main(){
	const out = fs.createWriteStream(resultsPath, { flags: "a" });
	const summary = {};
	for (const model of MODELS){
		summary[model] = {};
		console.log(`\n=== model: ${model} ===`);
		for (const [level, qs] of Object.entries(questions.levels)){
			const set = qs.slice(0, LIMIT);
			let correct = 0, errors = 0, totalMs = 0;
			for (const q of set){
				const prompt = buildPrompt(q);
				const r = await callLocal(model, prompt);
				if (!r.ok){ errors++; out.write(JSON.stringify({ model, level, id: q.id, ok: false, error: r.error }) + "\n"); continue; }
				const pass = grade(q, r.text);
				if (pass) correct++;
				totalMs += r.ms;
				out.write(JSON.stringify({ model, level, id: q.id, ok: true, pass, answer: r.text.slice(0, 120), expected: q.answer, ms: r.ms }) + "\n");
			}
			const total = set.length;
			const errRate = total ? Math.round(((total - correct - errors) / total) * 1000) / 10 : 0;
			summary[model][level] = { total, correct, errors, wrong: total - correct - errors, error_rate_pct: errRate, avg_ms: total ? Math.round(totalMs / Math.max(1, total - errors)) : 0 };
			console.log(`  ${level}: ${correct}/${total} correct, ${errors} api errors (${errRate}% wrong), avg ${summary[model][level].avg_ms}ms`);
			fs.writeFileSync(reportPath, JSON.stringify({ generated_at: new Date().toISOString(), in_progress: true, summary }, null, 2));
		}
	}
	fs.writeFileSync(reportPath, JSON.stringify({ generated_at: new Date().toISOString(), in_progress: false, summary }, null, 2));
	out.end();
	console.log("\nDone. Wrote", reportPath);
}

main().catch(e => { console.error("FATAL", e); process.exit(1); });
