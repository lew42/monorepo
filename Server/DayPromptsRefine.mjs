// DayPromptsRefine.mjs — retroactively runs the SAME mechanical refine step Echo.js runs
// live (Servex/agents/Echo.js `process()`) over owner prompts that have no `sentences` yet,
// writing through the exact same page_set wire line `Servex/agents/page_tools.js` writes, so
// a prompt refined by this script and one refined live by Echo read identically afterward.
//
// Deliverable 3, public/framework/ai/sessions/2026/10/04/day-cards/day-cards/requirements.md: "run the Refine
// engine over 2026-10-03 and 2026-10-04's owner prompts that have no sentences yet." Also the
// owner's follow-up (vscode-mastermind, same day): "the owner's prompts are long; refine each
// in paragraph-sized chunks so the local model doesn't drop sentences" — unlike Echo.js, which
// calls clean() once on the whole prompt, this script splits each prompt into ~700-character
// chunks first (chunkText below) and calls clean() once per chunk, carrying the tail of the
// previous chunk's cleaned text as `prev` (engine.js's own documented way to span a chunk
// boundary) and re-numbering sentences to stay continuous across the whole prompt.
//
// usage:
//   node Server/DayPromptsRefine.mjs 2026-10-03 2026-10-04 [--limit N] [--dry]
import fs, { appendFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { clean } from "../public/framework/ext/Refine/engine.js";
import CardDir from "../public/framework/ai/cards/CardDir.js";
import Cards from "../Servex/cards/Cards.js";
import { structure } from "../public/framework/ext/Refine/structure.js";
import { askOnce } from "./AskEach.mjs";
import { env_for } from "../Servex/ext/local/provider.js";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, "..");
const AI = path.join(ROOT, "public", "framework", "ai");
const LOCAL_MODEL = "local/qwen2.5-coder";

const args = process.argv.slice(2);
const dry = args.includes("--dry"); if (dry) args.splice(args.indexOf("--dry"), 1);
const limitIdx = args.indexOf("--limit");
const limit = limitIdx >= 0 ? Number(args[limitIdx + 1]) : Infinity;
if (limitIdx >= 0) args.splice(limitIdx, 2);
const dates = args.filter(a => /^\d{4}-\d{2}-\d{2}$/.test(a));
if (!dates.length){ console.error("usage: node Server/DayPromptsRefine.mjs YYYY-MM-DD [YYYY-MM-DD ...] [--limit N] [--dry]"); process.exit(2); }

// Best-effort schema check, same optional-dependency shape `page_tools.js` itself uses — a
// missing or broken checker degrades validation, never blocks a write.
let check = () => null;
try { ({ check } = await import("../.claude/hooks/jsonl-schema.mjs")); } catch {}

function nest(target, payload){
	const t = [...(target ?? [])];
	return t.length === 0 ? payload : { [t[0]]: nest(t.slice(1), payload) };
}
function write_line(file, line){
	let why = null;
	try { why = check(file, line); } catch {}
	if (why){ console.error(`  refused by schema: ${why}`); return false; }
	fs.appendFileSync(file, JSON.stringify(line) + "\n");
	return true;
}

// ---- find every owner Prompt item, across every session dir, not yet refined --------------

function listSessionDirs(){
	const out = [];
	for (const y of new Set([...safeReaddir(AI), ...safeReaddir(path.join(AI, "sessions"))])){
		if (!/^\d{4}$/.test(y)) continue;
		for (const m of new Set([...safeReaddir(path.join(AI, y)), ...safeReaddir(path.join(AI, "sessions", y))])){
			for (const d of new Set([...safeReaddir(path.join(AI, y, m)), ...safeReaddir(path.join(AI, "sessions", y, m))])){
				if (!/^\d{2}$/.test(m) || !/^\d{2}$/.test(d)) continue;
				// these session pages are cards: their folders moved into the store (ai/cards/CardDir.js, one tree 2026-10-13)
				for (const s of new Set([...safeReaddir(path.join(AI, y, m, d)), ...safeReaddir(path.join(AI, ...CardDir.rel(`${y}/${m}/${d}`).split("/")))])){
					if (s.startsWith("session-")){
						const f = path.join(Cards.dir(`${y}/${m}/${d}/${s}`, AI), "page.jsonl");
						if (fs.existsSync(f)) out.push({ url: `/framework/ai/${y}/${m}/${d}/${s}/`, file: f });
					}
				}
			}
		}
	}
	// a VS Code tab's prompts sit beside its session.jsonl in the store folder (prompt-relay, tab-session-record 2026-10-20)
	const seen = new Set(out.map(o => o.file));
	for (const y of safeReaddir(path.join(AI, "sessions"))) for (const m of safeReaddir(path.join(AI, "sessions", y))) for (const d of safeReaddir(path.join(AI, "sessions", y, m))){
		const day = path.join(AI, "sessions", y, m, d);
		for (const s of safeReaddir(day)){
			const f = path.join(day, s, "page.jsonl");
			if (!s.startsWith("session-") || seen.has(f) || !fs.existsSync(f)) continue;
			let id = null;
			for (const n of ["session.jsonl", "cache.jsonl"]) try { const l = JSON.parse(fs.readFileSync(path.join(day, s, n), "utf8").split(String.fromCharCode(10), 1)[0]); id = l.session?.id ?? l.summary?.id; if (id) break; } catch {}
			if (id) out.push({ url: `/framework/ai/sessions/${id}/`, file: f });
		}
	}
	return out;
}
function safeReaddir(d){ try { return fs.readdirSync(d); } catch { return []; } }

// Replay one page.jsonl: finds every top-level item ever `add`ed (both wire shapes — see
// Echo.js's own `read_item` note on the 2026-10-03 format change) and merges every later
// `page_set`-shaped delta addressed at that id on top, so an item this script (or Echo) has
// already refined shows its `sentences` key and is skipped.
function replayItems(file){
	const items = new Map();
	const text = fs.readFileSync(file, "utf8");
	for (const raw of text.split(/\r?\n/)){
		if (!raw.trim()) continue;
		let line; try { line = JSON.parse(raw); } catch { continue; }
		const add = (line.at === "content" ? line.add : line.content?.add);
		if (add?.id){ items.set(add.id, { ...add }); continue; }
		for (const id of Object.keys(line)){
			if (items.has(id)) Object.assign(items.get(id), line[id]);
		}
	}
	return items;
}

function ownerPromptsNeeding(date){
	const out = [];
	for (const { url, file } of listSessionDirs()){
		let items;
		try { items = replayItems(file); } catch { continue; }
		for (const item of items.values()){
			if (item.type !== "Prompt" || item.by !== "owner" || !item.text) continue;
			if (typeof item.ts !== "string" || !item.ts.startsWith(date)) continue;
			if (item.sentences) continue;   // already refined (live, or an earlier run of this script)
			out.push({ url, file, id: item.id, ts: item.ts, text: item.text });
		}
	}
	return out.sort((a, b) => Date.parse(a.ts) - Date.parse(b.ts));
}

// ---- paragraph-sized chunking (the owner's follow-up ask) ----------------------------------

// Real paragraph breaks first (a prompt that already has blank lines, e.g. a system prompt
// pasted into a test session); otherwise group plain sentences up to ~700 characters, the
// same "a few sentences, not the whole transcript" size a human paragraph reads as — small
// enough that qwen2.5-coder reliably numbers every sentence back (new-brain's own litmus,
// ai/sessions/2026/10/04/new-brain/new-brain, found it degrading on much bigger single calls).
const MAX_CHUNK = 700;
export function chunkText(text){
	const paras = text.split(/\n\s*\n/).map(s => s.trim()).filter(Boolean);
	const sentences = (paras.length > 1 ? paras : [text]).flatMap(p =>
		p.replace(/\s+/g, " ").trim().split(/(?<=[.!?])\s+/).filter(Boolean));
	const chunks = [];
	let cur = "";
	for (const s of sentences){
		if (cur && (cur.length + 1 + s.length) > MAX_CHUNK){ chunks.push(cur); cur = s; }
		else cur = cur ? `${cur} ${s}` : s;
	}
	if (cur) chunks.push(cur);
	return chunks.length ? chunks : [text];
}

// ---- the model call: local first, Anthropic fallback (Echo.js's own `call`, copied) --------

let cost_usd = 0;
const base_call = (p, o) => askOnce(p, o).then(r => { cost_usd += Number(r?.cost_usd) || 0; return r; });
const call = (p, o) => base_call(p, { ...o, model: LOCAL_MODEL, cwd: ROOT, env: env_for("local") })
	.catch(e => { console.error(`  local model unavailable (${e.message || e}), falling back`); return base_call(p, { ...o, cwd: ROOT }); });

// One prompt's full text, chunked, each chunk run through clean() with the previous chunk's
// tail as `prev` (engine.js's documented streaming seam) and sentence numbers offset to stay
// continuous across the whole prompt — the one piece Echo.js doesn't need, because it only
// ever calls clean() once per (shorter, live-dictated) prompt.
async function cleanWholePrompt(text){
	const chunks = chunkText(text);
	let sentences = [], strikes = [], misheard = [], flags = [], tailPrev = "";
	for (const chunk of chunks){
		const r = await clean(chunk, { prev: tailPrev, call });
		const offset = sentences.length;
		sentences.push(...r.sentences.map(s => ({ n: s.n + offset, text: s.text })));
		strikes.push(...r.strikes.map(s => ({ ...s, sentence_n: s.sentence_n + offset })));
		misheard.push(...r.misheard.map(m => ({ ...m, sentence_n: m.sentence_n + offset })));
		flags.push(...r.flags.map(f => ({ ...f, sentence_n: f.sentence_n + offset })));
		tailPrev = r.sentences.slice(-2).map(s => s.text).join(" ");
	}
	return { sentences, strikes, misheard, flags };
}

// Same tiny parser Echo.js keeps (not imported — that file is Servex-only and this script
// must run stand-alone): structure()'s "## Heading" / "- bullet [S1, S2]" shape into
// {heading, items:[{text, cites}]}, then stamped with ids the same way.
function parseSections(md){
	const sections = []; let current = null;
	const startDefault = () => { current = { heading: "", items: [] }; sections.push(current); };
	for (const line of String(md || "").split(/\r?\n/)){
		const h = line.match(/^##\s+(.+)$/);
		if (h){ current = { heading: h[1].trim(), items: [] }; sections.push(current); continue; }
		const b = line.match(/^[-*]\s+(.+)$/);
		if (b){
			if (!current) startDefault();
			const m = b[1].match(/\[(S\d+(?:\s*[-–]\s*S?\d+)?(?:\s*,\s*S?\d+(?:\s*[-–]\s*S?\d+)?)*)\]\s*$/);
			const cites = [];
			if (m) m[1].split(",").forEach(part => {
				const range = part.trim().match(/^S?(\d+)\s*[-–]\s*S?(\d+)$/);
				if (range){ const [lo, hi] = [Number(range[1]), Number(range[2])].sort((a, b) => a - b); for (let n = lo; n <= hi; n++) cites.push(n); return; }
				const single = part.trim().match(/^S?(\d+)$/);
				if (single) cites.push(Number(single[1]));
			});
			current.items.push({ text: m ? b[1].slice(0, m.index).trim() : b[1].trim(), cites });
		}
	}
	return sections.map((s, i) => ({ id: `sec${i + 1}`, heading: s.heading,
		items: s.items.map((it, j) => ({ id: `sec${i + 1}-i${j + 1}`, ...it })) }));
}

async function refineOne(p){
	cost_usd = 0;
	const { sentences, strikes, misheard, flags } = await cleanWholePrompt(p.text);
	const built = await structure(sentences, { call });
	const sections = parseSections(built.md);
	const cited = [...new Set(sections.flatMap(s => s.items.flatMap(i => i.cites)))].sort((a, b) => a - b);
	const coverage = { total: sentences.length, cited, missing: built.missing ?? [], duplicated: built.duplicated ?? [], confidence: built.confidence ?? {} };
	return { sentences, strikes, misheard, flags, sections, coverage, cost: { usd: Math.round(cost_usd * 10000) / 10000 } };
}

// ---- main ------------------------------------------------------------------------------

let done = 0, failed = 0;
for (const date of dates){
	const queue = ownerPromptsNeeding(date).slice(0, limit);
	console.log(`${date}: ${queue.length} owner prompt(s) without sentences`);
	for (const p of queue){
		if (done + failed >= limit) break;
		process.stdout.write(`  ${p.ts} ${p.url} (${p.text.length} chars)... `);
		try {
			const delta = await refineOne(p);
			if (dry){ console.log(`dry-run: ${delta.sentences.length} sentences, ${delta.flags.length} flag(s)`); }
			else {
				const line = nest([p.id], { ...delta, by: "day-prompts-refine", ts: new Date().toISOString() });
				write_line(p.file, line);
				console.log(`${delta.sentences.length} sentences, ${delta.flags.length} flag(s), $${delta.cost.usd}`);
			}
			done++;
		} catch (e) {
			console.log(`FAILED: ${e.message || e}`);
			failed++;
		}
	}
}
console.log(`done: ${done} refined, ${failed} failed`);
