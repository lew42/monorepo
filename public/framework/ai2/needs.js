import { div, span, small, a, p, h4, textarea, button } from "/app.js";
import { icon } from "/framework/core/View/View.js";
import { when, row } from "./faces.js";
import { append_card, static_cards, servex_base, servex_fetch } from "./inbox.js";
import { parse_lines } from "./fold.js";
import { card_needs, is_blocker, importance } from "./needs-rule.js";
import { fold_asks } from "../ai/asks/fold.js";

/**
 * NEEDS YOU — one ranked list of everything waiting on the owner, read off the
 * SAME card logs every other AI 2 view already reads (no new datastore, no
 * Servex change, per brief D), PLUS every STALLED line in the asks ledger
 * (`../ai/asks/fold.js`'s `fold_asks` — the one vocabulary Servex's own
 * `Asks.js` folds the same way, so the two can never disagree). The rule for
 * what counts as "open" lives in `needs-rule.js` (`card_needs`, `is_blocker`),
 * shared with brief E's rail filter and Servex's `list_waiting` tool; the rule
 * for HOW URGENT each one is lives right beside it (`importance()`), shared
 * with the Inbox's score badge and the asks ledger's own page.
 */

const AI_ROOT = new URL("../ai/", import.meta.url).pathname;
const read_text = url => fetch(url, { cache: "no-store" }).then(r => (r.ok ? r.text() : "")).catch(() => "");

/* ── the asks ledger's STALLED lines, shaped like a `card_needs()` row ─────────────────────
 * (asks-ledger/view, deliverable 2) so `need_row()` and `importance()` treat one exactly like
 * the other — one row renderer, one ranking rule, for both sources. */

const ASKS_URL = "/framework/ai/asks.jsonl";

function hours_since(at, now = Date.now()){
	const t = at ? Date.parse(at) : NaN;
	if (!Number.isFinite(t)) return 0;
	return Math.max(0, (now - t) / 3600000);
}

/** How long an ask has sat quiet, in words — shown on its row, and also handed to
 *  `importance()` as `hours_silent` so the row and its own score can never disagree. */
function silent_words(hours){
	if (hours < 1) return Math.round(hours * 60) + " min";
	if (hours < 48) return hours.toFixed(1) + " h";
	return Math.round(hours / 24) + " d";
}

/** A ledger path (e.g. "ai/2026-09-30/page-audit/owner-words.md") as a served url under
 *  `/framework/` — or `null` when it isn't served at all (`.claude/prompts/...`, the brief's
 *  own example of a words file to show as plain text instead of a dead link). */
function words_url(words){
	if (!words || words.startsWith(".claude/")) return null;
	return "/framework/" + String(words).replace(/^\/+/, "");
}

async function stalled_rows(){
	const text = await read_text(ASKS_URL);
	if (!text) return [];
	const folded = fold_asks(parse_lines(text));
	return Object.values(folded).filter(a => a.status === "stalled").map(ask => {
		const hours = hours_since(ask.status_at ?? ask.at);
		return {
			kind: "stalled",
			card: ask.card ?? null,
			ask: ask.id,
			title: ask.title || "Untitled ask",
			question: "Silent " + silent_words(hours) + (ask.why ? " — " + ask.why : ""),
			at: ask.status_at ?? ask.at,
			hours_silent: hours,
			owner: ask.owner,
			// A card to open when there is one; otherwise the ledger's own page, filtered to
			// exactly this row's group, so the row is never a dead click.
			url: ask.card ? "/framework/ai2/" + ask.card + "/" : "/framework/ai/asks/?status=stalled",
			words: ask.words,
			words_url: words_url(ask.words),
			control: null,
		};
	});
}

/** WHICH AGENTS ARE LIVE RIGHT NOW (asks-ledger/needs-rail, brief D's `item.from_live`) —
 *  `importance()` already reads this field on a question/decision row to score it 70+
 *  ("a blocking ask... whose asking agent is live"), but nothing set it until this. One
 *  Servex call, `GET /agents` (the same list `list_agents` answers): `working`, `idle` and
 *  `dormant` all count as "someone is sitting there waiting on this" — `stopped` and `gone`
 *  do not. Servex down, or the call fails for any reason: an empty set, so every row's
 *  `from_live` stays false rather than throwing — the same "leave it false" the brief asks for. */
async function live_agent_ids(){
	try {
		const res = await servex_fetch(servex_base() + "/agents");
		const rows = res.ok ? await res.json() : null;
		if (!Array.isArray(rows)) return new Set();
		return new Set(rows.filter(r => ["working", "idle", "dormant"].includes(r?.state)).map(r => r.id));
	} catch { return new Set(); }
}

/** Every open need across every (non-archived, non-done) card, PLUS every stalled ask, ranked
 *  by `importance()` — highest first, newest within a tie. `limit` caps how many card logs get
 *  fetched when Servex is down and this falls back to reading every card's file (brief: "the
 *  fastest working version first" — a card this old rarely still needs you). */
export async function scan_needs({ limit = 300 } = {}){
	const [card_rows, stalled, live_ids] = await Promise.all([
		waiting().then(served => served ?? file_scan(limit)),
		stalled_rows(),
		live_agent_ids(),
	]);
	const now = Date.now();
	return [...card_rows, ...stalled]
		.map(n => ({ ...n, from_live: n.from ? live_ids.has(n.from) : false }))
		.map(n => ({ ...n, score: importance(n, now) }))
		.sort((x, y) => y.score - x.score || Date.parse(y.at ?? 0) - Date.parse(x.at ?? 0));
}

/** The pre-Servex fallback: every card's own `page.jsonl`, read straight off the static site
 *  (production has no Servex at all). What `scan_needs()` used to do unconditionally. */
async function file_scan(limit){
	const cards = (await static_cards()) ?? [];
	const live = cards.filter(c => c.status !== "archived" && c.status !== "done")
		.sort((a, b) => Date.parse(b.last ?? b.created ?? 0) - Date.parse(a.last ?? a.created ?? 0))
		.slice(0, limit);
	const rows = await Promise.all(live.map(async c => {
		const text = await read_text(AI_ROOT + c.id + "/page.jsonl");
		if (!text) return [];
		return card_needs(c.id, parse_lines(text), c).map(n => ({ ...n, url: "/framework/ai2/" + c.id + "/" }));
	}));
	return rows.flat();
}

/* Servex's `GET /waiting` runs the same rule (`card_needs`, needs-rule.js) over every
   card and answers in ONE request. Reading each card's page.jsonl here instead was 300
   requests every 20 s on every AI 2 page (measured 09-29); that scan is now only the
   fallback when Servex is down (production, static). Null means "ask the files". */
async function waiting(){
	try {
		const res = await servex_fetch(servex_base() + "/waiting");
		const rows = res.ok ? await res.json() : null;
		return Array.isArray(rows) ? rows.map(n => ({ ...n, url: "/framework/ai2/" + n.card + "/" })) : null;
	} catch { return null; }
}

/* ── ONE SHARED SCAN, for the tab AND brief E's rail filter (contract: "one concept, one
 *    flag, one source of truth" — do not invent a second way to decide this). ── */
let state = { rows: [], ids: new Set(), ready: false };
const readers = new Set();
let timer = null, inflight = null;

function refresh(){
	if (inflight) return inflight;
	inflight = scan_needs().then(rows => {
		state = { rows, ids: new Set(rows.map(r => r.card)), ready: true };
		readers.forEach(fn => fn(state));
		return state;
	}).finally(() => { inflight = null; });
	return inflight;
}

/** Subscribe to the shared, live-ish need list — `fn(state)` at once (with whatever is known
 *  already) and again on every refresh. Polls gently (like `CardList`, `inbox.js`) while at
 *  least one reader is watching; `needs_soon()` asks for a refresh right now, right after this
 *  page's own write (choosing, answering) so the row leaves the list without waiting a poll. */
// The 20 s tick skips itself while the tab is hidden (2026-09-30 soak: this was
// one of several pollers running full speed forever behind a hidden tab) and
// catches up the moment it is looked at again.
const tick = () => { if (!document.hidden) refresh(); };

export function watch_needs(fn){
	readers.add(fn);
	fn(state);
	if (!timer){
		refresh();
		timer = setInterval(tick, 20000);
		document.addEventListener("visibilitychange", tick);
	}
	return () => {
		readers.delete(fn);
		if (!readers.size){ clearInterval(timer); timer = null; document.removeEventListener("visibilitychange", tick); }
	};
}

export const needs_soon = () => refresh();

/** ONE CARD'S OWN OPEN NEEDS (brief E's "Reviewed ✓" control, `card.js`) — read off the
 *  SAME shared scan every other reader here uses, never a second idea of "does this card
 *  still need the owner". Empty once nothing here is open on that card. */
export const needs_for = id => state.rows.filter(r => r.card === id);

/** An Inbox row's importance badge: its card's highest open need, or null when nothing is open.
 *  Lives here (not in inbox.js) so inbox.js never imports needs.js — needs.js imports inbox.js. */
export const score_for = id => { const open = needs_for(id); return open.length ? Math.max(...open.map(n => importance(n, Date.now()))) : null; };

/* ── the tab's own drawing ─────────────────────────────────────────────── */

const stamp = () => {
	const d = new Date(), off = -d.getTimezoneOffset(), p = n => String(Math.abs(n)).padStart(2, "0");
	return new Date(d.getTime() + off * 60000).toISOString().slice(0, 19) + (off < 0 ? "-" : "+") + p(Math.trunc(off / 60)) + ":" + p(off % 60);
};

/* "the ask/title, 5-8 words, not raw dictation" — the plain first sentence, cut short. Full
   words are still there in `title="…"` and behind the card link, never lost, just not the
   headline. */
function short_title(text){
	const words = String(text ?? "").replace(/\s+/g, " ").trim().split(" ");
	return (words.length > 9 ? words.slice(0, 8).join(" ") + "…" : words.join(" ")) || "Untitled";
}

const KIND_LABEL = { blocker: "Blocker", decision: "Decision", question: "Question", fyi: "Asked you", stalled: "Stalled" };
const KIND_ICON = { blocker: "block", decision: "fork_right", question: "help", fyi: "chat_bubble", stalled: "hourglass_disabled" };

function decision_control(n, on_done){
	let $err;
	div.c("ai2-need-options", () => {
		(n.options ?? []).forEach(o => {
			button.c("ai2-need-opt").attr("type", "button").attr("title", o.caveat ?? "")
				.text(o.say)
				.click(async () => {
					const res = await append_card(n.card, { chose: { decision: n.ask, option: o.say, at: stamp(), by: "owner" } });
					res?.ok ? on_done() : $err.el.hidden = false;
				});
		});
		$err = small.c("ai2-need-err muted").attr("hidden", "").text("Could not write that — is Servex running?");
	});
}

function reply_control(n, on_done){
	let $field, $err;
	div.c("ai2-need-reply", () => {
		$field = textarea.c("ai2-need-field").attr("placeholder", "Your answer…").attr("rows", "1")
			.on("keydown", e => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) go(); });
		button.c("ai2-need-send prim").attr("type", "button").text("Answer").click(go);
		$err = small.c("ai2-need-err muted").attr("hidden", "").text("Could not write that — is Servex running?");
	});
	async function go(){
		const text = $field.el.value.trim();
		if (!text) return;
		const res = await append_card(n.card, { answer: { question: n.ask, text, at: stamp(), by: "owner" } });
		res?.ok ? on_done() : $err.el.hidden = false;
	}
}

/* ONE BIG PLAIN LINE PER ITEM (mastermind's judged fix, 2026-09-29 — the first pass had this
   backwards): `n.title` is the SHORT one — the card's own title, "Add a git-safety hook?" — and
   `n.question` is the raw, often-long ask it was placed with, "May I add a hook in
   .claude/settings.json that…". The headline is the short title, plain (not a link-blue
   underline — the row's head anchor carries no default link style, `ai2.css`); the full question
   is one quiet line under it, never cut; the control sits at the right of the same row when it
   fits (`ai2.css`'s `.ai2-need` flex-wraps it below at a narrower width). */
/** Above 70 (the "blocking" bands and up) a row's score badge turns the error colour — the
 *  eye should read red only where the list actually means it. */
const SCORE_HOT = 70;

function need_row(n){
	let $row;
	$row = div.c("ai2-need ai2-need-" + n.kind, () => {
		a.c("ai2-need-head").href(n.url).append(() => {
			icon(KIND_ICON[n.kind] ?? "flag");
			div.c("ai2-need-body", () => {
				div.c("ai2-need-headline flex v-center gap-25", () => {
					// THE SCORE, ON EVERY ROW (brief D's own words) — `importance()`'s number,
					// attached by `scan_needs()` before this ever draws.
					span.c("ai2-need-score" + (n.score >= SCORE_HOT ? " ai2-need-score-hot" : ""))
						.attr("title", "importance " + n.score + "/100").text(String(n.score));
					if (n.kind === "blocker") span.c("ai2-need-blocker-flag").text("Blocker");
					span.c("ai2-need-title").text(n.title || short_title(n.question));
				});
				// The full ask, ONE quiet line (mastermind's judged fix, 2026-09-29: "one muted
				// line" — CSS truncates it with an ellipsis rather than wrapping to three or
				// four, which is most of why only ~6 items fit above the fold at 1920 instead
				// of the wanted 8-10; the whole sentence is still there in `title=`, and never
				// lost — it is also the card link's own visible text, one click away). Shown
				// only when it says more than the title already does (the "card" pseudo-ask's
				// `question` IS its `title`).
				if (n.question && n.question !== n.title)
					small.c("ai2-need-question muted").attr("title", n.question).text(n.question);
				small.c("ai2-need-meta muted")
					.text([KIND_LABEL[n.kind], n.owner ? "owner " + n.owner : null, when(n.at)].filter(Boolean).join(" · "));
				// A stalled ask's own two links (deliverable 2): its card (already the row's
				// own head link, when it has one) and its words — a second line, since a
				// card-having ask's head link is already spent on the card.
				if (n.kind === "stalled" && (n.words_url || n.words)) div.c("ai2-need-words flex wrap gap-25", () => {
					if (n.words_url) a.c("ai2-link page-link").href(n.words_url).text("its words");
					else small.c("muted").text(n.words);   // .claude/prompts/... isn't served — shown as plain text
				});
			});
		});
		div.c("ai2-need-control", () => {
			if (n.control === "decision" && n.options?.length) decision_control(n, remove);
			else if (n.control === "reply") reply_control(n, remove);
		});
	});
	function remove(){ $row.el.remove(); needs_soon(); }
}

/** A click on a link whose ONLY difference from here is the query string (`?v=1`,
 *  `?need=…`). The Router's own `go()` would push the url but never redraw — same
 *  pathname, same page object, so `activate()` finds nothing changed and no-ops
 *  (`core/Router/doc/decisions.md`) — so THIS PAGE manages its own query-string
 *  navigation: push the entry ourselves, then run whichever redraw the caller hands in. */
function go_query(e, url, redraw){
	if (e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;   // new tab etc. — let the browser do it
	e.preventDefault();
	history.pushState({}, "", url);
	redraw();
}

const rail_url = root => new URL(root.url, location.origin).pathname;
function v1_url(root){
	const u = new URL(root.url, location.origin);
	u.searchParams.set("v", "1");
	return u.pathname + u.search;
}

/** The whole tab, THE OLD SHAPE (deliverable 1: "keep v1" — every row a big answer box,
 *  reachable forever at `?v=1`, never destroyed). One small link at the top goes to the
 *  new rail view, the mirror of that view's own "list view" link back here — neither one
 *  is a dead end. */
function v1_view(root, redraw){
	let $box;
	const $root = div.c("ai2-needs-list", () => {
		a.c("ai2-word ai2-need-raillink").href(rail_url(root)).text("rail view ↗")
			.click(e => go_query(e, rail_url(root), redraw));
		$box = div.c("ai2-needs-rows");
	});
	const draw = s => $box.empty(() => {
		if (!s.ready) return void small.c("muted").text("Reading the cards…");
		if (!s.rows.length) return void span.c("ai2-needs-empty").text("Nothing needs you");
		s.rows.forEach(n => need_row(n));
	});
	// ⚠ No unsubscribe: the AI 2 root page's content() runs once and never tears down, same as
	// `board()`'s own log subscriptions just below it in page.js.
	watch_needs(draw);
	return $root;
}

/* ── v2, THE DEFAULT — the rail + a detail pane (asks-ledger/needs-rail, the owner,
 * 2026-09-30: "Needs you should look like the Inbox") ──────────────────────────────── */

const NEED_PARAM = "need";
const current_need = () => new URLSearchParams(location.search).get(NEED_PARAM) || null;

/** One row's key, and the `?need=` value it is addressed by: `<card>/<ask>` for an
 *  ordinary open need, `ask:<ask id>` for a stalled ledger ask (deliverable 3's own
 *  two shapes — a stalled ask often has no card at all, so it can't share the first). */
function need_key(n){ return n.kind === "stalled" ? "ask:" + n.ask : (n.card ?? "") + "/" + n.ask; }
function need_url(root, n){
	const u = new URL(root.url, location.origin);
	u.searchParams.set(NEED_PARAM, need_key(n));
	return u.pathname + u.search;
}
/** The row this key names, or the top-ranked row when there is no key yet or it
 *  matches nothing any more (deliverable 3: "with nothing selected, the first row
 *  opens" — also what happens once the row a stale link pointed at has been answered
 *  and dropped off the list). */
function find_need(rows, key){
	if (key){ const found = rows.find(n => need_key(n) === key); if (found) return found; }
	return rows[0] ?? null;
}

/** The rail row's one quiet line (deliverable 2): the kind, in words — except a
 *  stalled ask, which says who it is waiting on and how long instead, the two facts
 *  the owner actually needs to decide whether to go chase it. */
function rail_sub(n){
	if (n.kind === "stalled") return [n.owner ? "owner " + n.owner : null, "silent " + silent_words(n.hours_silent)].filter(Boolean).join(" · ");
	return KIND_LABEL[n.kind] ?? "";
}
/** Shaped for `faces.js`'s own `row()` — the SAME row function, classes, width, row
 *  height, padding and icon size the Inbox draws with (deliverable 2's own words). No
 *  `progress`/`usd`: `meter()` draws nothing when both are unset, so this never grows
 *  the answer-box-shaped bar an Inbox card gets. */
const rail_item = n => ({ icon: KIND_ICON[n.kind] ?? "flag", score: n.score, title: n.title || short_title(n.question), at: n.at, sub: rail_sub(n) });

/** ONE ITEM, WHOLE — the detail pane's own content (deliverable 3): the full question
 *  and its control for an ordinary need, or the stalled-ask facts (owner, why, how
 *  long, and the three links) for a ledger row. `on_done` is what happens after the
 *  control writes an answer — `needs_soon()`, the same "ask again right now" this
 *  module already exports for exactly this. */
function detail_content(n, on_done){
	div.c("ai2-need-detail-head flex v-center gap-25", () => {
		icon(KIND_ICON[n.kind] ?? "flag");
		span.c("ai2-need-score" + (n.score >= SCORE_HOT ? " ai2-need-score-hot" : ""))
			.attr("title", "importance " + n.score + "/100").text(String(n.score));
		if (n.kind === "blocker") span.c("ai2-need-blocker-flag").text("Blocker");
		span.c("ai2-need-title").text(n.title || short_title(n.question));
	});
	p.c("ai2-need-detail-question").text(n.question || n.title);

	if (n.kind === "stalled"){
		small.c("ai2-need-meta muted")
			.text([n.owner ? "owner " + n.owner : null, "silent " + silent_words(n.hours_silent)].filter(Boolean).join(" · "));
		div.c("ai2-need-words flex wrap gap-25", () => {
			if (n.card) a.c("ai2-link page-link").href("/framework/ai2/" + n.card + "/").text("its card");
			if (n.words_url) a.c("ai2-link page-link").href(n.words_url).text("its words");
			else if (n.words) small.c("muted").text(n.words);   // .claude/prompts/... isn't served — shown as plain text
			a.c("ai2-link page-link").href("/framework/ai/asks/").text("the asks ledger");
		});
		return;
	}

	small.c("ai2-need-meta muted")
		.text([KIND_LABEL[n.kind], n.owner ? "owner " + n.owner : null, when(n.at)].filter(Boolean).join(" · "));
	div.c("ai2-need-control", () => {
		if (n.control === "decision" && n.options?.length) decision_control(n, on_done);
		else if (n.control === "reply") reply_control(n, on_done);
	});
	if (n.card) div.c("ai2-need-words flex wrap gap-25", () => {
		a.c("ai2-link page-link").href("/framework/ai2/" + n.card + "/").text("its card");
	});
}

/** THE RAIL + DETAIL PANE — v2, the default. Same shapes the Inbox already built:
 *  `.ai2` is the two-column grid (rail | detail), `.ai2-rail`/`.ai2-rows`/`.ai2-row`
 *  are its own row chrome — reused, not reinvented, so the rail is exactly as wide
 *  and each row exactly as tall as the Inbox's own. What differs from the Inbox: the
 *  rows are RANKED by `importance()` instead of newest-first, there is no composer or
 *  "+ New card" (nothing here is a conversation), and the selection lives in `?need=`
 *  instead of a path segment (`need_url()`/`go_query()` above say why a plain routed
 *  `<a>` can't do this the way an Inbox card's own address does).
 *
 *  ⚠ Row clicks do NOT go through `redraw` (the shell's full remount, below) — that
 *  would open a fresh `watch_needs()` subscription on every single row you read,
 *  and this page's own subscriptions never unsubscribe (the comment on `v1_view()`'s
 *  `watch_needs` call says why: the AI 2 root page's `content()` never tears down).
 *  Ten rows read in a row would be ten pollers left running forever in the tab. This
 *  view opens exactly ONE subscription for its whole lifetime and redraws itself in
 *  place for every row click; only the rare v1 ⇄ v2 toggle goes through `redraw`. */
function needs_rail_view(root, redraw){
	let $rows, $body, rows = [], sel = current_need(), row_els = new Map();
	const open_mobile = !!sel;

	const $root = div.c("ai2 ai2-need-v2" + (open_mobile ? " ai2-need-open" : ""), () => {
		div.c("ai2-rail", () => {
			div.c("ai2-top ai2-need-top flex v-center gap-25", () => {
				h4.c("ai2-rail-name", () => span("Needs you"));
				a.c("ai2-word").href(v1_url(root)).text("list view").click(e => go_query(e, v1_url(root), redraw));
			});
			$rows = div.c("ai2-rows ai2-need-rows");
		});
		div.c("ai2-detail ai2-need-detail", () => {
			a.c("ai2-back ai2-need-back page-link").href(rail_url(root)).text("← Needs you")
				.click(e => { e.preventDefault(); $root.el.classList.remove("ai2-need-open"); });
			$body = div.c("ai2-need-detail-body");
		});
	});

	function select(n){
		sel = need_key(n);
		$root.el.classList.add("ai2-need-open");
		history.pushState({}, "", need_url(root, n));
		mark_active();
		draw_detail();
	}

	function mark_active(){
		row_els.forEach((el, key) => el.classList.toggle("active", key === sel));
	}

	// `sel` moves to whatever actually drew (deliverable 3: "with nothing selected, the
	// first row opens") — so the row the pane is showing is always the one `mark_active()`
	// highlights, even after the row `sel` used to name got answered and dropped away.
	//
	// ⚠ A ONE-QUESTION PANE IS SHORT, AND A 3440 SCREEN IS WIDE (`layout` skill: "give it
	// several columns... a layout check flags wasted space" — measured here: the pane alone
	// was 85% empty at 3440, the exact "60% empty" complaint deliverable 1 exists to fix,
	// just moved from the rail into the pane). So the pane also shows what else is waiting,
	// as a grid of the SAME compact row (`rail_item()`/`row()`) the rail itself draws — more
	// columns of it at a wider screen, never a wider empty margin around one short answer.
	function draw_detail(){
		const n = find_need(rows, sel);
		if (n) sel = need_key(n);
		$body.empty(() => {
			if (!n) return void small.c("muted").text("Nothing needs you right now.");
			detail_content(n, needs_soon);
			const rest = rows.filter(r => r !== n);
			if (rest.length) div.c("ai2-need-next", () => {
				small.c("ai2-need-next-head muted").text("Also waiting");
				div.c("ai2-need-next-grid", () => {
					rest.forEach(other => {
						a.c("ai2-row ai2-need-next-item").href(need_url(root, other)).append(() => row(rail_item(other)))
							.click(e => { if (e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return; e.preventDefault(); select(other); });
					});
				});
			});
		});
	}

	function draw(state){
		rows = state.rows;
		row_els = new Map();
		$rows.empty(() => {
			if (!state.ready) return void small.c("muted").text("Reading the cards…");
			if (!rows.length) return void span.c("ai2-needs-empty").text("Nothing needs you");
			rows.forEach(n => {
				const $a = a.c("ai2-row").href(need_url(root, n)).append(() => row(rail_item(n)));
				row_els.set(need_key(n), $a.el);
				$a.click(e => { if (e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return; e.preventDefault(); select(n); });
			});
		});
		draw_detail();
		mark_active();
	}

	// ⚠ Same "no unsubscribe" as `v1_view()` — one subscription for this view's whole
	// lifetime; see the comment above this function for why row clicks never open another.
	watch_needs(draw);
	return $root;
}

/** THE MOUNT (page.js's Needs-you tab): picks v1 or v2 off `?v=1`, in a container this
 *  file owns completely so a toggle between them is a redraw, never a Router navigation
 *  (deliverable 1: v1 stays reachable; deliverable 2: v2 — the rail — is the default). */
export function needs_shell(root){
	let $mode;
	const $root = div.c("ai2-needs-shell-v", () => { $mode = div.c("ai2-needs-mode"); });
	const is_v1 = () => new URLSearchParams(location.search).get("v") === "1";
	let showing = null;

	function render(){
		showing = is_v1() ? "v1" : "v2";
		$mode.empty(() => { showing === "v1" ? v1_view(root, render) : needs_rail_view(root, render); });
	}

	render();
	// Back/Forward across the `?v=` or `?need=` toggle: `Router.popped()` only reloads when
	// the PATHNAME moves (`core/Router/Router.js`), so a query-only history step never
	// reaches it — this page's own popstate is the only thing that hears it. A full
	// `render()` (never a lighter "just move the selection") is the simple, correct
	// answer here: Back is rare, unlike a row click, which `needs_rail_view()`'s own
	// comment explains must NOT go through this path.
	addEventListener("popstate", render);
	return $root;
}

export default needs_shell;
