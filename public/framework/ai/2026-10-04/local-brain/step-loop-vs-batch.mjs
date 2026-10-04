// step-loop-vs-batch.mjs — the owner's mid-task addition (2026-10-04): does a small local model
// do better on a multi-step task if you feed it ALL the steps at once, or one step at a time,
// checking each answer before sending the next?
//
// The 5-step task (same task, every run): read one real file, list its methods, pick the one
// that emits events, name the event it emits, write one sentence describing what it does.
// Uses public/framework/core/Item/Item.js's set_one() — it really does emit "change" and
// "delta" — so every step has one checkable right answer (law 7: computed, not graded by a
// second model's opinion).
//
// (a) BATCH: one prompt with all 5 instructions, one reply, pass only if all 5 sub-answers
//     are right.
// (b) LOOP: five separate calls, each given the previous Q&A as its own context (a node loop
//     sending one step, checking it, then sending the next — exactly as asked).
//
// 10 runs of each, $0 real cost (local model only). Reports pass rate and seconds for each.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../../../../..");
const PROXY = "http://127.0.0.1:8998/v1/chat/completions";
const MODEL = "qwen2.5-coder";
const RUNS = Number(process.argv[2]) || 10;

const FILE = "public/framework/core/Item/Item.js";
// Whole file, not a slice: an earlier cut at 6000 chars sliced off set_one() itself (it sits
// at line 169, past a long doc comment) — caught live in the smoke test, where the model
// correctly read what it was given but what it was given didn't have the answer in it.
const fileText = fs.readFileSync(path.join(ROOT, FILE), "utf8");

// The 5 checkable steps. `check` runs against the STEP's own answer text.
const STEPS = [
	{
		n: 1, ask: `Read the file above. List the names of every method defined on the class it exports, separated by commas. Just the list, nothing else.`,
		check: a => /set_one/.test(a) && /define_fields/.test(a)
	},
	{
		n: 2, ask: `From that method list, which ONE method EMITS events (calls .emit(...))? Answer with just the method name.`,
		check: a => /\bset_one\b/.test(a)
	},
	{
		n: 3, ask: `Name the two event names that method emits, exactly as written in the code (quoted strings). Answer with just the two names, comma-separated.`,
		check: a => /change/.test(a) && /delta/.test(a)
	},
	{
		n: 4, ask: `Which of those two events carries the OLD value as one of its arguments? Answer with just that one event's name.`,
		check: a => /\bchange\b/.test(a) && !/\bdelta\b/.test(a.replace(/change/g, ""))
	},
	{
		n: 5, ask: `Write ONE short sentence describing what this method does when a field's value changes.`,
		check: a => /(change|emit|event)/i.test(a) && a.trim().length > 10
	}
];

async function call(messages){
	const t0 = Date.now();
	const res = await fetch(PROXY, {
		method: "POST", headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ model: MODEL, temperature: 0, max_tokens: 150, messages })
	});
	const ms = Date.now() - t0;
	if (!res.ok) return { ok: false, error: `HTTP ${res.status}`, ms };
	const data = await res.json();
	return { ok: true, text: data.choices?.[0]?.message?.content ?? "", ms };
}

// (a) BATCH — one prompt, all 5 asks numbered, one reply; the reply is split back into 5
// numbered sections (by "1." "2." ... markers) and each is checked by its own step's `check`.
async function runBatch(){
	const prompt = `--- ${FILE} ---\n${fileText}\n\nAnswer these 5 questions about the code above, numbered 1 to 5, one answer per line, in order:\n` +
		STEPS.map(s => `${s.n}. ${s.ask}`).join("\n");
	const r = await call([{ role: "user", content: prompt }]);
	if (!r.ok) return { pass: false, ms: r.ms, ok: false };
	const text = r.text;
	// pull each numbered line's text (greedy to the next number or end)
	const parts = {};
	for (const s of STEPS){
		const re = new RegExp(`${s.n}\\.(.*?)(?=\\n\\s*${s.n + 1}\\.|$)`, "s");
		const m = text.match(re);
		parts[s.n] = m ? m[1].trim() : "";
	}
	const perStep = STEPS.map(s => s.check(parts[s.n] || ""));
	return { pass: perStep.every(Boolean), perStep, perStepText: STEPS.map(s => parts[s.n]), ms: r.ms, ok: true };
}

// (b) LOOP — one call per step; each call carries the whole conversation so far (the real
// "send one step, check the answer, then send the next" shape), and `check` runs right after
// each answer lands, same as the owner described.
async function runLoop(){
	const messages = [{ role: "user", content: `Here is one file from a JavaScript framework:\n\n--- ${FILE} ---\n${fileText}\n\nI will ask you 5 short questions about it, one at a time.` }];
	messages.push({ role: "assistant", content: "Ready." });
	let totalMs = 0;
	const perStep = [], perStepText = [];
	for (const s of STEPS){
		messages.push({ role: "user", content: s.ask });
		const r = await call(messages);
		totalMs += r.ms;
		if (!r.ok){ perStep.push(false); perStepText.push(""); messages.push({ role: "assistant", content: "" }); continue; }
		messages.push({ role: "assistant", content: r.text });
		perStep.push(s.check(r.text));
		perStepText.push(r.text);
	}
	return { pass: perStep.every(Boolean), perStep, perStepText, ms: totalMs, ok: true };
}

async function main(){
	const results = { batch: [], loop: [] };
	for (let i = 0; i < RUNS; i++){ results.batch.push(await runBatch()); console.log(`batch run ${i + 1}/${RUNS}: ${results.batch[i].pass ? "PASS" : "fail"} (${results.batch[i].ms}ms)`); }
	for (let i = 0; i < RUNS; i++){ results.loop.push(await runLoop()); console.log(`loop  run ${i + 1}/${RUNS}: ${results.loop[i].pass ? "PASS" : "fail"} (${results.loop[i].ms}ms)`); }

	const summarize = arr => ({
		pass_rate: `${arr.filter(r => r.pass).length}/${arr.length}`,
		avg_seconds: Math.round(arr.reduce((s, r) => s + r.ms, 0) / arr.length / 100) / 10
	});
	const report = { at: new Date().toISOString(), model: MODEL, runs: RUNS, batch: summarize(results.batch), loop: summarize(results.loop), raw: results };
	fs.writeFileSync(path.join(HERE, "step-loop-vs-batch.json"), JSON.stringify(report, null, 2));
	console.log("\nBATCH:", report.batch);
	console.log("LOOP: ", report.loop);
}

main().catch(e => { console.error("FATAL", e); process.exit(1); });
