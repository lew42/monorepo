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
 * It drops out entirely once the card's status is `done` or `archived` — and a Decision or
 * legacy ask matching `is_task_loop_escalation()` below drops out too (2026-09-30, the owner:
 * "not the owner's"): a task-loop or heartbeat "close it, or keep chasing?" is the SYSTEM's own
 * question, answered by the heartbeat or the Servex mastermind, never something that should
 * flood the owner's "Needs you". It still draws and still answers on the card's own page.
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
 *  in a comment"): the ask or the card's title says "blocked" or "blocker" — "resume the 5
 *  BLOCKED tasks", "blocker: the OpenRouter key". ⚠ Not any "block": "a hook that blocks git
 *  stash" was ranked a blocker, and it blocked nothing (the owner, 2026-09-30: "don't say it's a
 *  blocker if it's not"). An agent that means it writes the word. Everything else that is an open
 *  Decision or Question ranks as a plain decision/question; a card's own last-message-with-a-
 *  question-mark, with no formal ask placed, ranks lowest (an FYI, not yet a real blocker). */
export const is_blocker = (...texts) => texts.some(t => /\bblock(ed|er)\b/i.test(String(t ?? "")));

/** Every option becomes `{say, caveat?}`, the shape `ux/Content/Decision`'s own `normalize()`
 *  uses — a plain string option (what `card_ask` and the legacy sweep both write, e.g.
 *  `["close it", "keep chasing"]`) becomes `{say: "close it"}`. Without this, a consumer that
 *  reads `option.say` straight off a raw string option gets `undefined` and breaks. */
const norm_options = options => (options ?? []).map(o => typeof o === "string" ? { say: o } : o);

/** A HEARTBEAT / TASK-LOOP ESCALATION — "<task> has been quiet since … close it, or keep
 *  chasing?" (`Servex/TaskLoop.js` `escalate()`) or "…Servex could not fix it; please look."
 *  (`Servex/Heartbeat.js` `escalate()`/`post()`). This is the SYSTEM asking whether to keep
 *  chasing a stalled task — the heartbeat already revives or stops it, and the Servex
 *  mastermind decides what to do next — never something the owner should have to triage
 *  (the owner, 2026-09-30: "not the owner's"). So it is filtered OUT of the aggregate list —
 *  "Needs you", the rail's "Needs review" filter, and Servex's own `/waiting`, all three of
 *  which call `card_needs()` — but it is NOT deleted: the Decision widget it placed still
 *  draws and still answers on the card's OWN page, same as any other placed Decision, because
 *  `card_needs()` is only ever consulted for the AGGREGATE views, never for a card's own
 *  rendering. Detected by shape, not by a tag on the line — neither `TaskLoop.escalate()` nor
 *  `Heartbeat.post()` currently records who is asking (`Servex/cards/Cards.js`'s `tool()`
 *  wrapper drops the caller context before it ever reaches `ask()`) — so this reads the two
 *  option pairs and the two phrases those two callers actually write, which is stable because
 *  both are one-line functions nobody edits casually; a real owner-facing Decision asking with
 *  the exact same words and options would be a very strange coincidence. */
const ESCALATION_OPTION_PAIRS = [["close it", "keep chasing"], ["look into it", "close it"]];
export function is_task_loop_escalation(question, options){
	const opts = (options ?? []).map(o => String(o?.say ?? o ?? "").trim().toLowerCase());
	if (ESCALATION_OPTION_PAIRS.some(pair => opts.length === pair.length && pair.every((s, i) => s === opts[i]))) return true;
	return /has been quiet since|servex could not fix it|did not land after \d+ chases?/i.test(String(question ?? ""));
}

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
		if (is_task_loop_escalation(d.ask, d.options)) continue;   // the system's to triage, not the owner's — stays on the card
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
		if (is_task_loop_escalation(a.question, a.options)) continue;   // same escalation, the pre-card_ask legacy shape
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

/** A HEARTBEAT NOTICE IS NOT ACTIVITY (item A, 2026-09-30: "servex-heartbeat: minion-x its
 *  agent is not running: it was stopped on purpose" bumped old cards to the top of the Inbox).
 *  Servex checking in on itself is not the owner, or an agent, doing anything — so it must
 *  never move a card's or a task's own last-activity time, the one thing every row here sorts
 *  and scores by. Shared here so every reader of raw lines (`inbox.js`'s card folds,
 *  `groups.js`'s task lines) skips the same lines the same way. Matched by `by` — the exact
 *  author every heartbeat message writes — or, for a shape with no `by` at all (a task-loop's
 *  own escalation line), by its own words starting with the same name. */
export const is_heartbeat_line = v => {
	const by = String(v?.by ?? "");
	const text = String(v?.text ?? v?.msg ?? "");
	return by === "servex-heartbeat" || text.startsWith("servex-heartbeat");
};

/* ── IMPORTANCE — one number, 0-100, for anything the owner might see in the Inbox
 * (INBOX ZERO, the owner, 2026-09-30 16:35: "the Inbox shows only what is truly pressing:
 * score ≥ 90... the score decays with age... a somewhat important thing that just happened
 * may show briefly, [and] after about a day it drops below 90, unless it is super-important
 * and still pressing"). This replaces the earlier "≥50" scale (asks-ledger/view, brief D).
 *
 * Every list that ranks a row — the Inbox (`inbox.js` `items()`, computed AT READ TIME, never
 * written anywhere), the Needs you tab (`needs.js`), and the asks ledger's own page — calls
 * this ONE function, so nothing can rank a row two different ways. Pure: no DOM, no fetch.
 * `item` is whatever the caller already built — a `card_needs()` row (`kind`, `title`,
 * `question`, `from`, `at`), a folded stalled ask (`kind: "stalled"`, `status_at`, `cost`), or
 * a plain Inbox row (`kind: "card"|"note"|"landed"|"prompt"`, `at` its real last activity —
 * never a `servex-heartbeat` notice, `is_heartbeat_line()` above) — and `now` is a Date or
 * epoch-ms the caller supplies, so a test can fix it.
 *
 * THE RULE, IN WORDS (every number below is a constant in `IMPORTANCE`, so it can be retuned
 * without reading the function body):
 *
 *   97-100  BLOCKER          a key, money, something destructive: `item.kind === "blocker"`
 *                            (card_needs already decided this with `is_blocker()`), or the
 *                            item's own words trip `is_blocker()` or `BLOCKER_WORDS` here.
 *                            NEVER DECAYS — still 97+ no matter how old the row is, because
 *                            it is still open right now.
 *   90-96   BLOCKED          an open Question or Decision (`kind: "question"|"decision"`)
 *                            whose `from` agent is live right now (`item.from_live === true`)
 *                            — rises the longer it has sat (`item.at` against `now`).
 *                            NEVER DECAYS either, same reason.
 *   90-99   FRESH            anything else at all — EXCEPT a stalled ask, which never gets
 *                            this lift (item B: the owner has nothing to do about one no
 *                            matter how recently it stalled) — whose `at` is inside the last
 *                            `FRESH_HOURS` (~a day): "may show briefly." Fades on a straight
 *                            line back down to the row's own resting score (below) by
 *                            `FRESH_HOURS` old. A raw "You said…" row that never became a
 *                            card (`kind: "prompt"`) gets the same lift on a much shorter
 *                            `PROMPT_FRESH_HOURS` (~an hour) instead — item C: it is "current"
 *                            only while the owner is still talking about it, not for a day. A
 *                            row that is only a heartbeat notice never gets this either — its
 *                            real `at` (heartbeat lines skipped) is however old the last REAL
 *                            line on it actually is.
 *   < 90    RESTING (what is left once nothing is fresh or pressing)
 *     40-55   PLAIN ASK      the same open Question/Decision, but `from_live` is false or
 *                            unknown — nothing is known to be sitting idle waiting on it.
 *     15-35   STALLED ASK    `kind: "stalled"`: Servex revives the quiet owner agent itself
 *                            (CLAUDE.md law 5) — rises only with how long it has been silent
 *                            (`item.hours_silent`, or `item.status_at`/`item.at` against
 *                            `now`) and, once known, with `item.cost`.
 *       30     DECIDED       the system already chose something and is only telling you
 *                            (`kind: "decision_made"` — an "I chose X" FYI, not a question).
 *       10     FYI / DEFAULT `kind: "fyi"`, or anything `importance()` does not specifically
 *                            know — a note, a card that just updated, a landed task nobody
 *                            asked the owner about. Saying nothing about a row's urgency is
 *                            cheaper than guessing it into the Inbox. */
export const IMPORTANCE = {
	BLOCKER_BASE: 97, BLOCKER_MAX: 100,
	BLOCKED_BASE: 90, BLOCKED_MAX: 96,
	ASK_HOURS_FULL: 6,         // hours a live-blocked ask has sat that alone reaches the top of its band
	PLAIN_ASK_BASE: 40, PLAIN_ASK_MAX: 55,
	STALLED_BASE: 15, STALLED_MAX: 35,   // never ≥90 on its own (item B) — blocker_signal is the one way out
	STALLED_HOURS_FULL: 24,   // hours silent that alone reaches the top of the stalled band
	STALLED_COST_FULL: 20,    // dollars spent that alone reaches the top of the stalled band
	DECIDED: 30,
	FYI: 10,
	DEFAULT: 10,
	FRESH_FLOOR: 90, FRESH_MAX: 99, FRESH_HOURS: 24,   // "may show briefly… drops below 90 after about a day"
	PROMPT_FRESH_HOURS: 1,    // item C: a raw "You said…" row is "current" for about an hour, not a day
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

/** ⚠ NO TIMESTAMP IS NEVER "JUST NOW" — `Infinity`, not 0 (fixed while building the freshness
 *  lift below: a `place` line with no `at` at all used to read as 0 hours old, so `fresh_bonus()`
 *  scored it 99 forever, the opposite of what a missing timestamp should mean). Every caller
 *  below already clamps its own fraction with `Math.min(1, …)`, so `Infinity` safely becomes
 *  "as old as this ever gets" instead of quietly becoming "brand new". */
function hours_since(at, now){
	const t = at ? Date.parse(at) : NaN;
	if (!Number.isFinite(t)) return Infinity;
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

/** A LIVE-BLOCKED ask (an agent is actually waiting right now): 90-96, rising the longer it
 *  has sat. NEVER DECAYS with the row's overall age — it is pressing for as long as it stays
 *  open, which is exactly what `card_needs()` already stops listing once it is answered. */
function blocked_score(item, now){
	const frac = Math.min(1, hours_since(item?.at, now) / IMPORTANCE.ASK_HOURS_FULL);
	return Math.round(IMPORTANCE.BLOCKED_BASE + frac * (IMPORTANCE.BLOCKED_MAX - IMPORTANCE.BLOCKED_BASE));
}

/** A PLAIN ask (nobody confirmed to be blocked on it): the same "longer sat, higher" curve as
 *  `blocked_score()`, just capped under 90 — `from_live` is what actually moves a row into the
 *  pressing band, not how long it has waited. */
function plain_ask_score(item, now){
	const frac = Math.min(1, hours_since(item?.at, now) / IMPORTANCE.ASK_HOURS_FULL);
	return Math.round(IMPORTANCE.PLAIN_ASK_BASE + frac * (IMPORTANCE.PLAIN_ASK_MAX - IMPORTANCE.PLAIN_ASK_BASE));
}

/** THE FRESHNESS LIFT (INBOX ZERO's decay rule, the owner, 2026-09-30 16:35) — a straight line
 *  from `FRESH_MAX` right now down to `FRESH_FLOOR` at `window` hours old (`FRESH_HOURS` for
 *  most kinds, the shorter `PROMPT_FRESH_HOURS` for a raw "You said…" row — item C), then
 *  nothing: "a somewhat important thing that just happened may show briefly… after about a
 *  day it drops below 90." `importance()` below is what decides WHICH kinds ever get this —
 *  never a `stalled` row (item B), and never a row whose `at` is a `servex-heartbeat` notice,
 *  because that notice was never allowed to become the row's `at` in the first place
 *  (`is_heartbeat_line()` above, applied where `at` is computed: `inbox.js`, `groups.js`). */
function fresh_bonus(at, now, window = IMPORTANCE.FRESH_HOURS){
	const hours = hours_since(at, now);
	if (hours >= window) return 0;
	const frac = 1 - hours / window;
	return Math.round(IMPORTANCE.FRESH_FLOOR + frac * (IMPORTANCE.FRESH_MAX - IMPORTANCE.FRESH_FLOOR));
}

export function importance(item, now = Date.now()){
	const kind = item?.kind;
	// A blocker never decays — 100 when a live agent is also waiting on it, else 97.
	if (kind === "blocker" || blocker_signal(item)) return item?.from_live ? IMPORTANCE.BLOCKER_MAX : IMPORTANCE.BLOCKER_BASE;
	// item B: a stalled ask is never lifted by freshness — the owner has nothing to do about
	// one no matter how recently it stalled. `blocker_signal` above is the one way out.
	if (kind === "stalled") return stalled_score(item, now);
	if (kind === "decision" || kind === "question")
		return item?.from_live ? blocked_score(item, now) : Math.max(plain_ask_score(item, now), fresh_bonus(item?.at, now));
	if (kind === "decision_made") return Math.max(IMPORTANCE.DECIDED, fresh_bonus(item?.at, now));
	if (kind === "fyi") return Math.max(IMPORTANCE.FYI, fresh_bonus(item?.at, now));
	// item C, 2026-09-30: a raw "You said…" row — a voice transcription that never became a
	// real card (`inbox.js`'s own fallback title) — is "a current event" for a few minutes
	// (the owner's own words: dictating is something "I'm currently working on"), not for a
	// whole day like everything else's freshness lift — a row from hours ago (the owner's
	// 12:48 and 1:05 PM examples) is stale, not current. A `prompt` that DID become a real
	// card already shows up as that card (`kind: "card"`) instead, so this only ever catches
	// the orphaned ones, on `PROMPT_FRESH_HOURS` instead of the usual `FRESH_HOURS`.
	if (kind === "prompt") return Math.max(IMPORTANCE.DEFAULT, fresh_bonus(item?.at, now, IMPORTANCE.PROMPT_FRESH_HOURS));
	// Every other kind (card, note, landed, and anything not yet named): its own resting score
	// is the flat DEFAULT, lifted only while it is genuinely recent.
	return Math.max(IMPORTANCE.DEFAULT, fresh_bonus(item?.at, now));
}

/** THE REASON NEXT TO THE NUMBER (item 3, card-pipeline 2026-10-02 — the owner: "the items
 *  above 90 seem arbitrary") — which branch of `importance()`'s own rule actually produced a
 *  row's score, in five words. `top` is the highest-scoring OPEN need for this row
 *  (`card_needs()`'s own shape — `kind`, `ask`, `title`, `question`, `from_live`), or
 *  null/undefined when nothing is open at all; `item` is the row itself, read only for its own
 *  `kind`/`at` when `top` is empty (a plain card, a stalled ask, or just something recent).
 *  THE ONE FUNCTION — `ai2/rail.js`'s per-row reason and the card-pipeline task's own
 *  `audit-90.mjs` both call this (review, 2026-10-02: the first cut had two separate copies that
 *  had already drifted in wording — law 6, one of everything). */
export function reason_of(top, item, now = Date.now()){
	if (top){
		if (top.kind === "blocker" || is_blocker(top.title, top.question)) return "blocker word matched";
		if (top.kind === "decision" || top.kind === "question") return top.from_live ? "open ask, agent waiting" : "open ask, waiting on you";
		if (top.ask === "card") return "card typed \"question\", unanswered";
		if (top.ask === "last") return "last message ends in \"?\"";
	}
	if (item?.kind === "stalled") return "owner agent gone quiet";
	const hours = (now - Date.parse(item?.at ?? 0)) / 3600000;
	if (Number.isFinite(hours) && hours < 24) return "recently active";
	return "routine, resting score";
}
