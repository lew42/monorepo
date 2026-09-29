/**
 * THE RULE for "this card needs the owner" — one pure function, read off a card's raw
 * `page.jsonl` lines, with no DOM and no `/app.js` import (contract-v2 §1). Three callers
 * share it so they can never disagree: the AI 2 "Needs you" tab (`needs.js`), the rail's
 * "Needs review" filter, and Servex's `list_waiting` tool / `GET /waiting` route
 * (`Servex/cards/Cards.js`, imported as `../../public/framework/ai2/needs-rule.js`, the same
 * way `Cards.js` already imports `fold.js`).
 *
 * An item is open when it is one of these (contract-v2 §1):
 *
 *   1. A `place` line for a Decision (ux/Content) with no later `chose` line for its id.
 *   2. A `place` line for a Question (ux/Content) with no later `answer` line for its id.
 *   3. A legacy `{"ask": {id, title, question, options, from}}` line (yesterday's sweep wrote
 *      6 of these) with no `{"answer": {"ask": id}}` line.
 *   4. A card of `type: "question"` (pseudo-id `"card"`), or a card whose last message from an
 *      agent (not the owner) ends in "?" (pseudo-id `"last"`) — in both cases only when there
 *      is no answer line for it, AND no `{"reviewed": {"at"}}` line newer than it.
 *
 * It drops out entirely once the card's status is `done` or `archived`.
 *
 * ⚠ WHY NOT `fold_card()` (fold.js): its generic `absorb()` keeps only the LATEST line for a
 * repeated key like `place`, which is right for a single "where is X placed" fact but wrong
 * here — a card can carry several open asks (a Decision AND a Question AND a legacy `ask`) at
 * once, and every one of them is wanted, not just the last. This file reads the raw lines
 * itself instead.
 */

const DECISION_MOD = /\/Decision\/Decision\.js$/;
const QUESTION_MOD = /\/Question\/Question\.js$/;

/** A SIMPLE, WRITTEN-DOWN RULE for "blocker" (brief D: "a simple rule is fine, write it down
 *  in a comment"): the word "block" appears in the ask or the card's title — "the OpenRouter
 *  key blocks the harness", "resume the 5 BLOCKED tasks". Everything else that is an open
 *  Decision or Question ranks as a plain decision/question; a card's own last-message-with-a-
 *  question-mark, with no formal ask placed, ranks lowest (an FYI, not yet a real blocker). */
export const is_blocker = (...texts) => texts.some(t => /\bblock/i.test(String(t ?? "")));

/** Every option becomes `{say, caveat?}`, the shape `ux/Content/Decision`'s own `normalize()`
 *  uses — a plain string option (what `card_ask` and the legacy sweep both write, e.g.
 *  `["close it", "keep chasing"]`) becomes `{say: "close it"}`. Without this, a consumer that
 *  reads `option.say` straight off a raw string option gets `undefined` and breaks. */
const norm_options = options => (options ?? []).map(o => typeof o === "string" ? { say: o } : o);

/** One card's open needs, from its OWN raw lines (`page.jsonl`, already parsed). `meta` is the
 *  card's static-index summary (title, type, status) as a starting point — a line on the card
 *  can still override its title. Returns `[]` for a card with nothing open right now.
 *  Each item is `{card, ask, kind, title, question, options, hint, at, control, from}` —
 *  `from` (who is waiting on the answer) comes from the `place` line or the legacy `ask` line. */
export function card_needs(id, lines, meta = {}){
	const decisions = new Map();   // decision id -> { ask, options, at, from }
	const questions = new Map();   // question id -> { ask, hint, at, from }
	const legacies = new Map();    // legacy ask id -> { title, question, options, from, at }
	const chosen = new Set();      // decision ids already answered
	const answered = new Set();    // question ids (real, pseudo "card"/"last", or legacy ask ids) already answered
	const answered_at = new Map();
	let title = meta.title ?? "", type = meta.type ?? "card", status = meta.status ?? "open";
	let last_message = null;
	let reviewed_at = null;        // the newest {"reviewed": {"at"}} line, if any

	for (const line of lines){
		if (!line || typeof line !== "object") continue;
		if (typeof line.title === "string" && line.type !== "refined") title = line.title;
		if (typeof line.type === "string") type = line.type;
		if (typeof line.status === "string") status = line.status;
		const p = line.place;
		if (p?.module && p.id){
			if (DECISION_MOD.test(p.module)) decisions.set(p.id, { ask: p.ask, options: norm_options(p.options), at: p.at, from: p.from });
			else if (QUESTION_MOD.test(p.module)) questions.set(p.id, { ask: p.ask, hint: p.hint, at: p.at, from: p.from });
		}
		if (line.ask?.id) legacies.set(line.ask.id, { title: line.ask.title, question: line.ask.question,
			options: norm_options(line.ask.options), from: line.ask.from, at: line.ask.at ?? line.at });
		if (line.chose?.decision) chosen.add(line.chose.decision);
		if (line.answer?.question){ answered.add(line.answer.question); answered_at.set(line.answer.question, line.answer.at ?? line.at); }
		if (line.answer?.ask){ answered.add(line.answer.ask); answered_at.set(line.answer.ask, line.answer.at ?? line.at); }   // legacy answer.ask
		if (line.message?.by && line.message.by !== "owner") last_message = line.message;
		if (line.reviewed?.at) reviewed_at = line.reviewed.at;
	}

	if (status === "archived" || status === "done") return [];

	const out = [];
	for (const [qid, d] of decisions){
		if (chosen.has(qid)) continue;
		out.push({ card: id, ask: qid, kind: is_blocker(d.ask, title) ? "blocker" : "decision",
			title, question: d.ask || title, options: d.options, at: d.at, control: "decision", from: d.from });
	}
	for (const [qid, q] of questions){
		if (answered.has(qid)) continue;
		out.push({ card: id, ask: qid, kind: is_blocker(q.ask, title) ? "blocker" : "question",
			title, question: q.ask || title, hint: q.hint, at: q.at, control: "reply", from: q.from });
	}
	for (const [qid, a] of legacies){
		if (answered.has(qid)) continue;
		const control = a.options?.length ? "decision" : "reply";
		out.push({ card: id, ask: qid, kind: is_blocker(a.question, a.title, title) ? "blocker" : control === "decision" ? "decision" : "question",
			title: a.title || title, question: a.question || a.title || title, options: a.options, at: a.at, control, from: a.from });
	}
	// A whole card MADE as a question (no Question module placed on it separately).
	if (type === "question" && !questions.size){
		const cleared = answered.has("card") || (reviewed_at && Date.parse(reviewed_at) >= Date.parse(meta.last ?? meta.created ?? 0));
		if (!cleared) out.push({ card: id, ask: "card", kind: is_blocker(title) ? "blocker" : "question",
			title, question: title, at: meta.last ?? meta.created, control: "reply" });
	}
	// The card's own last message, an agent asking the owner something directly — only when
	// nothing more formal (a real Decision/Question/legacy ask) is already open on this card.
	if (!out.length && last_message && /\?\s*$/.test(String(last_message.text ?? "").trim())){
		const answered_cleared = answered.has("last") && Date.parse(answered_at.get("last") ?? 0) >= Date.parse(last_message.at ?? 0);
		const reviewed_cleared = reviewed_at && Date.parse(reviewed_at) >= Date.parse(last_message.at ?? 0);
		if (!answered_cleared && !reviewed_cleared) out.push({ card: id, ask: "last", kind: "fyi", title,
			question: last_message.text, at: last_message.at, control: "reply" });
	}
	return out;
}

export default card_needs;
