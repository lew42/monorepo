/* PromptLines.js — the delta lines that make a session's chat (chat-shape.md, Option C): a Prompt task holding the
 * owner's raw words and cleaned paragraphs, replies anchored to a sentence, and Questions nested under it. Pure
 * functions, no fs: the caller appends the result through its OWN single writer (Sessions.js's `write`/`append` for
 * the fast seat; the `item` tool for the smart seat, documented in session-smart.md). One function per line shape in
 * the brief, matched 1:1 against what `ChatV2Model.js` folds and what `core/Task/Prompt.js`/`Question.js` replay.
 *
 * VOICE SESSIONS ONLY (the look-first step, chat-v2-writers): a voice session's `session.jsonl` is never touched by
 * `Server/PromptsToSession.mjs` / `PromptRecords.mjs` — those two only mirror a VS CODE TAB's prompts.jsonl (guarded by
 * `kind !== "vscode-tab"` in `Servex/agents/PromptTasks.js`'s `record_for()`). A voice session's own id ("v-…") is not
 * even a transcript uuid PromptAudit could look up. So THIS is the first and only writer for a voice session's
 * Prompts: no risk of a second Prompt for one utterance (CLAUDE.md law 6), because nothing else ever makes one here. */

const now_iso = () => new Date().toISOString();

/* A timestamp, bumped when the clock hasn't moved since the last id of THIS prefix (two Prompts made in the same
 * millisecond would otherwise collide and silently merge into one — found desk-checking two standalone utterances
 * back to back). Per prefix, not global: a Prompt and a Question made in the same ms are already distinct. */
const last_at = new Map();
function unique_at(prefix){
	const now = Date.now(), at = Math.max(now, (last_at.get(prefix) ?? 0) + 1);
	last_at.set(prefix, at);
	return at;
}

/** One Prompt id: a timestamp, same scheme as chat-shape.md's examples ("nothing else depends on their shape"). */
export function prompt_id(){ return `p-${unique_at("p")}`; }
export function question_id(){ return `q-${unique_at("q")}`; }
export function reply_id(){ return `r-${unique_at("r")}`; }

/** The fast seat: a new Prompt, born with its raw words and (if given) one cleaned paragraph "a". */
export function add_prompt({ id, raw = [], text = "", by = "fast" } = {}){
	return { tasks: { add: { type: "Prompt", id, raw: [].concat(raw).filter(Boolean), paragraphs: text ? [{ id: "a", text }] : [] } }, ts: now_iso(), by };
}

/** The fast seat: more raw words heard, same Prompt (mid-sentence or a correction after the Prompt already exists). */
export function push_raw(id, text, by = "fast"){ return { [id]: { raw: { push: text } }, ts: now_iso(), by }; }

/** The fast seat: a new paragraph (a new idea within the same Prompt), or more text onto an existing one. */
export function add_paragraph(id, { para_id, text }, by = "fast"){ return { [id]: { paragraphs: { add: { id: para_id, text } } }, ts: now_iso(), by }; }
export function append_paragraph(id, { para_id, text }, by = "fast"){ return { [id]: { paragraphs: { append: { id: para_id, text } } }, ts: now_iso(), by }; }

/** The smart seat: its refined version of the Prompt (what the chat shows at the root, chat-shape.md "Two more"). */
export function refine_prompt(id, { title, text } = {}, by = "smart"){
	return { [id]: { ...(title !== undefined ? { title } : {}), ...(text !== undefined ? { text } : {}) }, ts: now_iso(), by };
}

/** The smart seat: a reply to the whole Prompt, or to one sentence (`anchor: {sentence, from?, to?}`). */
export function add_reply(id, { id: rid, text, anchor } = {}, by = "smart"){
	return { [id]: { replies: { add: { id: rid, text, by, ...(anchor ? { anchor } : {}) } } }, ts: now_iso(), by };
}

/** The smart seat: a task made from the Prompt, nested under it. `task` is any Task-shaped object (title, …) or a Question (below). */
export function add_task(prompt_id, task, by = "smart"){ return { [prompt_id]: { tasks: { add: task } }, ts: now_iso(), by }; }

/** The smart seat: a question it heard in the Prompt, open until answered. */
export function add_question(prompt_id, { id, text } = {}, by = "smart"){
	return { [prompt_id]: { tasks: { add: { type: "Question", id, text, from: prompt_id } } }, ts: now_iso(), by };
}

/** The smart seat: answers a Question. `{complete:{}}` (a separate item-tool call) is the "the owner has read it" step; not this. */
export function answer_question(id, { text, at = now_iso() } = {}, by = "smart"){ return { [id]: { answer: { text, by, at } }, ts: now_iso(), by }; }
