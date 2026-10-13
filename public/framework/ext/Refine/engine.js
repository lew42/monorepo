// History, design, and API: doc/notes.md
// Browser-safe AND Node-safe: no top-level node:* imports

const isNode = typeof window === "undefined";

// Glossary built by hand from CLAUDE.md + module names; see doc/notes.md
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

// Word-matching helpers: copy of Server/refine.mjs logic (can't import due to node:*)

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

// Glossary threshold: ~30% of word length, at least 1 (4-letter needs near-exact; 10-letter allows ±3)
const glossaryThreshold = w => Math.max(1, Math.round(w.length * 0.3));

function closestGlossaryMatch(word){
	let best = null;
	for (const name of GLOSSARY){
		const d = editDistance(word, name);
		if (!best || d < best.distance) best = { name, distance: d };
	}
	return best;
}

// Best-effort nearest raw word (closest by edit distance); not a precise citation
function nearestRawWord(name, rawWords){
	let best = null;
	for (const w of rawWords){
		const d = editDistance(name, w);
		if (!best || d < best.distance) best = { word: w, distance: d };
	}
	return best?.word ?? name;
}

// Strike detection: looks for correction markers ("no wait", "actually", etc.) in RAW text
const CORRECTION_MARKERS = /\b(no,?\s+wait|wait,?\s+no|actually|scratch that|i meant|i mean|not that)\b/i;

function splitClauses(text){
	return text.replace(/\s+/g, " ").trim().split(/(?<=[.!?,;])\s+/).filter(Boolean);
}

// Best-match sentence by word overlap (same idea as raw-match.md, reused for two jobs)
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

// Parse model's numbered reply (matches Servex/agents/tidy.js contract)
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

// Fallback for model ignoring numbered format (same as Server/refine.mjs)
function mechanicalSplit(text){
	return text.replace(/\s+/g, " ").trim().split(/(?<=[.!?])\s+/).filter(Boolean);
}

// Faithfulness check: global vocabulary (prev + text); doc/notes.md
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

// Node vs. browser split: nodeCall dynamic imports, browserCall hits /api/tidy

async function nodeCall(text, prev, model, cwd, call){
	// ⚠ Dynamic imports (not static) to avoid node:* builtins in browser
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

// Public clean() function
export async function clean(text, { prev = "", onFlag, call, cwd, model } = {}){
	if (typeof text !== "string" || !text.trim()) return { text: "", sentences: [], strikes: [], misheard: [], flags: [] };

	const answerText = isNode ? await nodeCall(text, prev, model, cwd, call) : await browserCall(text, prev, model);

	let { sentences, modelFlags } = parseModelReply(answerText);
	if (!sentences.length) sentences = mechanicalSplit(text).map((t, i) => ({ n: i + 1, text: t }));

	const strikes = detectStrikes(text, sentences);
	const rawForCheck = prev ? `${prev} ${text}` : text;
	const { sentences: finalSentences, misheard, mechanicalFlags } = applyFaithfulnessCheck(rawForCheck, text, sentences, strikes);

	// Fire onFlag in order found (model flags first, then mechanical)
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

// Instant clean (no model): drop fillers + stutters, capitalise, add punctuation
export function quick_clean(text){
	const t = String(text ?? "").replace(/\s+/g, " ").trim();
	if (!t) return [];
	const cleaned = t
		.replace(/\b(?:um+|uh+|ah+|er+|erm|hmm+)\b[,.]?\s*/gi, "")
		.replace(/\byou know,?\s*/gi, "")
		.replace(/\blike,\s*/gi, "")
		.replace(/\b(\w+)(?:,?\s+\1\b)+/gi, "$1")
		.replace(/\s+([,.!?;:])/g, "$1")
		.replace(/\s+/g, " ").trim();
	return mechanicalSplit(cleaned).map((s, i) => {
		let x = s.replace(/^[\s,;:-]+/, "");
		x = x.charAt(0).toUpperCase() + x.slice(1);
		if (!/[.!?]$/.test(x)) x += /^(who|what|when|where|why|how|is|are|do|does|can|could|should|would)\b/i.test(x) ? "?" : ".";
		return { n: i + 1, text: x };
	}).filter(s => s.text.length > 1);
}

// Word overlap score: Dice coefficient over 3+ letter words (law 6: one place)
export function word_overlap_score(a, b){
	const words = s => new Set((String(s ?? "").toLowerCase().match(/[a-z0-9']+/g) ?? []).filter(w => w.length >= 3));
	const wa = words(a), wb = words(b);
	if (!wa.size && !wb.size) return 1;
	if (!wa.size || !wb.size) return 0;
	let shared = 0;
	for (const w of wa) if (wb.has(w)) shared++;
	return (2 * shared) / (wa.size + wb.size);
}

export default clean;
