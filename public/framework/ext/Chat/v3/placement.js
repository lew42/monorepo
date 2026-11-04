// placement.js — the pieces of ChatV3 that are plain data logic, no View, no DOM (chunks.js's pattern): which Prompt a Reply
// answers, where a Prompt's words break into paragraphs, and what a message draws as a card. ChatV3.js and ChatList.js import
// these; placement.test.mjs runs them in plain node. Servex's own item tool (`page_tools.js`) imports `note_view` too, to
// answer a card's read-back the same way the views draw it — keep this file node-safe (no DOM, no browser-only API).
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

/** Sentence items grouped by the same pause rule as `paragraphs()`, kept as sentence objects (not joined into text): a gap to the
 *  previous sentence's `at` of `gap_ms` or more starts a new group. ChatV2 draws one row per sentence, so a Reply can sit beside
 *  the one it answers (`re.to`); `paragraphs()` below is this grouping, joined into one string per paragraph. */
export function paragraph_groups(sentence_items, gap_ms = PARAGRAPH_GAP_MS){
	const out = [];
	let cur = [], prev_at = null;
	for (const s of sentence_items) {
		const gap = prev_at && s.at ? Date.parse(s.at) - Date.parse(prev_at) : 0;
		if (cur.length && gap >= gap_ms) { out.push(cur); cur = []; }
		cur.push(s);
		if (s.at) prev_at = s.at;
	}
	if (cur.length) out.push(cur);
	return out;
}

/** One paragraph per run of sentences with no long pause between them (`paragraph_groups`), each joined into one string.
 *  `clean` prefers the fast seat's cleaned text per sentence id (Prompt.clean), else the sentence's own raw words. */
export function paragraphs(sentence_items, clean = {}, gap_ms = PARAGRAPH_GAP_MS){
	return paragraph_groups(sentence_items, gap_ms).map(group => group.map(s => clean[s.id] ?? s.text).join(" "));
}

/** What a plain Message (`note()`'s root, or an upgraded Reply) draws: a member with neither `title` nor `icon` set draws its
 *  text and nothing else; a card (icon/title set, by a fresh add or an upgrade) draws its title and icon; `content` (a List
 *  of plain Items, or Refs — "a ref to an existing item") draws one line each, the Ref's own `label()` when it has no title
 *  or text of its own. Guarded with `??`/`? :`, never `||`, so a member missing a field answers "" or `null`, never the
 *  stringified word "undefined". DOM-free so it is testable without a browser. */
export function note_view(m){
	const title = m?.title ? String(m.title) : null, icon = m?.icon ? String(m.icon) : null;
	const content = [...(m?.content ?? [])].map(c => c?.get_one?.("title") ?? c?.get_one?.("text") ?? c?.label?.() ?? null).filter(Boolean).map(String);
	return { title, icon, text: String(m?.text ?? ""), content };
}

/** Which answered Questions are "far off" (ux/Dictate/doc/principles.md, "Questions": "If the card has scrolled far away,
 *  a reference to it appears near the bottom") — review fix (ask7, finding 3): "far" means an actual distance, `threshold`
 *  or more OTHER root cards between the question's own Prompt and the end of the chat, not merely "not the newest root"
 *  (a question answered right as the next prompt arrives used to qualify at once). `items` is `[{question, prompt}]` (a
 *  Question and the Prompt card it nests under); `roots` is the card list in order (`ChatV3.card_roots()`). An unanswered
 *  Question is never far-off. The result is capped to the most recent `max` (closest to the end first, i.e. the ones
 *  the owner is most likely to still care about) so references never pile up for the whole session. */
export function far_off_questions(items, roots, { threshold = 3, max = 5 } = {}){
	const last_index = roots.length - 1;
	const far = items.filter(({ question, prompt }) => {
		if (!question?.answer) return false;
		const idx = roots.indexOf(prompt);
		return idx === -1 || last_index - idx > threshold;
	});
	return far.slice(-max);
}

// Fields whose change on a Question needs its owning card redrawn even though the write never fires a "delta" event
// (Task.replay_line's `take()`, never `set_one()`): the answer landing, and `also_from` growing (review fix, finding 4 —
// a repeated Question links to the existing card by growing THIS field, drawn as a reference under the repeating Prompt).
const QUESTION_LIVE_FIELDS = ["answer", "also_from"];

/** Every id directly nested under one of `QUESTION_LIVE_FIELDS` anywhere in a raw line (review fix, finding 1): a plain
 *  object carrying one of those keys names a Question whose card needs redrawing, at whatever depth the line addressed
 *  it — `{"q-id":{answer:{…}}}`, `{"p-id":{"q-id":{also_from:[…]}}}`. Pure data, no Session/DOM: ChatV3 looks these ids
 *  up itself (`session.find`) and marks their owning card dirty, fixed entirely in the view, as the review asked. */
export function find_answered_ids(node, out = []){
	if (!node || typeof node !== "object" || Array.isArray(node)) return out;
	for (const [k, v] of Object.entries(node)){
		if (v && typeof v === "object" && !Array.isArray(v) && QUESTION_LIVE_FIELDS.some(f => v[f] !== undefined)) out.push(k);
		find_answered_ids(v, out);
	}
	return out;
}
