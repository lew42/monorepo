// placement.js — the two pieces of ChatV3 that are plain data logic, no View, no DOM (chunks.js's pattern): which Prompt a Reply
// answers, and where a Prompt's words break into paragraphs. ChatV3.js imports these; placement.test.mjs runs them in plain node.
import Prompt from "../../../core/Session/Chat/Prompt.js";

export const PARAGRAPH_GAP_MS = 4000;   // a pause this long between two sentences' `at` starts a new paragraph (views-on-messages.md)

/** The Prompt a Reply answers: the one whose `sentences` holds `re.to`, else the newest Prompt before it in `list` (session.messages.messages). */
export function owning_prompt(list, reply){
	const to = reply.re?.to ?? null, prompts = list.filter(m => m instanceof Prompt);
	if (to) { const hit = prompts.find(p => p.sentences.includes(to)); if (hit) return hit; }
	const i = list.indexOf(reply);
	for (let j = i - 1; j >= 0; j--) if (list[j] instanceof Prompt) return list[j];
	return prompts.at(-1) ?? null;
}

/** One paragraph per run of sentences with no long pause between them: a gap to the previous sentence's `at` of `gap_ms` or more starts
 *  a new paragraph. `clean` prefers the fast seat's cleaned text per sentence id (Prompt.clean), else the sentence's own raw words. */
export function paragraphs(sentence_items, clean = {}, gap_ms = PARAGRAPH_GAP_MS){
	const out = [];
	let cur = [], prev_at = null;
	for (const s of sentence_items) {
		const gap = prev_at && s.at ? Date.parse(s.at) - Date.parse(prev_at) : 0;
		if (cur.length && gap >= gap_ms) { out.push(cur.join(" ")); cur = []; }
		cur.push(clean[s.id] ?? s.text);
		if (s.at) prev_at = s.at;
	}
	if (cur.length) out.push(cur.join(" "));
	return out;
}
