#!/usr/bin/env node
/* refine-days — run the refiner on the owner's prompts of past days, newest first.
 *   node Server/refine-days.mjs [--from 2026-10-13] [--to 2026-10-06] [--max-chars 45000] [--budget 12] [--dry]
 * Per day: gather the owner's words (requirements*.md files and `chat` lines with from:"owner" in
 * task.jsonl under that day's folders; never the gitignored transcripts), run Server/refine.mjs on
 * them (Haiku), then one more Haiku call that gives each ask two confidences on the scale in
 * public/framework/ext/Refine/doc/confidence.md. Writes ext/Refine/runs/<day>/{raw.txt, brief.md,
 * coverage.md, confidence.json} and runs/index.json (the runs page reads it). Stops when the spend passes --budget. */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const AI = path.join(root, "public/framework/ai");
const RUNS = path.join(root, "public/framework/ext/Refine/runs");
const arg = (k, d) => { const i = process.argv.indexOf("--" + k); return i < 0 ? d : (process.argv[i + 1] ?? true); };
const FROM = arg("from", "2026-10-13"), TO = arg("to", "2026-10-06"), MAX = +arg("max-chars", 45000), BUDGET = +arg("budget", 12), DRY = process.argv.includes("--dry");
// A git worktree has no node_modules: REFINE_SERVER_DIR points at a Server/ that can load the SDK (the main tree's).
const SERVER = process.env.REFINE_SERVER_DIR ?? path.dirname(fileURLToPath(import.meta.url));
const HAIKU = "claude-haiku-5-5";

const walk = (dir, out = []) => { if (!fs.existsSync(dir)) return out; for (const e of fs.readdirSync(dir, { withFileTypes: true })) { const f = path.join(dir, e.name); e.isDirectory() ? walk(f, out) : out.push(f); } return out; };
const days = (from, to) => { const out = []; for (let d = new Date(from + "T12:00:00Z"); d >= new Date(to + "T12:00:00Z"); d = new Date(d - 864e5)) out.push(d.toISOString().slice(0, 10)); return out; };

/** The owner's words for one day: [{source, text}]. Verbatim sections win over a brief's own summary. */
function ownerWords(day){
	const [y, m, d] = day.split("-");
	const dirs = [`sessions/${y}/${m}/${d}`, `${y}/${m}/${d}`, day].map(x => path.join(AI, x));
	const items = [];
	for (const f of dirs.flatMap(dir => walk(dir))){
		const rel = path.relative(AI, f).replaceAll("\\", "/");
		if (/requirements[^/]*\.md$/.test(f)){
			let t = fs.readFileSync(f, "utf8");
			const v = t.search(/^#{1,3}\s.*\bverbatim\b.*$/im);
			t = v >= 0 ? t.slice(v).replace(/^.*\n/, "") : t;
			if (t.trim().length > 200) items.push({ source: rel, text: t.trim() });
		} else if (/(^|[\\/])(task|session)\.jsonl$/.test(f)){
			for (const line of fs.readFileSync(f, "utf8").split(/\r?\n/)){
				if (!line.includes('"owner"')) continue;
				try { const c = JSON.parse(line).chat; if (c?.from === "owner" && c.text?.length > 40) items.push({ source: rel, text: c.text, verbatim: true }); } catch {}
			}
		}
	}
	const seen = new Set();
	items.sort((a, b) => b.verbatim - a.verbatim);   // the owner's own words first, so a cap cuts briefs, not dictation
	return items.filter(i => { const k = i.text.slice(0, 200); if (seen.has(k)) return false; seen.add(k); return true; });
}

const PROMPT = (brief, raw) => `Below is a brief (numbered asks a mastermind would act on) refined from the owner's raw words, then the raw words. For EACH numbered ask, give two confidences.
Scale (a probability that the statement is right): 0.5 = not sure (your default; start there). Below 0.3 = probably wrong. Above 0.7 ONLY with evidence: name what in the raw words makes it unmistakable. Never answer 0.9 out of habit.
- ask_clear: how sure are we what was actually requested?
- outcome_clear: how sure are we what a finished job would look like (a checkable end state)? Often lower than ask_clear.
Reply with ONLY a JSON array, one object per ask: {"n":<ask number>,"kind":"command"|"question"|"directive","ask":"<under 15 words>","quote":"<6-12 words copied from the raw>","ask_clear":{"p":<0-1>,"evidence":"<under 15 words>"},"outcome_clear":{"p":<0-1>,"evidence":"<under 15 words>"}}

BRIEF:
${brief}

RAW:
"""
${raw}
"""`;

const askOnce = DRY ? null : (await import("file:///" + path.join(SERVER, "AskEach.mjs").replaceAll("\\", "/"))).askOnce;
const mean = a => a.length ? +(a.reduce((s, x) => s + x, 0) / a.length).toFixed(2) : null;
let spent = 0;
const index = fs.existsSync(path.join(RUNS, "index.json")) ? JSON.parse(fs.readFileSync(path.join(RUNS, "index.json"), "utf8")) : [];

for (const day of days(FROM, TO)){
	const words = ownerWords(day);
	console.log(`${day}: ${words.length} owner texts`);
	if (!words.length){ upsert({ day, asks: 0, note: "no owner words found in that day's task logs or requirements files" }); continue; }
	let raw = ""; let truncated = false;
	for (const w of words){ const block = `[${w.source}]\n${w.text}\n\n`; if (raw.length + block.length > MAX){ truncated = true; const room = MAX - raw.length; if (room > 1500) raw += block.slice(0, room); break; } raw += block; }
	if (DRY){ console.log(`  ${raw.length} chars${truncated ? " (truncated)" : ""}`); continue; }
	if (spent >= BUDGET){ console.log(`budget $${BUDGET} reached, stopping before ${day}`); break; }
	const out = path.join(RUNS, day); fs.mkdirSync(out, { recursive: true });
	const rawFile = path.join(out, "input.txt"); fs.writeFileSync(rawFile, raw);
	const r = spawnSync(process.execPath, [path.join(SERVER, "refine.mjs"), rawFile, "--out", out, "--models", "haiku", "--no-repair"], { cwd: root, encoding: "utf8", windowsHide: true, maxBuffer: 1 << 26 });
	if (r.status !== 0){ console.log(r.stderr || r.stdout); upsert({ day, asks: 0, note: "refine.mjs failed: " + String(r.stderr || r.stdout).slice(-200) }); continue; }
	const brief = fs.readFileSync(path.join(out, "brief.md"), "utf8");
	const a = await askOnce(PROMPT(brief, raw), { model: HAIKU, cwd: root });
	spent += a.cost_usd || 0;
	let asks = [];
	try { asks = JSON.parse(/\[[\s\S]*\]/.exec(a.answer)[0]); } catch { console.log("  confidence JSON unparsable"); }
	for (const k of asks) for (const f of ["ask_clear", "outcome_clear"]) if (k[f]?.p > 0.7 && (k[f].evidence ?? "").trim().split(/\s+/).length < 3) k[f].p = 0.7;   // no evidence, no number over 0.7
	fs.writeFileSync(path.join(out, "confidence.json"), JSON.stringify({ day, scale: 2, truncated, sources: words.map(w => w.source), asks }, null, 1));
	upsert({ day, asks: asks.length, ask_clear: mean(asks.map(k => k.ask_clear?.p).filter(Number.isFinite)), outcome_clear: mean(asks.map(k => k.outcome_clear?.p).filter(Number.isFinite)), texts: words.length, chars: raw.length, truncated, cost_usd: +(spent).toFixed(2) });
	console.log(`  ${asks.length} asks, spent so far $${spent.toFixed(2)}`);
}

function upsert(row){
	const i = index.findIndex(r => r.day === row.day); if (i >= 0) index[i] = row; else index.push(row);
	index.sort((a, b) => b.day.localeCompare(a.day));
	fs.mkdirSync(RUNS, { recursive: true });
	fs.writeFileSync(path.join(RUNS, "index.json"), JSON.stringify(index, null, 1));
}
