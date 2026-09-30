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

// ---- one table, every rung's {model, prompt} (2026-09-29, this file's own task) --------------
//
// Every model call this file makes is one of these six rungs. `model` is the model id (or a
// short name from MODELS above) actually used, and is what "cheap, mechanical-ish work" or
// "wording asks correctly matters more here" used to be one-off comments on a scattered constant
// for. `promptTemplate`, when set, REPLACES that rung's built-in prompt wholesale — the one spot
// where "{{INPUT}}" appears in it is substituted with that rung's main input text (the raw
// transcript for `clean`, the numbered clean sentences for `structured`, the structured outline
// for `brief`) before the call. Left `null`, the rung's own default prompt function below is used.
//
// `pick`, `coverage` and `repair` have no `promptTemplate` slot: their prompts are built from
// several pieces at once (several drafts to compare; a list of specific gap sentences), not one
// swappable block of input text, so a single "{{INPUT}}" placeholder can't stand in for them
// without losing information a caller would need to supply anyway. Their MODEL is still
// configurable, same as the other three — see "overriding a rung" in Server/doc/refine.md.
//
// Overriding a rung, cheapest first: `--model-<rung> <model-or-short-name>` (e.g.
// `--model-structured sonnet`) swaps just its model. `--config <path.json>` — an object keyed by
// rung name, each `{ "model": "...", "prompt": "..." }` (either key optional) — can swap both;
// a CLI `--model-<rung>` flag wins over the same rung's `--config` entry, which wins over the
// default below. `structured` is the one multi-draft rung: its models come from `--models`
// (several drafts, then a pick), so `--model-structured <m>` is shorthand for `--models <m>`.
const RUNGS = {
	clean:      { model: MODELS.haiku,  promptTemplate: null }, // cheap, mechanical-ish work
	structured: { model: null,          promptTemplate: null }, // model: see --models, below
	pick:       { model: MODELS.haiku,  promptTemplate: null }, // "a single cheap judge call" (brief, deliverable 3)
	brief:      { model: MODELS.sonnet, promptTemplate: null }, // wording asks correctly matters more here
	coverage:   { model: MODELS.sonnet, promptTemplate: null }, // classifying "dropped, because …" needs real judgment
	repair:     { model: MODELS.sonnet, promptTemplate: null }, // same reasoning as brief
};

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
	const args = { input: null, out: process.cwd(), models: ["haiku", "sonnet"], collab: false, mock: false, coverageOnly: null, repairOnly: null, repairRounds: 1, config: null, rungModel: {} };
	const rest = [];
	for (let i = 0; i < argv.length; i++) {
		const a = argv[i];
		const rungModelFlag = /^--model-([a-z]+)$/.exec(a);
		if (a === "--out") args.out = argv[++i];
		else if (a === "--models") args.models = argv[++i].split(",").map(s => s.trim()).filter(Boolean);
		else if (a === "--collab") args.collab = true;
		else if (a === "--mock") args.mock = true;
		else if (a === "--coverage-only") args.coverageOnly = argv[++i];
		else if (a === "--repair-only") args.repairOnly = argv[++i];
		else if (a === "--repair-rounds") args.repairRounds = Number(argv[++i]);
		else if (a === "--no-repair") args.repairRounds = 0;
		else if (a === "--config") args.config = argv[++i];
		else if (rungModelFlag) args.rungModel[rungModelFlag[1]] = argv[++i];
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

// Applies `--config <path.json>` then `--model-<rung>` on top of RUNGS's own defaults, in that
// order (a CLI flag always wins) — see the big comment above RUNGS for the override rules. Called
// once, at the top of `main()`; every step function below just reads RUNGS from then on.
function applyRungOverrides(args) {
	if (args.config) {
		let cfg;
		try { cfg = JSON.parse(fs.readFileSync(args.config, "utf8")); }
		catch (e) { throw new Error(`refine.mjs: --config ${args.config} is not readable JSON: ${e.message}`); }
		for (const rung of Object.keys(cfg)) {
			if (!RUNGS[rung]) throw new Error(`refine.mjs: --config names unknown rung "${rung}" — expected one of ${Object.keys(RUNGS).join(", ")}`);
			if (cfg[rung].model) RUNGS[rung].model = modelIdFor(cfg[rung].model);
			if (cfg[rung].prompt) RUNGS[rung].promptTemplate = cfg[rung].prompt;
		}
	}
	if (args.rungModel.structured) { args.models = [args.rungModel.structured]; delete args.rungModel.structured; }
	for (const [rung, model] of Object.entries(args.rungModel)) {
		if (!RUNGS[rung]) throw new Error(`refine.mjs: --model-${rung} names unknown rung "${rung}" — expected one of ${Object.keys(RUNGS).join(", ")}`);
		RUNGS[rung].model = modelIdFor(model);
	}
}

// `.claude/prompts/` is git-ignored and PER-WORKTREE (prompt-relay.mjs writes into whichever
// tree the typing session's cwd was) — a worktree's own copy usually has just that worktree's own
// sessions in it, so a prompt typed in the main tree (or a sibling worktree) is invisible from
// here. `git rev-parse --git-common-dir` always points at the ONE shared `.git` every worktree of
// the same repo has (the main tree's own, for a worktree; its own `.git` for the main tree
// itself), so its parent is the main tree's root — the one other place worth trying.
function mainTreeRoot(root) {
	const r = spawnSync("git", ["rev-parse", "--git-common-dir"], { cwd: root, encoding: "utf8", windowsHide: true });
	if (r.status !== 0 || !r.stdout.trim()) return null;
	const commonDir = path.resolve(root, r.stdout.trim()); // e.g. C:/Code/lew42/monorepo/.git
	return path.dirname(commonDir);
}

// <date>:<line>, 0-based, into .claude/prompts/<date>.jsonl's `.prompt.text` — tried in THIS tree
// first, then the main tree, since a worktree's own log usually won't have a prompt that was
// typed somewhere else. Returns which file it actually read, for refine.json.
function resolveRaw(input, root) {
	const m = /^(\d{4}-\d{2}-\d{2}):(\d+)$/.exec(input);
	if (!m) return { text: fs.readFileSync(input, "utf8"), sourceFile: path.resolve(input) };
	const [, date, lineStr] = m;
	const line = Number(lineStr);

	const candidates = [path.join(root, ".claude/prompts", `${date}.jsonl`)];
	const mainRoot = mainTreeRoot(root);
	if (mainRoot && path.resolve(mainRoot) !== path.resolve(root)) candidates.push(path.join(mainRoot, ".claude/prompts", `${date}.jsonl`));

	let file, lines;
	const misses = [];
	for (const candidate of candidates) {
		try { lines = fs.readFileSync(candidate, "utf8").split(/\r?\n/).filter(Boolean); file = candidate; break; }
		catch (e) { misses.push(`${candidate} (${e.code || e.message})`); }
	}
	if (!file) throw new Error(`refine.mjs: no ${date}.jsonl found — tried ${misses.join(" and ")}. .claude/prompts/ is git-ignored and per-worktree, so a prompt typed in a different tree's session won't be here.`);

	if (line < 0 || line >= lines.length) throw new Error(`refine.mjs: ${file} has ${lines.length} line(s), no line ${line}`);
	let obj;
	try { obj = JSON.parse(lines[line]); } catch (e) { throw new Error(`refine.mjs: line ${line} of ${file} is not valid JSON: ${e.message}`); }
	const text = obj?.prompt?.text;
	if (typeof text !== "string" || !text.trim()) throw new Error(`refine.mjs: line ${line} of ${file} has no usable .prompt.text`);
	return { text, sourceFile: file };
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

function cleanPromptDefault(raw) {
	return `You are cleaning a raw speech-to-text transcript for readability, changing as LITTLE as possible.\n\n`
		+ `Rules:\n`
		+ `- Remove filler sounds and words: uh, um, like (only when it is a verbal tic, not a real comparison), "you know", "I mean", "whatever", and exact repeated words/false starts ("I, I'm" -> "I'm").\n`
		+ `- Fix obvious transcription typos, capitalization and punctuation.\n`
		+ `- Do NOT summarize, shorten, combine sentences, or change any idea, name, number, or claim. Keep the owner's own wording everywhere else.\n`
		+ `- Split the cleaned text into sentences, in original order, and number them S1, S2, S3, ...\n\n`
		+ `Output ONLY the numbered sentences, one per line, in exactly this format and nothing else (no heading, no commentary):\n`
		+ `S1. <first sentence>\nS2. <second sentence>\n...\n\n`
		+ `Raw transcript:\n"""\n${raw}\n"""\n`;
}

async function stepClean(raw, cwd, mock) {
	if (mock) {
		const sentences = mechanicalClean(raw).map((text, i) => ({ n: i + 1, text }));
		const md = sentences.map(s => `S${s.n}. ${s.text}`).join("\n") + "\n";
		return { md, sentences, cost_usd: 0 };
	}
	const prompt = RUNGS.clean.promptTemplate ? RUNGS.clean.promptTemplate.replaceAll("{{INPUT}}", raw) : cleanPromptDefault(raw);
	const r = await askOnce(prompt, { model: RUNGS.clean.model, cwd });
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
	// byte-identical (same trick collab.mjs's own mockFacts uses, for the same reason). Wrapped in
	// one H1 + H2 (same shape the real prompt below produces) so the mock path still exercises the
	// real structure downstream code (pick, brief) has to read.
	const groupSize = 2 + (index % 2);
	const lines = [`# Mock subject ${index}`, "", "## Mock part"];
	for (let i = 0; i < sentences.length; i += groupSize) {
		const group = sentences.slice(i, i + groupSize);
		const cites = group.map(s => `S${s.n}`).join(", ");
		lines.push(`- ${group.map(s => s.text).join(" ")} [${cites}]`);
	}
	return lines.join("\n") + "\n";
}

// The structured rung's own job (owner, 2026-09-29 ~8:20 PM): not another pass of condensing —
// the "clean" rung already did that — but an information HIERARCHY: what is this dictation about
// (one H1), what are its familiar parts (an H2 each, reusing a name that already exists, like
// "Layout", when one applies), and the owner's own points under each, in their own words, kept
// whole rather than shortened further.
function structuredPromptDefault(sentences) {
	return `Read this numbered, cleaned transcript of the owner talking. Turn it into an INFORMATION\n`
		+ `HIERARCHY, not another summary — the owner's exact words for it: "putting familiar names, like\n`
		+ `the headings" on the one thing being discussed and on each of its parts.\n\n`
		+ `Output Markdown in EXACTLY this shape:\n\n`
		+ `# <the one thing this whole transcript is about — the primary visual anchor everything else\n`
		+ `hangs off of, e.g. "Page class". If nothing this clear-cut is named, use the thing the owner kept\n`
		+ `coming back to.>\n`
		+ `## <a familiar name for one part of that thing, in the owner's own words>\n`
		+ `- <a point about that part, kept in the owner's own words> [S#, S#]\n`
		+ `  - <a sub-point nested under it, if the point has one> [S#]\n`
		+ `## <the next part's familiar name>\n`
		+ `- <...> [S#]\n\n`
		+ `Rules:\n`
		+ `- Exactly ONE "#" H1. As many "##" H2s as the transcript actually has distinct parts — never\n`
		+ `  invent an H2 just to have more than one.\n`
		+ `- Each H2 must be a FAMILIAR name — one a reader already knows, not a label you invent. If a name\n`
		+ `  already exists for that part elsewhere (the owner's example: "Layout"), use that exact name.\n`
		+ `  Otherwise use whatever word the owner themselves used for it.\n`
		+ `- Nest a bullet under another only when it truly is a sub-point of the one above it (a detail, an\n`
		+ `  example, a "but" on that same point) — never nest just to look organized.\n`
		+ `- KEEP EVERY POINT. This is a re-arrangement into headings, not a second round of condensing —\n`
		+ `  the only merging allowed is combining two bullets that say the EXACT same thing twice. Never\n`
		+ `  drop an idea, and never turn a hedge ("maybe", "I think", "I guess") into a flat claim.\n`
		+ `- Every bullet and sub-bullet ends with the sentence numbers it is based on, in this exact form:\n`
		+ `  [S3, S7]. Cite each sentence individually — never a range like [S6-S9]; a range hides which\n`
		+ `  specific sentence supports which part of the bullet. Use only sentence numbers that appear\n`
		+ `  below — never invent one.\n\n`
		+ `Cleaned transcript:\n"""\n${cleanTextForPrompt(sentences)}\n"""\n\n`
		+ `Output ONLY the Markdown described above (the H1, its H2s, and their bullets), nothing else.`;
}

async function draftStructured(modelId, sentences, cwd, mock, index) {
	if (mock) return { md: mockStructured(sentences, index), cost_usd: 0 };
	const prompt = RUNGS.structured.promptTemplate
		? RUNGS.structured.promptTemplate.replaceAll("{{INPUT}}", cleanTextForPrompt(sentences))
		: structuredPromptDefault(sentences);
	const r = await askOnce(prompt, { model: modelId, cwd });
	return { md: r.answer.trim() + "\n", cost_usd: r.cost_usd };
}

// Without --collab: one cheap judge call picks a base draft (or merges) and says which model it
// started from, so the scoreboard still has a winner to record. `caveats` (2026-09-29, collab's
// tie fallback below) is optional extra context from a vote that couldn't cleanly decide — empty
// for the normal, non-collab path.
async function judgePick(drafts, cwd, mock, caveats = []) {
	if (mock || drafts.length === 1) {
		const first = drafts[0];
		return { md: first.md, winner: first.name, cost_usd: 0 };
	}
	const body = drafts.map(d => `Draft "${d.name}":\n"""\n${d.md}\n"""`).join("\n\n");
	const caveatLine = caveats.length ? `A vote on these drafts couldn't cleanly decide; the voters left these caveats — weigh\nthem in: ${caveats.map(c => `"${c}"`).join("; ")}\n\n` : "";
	const prompt = `${drafts.length} drafts of the same information hierarchy exist (${drafts.map(d => `"${d.name}"`).join(", ")}),\n`
		+ `made by different models from the same source sentences: one "#" H1 naming the subject, "##" H2s\n`
		+ `naming its familiar parts, bullets under each. Pick the best one as your base, or merge the best\n`
		+ `parts of the others into it — keep the H1/H2 structure and every [S#] citation exactly as written,\n`
		+ `never invent one, never drop an idea that was in a draft. The FIRST line of your answer must be\n`
		+ `exactly:\nWINNER: <the draft name you started from>\n`
		+ `Then the final Markdown (the H1, its H2s, and their bullets), and nothing else.\n\n${caveatLine}${body}`;
	const r = await askOnce(prompt, { model: RUNGS.pick.model, cwd });
	const m = /^WINNER:\s*(\S+)/.exec(r.answer.trim());
	const winner = m && drafts.some(d => d.name === m[1]) ? m[1] : drafts[0].name;
	const md = r.answer.replace(/^WINNER:\s*\S+\s*\n?/, "").trim() + "\n";
	return { md, winner, cost_usd: r.cost_usd };
}

// A vote's caveat is "the one improvement I'd make" — actually WORTH something only if it gets
// worked into the winning text, not just listed under it as a footnote nobody reads (2026-09-29,
// the owner on runs/b: "$0.31 for nothing" — the vote cost real money and its caveats were never
// applied). One cheap call, skipped entirely (and free) when there's nothing to apply.
async function applyCaveats(draftMd, caveats, cwd, mock) {
	if (mock || !caveats.length) return { md: draftMd, cost_usd: 0 };
	const prompt = `This information hierarchy (one H1, H2s for its familiar parts, bullets under each) won a vote\n`
		+ `among several models' drafts of the same source. The voter(s) also left these caveats — the one\n`
		+ `improvement each would make. Revise it to address any caveat that's actually warranted; keep the\n`
		+ `H1/H2 structure and every [S#] citation exactly as written (never invent one, never a range like\n`
		+ `[S6-S9]), and leave anything a caveat didn't mention unchanged. Output ONLY the final Markdown,\n`
		+ `nothing else.\n\n`
		+ `Caveats:\n${caveats.map(c => `- ${c}`).join("\n")}\n\nOutline:\n"""\n${draftMd}\n"""`;
	const r = await askOnce(prompt, { model: RUNGS.pick.model, cwd });
	return { md: r.answer.trim() + "\n", cost_usd: r.cost_usd };
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
	const decision = [...lines].reverse().find(l => l.decision?.status === "decided")?.decision;
	const winnerLine = [...lines].reverse().find(l => l.winner)?.winner;
	if (!winnerLine || !winnerLine.pick) throw new Error(`refine.mjs: collab.mjs run at ${collabDir} produced no winner (see ${jsonlPath})`);
	const caveats = (winnerLine.caveats || []).filter(Boolean);
	const collabDirRel = path.relative(outDir, collabDir).replaceAll("\\", "/");

	// Fix (2026-09-29, owner on runs/b: a 1-1 tie broken by collab.mjs's own "cheaper member" rule
	// spent $0.31 to land on an arbitrary pick — price is not a quality signal). `tie_rule` is set
	// on the decision line whenever tallyVotes() had to break a tie (by caveat-count or by price);
	// on a tie, don't trust that pick — fall back to the same cheap judge call the non-collab path
	// uses, so the tied vote's own spend at least buys a real, quality-based decision, and feed it
	// the tied vote's caveats so nothing from it goes to waste.
	if (decision?.tie_rule) {
		const judged = await judgePick(drafts, cwd, mock, caveats);
		return { md: judged.md, winner: judged.winner, cost_usd: (winnerLine.cost || 0) + judged.cost_usd, collabDir: collabDirRel, tie_broken_by: "judge" };
	}

	const winner = drafts.find(d => d.name === winnerLine.pick) || drafts[0];
	const applied = await applyCaveats(winner.md, caveats, cwd, mock);
	return { md: applied.md, winner: winner.name, cost_usd: (winnerLine.cost || 0) + applied.cost_usd, collabDir: collabDirRel, caveats_applied: caveats.length };
}

// ---- step 3: brief.md — numbered asks for a mastermind ----------------------------------------

function mockBrief(structuredMd) {
	const bullets = structuredMd.split("\n").filter(l => /^-\s/.test(l));
	return bullets.map((b, i) => `${i + 1}. ${b.replace(/^-\s*/, "")}`).join("\n") + "\n";
}

function briefPromptDefault(structuredMd) {
	return `Turn this outline into a numbered list of asks for a mastermind (an AI project lead) to act on.\n\n`
		+ `Rules:\n`
		+ `- Keep the owner's own names and words for things; never invent new terminology.\n`
		+ `- Every ask ends with the sentence numbers it is based on, exactly as the outline already has them,\n`
		+ `  like [S3, S7] — carry these over, never invent a new one and never drop one that applies. Cite\n`
		+ `  each sentence individually — never a range like [S6-S9]; a range hides which specific sentence\n`
		+ `  supports which part of the ask.\n`
		+ `- If the outline hedges ("maybe", "I think", "I guess"), phrase the ask as "the owner suggests ...",\n`
		+ `  never as a flat instruction. A suggestion must never read like a rule.\n`
		+ `- Number the asks 1, 2, 3, ... — one ask per idea, don't merge unrelated ideas into one ask.\n\n`
		+ `Outline:\n"""\n${structuredMd}\n"""\n\n`
		+ `Output ONLY the numbered list, nothing else.`;
}

async function stepBrief(structuredMd, cwd, mock) {
	if (mock) return { md: mockBrief(structuredMd), cost_usd: 0 };
	const prompt = RUNGS.brief.promptTemplate ? RUNGS.brief.promptTemplate.replaceAll("{{INPUT}}", structuredMd) : briefPromptDefault(structuredMd);
	const r = await askOnce(prompt, { model: RUNGS.brief.model, cwd });
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

// Fix (2026-09-29, B's scoring of runs/b): a range like "[S6-S9]" or "[S6–S9]" used to read as
// just S6 and S9 — every sentence INSIDE the range (S7, S8) showed up as uncited, so 4 of 6
// "dropped" rows in that run were wrong; the sentence wasn't dropped, it was cited by a range the
// parser didn't expand. Expand a range first (either dash), THEN scan whatever's left for plain
// S# citations, so a mix like "[S3, S6-S9, S12]" reads as {3,6,7,8,9,12}.
const RANGE_RE = /\bS(\d+)\s*[-–]\s*S(\d+)\b/g;
function citationsIn(text) {
	const out = new Set();
	for (const m of text.matchAll(RANGE_RE)) {
		const a = Number(m[1]), b = Number(m[2]);
		for (let n = Math.min(a, b); n <= Math.max(a, b); n++) out.add(n);
	}
	for (const m of text.replace(RANGE_RE, " ").matchAll(/\bS(\d+)\b/g)) out.add(Number(m[1]));
	return [...out];
}
const STRENGTH_WORDS = ["must", "never", "always", "only"];

// Fix (2026-09-29, owner review of runs/sample: "7 flags on 7 asks... the real catch is buried
// among plurals and boilerplate") — the "new words" flag below used to compare exact words, so
// "toward" vs the raw's "towards", or "choose" vs "choosing", counted as two different words and
// flagged constantly. A crude stem fixes most of it: lowercase, then strip the FIRST of these
// suffixes that fits (in this order) as long as at least 3 letters are left: 's, n't, ing, ed, es,
// s. Two stems "match" if the shorter one (at least 4 letters, so we're not matching on "th" or
// "in") is a PREFIX of the longer one, not just equal — a fixed 6-suffix list still leaves
// "explicit" and "explicitly" at different lengths after stripping (the "ly" isn't in the list),
// and the prefix check absorbs that without a bigger stemmer.
const STEM_SUFFIXES = ["'s", "n't", "ing", "ed", "es", "s"];
function crudeStem(w) {
	const s = w.toLowerCase();
	for (const suf of STEM_SUFFIXES) if (s.endsWith(suf) && s.length - suf.length >= 3) return s.slice(0, -suf.length);
	return s;
}
function stemsMatch(a, b) {
	if (a === b) return true;
	const [shorter, longer] = a.length <= b.length ? [a, b] : [b, a];
	return shorter.length >= 4 && longer.startsWith(shorter);
}
// A word with an apostrophe ("there's", "wasn't", "llm's") is a contraction or a possessive, not
// a new claim — ignored outright, never even stemmed. The brief's OWN framing words, added by the
// "keep a suggestion a suggestion" rule (deliverable 3's brief prompt), aren't the owner's words
// either, but they're not a leak — ignored by name.
const isContraction = w => w.includes("'");
const FRAMING_WORDS = new Set(["owner", "owner's", "suggests", "suspects", "ask"]);

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
	const r = await askOnce(prompt, { model: RUNGS.coverage.model, cwd });
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

async function buildCoverage(rawText, sentences, asks, cwd, mock) {
	const sentenceText = new Map(sentences.map(s => [s.n, s.text]));
	// The RAW transcript's own vocabulary, stemmed once — used by the "new words" flag below so a
	// legitimate paraphrase (reusing a word the owner actually said, in a different form) is never
	// flagged, only a word that appears nowhere the owner actually said. Checked against raw.txt,
	// not clean.md — clean.md is near-verbatim but the owner's own instruction is "nowhere in the
	// raw text", and it also catches a word clean.md's rewording happened to lose.
	const fullStems = [...new Set(contentWords(rawText))].map(crudeStem);
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

		// Fix: "new words" — a content word in the ask that appears NOWHERE in the whole raw
		// transcript, not just outside its own cited sentence(s) — the owner's exact worry,
		// "choosing different words ... when I haven't said it explicitly that way." Ignores a
		// contraction/possessive, the brief's own framing words, and anything whose crude stem is
		// prefix-compatible with a stem from the raw text (a plural, "-ing", "-ed" form, etc.).
		const novel = [...askWords]
			.filter(w => !isContraction(w) && !FRAMING_WORDS.has(w))
			.filter(w => !fullStems.some(fs => stemsMatch(crudeStem(w), fs)));
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
		md, rows, cost_usd: classifyCost,
		numbers: {
			sentences: rows.length, cited, context_only: contextOnly, dropped, unclassified,
			flags: flagRows.length, thin_citations: flagRows.filter(f => f.kind === "thin citation").length,
		},
	};
}

// ---- --coverage-only <dir>: rebuild coverage.md (and refine.json's coverage numbers) from a
// run dir's own raw.txt/clean.md/brief.md, without re-running clean/structured/brief. Added
// 2026-09-29 (owner: "that way I can refresh a, b and c after your fix without rerunning them")
// so a coverage-only bug fix (like the "new words" stemmer above) doesn't cost a full re-run's
// worth of clean/structured/brief calls — the classifier (uncited sentences only) is the one
// model call left. ----------------------------------------------------------------------------

async function runCoverageOnly(dir, mock) {
	const root = repoRoot();
	const outDir = path.resolve(dir);
	const rawText = fs.readFileSync(path.join(outDir, "raw.txt"), "utf8");
	const sentences = parseNumberedSentences(fs.readFileSync(path.join(outDir, "clean.md"), "utf8"));
	const asks = parseAsks(fs.readFileSync(path.join(outDir, "brief.md"), "utf8"));

	console.log("refine.mjs --coverage-only: rebuilding coverage.md...");
	const coverage = await buildCoverage(rawText, sentences, asks, root, mock);
	fs.writeFileSync(path.join(outDir, "coverage.md"), coverage.md);

	const refineJsonPath = path.join(outDir, "refine.json");
	let refineJson = {};
	try { refineJson = JSON.parse(fs.readFileSync(refineJsonPath, "utf8")); } catch { /* no prior refine.json — write a minimal one below */ }
	const prevCoverageCost = refineJson.cost_usd?.coverage || 0;
	refineJson.coverage = coverage.numbers;
	refineJson.cost_usd = refineJson.cost_usd || {};
	refineJson.cost_usd.coverage = coverage.cost_usd;
	if (typeof refineJson.cost_usd.total === "number") refineJson.cost_usd.total = Number((refineJson.cost_usd.total - prevCoverageCost + coverage.cost_usd).toFixed(6));
	refineJson.coverage_only_rerun_at = now();
	fs.writeFileSync(refineJsonPath, JSON.stringify(refineJson, null, 2) + "\n");

	console.log(`refine.mjs --coverage-only: wrote ${outDir}\\coverage.md — ${coverage.numbers.sentences} sentences (${coverage.numbers.dropped} dropped, ${coverage.numbers.unclassified} unclassified, ${coverage.numbers.flags} flag(s), ${coverage.numbers.thin_citations} thin), classify cost $${coverage.cost_usd.toFixed(4)}`);
}

// ---- the repair round: coverage catches a drop, this fixes it -------------------------------
//
// The owner's own words (runs/c: 23 real asks dropped out of 121 sentences): "we need to make
// sure we don't do that." Catching a drop in coverage.md isn't enough by itself — this round
// closes the loop: after coverage runs, if anything is dropped or thin, ONE Sonnet call reads the
// brief plus just those sentences and writes ONLY the new or amended asks needed to cover them,
// then coverage is rebuilt against the repaired brief. `brief-v1.md` keeps the pre-repair version
// so the two can be diffed; `refine.json`'s `repair` records dropped/thin before -> after.

// New asks get NEXT sequential numbers, in order given; an "AMEND <n>" targeting a real existing
// ask number replaces that ask's text in place (same number); an "AMEND <n>" whose number doesn't
// match anything real is treated as new rather than silently dropped (a model citing the wrong
// number is a model mistake, not a reason to lose the fix).
function mergeRepair(briefMd, repairAnswer) {
	const original = parseAsks(briefMd);
	const byN = new Map(original.map(a => [a.n, a.text]));
	const originalNs = new Set(original.map(a => a.n));
	let nextN = Math.max(0, ...original.map(a => a.n)) + 1;
	const notes = [];

	const lines = repairAnswer.split(/\r?\n/);
	const entries = [];
	let cur = null;
	for (const line of lines) {
		const m = /^(NEW|AMEND)\s+(\d+)\.\s*(.*)$/.exec(line.trim());
		if (m) { if (cur) entries.push(cur); cur = { kind: m[1], n: Number(m[2]), text: m[3] }; }
		else if (cur && line.trim()) cur.text += " " + line.trim();
	}
	if (cur) entries.push(cur);

	for (const e of entries) {
		if (!e.text.trim()) continue;
		if (e.kind === "AMEND" && originalNs.has(e.n)) { byN.set(e.n, e.text.trim()); notes.push(`amended ask #${e.n}`); }
		else { byN.set(nextN, e.text.trim()); notes.push(`${e.kind === "AMEND" ? `amend targeted ask #${e.n}, which doesn't exist — added as new` : "new"} ask #${nextN}`); nextN++; }
	}

	const md = [...byN.keys()].sort((a, b) => a - b).map(n => `${n}. ${byN.get(n)}`).join("\n") + "\n";
	return { md, notes };
}

// --mock stand-in: demonstrates BOTH merge paths for $0 — a THIN sentence (already cited by a
// real ask, per its own `citingAsk`) amends that same ask; a DROPPED sentence (cited by no one)
// becomes a new ask.
function mockRepair(problemSentences) {
	return problemSentences.map((s, i) => s.citingAsk
		? `AMEND ${s.citingAsk}. mock: amended to also cover this. [S${s.n}]`
		: `NEW ${900 + i}. mock: a new ask for a previously ${s.reason}. [S${s.n}]`
	).join("\n") + "\n";
}

async function repairBrief(briefMd, problemSentences, cwd, mock) {
	if (mock) return { answer: mockRepair(problemSentences), cost_usd: 0 };
	const list = problemSentences.map(s => `S${s.n} (${s.reason}). ${s.text}`).join("\n");
	const prompt = `A brief made from a dictation dropped, or only thinly covered, some of the owner's sentences.\n`
		+ `Fix ONLY those gaps — do not touch or restate anything already well covered.\n\n`
		+ `Rules:\n`
		+ `- Keep the owner's own names and words; never invent new terminology.\n`
		+ `- Every new or amended ask ends with the sentence numbers it is based on, like [S12, S15] —\n`
		+ `  cite each sentence individually, never a range like [S12-S15].\n`
		+ `- If the sentence hedges ("maybe", "I think", "I guess"), phrase it as "the owner suggests ...",\n`
		+ `  never as a flat instruction.\n`
		+ `- If an EXISTING ask already covers most of this idea and just needs to also cite the missing\n`
		+ `  sentence, or be reworded because its citation was "thin" (it didn't actually reflect what that\n`
		+ `  sentence said), output "AMEND <that ask's exact number>. <the FULL, corrected ask text>".\n`
		+ `  Otherwise output a brand new ask as "NEW <any number>. <the ask text>" — the number you give a\n`
		+ `  new ask is ignored and reassigned, but an AMEND number must be a real ask number from below.\n`
		+ `- Output ONLY NEW/AMEND lines, nothing else — no commentary, no restating what was already fine.\n\n`
		+ `The existing brief:\n"""\n${briefMd}\n"""\n\n`
		+ `Sentences that need fixing:\n${list}\n`;
	const r = await askOnce(prompt, { model: RUNGS.repair.model, cwd });
	return { answer: r.answer, cost_usd: r.cost_usd };
}

// Runs up to `maxRounds` repair rounds against `briefMd`, rebuilding coverage each time to see
// what's still dropped/thin. Stops early the moment nothing is left to fix (the common case, and
// the cheap one — a round with nothing to fix costs $0, since coverage's own classifier only runs
// when something is uncited). Returns the FINAL brief and coverage always matching each other —
// if the loop stopped because it ran out of rounds rather than running out of problems, one more
// coverage build happens after the loop so the reported numbers are never one round stale.
async function runRepair(rawText, sentences, briefMd, cwd, mock, maxRounds) {
	let currentBrief = briefMd;
	let firstCoverage = null, finalCoverage = null;
	let roundsRun = 0, repairCost = 0, problemsRemained = true;
	const notes = [];

	for (let round = 0; round < maxRounds; round++) {
		const asks = parseAsks(currentBrief);
		const coverage = await buildCoverage(rawText, sentences, asks, cwd, mock);
		if (round === 0) firstCoverage = coverage;
		finalCoverage = coverage;
		const problems = coverage.rows.filter(r => r.dest.startsWith("dropped") || r.dest.includes("(thin)"));
		if (!problems.length) { problemsRemained = false; break; }

		const problemSentences = problems.map(r => {
			const citing = /ask #(\d+)/.exec(r.dest); // set for a thin citation (an ask cited it); absent for a drop (no one cited it)
			return { n: r.n, text: r.text, reason: r.dest, citingAsk: citing ? Number(citing[1]) : null };
		});
		const repair = await repairBrief(currentBrief, problemSentences, cwd, mock);
		repairCost += repair.cost_usd;
		const merged = mergeRepair(currentBrief, repair.answer);
		currentBrief = merged.md;
		notes.push(...merged.notes.map(n => `round ${round + 1}: ${n}`));
		roundsRun++;
	}
	if (roundsRun > 0 && problemsRemained) {
		// Ran out of rounds with problems still open — the loop's last coverage build was against
		// the brief BEFORE that final round's repair; rebuild once more so nothing reported is stale.
		finalCoverage = await buildCoverage(rawText, sentences, parseAsks(currentBrief), cwd, mock);
	}
	return { brief: currentBrief, changed: roundsRun > 0, firstCoverage, finalCoverage, roundsRun, repairCost, notes };
}

function repairInfoFrom(repair) {
	return {
		rounds_run: repair.roundsRun, cost_usd: Number(repair.repairCost.toFixed(6)),
		dropped_before: repair.firstCoverage.numbers.dropped, thin_before: repair.firstCoverage.numbers.thin_citations,
		dropped_after: repair.finalCoverage.numbers.dropped, thin_after: repair.finalCoverage.numbers.thin_citations,
		notes: repair.notes,
	};
}

// ---- --repair-only <dir>: run the repair round (and rebuild coverage) against a run dir's own
// EXISTING brief.md, without re-running clean/structured/brief — the model spend left is the
// repair call(s) plus, if anything is still uncited afterward, the classifier. brief-v1.md is
// written only if it doesn't already exist, so a second --repair-only run never overwrites the
// true original with an already-once-repaired brief. -------------------------------------------

async function runRepairOnly(dir, mock, rounds) {
	const root = repoRoot();
	const outDir = path.resolve(dir);
	const rawText = fs.readFileSync(path.join(outDir, "raw.txt"), "utf8");
	const sentences = parseNumberedSentences(fs.readFileSync(path.join(outDir, "clean.md"), "utf8"));
	const briefMd = fs.readFileSync(path.join(outDir, "brief.md"), "utf8");

	console.log(`refine.mjs --repair-only: running up to ${rounds} repair round(s)...`);
	const repair = await runRepair(rawText, sentences, briefMd, root, mock, rounds);

	if (repair.changed) {
		const v1Path = path.join(outDir, "brief-v1.md");
		if (!fs.existsSync(v1Path)) fs.writeFileSync(v1Path, briefMd);
		fs.writeFileSync(path.join(outDir, "brief.md"), repair.brief);
	}
	fs.writeFileSync(path.join(outDir, "coverage.md"), repair.finalCoverage.md);

	const info = repairInfoFrom(repair);
	const refineJsonPath = path.join(outDir, "refine.json");
	let refineJson = {};
	try { refineJson = JSON.parse(fs.readFileSync(refineJsonPath, "utf8")); } catch { /* no prior refine.json — write a minimal one below */ }
	const prevCoverageCost = refineJson.cost_usd?.coverage || 0;
	const prevRepairCost = refineJson.cost_usd?.repair || 0;
	refineJson.coverage = repair.finalCoverage.numbers;
	refineJson.repair = info;
	refineJson.cost_usd = refineJson.cost_usd || {};
	refineJson.cost_usd.coverage = repair.finalCoverage.cost_usd;
	refineJson.cost_usd.repair = info.cost_usd;
	if (typeof refineJson.cost_usd.total === "number") refineJson.cost_usd.total = Number((refineJson.cost_usd.total - prevCoverageCost - prevRepairCost + repair.finalCoverage.cost_usd + info.cost_usd).toFixed(6));
	refineJson.repair_only_rerun_at = now();
	fs.writeFileSync(refineJsonPath, JSON.stringify(refineJson, null, 2) + "\n");

	console.log(`refine.mjs --repair-only: wrote ${outDir}\\coverage.md${repair.changed ? " and brief.md (brief-v1.md kept)" : " (nothing to repair)"} — dropped ${info.dropped_before} -> ${info.dropped_after}, thin ${info.thin_before} -> ${info.thin_after}, ${repair.roundsRun} round(s), cost $${info.cost_usd.toFixed(4)}`);
}

// ---- main ---------------------------------------------------------------------------------

async function main() {
	const args = parseArgs(process.argv.slice(2));
	applyRungOverrides(args);
	if (args.coverageOnly) { await runCoverageOnly(args.coverageOnly, args.mock); return; }
	if (args.repairOnly) { await runRepairOnly(args.repairOnly, args.mock, args.repairRounds); return; }
	if (!args.input) {
		console.error("usage: node Server/refine.mjs <raw.txt | date:line> [--out <dir>] [--models haiku,sonnet] [--collab] [--mock] [--repair-rounds N | --no-repair] [--config <path.json>] [--model-<rung> <model>]");
		console.error("   or: node Server/refine.mjs --coverage-only <dir> [--mock]");
		console.error("   or: node Server/refine.mjs --repair-only <dir> [--mock] [--repair-rounds N]");
		process.exit(1);
	}
	const root = repoRoot();
	const cwd = root;
	const outDir = path.resolve(args.out);
	fs.mkdirSync(outDir, { recursive: true });

	const resolved = resolveRaw(args.input, root);
	const rawText = resolved.text;
	fs.writeFileSync(path.join(outDir, "raw.txt"), rawText); // byte for byte, whatever it is
	console.log(`refine.mjs: read from ${resolved.sourceFile}`);

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
	let coverage, finalBriefMd = brief.md, repairInfo = null;
	if (args.repairRounds > 0) {
		const repair = await runRepair(rawText, clean.sentences, brief.md, cwd, args.mock, args.repairRounds);
		coverage = repair.finalCoverage;
		if (repair.changed) {
			fs.writeFileSync(path.join(outDir, "brief-v1.md"), brief.md);
			finalBriefMd = repair.brief;
			fs.writeFileSync(path.join(outDir, "brief.md"), finalBriefMd);
		}
		repairInfo = repairInfoFrom(repair);
	} else {
		const asks = parseAsks(brief.md);
		coverage = await buildCoverage(rawText, clean.sentences, asks, cwd, args.mock);
	}
	costs.coverage = coverage.cost_usd;
	costs.repair = repairInfo ? repairInfo.cost_usd : 0;
	fs.writeFileSync(path.join(outDir, "coverage.md"), coverage.md);

	const wordCount = t => wordsOf(t).length;
	const totalCost = (costs.clean || 0) + Object.values(costs.structured).reduce((s, c) => s + c, 0) + (costs.pick || 0) + (costs.brief || 0) + (costs.coverage || 0) + (costs.repair || 0);
	const refineJson = {
		at: now(), input: args.input, source_file: resolved.sourceFile.replaceAll("\\", "/"), out: path.relative(root, outDir).replaceAll("\\", "/"),
		models: { clean: RUNGS.clean.model, structured: args.models.map(modelIdFor), pick: args.collab ? "collab.mjs" : RUNGS.pick.model, brief: RUNGS.brief.model, coverage: RUNGS.coverage.model, repair: RUNGS.repair.model },
		collab: args.collab, mock: args.mock, structured_winner: pick.winner, tie_broken_by: pick.tie_broken_by || null,
		cost_usd: { ...costs, total: Number(totalCost.toFixed(6)) },
		word_counts: { raw: wordCount(rawText), clean: wordCount(clean.md), structured: wordCount(pick.md), brief: wordCount(finalBriefMd) },
		clean_overlap_ratio: ratio,
		coverage: coverage.numbers,
		repair: repairInfo,
	};
	fs.writeFileSync(path.join(outDir, "refine.json"), JSON.stringify(refineJson, null, 2) + "\n");

	console.log(`refine.mjs: wrote ${outDir} — total cost $${totalCost.toFixed(4)}, ${coverage.numbers.sentences} sentences (${coverage.numbers.dropped} dropped, ${coverage.numbers.flags} flag(s)), overlap ${ratio}${repairInfo ? `, repair ${repairInfo.dropped_before}->${repairInfo.dropped_after} dropped` : ""}`);
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) main().catch(e => { console.error(String(e?.stack || e)); process.exitCode = 1; });

// Exported for Server/refine/compare-structured.mjs (the before/after proof for the structured
// rung's rewrite, 2026-09-29) — nothing else in this repo imports this file, so this list stays
// exactly as small as that one script needs.
export { stepClean, draftStructured, structuredPromptDefault, modelIdFor, RUNGS, repoRoot };
