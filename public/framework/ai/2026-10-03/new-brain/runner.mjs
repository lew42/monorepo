import fs from "node:fs";
import path from "node:path";
import { callModel, evaluateRefinement } from "./harness.mjs";
import { level_a, level_b, level_c } from "./eval-suite.mjs";

const MODELS_TO_TEST = process.env.MODELS ? process.env.MODELS.split(",") : [
	"anthropic/claude-haiku-4.5",                 // the bar
	"openai/gpt-oss-120b", "qwen/qwen3.7-flash", "z-ai/glm-5.3-flash:batch", "qwen/qwen3-235b-a22b-2507",
	"deepseek/deepseek-v4.1-flash", "openai/gpt-6-luna",
	"nvidia/nemotron-3-ultra-550b-a55b:free", "nvidia/nemotron-3-super-120b-a12b:free",
	"local/gemma-4-e4b", "local/qwen2.5-coder"
];

// Context files to inject for level_a and level_b
const CONTEXT_DOCS = `
[CONTEXT: public/framework/CLAUDE.md excerpt]
Traps that never throw:
- A class's folder, file and name match, capitalised: ext/JSONL/JSONL.js exports class JSONL.
- No DOM after an await: capture the box synchronously, fill it in a callback.
- Every CSS rule inside a layer — base theme site util; the order lives once, in framework.css, which app.js loads first.
- Resolve URLs against import.meta, never the document.
- Only p()/h1–h6 read backticks; one backtick inside css(\`...\`) kills every page.
- Imports flow down; a parent<->child import cycle breaks only on deep reload.

[CONTEXT: public/framework/core/Item/Item.js excerpt]
export class Item extends Events(Object) {
  set_one(key, value){
    const here = this[key];
    if (typeof here === "function") return void here.call(this, value);
    const target = this.get(key);
    if (target && typeof target.set === "function" && !(target instanceof Map)) return void target.set(value);
    const old = this.get(key);
    this.put(key, value);
    if (old !== value){
      this.emit("change", key, value, old);
      this.emit("delta", { set: { [key]: value } }, this);
    }
  }
  static define_fields(){
    for (const name of this.fields ?? []){
      if (name in Item.prototype) throw new Error(\`field "\${name}" collides with Item.prototype\`);
      Object.defineProperty(this.prototype, name, {
        get(){ return this.get(name); },
        set(value){ this.set_one(name, value); },
        enumerable: true,
        configurable: true
      });
    }
  }
}

[CONTEXT: public/framework/core/Item/Store.js excerpt]
export class Store {
  static for(url){
    const found = (Store.instances ??= new Map()).get(url);
    if (found) return found;
    const store = new this({ url });
    Store.instances.set(url, store);
    return store;
  }
  // store.attach(host) listens for host's own "delta" event (which bubbles up from anything below it — a nested Item, a List three levels down), works out the NESTING from the host down to wherever the change actually happened — never a path string — and appends ONE line.
}
`;

async function runEvaluation() {
	console.log("=== Starting New Brain Evaluation ===");
	console.log(`Testing ${MODELS_TO_TEST.length} models across Level (a), Level (b), and Level (c)...`);

	const allResults = {};

	for (const model of MODELS_TO_TEST) {
		console.log(`\n--- Testing model: ${model} ---`);
		const res = {
			model,
			level_a: { correct: 0, total: level_a.length, details: [] },
			level_b: { correct: 0, total: level_b.length, details: [] },
			level_c: { pass: 0, total: level_c.length, avg_score: 0, details: [] },
			total_cost_usd: 0,
			total_ms: 0
		};

		// 1. Level (a) - Facts
		for (const q of level_a) {
			const prompt = `${CONTEXT_DOCS}\n\nQuestion: ${q.question}\nAnswer directly in 1-2 concise sentences.`;
			const r = await callModel({
				model,
				messages: [{ role: "user", content: prompt }]
			});
			if (!r.ok) {
				console.log(`  [a] ${q.id} FAILED API CALL: ${r.error}`);
				res.level_a.details.push({ id: q.id, pass: false, error: r.error });
				continue;
			}
			res.total_cost_usd += r.cost_usd || 0; res.tokens_in = (res.tokens_in || 0) + (r.usage?.prompt_tokens || 0); res.tokens_out = (res.tokens_out || 0) + (r.usage?.completion_tokens || 0);
			res.total_ms += r.ms || 0;
			const passed = q.verify(r.text);
			if (passed) res.level_a.correct++;
			res.level_a.details.push({ id: q.id, pass: passed, answer: r.text, expected: q.expected });
			console.log(`  [a] ${q.id}: ${passed ? "PASS" : "FAIL"} (${r.ms}ms)`);
		}

		// 2. Level (b) - Multi-step reasoning
		for (const q of level_b) {
			const prompt = `${CONTEXT_DOCS}\n\n${q.question}\nReason through this carefully and provide direct answers for each numbered point.`;
			const r = await callModel({
				model,
				messages: [{ role: "user", content: prompt }]
			});
			if (!r.ok) {
				console.log(`  [b] ${q.id} FAILED API CALL: ${r.error}`);
				res.level_b.details.push({ id: q.id, pass: false, error: r.error });
				continue;
			}
			res.total_cost_usd += r.cost_usd || 0; res.tokens_in = (res.tokens_in || 0) + (r.usage?.prompt_tokens || 0); res.tokens_out = (res.tokens_out || 0) + (r.usage?.completion_tokens || 0);
			res.total_ms += r.ms || 0;
			const passed = q.verify(r.text);
			if (passed) res.level_b.correct++;
			res.level_b.details.push({ id: q.id, pass: passed, answer: r.text, expected: q.expected });
			console.log(`  [b] ${q.id}: ${passed ? "PASS" : "FAIL"} (${r.ms}ms)`);
		}

		// 3. Level (c) - Real Prompt Refinement (10 prompts)
		let totalScoreC = 0;
		for (const p of level_c) {
			const prompt = `You are a prompt refiner in the Lew42 system.
Clean and refine the following dictated user prompt into clear, numbered sentences (1., 2., 3...) without losing any facts, names, or intent. Remove stutter and verbal filler. Do not invent things not in the prompt.

Raw Dictated Prompt:
"""
${p.raw}
"""

Numbered Refined Sentences:`;
			const r = await callModel({
				model,
				messages: [{ role: "user", content: prompt }]
			});
			if (!r.ok) {
				console.log(`  [c] ${p.id} FAILED API CALL: ${r.error}`);
				res.level_c.details.push({ id: p.id, pass: false, error: r.error });
				continue;
			}
			res.total_cost_usd += r.cost_usd || 0; res.tokens_in = (res.tokens_in || 0) + (r.usage?.prompt_tokens || 0); res.tokens_out = (res.tokens_out || 0) + (r.usage?.completion_tokens || 0);
			res.total_ms += r.ms || 0;
			const evalRes = evaluateRefinement(p.raw, r.text);
			totalScoreC += evalRes.score;
			if (evalRes.pass) res.level_c.pass++;
			res.level_c.details.push({ id: p.id, pass: evalRes.pass, score: evalRes.score, refined: r.text });
			console.log(`  [c] ${p.id}: ${evalRes.pass ? "PASS" : "FAIL"} (${evalRes.score}% coverage, ${r.ms}ms)`);
		}
		res.level_c.avg_score = Math.round(totalScoreC / level_c.length);
		allResults[model] = res;
	}

	// 4. Batch Reads vs Step-by-Step Context Token Experiment
	console.log("\n=== Running Batch Reads vs Step-by-Step Read Measurement ===");
	// Measure tokens/cost of 1 single batched context turn vs 3 sequential read turns
	const testModel = "google/gemini-3.8-flash";
	const singleBatchPrompt = CONTEXT_DOCS + "\n\nAnswer: What does Item emit on change?";
	const rBatch = await callModel({ model: testModel, messages: [{ role: "user", content: singleBatchPrompt }] });

	// Sequential simulation: Turn 1 (Item.js), Turn 2 (Item.js + Store.js), Turn 3 (Item.js + Store.js + CLAUDE.md)
	const rStep1 = await callModel({ model: testModel, messages: [{ role: "user", content: "Doc 1:\n" + CONTEXT_DOCS.slice(0, 500) + "\nWhat does Item emit?" }] });
	const rStep2 = await callModel({ model: testModel, messages: [
		{ role: "user", content: "Doc 1:\n" + CONTEXT_DOCS.slice(0, 500) },
		{ role: "assistant", content: "Understood Doc 1." },
		{ role: "user", content: "Doc 2:\n" + CONTEXT_DOCS.slice(500, 1000) + "\nWhat does Item emit?" }
	] });
	const rStep3 = await callModel({ model: testModel, messages: [
		{ role: "user", content: "Doc 1:\n" + CONTEXT_DOCS.slice(0, 500) },
		{ role: "assistant", content: "Understood Doc 1." },
		{ role: "user", content: "Doc 2:\n" + CONTEXT_DOCS.slice(500, 1000) },
		{ role: "assistant", content: "Understood Doc 2." },
		{ role: "user", content: "Doc 3:\n" + CONTEXT_DOCS.slice(1000) + "\nWhat does Item emit?" }
	] });

	const batchTokens = rBatch.usage?.total_tokens || 0;
	const stepTokens = (rStep1.usage?.total_tokens || 0) + (rStep2.usage?.total_tokens || 0) + (rStep3.usage?.total_tokens || 0);

	const batchExperiment = {
		single_turn_tokens: batchTokens,
		multi_turn_step_tokens: stepTokens,
		overhead_ratio: Number((stepTokens / (batchTokens || 1)).toFixed(2))
	};
	console.log("Batch tokens:", batchTokens, "Sequential steps tokens:", stepTokens, "Overhead ratio:", batchExperiment.overhead_ratio);

	// 5. Failure Recovery Test (giving an error line to see if model self-corrects)
	console.log("\n=== Running Failure Recovery Test ===");
	const recoveryResults = {};
	const brokenSnippet = `
function updateItem(item, data) {
  item.set(data)
  item.emit("delta", { set: data }) // Error: item.emit is not a function
}
`;
	for (const model of ["google/gemini-3.8-flash", "deepseek/deepseek-v4.1-flash", "openai/gpt-6-luna", "qwen/qwen3.8-27b:free"]) {
		const prompt = `Here is a code snippet that failed with TypeError: item.emit is not a function:
\`\`\`js
${brokenSnippet}
\`\`\`
Error message: TypeError: item.emit is not a function at updateItem (line 4).
Note: In Lew42, Item extends Events(Object). Why did this error occur and how do you fix it? Give the fixed code snippet.`;
		const r = await callModel({ model, messages: [{ role: "user", content: prompt }] });
		const lower = (r.text || "").toLowerCase();
		const fixed = lower.includes("events") || lower.includes("item.set") || lower.includes("already emits") || lower.includes("remove") || lower.includes("item.prototype");
		recoveryResults[model] = { ok: r.ok, fixed, reply: r.text?.slice(0, 200) };
		console.log(`Recovery test ${model}: ${fixed ? "PASS" : "FAIL"}`);
	}

	const finalReport = {
		at: new Date().toISOString(),
		results: allResults,
		batchExperiment,
		recoveryResults
	};

	fs.writeFileSync(process.env.OUT || "public/framework/ai/2026-10-03/new-brain/eval-results.json", JSON.stringify(finalReport, null, 2));
	console.log("\nWrote results to public/framework/ai/2026-10-03/new-brain/eval-results.json");
}

runEvaluation().catch(e => console.error("FATAL in runner:", e));
