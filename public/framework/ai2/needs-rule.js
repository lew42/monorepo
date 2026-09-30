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

/* ── IMPORTANCE — one number, 1-100, for anything waiting on the owner ──────────────────
 * (asks-ledger/view, 2026-09-30: brief D)
 *
 * Every list that ranks what needs the owner — the Needs you tab (`needs.js`), the Inbox's
 * score badge (`inbox.js`), and the asks ledger's own page — calls this ONE function, so a
 * blocker always outranks a question and a stalled ask always outranks a quiet FYI, wherever
 * the row ends up drawn. Pure: no DOM, no fetch. `item` is whatever the caller already
 * built — a `card_needs()` row (`kind`, `title`, `question`, `from`), or a folded stalled ask
 * (`kind: "stalled"`, `status_at`, `cost`) — and `now` is a Date or epoch-ms the caller
 * supplies, so a test can fix it.
 *
 * THE SCALE (every number below is a constant in `IMPORTANCE`, so it can be retuned without
 * reading the function body):
 *
 *   90-100  BLOCKER        a key, money, something destructive: `item.kind === "blocker"`
 *                          (card_needs already decided this with `is_blocker()`), or the
 *                          item's own words trip `is_blocker()` or `BLOCKER_WORDS` here.
 *   70-89   BLOCKING ASK   an open Question or Decision (`kind: "question"|"decision"`)
 *                          whose `from` agent is live right now (`item.from_live === true`)
 *                          — rises the longer it has sat (`item.at` against `now`).
 *   60-80   STALLED ASK    `kind: "stalled"`: rises with how long it has been silent
 *                          (`item.hours_silent`, or `item.status_at`/`item.at` against `now`)
 *                          and, once known, with `item.cost` — a $20 ask silent for an hour
 *                          scores as high as a free one silent for a day.
 *   40-59   PLAIN ASK      the same open Question/Decision, but `from_live` is false or
 *                          unknown — nothing is known to be sitting idle waiting on it.
 *   20-40   DECIDED        the system already chose something and is only telling you
 *                          (`kind: "decision_made"` — an "I chose X" FYI, not a question).
 *    1-19   FYI            `kind: "fyi"`: worth knowing, nothing to do.
 *
 * An item whose `kind` matches none of these falls back to `IMPORTANCE.DEFAULT` (10) — saying
 * nothing about a row's urgency is cheaper than guessing it into the middle of the list. */
export const IMPORTANCE = {
	BLOCKER: 95,
	BLOCKING_ASK_BASE: 70, BLOCKING_ASK_MAX: 89,
	PLAIN_ASK_BASE: 40, PLAIN_ASK_MAX: 59,   // below every stalled ask (60+): nothing live is waiting on these
	ASK_HOURS_FULL: 6,        // hours an open question/decision has sat that alone reaches the top of its band
	STALLED_BASE: 60, STALLED_MAX: 80,
	STALLED_HOURS_FULL: 24,   // hours silent that alone reaches the top of the stalled band
	STALLED_COST_FULL: 20,    // dollars spent that alone reaches the top of the stalled band
	DECIDED: 30,
	FYI: 10,
	DEFAULT: 10,
};

/** A few more words than `is_blocker`'s own "block" — the ones the owner named directly
 *  ("a key, money, something destructive"). Kept separate from `is_blocker` itself so that
 *  function's existing contract (card_needs' own "blocker" kind, already tested elsewhere)
 *  never changes shape underneath its other two callers. */
const BLOCKER_WORDS = /\b(key|login|password|credential|pay|payment|delete|force|destroy|wipe)\b/i;

function blocker_signal(item){
	const text = [item?.title, item?.question].filter(Boolean).join(" ");
	return is_blocker(text) || BLOCKER_WORDS.test(text);
}

function hours_since(at, now){
	const t = at ? Date.parse(at) : NaN;
	if (!Number.isFinite(t)) return 0;
	const n = now instanceof Date ? now.getTime() : Number(now ?? Date.now());
	return Math.max(0, (n - t) / 3600000);
}

/** How long a stalled ask's owner has been quiet, in hours: the time since the stall was
 *  marked (`status_at`), PLUS the silence the stall line's own `why` already carries
 *  ("owner agent silent 131 min" — Servex marks a stall only after 2 h of quiet). Without
 *  the second part a fresh stall reads "silent 5 min" beside "silent 131 min". */
export function silent_hours(ask, now = Date.now()){
	const m = /silent (\d+) min/.exec(String(ask?.why ?? ""));
	return hours_since(ask?.status_at ?? ask?.at, now) + (m ? Number(m[1]) / 60 : 0);
}

function stalled_score(item, now){
	const hours = Number.isFinite(item?.hours_silent) ? item.hours_silent : hours_since(item?.status_at ?? item?.at, now);
	const cost = Number(item?.cost ?? 0);
	const hours_frac = Math.min(1, hours / IMPORTANCE.STALLED_HOURS_FULL);
	const cost_frac = Number.isFinite(cost) ? Math.min(1, cost / IMPORTANCE.STALLED_COST_FULL) : 0;
	const frac = Math.max(hours_frac, cost_frac);   // whichever signal is further along wins
	return Math.round(IMPORTANCE.STALLED_BASE + frac * (IMPORTANCE.STALLED_MAX - IMPORTANCE.STALLED_BASE));
}

function ask_score(item, now){
	const live = !!item?.from_live;
	const base = live ? IMPORTANCE.BLOCKING_ASK_BASE : IMPORTANCE.PLAIN_ASK_BASE;
	const max = live ? IMPORTANCE.BLOCKING_ASK_MAX : IMPORTANCE.PLAIN_ASK_MAX;
	const frac = Math.min(1, hours_since(item?.at, now) / IMPORTANCE.ASK_HOURS_FULL);
	return Math.round(base + frac * (max - base));
}

export function importance(item, now = Date.now()){
	const kind = item?.kind;
	if (kind === "blocker" || blocker_signal(item)) return IMPORTANCE.BLOCKER;
	if (kind === "stalled") return stalled_score(item, now);
	if (kind === "decision_made") return IMPORTANCE.DECIDED;
	if (kind === "fyi") return IMPORTANCE.FYI;
	if (kind === "decision" || kind === "question") return ask_score(item, now);
	return IMPORTANCE.DEFAULT;
}
