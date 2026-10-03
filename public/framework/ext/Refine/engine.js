/* engine.js — ONE clean() for a dictation, whether it runs once on a whole logged prompt
 * or many times in a row on live streaming segments. Browser-safe AND Node-safe: no
 * top-level `node:fs`/`node:child_process` import, so Dictate (browser) and the prompt-log
 * processor (Node) can both `import { clean } from ".../ext/Refine/engine.js"`.
 *
 * NAMED "engine.js", NOT "refine.js" (2026-10-02, a mid-task correction, logged in this
 * task's task.jsonl): the brief asked for `ext/Refine/refine.js`, but this directory
 * already has `Refine.js` (capital R, the viewer — explicitly off-limits to this task).
 * Windows' filesystem is case-INSENSITIVE but case-PRESERVING: "refine.js" and "Refine.js"
 * are the exact same file on disk here, so writing one overwrites the other in place, with
 * no error and no warning. That's exactly what happened once while building this (caught
 * immediately, `Refine.js` recovered byte-for-byte from git HEAD, confirmed with `git diff`
 * showing zero difference) — this file was renamed right after, to make the collision
 * structurally impossible rather than just "being careful" going forward. On a
 * case-SENSITIVE filesystem (Linux/Mac) the two names could have coexisted, but this would
 * have stayed a loaded landmine for the next Windows checkout either way, so the rename
 * stands regardless of this session's own OS. If you were told to import
 * `ext/Refine/refine.js`, that brief predates this fix — import `engine.js` instead; the
 * exports (`clean`, `GLOSSARY`) are unchanged.
 *
 * TWO SPEEDS, ONE FUNCTION (the owner's own framing, 2026-10-02 — see
 * `public/framework/ai/2026-10-02/prompt-refine/requirements.md`): there is no separate
 * "stream mode" flag here. `clean(text, {prev})` is the same call either way —
 *   - once, on a whole logged prompt (`prev` omitted): one clean pass over everything.
 *   - many times, on live segments as they finish (`prev` = the last ~2 sentences already
 *     settled): a self-correction spanning a segment boundary ("wait, not blue — green")
 *     still gets caught, because the model sees `prev` as context for THIS call.
 * Decided this way (rather than a `{stream: true}` flag that changes behavior) because
 * calling the same function more times IS what streaming already means for every other
 * part of this pipeline (Revise.run's own `before` param works the same way) — a flag
 * would just be a second name for "I'm passing `prev` now." If that turns out wrong (a
 * live caller needs the model to behave differently mid-stream, not just see more
 * context), add a `{stream}` option later; nothing here would need to change shape.
 *
 * THE MODEL CALL IS SPLIT FROM THE PROMPT ON PURPOSE (law 6 — one clean prompt, not two):
 * the actual wording of "what counts as clean" lives in ONE place, `Servex/agents/tidy.js`'s
 * `LEVELS.clean` — this file never writes its own copy of that prompt. What IS here, and
 * does NOT live in tidy.js, is everything in laws 2-7 below: mechanical, code-only checks
 * run on the model's OWN output, so a model that quietly adds a word can't just be trusted.
 * The owner's note while this was being built (2026-10-02, folded in mid-task): keep the
 * model prompt LEAN. The glossary (CLAUDE.md names, module names) is NOT sent to the model
 * at all — it is matched here, in JS, by edit distance, only against a word the mechanical
 * check already flagged as "not in what was actually said." Same for self-corrections
 * ("strikes"): found here, by a plain regex scan of the RAW text, never by asking the model
 * to tag them (which would mean more prompt instructions every time one more example came
 * up — exactly the "growing skill-style instruction block" the owner was avoiding).
 *
 * clean(text, { prev, onFlag, call, cwd, model }) -> {text, sentences, strikes, misheard, flags}
 *   text   — the full raw input for THIS call (a whole prompt, or one live segment).
 *   prev   — optional, the tail of already-cleaned text right before this call (streaming).
 *   onFlag — optional (flag) => void, called the INSTANT each flag is found (model-reported
 *            or mechanical), so a live caller (Dictate) can play its sound right away
 *            instead of waiting for the whole result.
 *   call   — optional (prompt, {model, cwd}) => {answer, cost_usd} — same shape as
 *            `Server/ask-each.mjs`'s own `askOnce`, which is the default on Node. Swapping
 *            this in is how `Server/refine-litmus.mjs` runs the exact same clean() against
 *            three different models without forking any of the logic below.
 *   cwd, model — passed straight through to the call.
 *
 * Returns (never throws on a model-reply formatting problem — only a real transport
 * failure, e.g. Servex down, throws, same as any other direct model call in this repo):
 *   text      — the final cleaned text, sentence-fallbacks already applied, joined with spaces.
 *   sentences — [{n, text}], every sentence, numbered, near-verbatim (or the raw fallback).
 *   strikes   — [{sentence_n, struck_text}] — a self-correction found in the RAW text.
 *   misheard  — [{sentence_n, from, to}] — a word the mechanical check fixed against the
 *               glossary below (not the model's own doing — see law 6 above).
 *   flags     — [{sentence_n, question, confidence, source}] — "source" is "model" (the
 *               model itself said "S2? ...") or "mechanical" (the diff-check rejected a
 *               word and could not explain it away). `confidence` is a plain fixed number,
 *               not a model-derived probability — 0.3 for a model's own "unsure" marker,
 *               0.5 for a mechanical reject (we are LESS sure that one is really wrong,
 *               since it could just be this checker's own blind spot) — documented here so
 *               nobody mistakes it for something more precise than it is. */

const isNode = typeof window === "undefined";

// ---- the glossary (law 6, deliverable 2b) ------------------------------------------------
//
// Built once, by hand, from exactly the two sources the brief named: the proper nouns in
// CLAUDE.md (root + public/framework/ai/CLAUDE.md) that aren't already plain English words,
// plus every module/class directory name under `public/framework/*/*/readme.md` that starts
// with a capital letter (the lowercase ones — "color", "layout", "menu" — are themselves
// common words; fuzzy-matching a mis-heard word against THOSE would just invent false
// corrections). To regenerate the module-name half after adding or renaming a module:
//   for f in public/framework/*/*/readme.md; do basename "$(dirname "$f")"; done | sort -u | grep -E '^[A-Z]'
// This is a plain array on purpose (deliverable 2b: "keep it a plain exported array/function
// so it's easy to extend") — add a name by hand any time one gets mis-heard a lot and isn't
// here yet; there is no build step that could regenerate it automatically.
export const GLOSSARY = [
	// public/framework/*/*/readme.md module & class names (regenerated 2026-10-02, see above)
	"AITask", "App", "Ask", "Auth", "CSSDoc", "Card", "Chat", "Claim", "Classify", "Collab",
	"Content", "Course", "DesignTool", "DevBar", "DevShell", "Dictate", "Doc", "Draggable",
	"Dropdown", "Events", "Filter", "Inbox", "Item", "JSONL", "Layout", "List", "Mention",
	"Menu", "MicStream", "Omnibox", "Page", "Pagination", "Panel", "Popover", "Recorder",
	"Refine", "Rename", "Research", "Revise", "Router", "Saver", "Search", "Section",
	"Session", "Shell", "Sidebar", "Socket", "Tags", "Timeline", "Transcriber", "Tree",
	"Understand", "View", "Wizard",
	// CLAUDE.md / system proper nouns, added by hand
	"Servex", "Lew42", "CLAUDE.md", "Cloudflare", "Whisper", "Dispatcher", "Playground",
	"Haiku", "Sonnet", "Opus", "Fable",
];

// ---- small, local, duplicated-on-purpose word-matching helpers --------------------------
//
// `Server/refine.mjs` already has this exact logic (its coverage.md "new words" flag) —
// the brief says to reuse it rather than writing a new diff algorithm, but `refine.mjs`
// imports `node:fs`/`node:child_process` at the top of the file, which crashes in a
// browser the instant it's imported — so the ~20 lines below are copied, not imported,
// kept deliberately tiny and byte-similar to the original so the two can be eyeballed
// against each other if one is ever fixed without the other.

const wordsOf = s => (String(s).toLowerCase().match(/[a-z0-9']+/g) || []);
const STOP = new Set(["the", "a", "an", "and", "or", "but", "to", "of", "in", "on", "for", "is",
	"are", "was", "were", "be", "been", "it", "that", "this", "i", "you", "we", "they", "he",
	"she", "with", "as", "at", "by", "from", "so", "if", "then", "than", "not", "no", "do",
	"does", "did", "have", "has", "had", "my", "your", "our", "their", "his", "her", "its",
	"um", "uh", "like", "going", "gonna", "just", "really", "kind", "sort"]);
const contentWords = s => wordsOf(s).filter(w => w.length >= 4 && !STOP.has(w));
const STEM_SUFFIXES = ["'s", "n't", "ing", "ed", "es", "s"];
function crudeStem(w){
	const s = w.toLowerCase();
	for (const suf of STEM_SUFFIXES) if (s.endsWith(suf) && s.length - suf.length >= 3) return s.slice(0, -suf.length);
	return s;
}
function stemsMatch(a, b){
	if (a === b) return true;
	const [shorter, longer] = a.length <= b.length ? [a, b] : [b, a];
	return shorter.length >= 4 && longer.startsWith(shorter);
}

// Plain Levenshtein edit distance — "closest-word-by-edit-distance against the glossary
// list is enough" (the brief, deliverable 2b). No npm dependency, ~12 lines.
function editDistance(a, b){
	a = a.toLowerCase(); b = b.toLowerCase();
	const dp = [];
	for (let i = 0; i <= a.length; i++) dp.push([i, ...Array(b.length).fill(0)]);
	for (let j = 0; j <= b.length; j++) dp[0][j] = j;
	for (let i = 1; i <= a.length; i++)
		for (let j = 1; j <= b.length; j++)
			dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
	return dp[a.length][b.length];
}

// How close is "close enough" to call it a glossary fix rather than a coincidence —
// roughly 30% of the word's own length, at least 1. A 4-letter word needs a near-exact
// match; a 10-letter one can be off by 3 letters and still count.
const glossaryThreshold = w => Math.max(1, Math.round(w.length * 0.3));

function closestGlossaryMatch(word){
	let best = null;
	for (const name of GLOSSARY){
		const d = editDistance(word, name);
		if (!best || d < best.distance) best = { name, distance: d };
	}
	return best;
}

// Best-effort "what word in the raw text did this probably come from" — just the raw
// content word closest by edit distance to the glossary name. There's no per-position
// alignment between raw text and a numbered clean sentence, so this is a guess, not a
// citation; good enough for a human reading `misheard` to see what likely happened.
function nearestRawWord(name, rawWords){
	let best = null;
	for (const w of rawWords){
		const d = editDistance(name, w);
		if (!best || d < best.distance) best = { word: w, distance: d };
	}
	return best?.word ?? name;
}

// ---- mechanical self-correction ("strike") detection, on the RAW text -------------------
//
// Deliberately simple and best-effort (documented here, not hidden): looks for one of a
// few common correction markers ("no wait", "actually", "scratch that", "i meant") sitting
// in a clause right after another clause, and calls the clause BEFORE the marker "struck"
// and the clause AFTER it (with the marker words stripped) "kept." A correction phrased some
// other way ("hold on", "let me rephrase", a correction with no marker word at all) is not
// caught — it just never gets a strikes entry, which is a worse miss than a wrong one: the
// clean text itself (built by the model, which DOES understand meaning) already reflects
// the correction either way; `strikes` only adds the "X struck through" presentation on top.
const CORRECTION_MARKERS = /\b(no,?\s+wait|wait,?\s+no|actually|scratch that|i meant|i mean|not that)\b/i;

function splitClauses(text){
	return text.replace(/\s+/g, " ").trim().split(/(?<=[.!?,;])\s+/).filter(Boolean);
}

// Which numbered sentence a chunk of text most likely landed in, by plain word overlap —
// the same idea `ext/Refine/doc/raw-match.md` already documents for lighting up Raw from a
// Structured citation, reused here (not imported — that file is UI code) for two different
// jobs: pointing a detected strike at a sentence, and finding a raw-text fallback sentence
// when the mechanical check below has to reject a clean sentence outright.
function bestMatchSentence(text, sentences){
	const words = new Set(contentWords(text));
	if (!words.size || !sentences.length) return sentences[0]?.n ?? 1;
	let best = sentences[0], bestScore = -1;
	for (const s of sentences){
		const sWords = contentWords(s.text);
		const score = sWords.filter(w => words.has(w)).length;
		if (score > bestScore){ bestScore = score; best = s; }
	}
	return best.n;
}

function detectStrikes(rawText, sentences){
	const clauses = splitClauses(rawText);
	const strikes = [];
	for (let i = 1; i < clauses.length; i++){
		if (CORRECTION_MARKERS.test(clauses[i]) && !CORRECTION_MARKERS.test(clauses[i - 1])){
			const struck = clauses[i - 1].replace(/[,.;]$/, "").trim();
			const kept = (clauses[i].replace(CORRECTION_MARKERS, "").replace(/^[,:\s]+/, "").trim()) || (clauses[i + 1] || "").trim();
			if (struck && kept) strikes.push({ sentence_n: bestMatchSentence(kept, sentences), struck_text: struck });
		}
	}
	return strikes;
}

// ---- parsing the model's numbered reply --------------------------------------------------
//
// Matches `Servex/agents/tidy.js`'s own output contract exactly (see its CLEAN_SYSTEM):
// "S1. <sentence>" for a normal line, "S2? <sentence>, unclear: <question>" for one the
// model itself flagged as unsure.
function parseModelReply(answerText){
	const sentences = [];
	const modelFlags = [];
	for (const line of String(answerText || "").split(/\r?\n/)){
		const m = /^S(\d+)([.?])\s*(.*)$/.exec(line.trim());
		if (!m) continue;
		const n = Number(m[1]);
		let body = m[3].trim();
		if (m[2] === "?"){
			const uq = /^(.*?),\s*unclear:\s*(.+)$/i.exec(body);
			const question = uq ? uq[2].trim() : "This part was unclear — please confirm what was meant.";
			body = uq ? uq[1].trim() : body;
			modelFlags.push({ sentence_n: n, question, confidence: 0.3, source: "model" });
		}
		sentences.push({ n, text: body });
	}
	return { sentences, modelFlags };
}

// Mechanical stand-in for when the model ignores the numbered format entirely — a plain
// sentence split, same shape `Server/refine.mjs`'s own `mechanicalClean()` fallback uses,
// so a formatting miss never produces an empty result.
function mechanicalSplit(text){
	return text.replace(/\s+/g, " ").trim().split(/(?<=[.!?])\s+/).filter(Boolean);
}

// ---- the mechanical faithfulness check (deliverable 2) -----------------------------------
//
// Runs on the model's OWN numbered sentences, against the FULL raw vocabulary (this
// call's `prev` + this call's `text` — `prev` counts too, so a streaming segment that
// refers back to something only said in the PREVIOUS segment isn't wrongly flagged as
// "new"). Checked globally, not sentence-by-sentence against an aligned raw sentence —
// same choice `Server/refine.mjs`'s "new words" flag makes, and for the same reason: a
// legitimate paraphrase using a word from elsewhere in the same dictation must never be
// flagged, only a word that was never said at all.
function applyFaithfulnessCheck(rawForCheck, rawTextThisCall, sentences, strikes){
	const rawStems = [...new Set(contentWords(rawForCheck))].map(crudeStem);
	const rawWords = [...new Set(contentWords(rawForCheck))];
	const struckSentenceNs = new Set(strikes.map(s => s.sentence_n));
	const fallbackSentences = mechanicalSplit(rawTextThisCall);

	const misheard = [];
	const mechanicalFlags = [];
	const finalSentences = sentences.map((s, idx) => {
		const words = [...new Set(contentWords(s.text))];
		const bad = [];
		for (const w of words){
			const stem = crudeStem(w);
			if (rawStems.some(rs => stemsMatch(stem, rs))) continue;       // said somewhere already — fine
			// Glossary check BEFORE the strike check, on purpose: a self-correction sentence
			// can still contain a genuine glossary fix ("no wait, I meant the Servex
			// dashboard" — both the correction AND the misheard "Servex" are real), and
			// `misheard` should record that either way, not just the strikes entry.
			const g = closestGlossaryMatch(w);
			if (g && g.distance <= glossaryThreshold(w)){
				misheard.push({ sentence_n: s.n, from: nearestRawWord(g.name, rawWords), to: g.name });
				continue;                                                   // a confident glossary fix — allowed
			}
			if (struckSentenceNs.has(s.n)) continue;                       // this sentence is a self-correction — the model's wording is trusted
			bad.push(w);
		}
		if (bad.length){
			mechanicalFlags.push({
				sentence_n: s.n,
				question: `The cleaned text adds or changes "${bad.join('", "')}", which isn't anywhere in what was actually said — is this right, or should it be reverted?`,
				confidence: 0.5,
				source: "mechanical",
			});
			// Reject -> fall back to the raw text for this sentence (best-effort positional
			// match: clean sentences are usually produced in the same order as raw ones).
			const fallback = fallbackSentences[idx] ?? s.text;
			return { n: s.n, text: fallback };
		}
		return { n: s.n, text: s.text };
	});

	return { sentences: finalSentences, misheard, mechanicalFlags };
}

// ---- the model call: askOnce (Node) or /api/tidy (browser) -------------------------------
//
// This is the ONE place the "Node vs. browser" split happens. Everything above this line,
// and everything in `clean()` below, is identical either way.

async function nodeCall(text, prev, model, cwd, call){
	// Dynamic imports, not static ones: a static `import ... from "...Server/ask-each.mjs"`
	// at the top of this file would be resolved (and fail, trying to load `node:...`
	// builtins) the instant a BROWSER loads this module, even though this whole branch
	// never runs there. Deferred to inside this Node-only function, it's never even asked
	// for outside Node.
	const [{ askOnce }, { LEVELS, bodyFor }] = await Promise.all([
		import("../../../../Server/ask-each.mjs"),
		import("../../../../Servex/agents/tidy.js"),
	]);
	const theCall = call || askOnce; // same (prompt, {model, cwd}) -> {answer, cost_usd} shape
	const prompt = `${LEVELS.clean.prompt}\n\n${bodyFor({ text, before: prev })}`;
	const r = await theCall(prompt, { model: model || LEVELS.clean.model, cwd: cwd || process.cwd() });
	return r.answer ?? "";
}

async function browserCall(text, prev, model){
	const { servex_url } = await import("/framework/dev/servex_url.js");
	const res = await fetch(servex_url("/api/tidy"), {
		method: "POST", headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ text, before: prev, level: "clean", model }),
	});
	if (!res.ok) throw new Error(`clean(): Servex answered ${res.status}`);
	const out = await res.json();
	if (!out?.ok) throw new Error(`clean(): Servex refused (${out?.why ?? "unknown"})`);
	return out.text ?? "";
}

// ---- the public function -------------------------------------------------------------

export async function clean(text, { prev = "", onFlag, call, cwd, model } = {}){
	if (typeof text !== "string" || !text.trim()) return { text: "", sentences: [], strikes: [], misheard: [], flags: [] };

	const answerText = isNode ? await nodeCall(text, prev, model, cwd, call) : await browserCall(text, prev, model);

	let { sentences, modelFlags } = parseModelReply(answerText);
	if (!sentences.length) sentences = mechanicalSplit(text).map((t, i) => ({ n: i + 1, text: t }));

	const strikes = detectStrikes(text, sentences);
	const rawForCheck = prev ? `${prev} ${text}` : text;
	const { sentences: finalSentences, misheard, mechanicalFlags } = applyFaithfulnessCheck(rawForCheck, text, sentences, strikes);

	// Fire in the order each flag was actually found — model flags are already known at
	// parse time (before the mechanical pass even runs), so they come first; this is also
	// the one reason `onFlag` fires here, in `clean()`, rather than inside the two helper
	// passes above: a single ordered place to call it, matching the single ordered place
	// the final `flags` array is built.
	const flags = [...modelFlags, ...mechanicalFlags];
	if (typeof onFlag === "function") for (const f of flags) onFlag(f);

	return {
		text: finalSentences.map(s => s.text).join(" "),
		sentences: finalSentences,
		strikes,
		misheard,
		flags,
	};
}

export default clean;
