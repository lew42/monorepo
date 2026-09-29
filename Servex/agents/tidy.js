import { query } from "@anthropic-ai/claude-agent-sdk";

/* TIDY — the fast, near-verbatim cleanup pass on one chunk of dictated text.
 *
 * One no-tools Sonnet call, same minimal options `jobs.js` `decide` uses (see
 * that file's comment: without `strictMcpConfig` etc. the prefix is ~51k
 * tokens instead of about 800). This pass never rephrases, reorders or
 * summarizes — see the owner's words in this task's requirements.md: the
 * first pass stays "nearly verbatim", only typos, capitalization, punctuation
 * and filler words are touched. `before` is the already-cleaned text just
 * before this chunk, given only so the seam's capitalization/punctuation
 * comes out right — it is context, never rewritten. */

const MODEL = "claude-sonnet-5";

const SYSTEM = `You clean up one chunk of dictated (speech-to-text) text. Stay as close to verbatim as possible.

Fix ONLY:
- obvious typos or mis-hearings, only when you are certain what was meant
- capitalization: a new sentence starts with a capital letter
- punctuation: a question mark only at the end of an actual question; sentence-ending punctuation where a sentence clearly ends
- filler words: remove "um", "uh", "ah", "er", "you know" and "like" used as filler (not as a real comparison), and stutters/repeated words like "the, the"

Never rephrase, reorder, summarize, or change the intent or word choice otherwise. Return ONLY the cleaned text — no quotes, no commentary, nothing else.`;

/* {text, before} -> {ok:true, text, model, ms} or {ok:false, why}. `run_query`
 * is swappable so a proof (or a test) can fake the model call. */
export async function tidy({ text, before } = {}, { run_query = query } = {}){
	if (typeof text !== "string") return { ok: false, why: "text must be a string" };
	if (!text.trim()) return { ok: true, text: "" };

	const prompt = before?.trim()
		? `The text just before this chunk (already cleaned, for context only — do not repeat or edit it):\n${before.trim()}\n\nClean this chunk:\n${text}`
		: `Clean this chunk:\n${text}`;

	const t0 = Date.now();
	let out = "";
	try {
		for await (const m of run_query({ prompt, options: {
			/* Same minimal config as jobs.js `decide` — see its comment. */
			model: MODEL, tools: [], mcpServers: {}, strictMcpConfig: true, skills: [],
			settingSources: [], maxTurns: 1, persistSession: false,
			extraArgs: { "disable-slash-commands": null },
			systemPrompt: SYSTEM
		} })){
			if (m.type === "result") out = m.result ?? out;
			else if (m.type === "assistant") out = (m.message?.content ?? []).filter(b => b.type === "text").map(b => b.text).join("") || out;
		}
	} catch (e){ return { ok: false, why: String(e.message || e) }; }

	if (!out.trim()) return { ok: false, why: "empty model reply" };
	return { ok: true, text: out.trim(), model: MODEL, ms: Date.now() - t0 };
}

export default tidy;
