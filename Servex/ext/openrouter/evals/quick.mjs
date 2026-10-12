/* quick.mjs — small tasks with checkable answers, across models and thinking levels.
 *   node Servex/ext/openrouter/evals/quick.mjs [--models a,b,c] [--efforts low,high] [--budget 3] [--dry-run]
 * One plain chat-completion per model x effort x task (no agent, no tools). A script checks each answer;
 * cost is OpenRouter's own `usage.cost` from the same response. Stops early past --budget dollars.
 * Appends one {"quick":{...}} line per run to quick-results.jsonl; `--table` rewrites the models page table. */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import { read_key, key_status, evaluate_guard } from "../provider.js";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, "quick-results.jsonl");
const arg = (n, d) => { const i = process.argv.indexOf("--" + n); return i < 0 ? d : (process.argv[i + 1] ?? true); };
const MODELS = String(arg("models", "deepseek/deepseek-v4.1-flash,google/gemini-3.8-flash,openai/gpt-6-luna")).split(",");
const EFFORTS = String(arg("efforts", "low,high")).split(",");
const BUDGET = Number(arg("budget", 3));

const code = s => s.replace(/^```\w*\n?|```\s*$/gm, "").trim();
const TASKS = [
	{ id: "code-add", kind: "code edit", prompt: "Reply with ONLY a JavaScript function expression named add that returns the sum of two numbers, no prose.",
		check: a => { try { const f = vm.runInNewContext("(" + code(a).replace(/^function\s+add/, "function").replace(/^(const|let|var)\s+add\s*=\s*/, "").replace(/;$/, "") + ")"); return f(2, 3) === 5 && f(-1, 1) === 0; } catch { return false; } } },
	{ id: "code-bug", kind: "code edit", prompt: "This function should return the largest number in an array but has a bug. Reply with ONLY the fixed function expression, no prose.\nfunction max(a){ let m = 0; for (const n of a) if (n > m) m = n; return m; }",
		check: a => { try { const f = vm.runInNewContext("(" + code(a).replace(/^function\s+max/, "function").replace(/^(const|let|var)\s+max\s*=\s*/, "").replace(/;$/, "") + ")"); return f([-5, -2, -9]) === -2 && f([1, 7, 3]) === 7; } catch { return false; } } },
	{ id: "classify-1", kind: "classification", prompt: "Classify the sentiment of this review as exactly one word, positive or negative: \"The battery died in an hour and support never answered.\"",
		check: a => /^\W*negative\W*$/i.test(a.trim()) },
	{ id: "classify-2", kind: "classification", prompt: "Which one word best labels this message: bug, feature or question? \"Could you add a dark mode toggle to the settings page?\" Reply with the one word only.",
		check: a => /^\W*feature\W*$/i.test(a.trim()) },
	{ id: "summary-facts", kind: "summary", prompt: "Summarise in two sentences, keeping the three facts: the server restarted at 14:05, the cause was a full disk (98%), and 12 requests failed.\n\nLog: At 14:05 the server restarted. Disk use was at 98%, which caused the restart. During the outage 12 requests failed. No data was lost.",
		check: a => /14:05/.test(a) && /98\s?%/.test(a) && /\b12\b/.test(a) },
	{ id: "extract-json", kind: "extraction", prompt: "Extract JSON with keys name and age (number) from: \"Ada Lovelace was 36 when she died.\" Reply with ONLY the JSON.",
		check: a => { try { const j = JSON.parse(code(a)); return j.name === "Ada Lovelace" && j.age === 36; } catch { return false; } } },
	{ id: "arith", kind: "reasoning", prompt: "A train leaves at 09:40 and the trip takes 2 hours 35 minutes. What time does it arrive? Reply with ONLY the time as HH:MM.",
		check: a => /\b12:15\b/.test(a) },
	{ id: "logic", kind: "reasoning", prompt: "All bloops are razzies. No razzies are lazzies. Can a bloop be a lazzy? Reply with ONLY yes or no.",
		check: a => /^\W*no\W*$/i.test(a.trim()) },
];

async function ask(key, model, effort, prompt){
	const t0 = Date.now();
	const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
		method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
		body: JSON.stringify({ model, messages: [{ role: "user", content: prompt }], max_tokens: 4000, reasoning: { effort }, usage: { include: true } }),
	});
	const j = await res.json().catch(() => ({}));
	return { ms: Date.now() - t0, status: res.status, text: j?.choices?.[0]?.message?.content ?? "", cost: j?.usage?.cost ?? null, err: j?.error?.message ?? null };
}

function table(){
	if (!fs.existsSync(OUT)) return [];
	const rows = fs.readFileSync(OUT, "utf8").split("\n").filter(Boolean).map(l => JSON.parse(l).quick);
	const latest = new Map(); for (const r of rows) latest.set(`${r.model}|${r.effort}|${r.task}`, r);
	const g = {}; for (const r of latest.values()) (g[`${r.model}|${r.effort}`] ??= []).push(r);
	return Object.entries(g).map(([k, v]) => { const [model, effort] = k.split("|"); return {
		model, effort, passed: v.filter(r => r.pass).length, of: v.length,
		seconds: +(v.reduce((s, r) => s + r.ms, 0) / v.length / 1000).toFixed(1), cost_usd: +v.reduce((s, r) => s + (r.cost_usd || 0), 0).toFixed(5) }; })
		.sort((a, b) => b.passed / b.of - a.passed / a.of || a.cost_usd - b.cost_usd);
}

const MODELS_JSON = path.join(HERE, "../../../../public/framework/ai/system/models/models.json");
function publish(){
	const d = JSON.parse(fs.readFileSync(MODELS_JSON, "utf8"));
	d.quick = { generated_at: new Date().toISOString(), tasks: TASKS.map(t => ({ id: t.id, kind: t.kind })), rows: table() };
	fs.writeFileSync(MODELS_JSON, JSON.stringify(d, null, 2) + "\n");
}
if (process.argv.includes("--table")){ console.table(table()); publish(); process.exit(0); }
const key = read_key();
const st = await key_status(key);
const guard = evaluate_guard(st);
if (guard && guard.ok === false) { console.log("spend guard refuses:", guard.reason ?? guard); process.exit(1); }
let spent = 0;
for (const model of MODELS) for (const effort of EFFORTS) for (const t of TASKS){
	if (spent >= BUDGET){ console.log(`budget $${BUDGET} reached, stopping`); break; }
	if (process.argv.includes("--dry-run")){ console.log("would run", model, effort, t.id); continue; }
	const r = await ask(key, model, effort, t.prompt);
	const pass = !r.err && t.check(r.text);
	spent += r.cost ?? 0;
	const line = { at: new Date().toISOString(), model, effort, task: t.id, kind: t.kind, pass, ms: r.ms, cost_usd: r.cost, error: r.err, answer: r.text.slice(0, 200) };
	fs.appendFileSync(OUT, JSON.stringify({ quick: line }) + "\n");
	console.log(pass ? "PASS" : "FAIL", model, effort, t.id, `${r.ms}ms $${r.cost ?? "?"}`, r.err ?? "");
}
console.log(`spent $${spent.toFixed(4)}`); console.table(table()); publish();
