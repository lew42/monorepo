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
const MODELS = String(arg("models", "openai/gpt-6-luna,deepseek/deepseek-v4.1-flash,google/gemini-3.8-flash,anthropic/claude-haiku-5.5,anthropic/claude-sonnet-5.5")).split(",");
const EFFORTS = String(arg("efforts", "low,high")).split(",");
const BUDGET = Number(arg("budget", 4));

const code = s => s.replace(/^```\w*\n?|```\s*$/gm, "").trim();
/* Run the model's function expression against a test; `name` is stripped so `function f`, `const f =` and a bare expression all work. */
const fn = (a, name) => vm.runInNewContext("(" + code(a).replace(new RegExp("^function\\s+" + name), "function").replace(new RegExp("^(const|let|var)\\s+" + name + "\\s*="), "").replace(/;\s*$/, "") + ")");
const code_check = (name, test) => a => { try { return !!test(fn(a, name)); } catch { return false; } };
const json_of = a => JSON.parse(code(a));
const one = word => a => new RegExp("^\\W*" + word + "\\W*$", "i").test(a.trim());
const ONLY = "Reply with ONLY ";
const CARD = "Classify this AI-board card into exactly one category word: blocking, review or fyi.\nblocking = the owner must act before work can continue; review = finished work awaiting a look; fyi = information only.\nCard: ";
const CLEAN = "Clean this dictated transcript: remove filler words (um, uh, like, you know) and false starts, fix punctuation and capitalisation, change no facts. " + ONLY + "the cleaned text.\n\nTranscript: ";
const TASKS = [
	// code edit with a test
	{ id: "code-add", kind: "code edit", prompt: ONLY + "a JavaScript function expression named add that returns the sum of two numbers, no prose.", check: code_check("add", f => f(2, 3) === 5 && f(-1, 1) === 0) },
	{ id: "code-bug", kind: "code edit", prompt: "This function should return the largest number in an array but has a bug. " + ONLY + "the fixed function expression, no prose.\nfunction max(a){ let m = 0; for (const n of a) if (n > m) m = n; return m; }", check: code_check("max", f => f([-5, -2, -9]) === -2 && f([1, 7, 3]) === 7) },
	{ id: "code-slug", kind: "code edit", prompt: ONLY + "a JavaScript function expression named slug that lowercases a string, replaces each run of non-alphanumeric characters with one hyphen, and trims hyphens from both ends. slug(\"Hello, World!\") is \"hello-world\".", check: code_check("slug", f => f("Hello, World!") === "hello-world" && f("  --A  b--") === "a-b" && f("x") === "x") },
	{ id: "code-dedupe", kind: "code edit", prompt: ONLY + "a JavaScript function expression named dedupe that removes duplicates from an array keeping the first occurrence order, without mutating the input.", check: code_check("dedupe", f => { const i = [3, 1, 3, 2, 1]; const o = f(i); return JSON.stringify(o) === "[3,1,2]" && i.length === 5; }) },
	{ id: "code-chunk", kind: "code edit", prompt: "Fix the off-by-one bug. " + ONLY + "the fixed function expression.\nfunction chunk(a, n){ const out = []; for (let i = 0; i < a.length - n; i += n) out.push(a.slice(i, i + n)); return out; }", check: code_check("chunk", f => JSON.stringify(f([1, 2, 3, 4, 5], 2)) === "[[1,2],[3,4],[5]]" && JSON.stringify(f([1, 2], 2)) === "[[1,2]]") },
	{ id: "code-class", kind: "code edit", prompt: ONLY + "a JavaScript class expression (not a declaration) with a constructor taking a start number, an inc() method that adds 1 and returns this, and a getter value. No prose.", check: a => { try { const C = vm.runInNewContext("(" + code(a).replace(/^class\s+\w+/, "class").replace(/^(const|let|var)\s+\w+\s*=\s*/, "").replace(/;\s*$/, "") + ")"); return new C(5).inc().inc().value === 7; } catch { return false; } } },
	{ id: "code-rename", kind: "code edit", prompt: "Rename the variable x to count everywhere in this function, change nothing else. " + ONLY + "the function.\nfunction tally(list){ let x = 0; for (const item of list) if (item.ok) x += 1; return x; }", check: a => { try { const t = code(a); return !/\bx\b/.test(t) && (t.match(/\bcount\b/g) || []).length >= 3 && code_check("tally", f => f([{ ok: 1 }, { ok: 0 }, { ok: 1 }]) === 2)(a); } catch { return false; } } },
	{ id: "code-regex", kind: "code edit", prompt: ONLY + "a JavaScript function expression named isHex that returns true only for a string like #fff or #A1b2C3 (a # then exactly 3 or 6 hex digits).", check: code_check("isHex", f => f("#fff") && f("#A1b2C3") && !f("#ffff") && !f("fff") && !f("#ggg")) },
	// readme check
	{ id: "readme-stale", kind: "readme check", prompt: "A readme says: \"Run `node Server/start.mjs` to launch the dev server.\" The directory listing is: Server/{dev.mjs, merge.mjs, hold.mjs, readme.md}. Is the readme line stale? Reply with ONLY yes or no.", check: one("yes") },
	{ id: "readme-ok", kind: "readme check", prompt: "A readme says: \"Run `node Server/hold.mjs on` before a batch of writes.\" The directory listing is: Server/{dev.mjs, merge.mjs, hold.mjs, readme.md}. Is the readme line stale? " + ONLY + "yes or no.", check: one("no") },
	{ id: "readme-lines", kind: "readme check", prompt: "Our rule: a readme must be under 100 lines. Readme sizes in lines: core 64, ext 143, ui 98, ux 101, styles 40. " + ONLY + "the names that break the rule, comma separated, alphabetical, nothing else.", check: a => a.toLowerCase().replace(/[^a-z,]/g, "") === "ext,ux" },
	{ id: "readme-link", kind: "readme check", prompt: "Which of these links in a readme points to a file that is not in the listing? Listing: doc/flow.md, doc/cards.md, page.js, readme.md. Links: doc/flow.md, doc/card.md, page.js. " + ONLY + "the broken link.", check: a => /doc\/card\.md/.test(a) && !/flow/.test(a) },
	// card classification
	{ id: "card-blocking", kind: "card classification", prompt: CARD + "\"Cloudflare login expired; deploy cannot continue until you log in again.\" " + ONLY + "the one word.", check: one("blocking") },
	{ id: "card-review", kind: "card classification", prompt: CARD + "\"The Dictate page restyle is finished and merged to michael/dev; screenshots at 400 and 1200 attached.\" " + ONLY + "the one word.", check: one("review") },
	{ id: "card-fyi", kind: "card classification", prompt: CARD + "\"Nightly token count: 4.1M, under pace by 12 points.\" " + ONLY + "the one word.", check: one("fyi") },
	{ id: "card-blocking-2", kind: "card classification", prompt: CARD + "\"Two designs for the rail are ready; I will not pick one without you.\" " + ONLY + "the one word.", check: one("blocking") },
	// transcript clean
	{ id: "clean-filler", kind: "transcript clean", prompt: CLEAN + "um so I want the, uh, the sidebar to like collapse on phones you know", check: a => /sidebar/i.test(a) && /collapse/i.test(a) && /phones/i.test(a) && !/\b(um|uh)\b/i.test(a) && !/you know/i.test(a) && !/\blike\b/i.test(a) && /[.!]\s*$/.test(a.trim()) },
	{ id: "clean-facts", kind: "transcript clean", prompt: CLEAN + "the, the meeting is on, no wait, on Thursday at three thirty and uh Priya is bringing the 12 laptops", check: a => /Thursday/.test(a) && /3:30|three thirty/i.test(a) && /Priya/.test(a) && /\b12\b|twelve/i.test(a) && !/\buh\b/i.test(a) && !/no wait/i.test(a) },
	{ id: "clean-numbers", kind: "transcript clean", prompt: CLEAN + "it costs like forty two dollars um per month and we have 3 users", check: a => /(\$42|42 dollars|forty[- ]two dollars)/i.test(a) && /\b(3|three) users/i.test(a) && !/\bum\b/i.test(a) && !/\blike\b/i.test(a) },
	// refine step
	{ id: "refine-ask", kind: "refine step", prompt: "Pull out the separate asks from this prompt. " + ONLY + "a JSON array of short strings, one per ask.\n\nPrompt: Make the rail narrower on phones. Also the Refine button is hidden under the footer. And please log every voice prompt raw first.", check: a => { try { const j = json_of(a); return Array.isArray(j) && j.length === 3 && j.every(x => typeof x === "string"); } catch { return false; } } },
	{ id: "refine-tag", kind: "refine step", prompt: "Tag each ask with the module it belongs to, from: rail, refine, voice. " + ONLY + "a JSON object mapping the ask number to the module.\n1. Make the rail narrower on phones\n2. The Refine button is hidden under the footer\n3. Whisper restarts show instantly", check: a => { try { const j = json_of(a); return j["1"] === "rail" && j["2"] === "refine" && j["3"] === "voice"; } catch { return false; } } },
	{ id: "refine-rank", kind: "refine step", prompt: "Order these asks from most to least important for the owner: A) fix typo in a footer, B) the site is down for everyone, C) rename a CSS class. " + ONLY + "the three letters in order, comma separated.", check: a => a.replace(/[^A-C]/g, "")[0] === "B" && a.replace(/[^A-C]/g, "").length === 3 },
	// extraction / summary / reasoning
	{ id: "summary-facts", kind: "summary", prompt: "Summarise in two sentences, keeping the three facts: the server restarted at 14:05, the cause was a full disk (98%), and 12 requests failed.\n\nLog: At 14:05 the server restarted. Disk use was at 98%, which caused the restart. During the outage 12 requests failed. No data was lost.", check: a => /14:05/.test(a) && /98\s?%/.test(a) && /\b12\b/.test(a) },
	{ id: "extract-json", kind: "extraction", prompt: "Extract JSON with keys name and age (number) from: \"Ada Lovelace was 36 when she died.\" " + ONLY + "the JSON.", check: a => { try { const j = json_of(a); return j.name === "Ada Lovelace" && j.age === 36; } catch { return false; } } },
	{ id: "extract-cost", kind: "extraction", prompt: "From this log line extract the dollar cost as a plain number. " + ONLY + "the number.\nLog: agent minion-7 finished turn 4 in 12.3s, cost $0.0416, tokens 18211.", check: a => /^\W*0?\.0416\W*$/.test(a.trim()) },
	{ id: "arith", kind: "reasoning", prompt: "A train leaves at 09:40 and the trip takes 2 hours 35 minutes. What time does it arrive? " + ONLY + "the time as HH:MM.", check: a => /\b12:15\b/.test(a) },
	{ id: "logic", kind: "reasoning", prompt: "All bloops are razzies. No razzies are lazzies. Can a bloop be a lazzy? " + ONLY + "yes or no.", check: one("no") },
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
	const ids = new Set(TASKS.map(t => t.id)), latest = new Map(); for (const r of rows) if (ids.has(r.task)) latest.set(`${r.model}|${r.effort}|${r.task}`, r);
	const g = {}; for (const r of latest.values()) (g[`${r.model}|${r.effort}`] ??= []).push(r);
	return Object.entries(g).map(([k, v]) => { const [model, effort] = k.split("|"); const cost = v.reduce((s, r) => s + (r.cost_usd || 0), 0);
		const by_kind = {}; for (const r of v){ const b = by_kind[r.kind] ??= { passed: 0, of: 0 }; b.of++; if (r.pass) b.passed++; }
		return { model, effort, passed: v.filter(r => r.pass).length, of: v.length,
			seconds: +(v.reduce((s, r) => s + r.ms, 0) / v.length / 1000).toFixed(1), cost_usd: +cost.toFixed(5), cost_per_task: +(cost / v.length).toFixed(6),
			by_kind: Object.entries(by_kind).map(([kind, b]) => `${kind} ${b.passed}/${b.of}`).join(" · ") }; })
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
