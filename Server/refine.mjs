#!/usr/bin/env node
/* refine.mjs — a raw dictation, turned into a brief a mastermind can act on, with nothing lost
 * on the way and a paper trail proving it.
 *
 * The owner's worry (public/framework/ai/2026-09-29/prompt-refine/owner-words.md, 2026-09-29
 * about 1:25 PM): a long, rambling, informal dictation — full of "uh", "um", "like" — may lower
 * the model's quality, and whatever summary gets made from it (by a human-in-the-loop VS Code
 * tab, or by a mastermind) may leave out details or quietly turn a suggestion into a rule. What
 * reaches a mastermind should still be provably what was actually said.
 *
 * The ladder, each rung written to its own file so two rungs can be diffed:
 *   raw.txt        — the input, byte for byte.
 *   clean.md       — near-verbatim: fillers gone, typos/punctuation fixed, nothing else changed.
 *                    Every sentence numbered S1, S2, … so every later file can cite its source.
 *   structured.md  — the owner's ideas as an outline, in the owner's own words and names, every
 *                    bullet citing the sentences it came from.
 *   brief.md       — numbered asks for a mastermind, each citing its source sentences. A
 *                    suggestion ("maybe", "I think") stays a suggestion, never becomes a rule.
 *   coverage.md    — the audit, the actual point of the tool: every clean sentence traced to an
 *                    ask, "context only", or "dropped, because …", built MECHANICALLY from the
 *                    citations the other three files already carry (never trust prose, count it).
 *   refine.json    — models used, cost per step, word counts at each rung, the coverage numbers.
 *
 * Usage:
 *   node Server/refine.mjs <raw.txt | date:line> [--out <dir>] [--models haiku,sonnet] [--collab] [--mock]
 *
 * <date:line> is a 0-based line into .claude/prompts/<date>.jsonl (that file's `.prompt.text`),
 * so a dictation that was typed straight into a Claude Code session can be refined without first
 * saving it to a .txt file by hand.
 *
 * --models is the STRUCTURED step's model list, cheap first (default haiku,sonnet — see
 * Server/doc/refine.md for why cheap-first, and why clean/brief/coverage are pinned to one model
 * each rather than also being configurable: this is a tool for a fixed, known-good pipeline, not
 * a model-comparison harness). Each model drafts structured-<name>.md independently; --collab
 * picks among the drafts by running them through Server/collab.mjs's own vote (real Servex
 * agents, real cost — see the "given" hook in collab.mjs, added for exactly this reuse); without
 * it, one cheap judge call (Haiku) picks or merges. Either way the winner is recorded so
 * Server/refine-scoreboard.jsonl can say, over many runs, which model actually refines best.
 *
 * --mock makes every step deterministic and model-free (a mechanical sentence splitter stands in
 * for the "clean" call, a fixed grouping stands in for "structured", etc.) so the whole pipeline —
 * file layout, the coverage table's mechanics, the collab hand-off — can be proven for $0 before
 * spending anything real.
 *
 * Reuse, not a third engine (the brief's own rule): every model call goes through `askOnce` from
 * Server/ask-each.mjs; the --collab path goes through Server/collab.mjs. This file does no direct
 * SDK or MCP calls of its own. Every Node spawn sets `windowsHide: true`. */

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { askOnce } from "./ask-each.mjs";

const MODELS = {
	haiku: "claude-haiku-4-5-20251001",
	sonnet: "claude-sonnet-5",
};
const CLEAN_MODEL = MODELS.haiku;      // cheap, mechanical-ish work
const JUDGE_MODEL = MODELS.haiku;      // "a single cheap judge call" (brief, deliverable 3)
const BRIEF_MODEL = MODELS.sonnet;     // wording asks correctly matters more here
const COVERAGE_MODEL = MODELS.sonnet;  // classifying "dropped, because …" needs real judgment

// ---- small shared helpers (same shapes collab.mjs already uses, kept local on purpose: this
// file has to stand alone as a CLI tool, not depend on another script's internals) ----------

const now = () => { const d = new Date(), o = -d.getTimezoneOffset(), p = n => String(Math.floor(Math.abs(n))).padStart(2, "0"); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}${o < 0 ? "-" : "+"}${p(o / 60)}:${p(o % 60)}`; };

function appendJSON(file, obj) {
	fs.mkdirSync(path.dirname(file), { recursive: true });
	let lead = ""; try { const b = fs.readFileSync(file); if (b.length && b.at(-1) !== 10) lead = "\n"; } catch {}
	fs.appendFileSync(file, lead + JSON.stringify(obj) + "\n");
}

function repoRoot() {
	const r = spawnSync("git", ["rev-parse", "--show-toplevel"], { encoding: "utf8", windowsHide: true }).stdout.trim();
	return r || process.cwd();
}

function parseArgs(argv) {
	const args = { input: null, out: process.cwd(), models: ["haiku", "sonnet"], collab: false, mock: false };
	const rest = [];
	for (let i = 0; i < argv.length; i++) {
		const a = argv[i];
		if (a === "--out") args.out = argv[++i];
		else if (a === "--models") args.models = argv[++i].split(",").map(s => s.trim()).filter(Boolean);
		else if (a === "--collab") args.collab = true;
		else if (a === "--mock") args.mock = true;
		else rest.push(a);
	}
	args.input = rest[0];
	return args;
}

// A short, filesystem-safe id for a model: "haiku" stays "haiku"; a raw model id like
// "claude-sonnet-5" collapses to "claude-sonnet-5" (already safe). Used for both the
// structured-<id>.md filename and the collab member id.
const modelKey = s => String(s).replace(/[^a-zA-Z0-9_-]+/g, "-");
const modelIdFor = name => MODELS[name] || name; // a name not in the table is used literally

// <date>:<line>, 0-based, into .claude/prompts/<date>.jsonl's `.prompt.text`.
function resolveRaw(input, root) {
	const m = /^(\d{4}-\d{2}-\d{2}):(\d+)$/.exec(input);
	if (!m) return fs.readFileSync(input, "utf8");
	const [, date, lineStr] = m;
	const line = Number(lineStr);
	const file = path.join(root, ".claude/prompts", `${date}.jsonl`);
	let lines;
	try { lines = fs.readFileSync(file, "utf8").split(/\r?\n/).filter(Boolean); }
	catch (e) { throw new Error(`refine.mjs: could not read ${file}: ${e.message}`); }
	if (line < 0 || line >= lines.length) throw new Error(`refine.mjs: ${file} has ${lines.length} line(s), no line ${line}`);
	let obj;
	try { obj = JSON.parse(lines[line]); } catch (e) { throw new Error(`refine.mjs: line ${line} of ${file} is not valid JSON: ${e.message}`); }
	const text = obj?.prompt?.text;
	if (typeof text !== "string" || !text.trim()) throw new Error(`refine.mjs: line ${line} of ${file} has no usable .prompt.text`);
	return text;
}

// ---- word counting / the mechanical faithfulness check (deliverable 2: "check it mechanically,
// log the ratio" — no model call needed for this, it is exactly the kind of thing code should do) ----

const wordsOf = text => (String(text).toLowerCase().match(/[a-z0-9']+/g) || []);
const STOP = new Set(["the", "a", "an", "and", "or", "but", "to", "of", "in", "on", "for", "is", "are", "was", "were", "be", "been", "it", "that", "this", "i", "you", "we", "they", "he", "she", "with", "as", "at", "by", "from", "so", "if", "then", "than", "not", "no", "do", "does", "did", "have", "has", "had", "my", "your", "our", "their", "his", "her", "its", "um", "uh", "like", "going", "gonna", "just", "really", "kind", "sort"]);
const contentWords = text => wordsOf(text).filter(w => w.length >= 4 && !STOP.has(w));

// The clean text's content words should almost all be present in the raw text — this is the
// mechanical half of "is clean.md still what the owner said", separate from (and cheaper than)
// any model judgment.
function overlapRatio(rawText, cleanText) {
	const rawSet = new Set(contentWords(rawText));
	const cw = contentWords(cleanText);
	if (!cw.length) return 1;
	const hit = cw.filter(w => rawSet.has(w)).length;
	return Math.round((hit / cw.length) * 1000) / 1000;
}

// ---- step 1: clean.md — near-verbatim, numbered sentences -------------------------------------

// Mechanical stand-in for --mock: a plain sentence split plus a light filler strip. Real quality
// (deciding what is a filler vs. a real word, fixing typos) is the model's job in the real path —
// this only exists so the file layout and every later step can be proven without spending money.
function mechanicalClean(raw) {
	const FILLERS = /\b(uh+|um+|like|you know|i mean|whatever|kind of|sort of)\b[,.]?\s*/gi;
	const collapsed = raw.replace(/\s+/g, " ").trim();
	const sentences = collapsed.split(/(?<=[.!?])\s+/).map(s => s.replace(FILLERS, " ").replace(/\s+/g, " ").trim()).filter(Boolean);
	return sentences;
}

function parseNumberedSentences(text) {
	const out = [];
	for (const m of text.matchAll(/^S(\d+)\.\s*(.+)$/gm)) out.push({ n: Number(m[1]), text: m[2].trim() });
	return out;
}

async function stepClean(raw, cwd, mock) {
	if (mock) {
		const sentences = mechanicalClean(raw).map((text, i) => ({ n: i + 1, text }));
		const md = sentences.map(s => `S${s.n}. ${s.text}`).join("\n") + "\n";
		return { md, sentences, cost_usd: 0 };
	}
	const prompt = `You are cleaning a raw speech-to-text transcript for readability, changing as LITTLE as possible.\n\n`
		+ `Rules:\n`
		+ `- Remove filler sounds and words: uh, um, like (only when it is a verbal tic, not a real comparison), "you know", "I mean", "whatever", and exact repeated words/false starts ("I, I'm" -> "I'm").\n`
		+ `- Fix obvious transcription typos, capitalization and punctuation.\n`
		+ `- Do NOT summarize, shorten, combine sentences, or change any idea, name, number, or claim. Keep the owner's own wording everywhere else.\n`
		+ `- Split the cleaned text into sentences, in original order, and number them S1, S2, S3, ...\n\n`
		+ `Output ONLY the numbered sentences, one per line, in exactly this format and nothing else (no heading, no commentary):\n`
		+ `S1. <first sentence>\nS2. <second sentence>\n...\n\n`
		+ `Raw transcript:\n"""\n${raw}\n"""\n`;
	const r = await askOnce(prompt, { model: CLEAN_MODEL, cwd });
	let sentences = parseNumberedSentences(r.answer);
	if (!sentences.length) {
		// The model didn't follow the format — fall back to the mechanical split rather than
		// produce an empty clean.md; every later step still needs numbered sentences to cite.
		sentences = mechanicalClean(raw).map((text, i) => ({ n: i + 1, text }));
	}
	const md = sentences.map(s => `S${s.n}. ${s.text}`).join("\n") + "\n";
	return { md, sentences, cost_usd: r.cost_usd };
}

// ---- step 2: structured.md — multi-model outline, then pick (judge or collab) -----------------

function cleanTextForPrompt(sentences) {
	return sentences.map(s => `S${s.n}. ${s.text}`).join("\n");
}

function mockStructured(sentences, index) {
	// A deterministic, slightly different grouping per model index so two mock drafts are never
	// byte-identical (same trick collab.mjs's own mockFacts uses, for the same reason).
	const groupSize = 2 + (index % 2);
	const lines = [];
	for (let i = 0; i < sentences.length; i += groupSize) {
		const group = sentences.slice(i, i + groupSize);
		const cites = group.map(s => `S${s.n}`).join(", ");
		lines.push(`- ${group.map(s => s.text).join(" ")} [${cites}]`);
	}
	return lines.join("\n") + "\n";
}

async function draftStructured(modelId, sentences, cwd, mock, index) {
	if (mock) return { md: mockStructured(sentences, index), cost_usd: 0 };
	const prompt = `Read this numbered, cleaned transcript of the owner talking. Write an OUTLINE of the owner's\n`
		+ `own ideas: Markdown bullets, using the owner's own words and names for things — never invent new\n`
		+ `terminology. Group related sentences under one bullet where that helps. Do not add any idea that\n`
		+ `is not in the transcript, and do not turn a hedge ("maybe", "I think", "I guess") into a flat claim.\n\n`
		+ `Every bullet MUST end with the sentence numbers it is based on, in this exact form: [S3, S7].\n`
		+ `Use only sentence numbers that appear below — never invent one.\n\n`
		+ `Cleaned transcript:\n"""\n${cleanTextForPrompt(sentences)}\n"""\n\n`
		+ `Output ONLY the outline (Markdown bullets), nothing else.`;
	const r = await askOnce(prompt, { model: modelId, cwd });
	return { md: r.answer.trim() + "\n", cost_usd: r.cost_usd };
}

// Without --collab: one cheap judge call picks a base draft (or merges) and says which model it
// started from, so the scoreboard still has a winner to record.
async function judgePick(drafts, cwd, mock) {
	if (mock || drafts.length === 1) {
		const first = drafts[0];
		return { md: first.md, winner: first.name, cost_usd: 0 };
	}
	const body = drafts.map(d => `Draft "${d.name}":\n"""\n${d.md}\n"""`).join("\n\n");
	const prompt = `${drafts.length} drafts of the same outline exist (${drafts.map(d => `"${d.name}"`).join(", ")}), made by\n`
		+ `different models from the same source sentences. Pick the best one as your base, or merge the\n`
		+ `best parts of the others into it — keep every [S#] citation exactly as written, never invent one,\n`
		+ `never drop an idea that was in a draft. The FIRST line of your answer must be exactly:\n`
		+ `WINNER: <the draft name you started from>\n`
		+ `Then the final outline (Markdown bullets), and nothing else.\n\n${body}`;
	const r = await askOnce(prompt, { model: JUDGE_MODEL, cwd });
	const m = /^WINNER:\s*(\S+)/.exec(r.answer.trim());
	const winner = m && drafts.some(d => d.name === m[1]) ? m[1] : drafts[0].name;
	const md = r.answer.replace(/^WINNER:\s*\S+\s*\n?/, "").trim() + "\n";
	return { md, winner, cost_usd: r.cost_usd };
}

// With --collab: reuse Server/collab.mjs's own vote — pre-seed each draft as that phase's
// "given" file (see the hook added to collab.mjs), let collab.mjs run its real vote + tally +
// scoreboard, then read its winner back. Real Servex agents, real cost — see Server/doc/collab.md.
async function collabPick(drafts, outDir, cwd, mock) {
	const collabDir = path.join(outDir, "collab-structured");
	fs.mkdirSync(collabDir, { recursive: true });
	for (const d of drafts) {
		const dir = path.join(collabDir, "collab", d.name);
		fs.mkdirSync(dir, { recursive: true });
		fs.writeFileSync(path.join(dir, "1-structured.md"), d.md);
	}
	const collabJson = {
		id: "structured-pick",
		question: "Which structured draft best captures the owner's dictation, keeping their own words and the sentence citations intact?",
		kind: "structure",
		phases: [{ n: 1, kind: "structured", given: true }, { n: 2, kind: "vote" }],
		members: drafts.map(d => ({ id: d.name, model: d.modelId })),
	};
	fs.writeFileSync(path.join(collabDir, "collab.json"), JSON.stringify(collabJson, null, 2));
	const collabScript = path.join(path.dirname(fileURLToPath(import.meta.url)), "collab.mjs");
	const args = [collabScript, collabDir]; if (mock) args.push("--mock");
	const r = spawnSync(process.execPath, args, { cwd, encoding: "utf8", windowsHide: true });
	if (r.status !== 0) throw new Error(`refine.mjs: collab.mjs failed (exit ${r.status}):\n${r.stderr || r.stdout}`);
	const jsonlPath = path.join(collabDir, "collab.jsonl");
	const lines = fs.readFileSync(jsonlPath, "utf8").split(/\r?\n/).filter(Boolean).map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
	const winnerLine = [...lines].reverse().find(l => l.winner)?.winner;
	if (!winnerLine || !winnerLine.pick) throw new Error(`refine.mjs: collab.mjs run at ${collabDir} produced no winner (see ${jsonlPath})`);
	const winner = drafts.find(d => d.name === winnerLine.pick) || drafts[0];
	const caveats = (winnerLine.caveats || []).filter(Boolean);
	const md = winner.md.trim() + (caveats.length ? `\n\n**Caveats from the vote:**\n${caveats.map(c => `- ${c}`).join("\n")}\n` : "\n");
	return { md, winner: winner.name, cost_usd: winnerLine.cost || 0, collabDir: path.relative(outDir, collabDir).replaceAll("\\", "/") };
}

// ---- step 3: brief.md — numbered asks for a mastermind ----------------------------------------

function mockBrief(structuredMd) {
	const bullets = structuredMd.split("\n").filter(l => /^-\s/.test(l));
	return bullets.map((b, i) => `${i + 1}. ${b.replace(/^-\s*/, "")}`).join("\n") + "\n";
}

async function stepBrief(structuredMd, cwd, mock) {
	if (mock) return { md: mockBrief(structuredMd), cost_usd: 0 };
	const prompt = `Turn this outline into a numbered list of asks for a mastermind (an AI project lead) to act on.\n\n`
		+ `Rules:\n`
		+ `- Keep the owner's own names and words for things; never invent new terminology.\n`
		+ `- Every ask ends with the sentence numbers it is based on, exactly as the outline already has them,\n`
		+ `  like [S3, S7] — carry these over, never invent a new one and never drop one that applies.\n`
		+ `- If the outline hedges ("maybe", "I think", "I guess"), phrase the ask as "the owner suggests ...",\n`
		+ `  never as a flat instruction. A suggestion must never read like a rule.\n`
		+ `- Number the asks 1, 2, 3, ... — one ask per idea, don't merge unrelated ideas into one ask.\n\n`
		+ `Outline:\n"""\n${structuredMd}\n"""\n\n`
		+ `Output ONLY the numbered list, nothing else.`;
	const r = await askOnce(prompt, { model: BRIEF_MODEL, cwd });
	return { md: r.answer.trim() + "\n", cost_usd: r.cost_usd };
}

// ---- step 4: coverage.md — the audit, built mechanically first --------------------------------

// One ask = one numbered top-level item; its "text" is everything up to (not including) the next
// numbered item, so a wrapped, multi-line ask is still read whole.
function parseAsks(briefMd) {
	const lines = briefMd.split(/\r?\n/);
	const asks = [];
	let cur = null;
	for (const line of lines) {
		const m = /^(\d+)\.\s*(.*)$/.exec(line);
		if (m) { if (cur) asks.push(cur); cur = { n: Number(m[1]), text: m[2] }; }
		else if (cur && line.trim()) cur.text += " " + line.trim();
	}
	if (cur) asks.push(cur);
	return asks;
}

const citationsIn = text => [...text.matchAll(/\bS(\d+)\b/g)].map(m => Number(m[1]));
const STRENGTH_WORDS = ["must", "never", "always", "only"];

async function classifyUncited(uncited, cwd, mock) {
	// --mock is canned test data, not a real classification gap, so it can safely default to
	// "context only" — the fix below (an honest "unclassified" verdict) is only for the REAL
	// path, where the model itself might skip a line and a silent default would hide that.
	if (mock || !uncited.length) {
		return new Map(uncited.map(s => [s.n, { verdict: "context only", why: "" }]));
	}
	const list = uncited.map(s => `S${s.n}. ${s.text}`).join("\n");
	const prompt = `These sentences from a cleaned transcript were not cited by any numbered ask in the brief made\n`
		+ `from it. For EACH one, decide: is it "context only" (true but doesn't need its own ask — scene-\n`
		+ `setting, an aside, something already covered by another ask in different words), or was it\n`
		+ `genuinely "dropped" (a real idea, request or detail that never made it into any ask)? For a drop,\n`
		+ `say why in a few words.\n\n`
		+ `Sentences:\n${list}\n\n`
		+ `Output ONLY one line per sentence, in exactly this format:\n`
		+ `S<n> | context only\n`
		+ `S<n> | dropped, because <short reason>\n`;
	const r = await askOnce(prompt, { model: COVERAGE_MODEL, cwd });
	const out = new Map();
	for (const m of r.answer.matchAll(/^S(\d+)\s*\|\s*(.+)$/gm)) {
		const n = Number(m[1]), rest = m[2].trim();
		if (/^dropped/i.test(rest)) out.set(n, { verdict: "dropped", why: rest.replace(/^dropped,?\s*(because\s*)?/i, "").trim() });
		else out.set(n, { verdict: "context only", why: "" });
	}
	// Fix (2026-09-29, review before this file's first commit): a line the model skipped used to
	// fall back to "context only" — a SILENT default, exactly the failure mode this whole tool
	// exists to catch (the owner: "sometimes the LLM will leave out important details ... and we
	// need to make sure we don't do that"). It now falls back to an explicit "unclassified" verdict
	// instead, so a reader sees "the model never answered for this one" rather than a false all-clear.
	for (const s of uncited) if (!out.has(s.n)) out.set(s.n, { verdict: "unclassified", why: "" });
	return { classified: out, cost_usd: r.cost_usd };
}

async function buildCoverage(sentences, asks, cwd, mock) {
	const sentenceText = new Map(sentences.map(s => [s.n, s.text]));
	// The whole transcript's own vocabulary — used by the "new words" flag below so a legitimate
	// paraphrase (reusing a word from elsewhere in the SAME dictation) is never flagged, only a
	// word that appears nowhere the owner actually said.
	const fullWords = new Set(sentences.flatMap(s => contentWords(s.text)));
	const citedBy = new Map(); // sentence n -> [{ask, thin}, ...]
	const flagRows = [];

	for (const ask of asks) {
		const cited = citationsIn(ask.text);
		const askWords = new Set(contentWords(ask.text));

		// Fix: "cited-but-thin" — an ask CITES a sentence (so the mechanical count above would
		// have called it covered) but shares no content word with it at all, meaning the citation
		// is there in form only and the ask may not actually reflect what that sentence said.
		for (const n of cited) {
			const sWords = contentWords(sentenceText.get(n) || "");
			const thin = sWords.length > 0 && sWords.every(w => !askWords.has(w));
			if (!citedBy.has(n)) citedBy.set(n, []);
			citedBy.get(n).push({ ask: ask.n, thin });
			if (thin) flagRows.push({ ask: ask.n, kind: "thin citation", detail: `cites S${n} but shares no wording with it — the citation may not reflect what S${n} actually says` });
		}

		// A strength word (must/never/always/only) the ask uses but its own cited sentence(s)
		// don't contain — the sharpest, narrowest sign of a suggestion turned into a rule.
		const citedText = cited.map(n => sentenceText.get(n) || "").join(" ").toLowerCase();
		for (const w of STRENGTH_WORDS) {
			const re = new RegExp(`\\b${w}\\b`, "i");
			if (re.test(ask.text) && !re.test(citedText)) flagRows.push({ ask: ask.n, kind: "strength word", detail: `uses "${w}", not found in the cited sentence(s)` });
		}

		// Fix: "new words" — a content word in the ask that appears NOWHERE in the whole
		// transcript, not just outside its own cited sentence(s). Checked against the FULL
		// transcript (not only what's cited) on purpose: reusing a word the owner said somewhere
		// else in the same dictation is normal paraphrase, not a problem; a word that was never
		// said at all is the owner's exact worry — "choosing different words ... when I haven't
		// said it explicitly that way."
		const novel = [...askWords].filter(w => !fullWords.has(w));
		if (novel.length) flagRows.push({ ask: ask.n, kind: "new words", detail: `"${novel.join('", "')}" — not in the transcript at all` });
	}

	const uncited = sentences.filter(s => !citedBy.has(s.n));
	const classResult = await classifyUncited(uncited, cwd, mock);
	const classified = classResult instanceof Map ? classResult : classResult.classified;
	const classifyCost = classResult instanceof Map ? 0 : classResult.cost_usd;

	const rows = sentences.map(s => {
		const citing = citedBy.get(s.n);
		if (citing) return { n: s.n, text: s.text, dest: citing.map(c => `ask #${c.ask}${c.thin ? " (thin)" : ""}`).join(", ") };
		const c = classified.get(s.n) || { verdict: "unclassified", why: "" };
		if (c.verdict === "dropped") return { n: s.n, text: s.text, dest: `dropped, because ${c.why || "unclear"}` };
		if (c.verdict === "unclassified") return { n: s.n, text: s.text, dest: "unclassified — the model gave no answer for this sentence" };
		return { n: s.n, text: s.text, dest: "context only" };
	});

	const md = [
		`# Coverage`,
		"",
		"One row per clean sentence, built mechanically from the citations `structured.md` and `brief.md`",
		"already carry — only the *uncited* rows below (\"context only\" / \"dropped, because …\" /",
		"\"unclassified\") came from a model classification pass; every other row, and every flag, is a",
		"plain word count against the transcript, no model call.",
		"",
		"## Sentence coverage",
		"",
		"| S# | sentence | -> |",
		"|---|---|---|",
		...rows.map(r => `| S${r.n} | ${r.text.replace(/\|/g, "\\|")} | ${r.dest} |`),
		"",
		"## Flags",
		"",
		"Three mechanical checks: a **strength word** (must / never / always / only) the cited",
		"sentence(s) don't contain; **new words** — a word in the ask that is nowhere in the whole",
		"transcript; a **thin citation** — an ask cites a sentence but shares no wording with it",
		"(also marked \"(thin)\" right in the table above).",
		"",
		flagRows.length ? "| ask | flag | detail |" : "(none)",
		...(flagRows.length ? ["|---|---|---|", ...flagRows.map(f => `| #${f.ask} | ${f.kind} | ${f.detail} |`)] : []),
	].join("\n") + "\n";

	const dropped = rows.filter(r => r.dest.startsWith("dropped")).length;
	const unclassified = rows.filter(r => r.dest.startsWith("unclassified")).length;
	const contextOnly = rows.filter(r => r.dest === "context only").length;
	const cited = rows.length - dropped - contextOnly - unclassified;
	return {
		md, cost_usd: classifyCost,
		numbers: {
			sentences: rows.length, cited, context_only: contextOnly, dropped, unclassified,
			flags: flagRows.length, thin_citations: flagRows.filter(f => f.kind === "thin citation").length,
		},
	};
}

// ---- main ---------------------------------------------------------------------------------

async function main() {
	const args = parseArgs(process.argv.slice(2));
	if (!args.input) {
		console.error("usage: node Server/refine.mjs <raw.txt | date:line> [--out <dir>] [--models haiku,sonnet] [--collab] [--mock]");
		process.exit(1);
	}
	const root = repoRoot();
	const cwd = root;
	const outDir = path.resolve(args.out);
	fs.mkdirSync(outDir, { recursive: true });

	const rawText = resolveRaw(args.input, root);
	fs.writeFileSync(path.join(outDir, "raw.txt"), rawText); // byte for byte, whatever it is

	const costs = {};

	console.log("refine.mjs: cleaning...");
	const clean = await stepClean(rawText, cwd, args.mock);
	costs.clean = clean.cost_usd;
	fs.writeFileSync(path.join(outDir, "clean.md"), clean.md);
	const ratio = overlapRatio(rawText, clean.md);

	console.log(`refine.mjs: drafting structured.md with ${args.models.join(", ")}...`);
	const drafts = [];
	costs.structured = {};
	for (let i = 0; i < args.models.length; i++) {
		const name = modelKey(args.models[i]);
		const modelId = modelIdFor(args.models[i]);
		const d = await draftStructured(modelId, clean.sentences, cwd, args.mock, i);
		costs.structured[name] = d.cost_usd;
		fs.writeFileSync(path.join(outDir, `structured-${name}.md`), d.md);
		drafts.push({ name, modelId, md: d.md });
	}

	console.log(args.collab ? "refine.mjs: picking via collab.mjs..." : "refine.mjs: picking via judge call...");
	const pick = args.collab ? await collabPick(drafts, outDir, cwd, args.mock) : await judgePick(drafts, cwd, args.mock);
	costs.pick = pick.cost_usd;
	fs.writeFileSync(path.join(outDir, "structured.md"), pick.md);

	appendJSON(path.join(path.dirname(fileURLToPath(import.meta.url)), "refine-scoreboard.jsonl"), {
		at: now(), input: args.input, models: args.models.map(modelIdFor), collab: args.collab, mock: args.mock, winner: pick.winner,
		costs: { clean: costs.clean, structured: costs.structured, pick: costs.pick },
	});

	console.log("refine.mjs: drafting brief.md...");
	const brief = await stepBrief(pick.md, cwd, args.mock);
	costs.brief = brief.cost_usd;
	fs.writeFileSync(path.join(outDir, "brief.md"), brief.md);

	console.log("refine.mjs: building coverage.md...");
	const asks = parseAsks(brief.md);
	const coverage = await buildCoverage(clean.sentences, asks, cwd, args.mock);
	costs.coverage = coverage.cost_usd;
	fs.writeFileSync(path.join(outDir, "coverage.md"), coverage.md);

	const wordCount = t => wordsOf(t).length;
	const totalCost = (costs.clean || 0) + Object.values(costs.structured).reduce((s, c) => s + c, 0) + (costs.pick || 0) + (costs.brief || 0) + (costs.coverage || 0);
	const refineJson = {
		at: now(), input: args.input, out: path.relative(root, outDir).replaceAll("\\", "/"),
		models: { clean: CLEAN_MODEL, structured: args.models.map(modelIdFor), pick: args.collab ? "collab.mjs" : JUDGE_MODEL, brief: BRIEF_MODEL, coverage: COVERAGE_MODEL },
		collab: args.collab, mock: args.mock, structured_winner: pick.winner,
		cost_usd: { ...costs, total: Number(totalCost.toFixed(6)) },
		word_counts: { raw: wordCount(rawText), clean: wordCount(clean.md), structured: wordCount(pick.md), brief: wordCount(brief.md) },
		clean_overlap_ratio: ratio,
		coverage: coverage.numbers,
	};
	fs.writeFileSync(path.join(outDir, "refine.json"), JSON.stringify(refineJson, null, 2) + "\n");

	console.log(`refine.mjs: wrote ${outDir} — total cost $${totalCost.toFixed(4)}, ${coverage.numbers.sentences} sentences (${coverage.numbers.dropped} dropped, ${coverage.numbers.flags} flag(s)), overlap ${ratio}`);
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) main().catch(e => { console.error(String(e?.stack || e)); process.exitCode = 1; });
