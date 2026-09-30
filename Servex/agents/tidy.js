import { query } from "@anthropic-ai/claude-agent-sdk";

/* TIDY — revise one chunk of dictated (or rambling) text, at a LEVEL.
 *
 * One no-tools Sonnet call, same minimal options `jobs.js` `decide` uses (see
 * that file's comment: without `strictMcpConfig` etc. the prefix is ~51k
 * tokens instead of about 800). `level` names one of LEVELS below (`clean`,
 * `edit` or `summary` — see ux/Revise, which shows all three on one page);
 * an explicit `system` (+ optional `model`) lets a caller run its own prompt
 * instead of a named level. With NEITHER given — every caller before this
 * task — this is byte-for-byte the ORIGINAL /api/tidy call: `LEVELS.clean`
 * is the exact prompt this file always used, `before` still means the same
 * thing at every level: the already-cleaned text just before this chunk,
 * given only so the seam's capitalization/punctuation comes out right — it
 * is context, never rewritten. */

const MODEL = "claude-sonnet-5";

const CLEAN_SYSTEM = `You clean up one chunk of dictated (speech-to-text) text. Stay as close to verbatim as possible.

Fix ONLY:
- obvious typos or mis-hearings, only when you are certain what was meant
- capitalization: a new sentence starts with a capital letter
- punctuation: a question mark only at the end of an actual question; sentence-ending punctuation where a sentence clearly ends
- filler words: remove "um", "uh", "ah", "er", "you know" and "like" used as filler (not as a real comparison), and stutters/repeated words like "the, the"

Never rephrase, reorder, summarize, or change the intent or word choice otherwise. Return ONLY the cleaned text — no quotes, no commentary, nothing else.`;

const EDIT_SYSTEM = `You lightly edit dictated or rambling text into tighter sentences, in the SAME voice and the same level of informality — this is a light pass, not a rewrite.

Do:
- tighten run-on sentences and cut true filler ("um", "you know", stray repeats)
- fix grammar, punctuation and capitalization
- keep the person's own words and phrasing wherever they already work

Never change the meaning, drop a point they made, or make it sound more formal than they spoke it. Return ONLY the edited text — no quotes, no commentary, nothing else.`;

const SUMMARY_SYSTEM = `You take long, rambling dictated text (a prompt, or rambling notes for a piece of writing) and turn it into a short, organized result — this is a HEAVY pass: summarize and reorganize, don't just tidy.

Do:
- pull out the actual points being made, drop the repetition and the thinking-out-loud
- organize into short paragraphs, or a bulleted/numbered list when the content is naturally a list of points
- keep it in the person's own voice and intent — this is their curated writing, not a report about it

Return ONLY the summarized, organized text — no quotes, no commentary, nothing else.`;

/* The three built-in levels, each a plain {label, prompt, model} — the exact shape
 * ux/Revise's own `LEVELS` uses, so a caller comparing the two files can see they
 * agree. `clean` is unchanged from before this task; `edit` and `summary` are new. */
export const LEVELS = {
	clean:   { label: "Clean",   prompt: CLEAN_SYSTEM,   model: MODEL },
	edit:    { label: "Edit",    prompt: EDIT_SYSTEM,    model: MODEL },
	summary: { label: "Summary", prompt: SUMMARY_SYSTEM, model: MODEL },
};

/* {text, before, level?, system?, model?} -> {ok:true, text, model, ms} or {ok:false, why}.
 * `run_query` is swappable so a proof (or a test) can fake the model call. */
export async function tidy({ text, before, level, system, model } = {}, { run_query = query } = {}){
	if (typeof text !== "string") return { ok: false, why: "text must be a string" };
	if (!text.trim()) return { ok: true, text: "" };

	// No `level` and no `system`: this is exactly the original call — LEVELS.clean's
	// prompt IS the original SYSTEM constant, and MODEL is the original model.
	const chosen = system ? { prompt: system, model } : (LEVELS[level] ?? LEVELS.clean);
	const use_model = model || chosen.model || MODEL;

	const prompt = before?.trim()
		? `The text just before this chunk (already cleaned, for context only — do not repeat or edit it):\n${before.trim()}\n\nClean this chunk:\n${text}`
		: `Clean this chunk:\n${text}`;

	const t0 = Date.now();
	let out = "";
	try {
		for await (const m of run_query({ prompt, options: {
			/* Same minimal config as jobs.js `decide` — see its comment. */
			model: use_model, tools: [], mcpServers: {}, strictMcpConfig: true, skills: [],
			settingSources: [], maxTurns: 1, persistSession: false,
			extraArgs: { "disable-slash-commands": null },
			systemPrompt: chosen.prompt
		} })){
			if (m.type === "result") out = m.result ?? out;
			else if (m.type === "assistant") out = (m.message?.content ?? []).filter(b => b.type === "text").map(b => b.text).join("") || out;
		}
	} catch (e){ return { ok: false, why: String(e.message || e) }; }

	if (!out.trim()) return { ok: false, why: "empty model reply" };
	return { ok: true, text: out.trim(), model: use_model, ms: Date.now() - t0 };
}

export default tidy;
