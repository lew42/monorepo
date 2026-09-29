import { div, span, small, a, textarea, button } from "/app.js";
import { icon } from "/framework/core/View/View.js";
import { when } from "./faces.js";
import { append_card, static_cards } from "./inbox.js";
import { parse_lines } from "./fold.js";
import { card_needs, is_blocker } from "./needs-rule.js";

/**
 * NEEDS YOU — one ranked list of everything waiting on the owner, read off the
 * SAME card logs every other AI 2 view already reads (no new datastore, no
 * Servex change, per brief D). The rule for what counts as "open" lives in
 * `needs-rule.js` (`card_needs`, `is_blocker`), shared with brief E's rail
 * filter and Servex's `list_waiting` tool, so they can never disagree.
 */

const AI_ROOT = new URL("../ai/", import.meta.url).pathname;
const read_text = url => fetch(url, { cache: "no-store" }).then(r => (r.ok ? r.text() : "")).catch(() => "");

/** Every open need across every (non-archived, non-done) card, ranked: a blocker first, then a
 *  decision or question, an FYI last; newest within each group. `limit` caps how many card logs
 *  get fetched, so a very large board still answers quickly (brief: "the fastest working version
 *  first" — a card this old rarely still needs you). */
export async function scan_needs({ limit = 300 } = {}){
	const cards = (await static_cards()) ?? [];
	const live = cards.filter(c => c.status !== "archived" && c.status !== "done")
		.sort((a, b) => Date.parse(b.last ?? b.created ?? 0) - Date.parse(a.last ?? a.created ?? 0))
		.slice(0, limit);
	const rows = await Promise.all(live.map(async c => {
		const text = await read_text(AI_ROOT + c.id + "/page.jsonl");
		if (!text) return [];
		return card_needs(c.id, parse_lines(text), c).map(n => ({ ...n, url: "/framework/ai2/" + c.id + "/" }));
	}));
	const RANK = { blocker: 0, decision: 1, question: 1, fyi: 2 };
	return rows.flat().sort((x, y) => (RANK[x.kind] ?? 3) - (RANK[y.kind] ?? 3) || Date.parse(y.at ?? 0) - Date.parse(x.at ?? 0));
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
export function watch_needs(fn){
	readers.add(fn);
	fn(state);
	if (!timer){ refresh(); timer = setInterval(refresh, 20000); }
	return () => { readers.delete(fn); if (!readers.size){ clearInterval(timer); timer = null; } };
}

export const needs_soon = () => refresh();

/** ONE CARD'S OWN OPEN NEEDS (brief E's "Reviewed ✓" control, `card.js`) — read off the
 *  SAME shared scan every other reader here uses, never a second idea of "does this card
 *  still need the owner". Empty once nothing here is open on that card. */
export const needs_for = id => state.rows.filter(r => r.card === id);

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

const KIND_LABEL = { blocker: "Blocker", decision: "Decision", question: "Question", fyi: "Asked you" };
const KIND_ICON = { blocker: "block", decision: "fork_right", question: "help", fyi: "chat_bubble" };

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

function need_row(n, on_done){
	div.c("ai2-need ai2-need-" + n.kind, $row => {
		a.c("ai2-need-head").href(n.url).append(() => {
			icon(KIND_ICON[n.kind] ?? "flag");
			div.c("ai2-need-body", () => {
				span.c("ai2-need-line").text(short_title(n.question || n.title));
				small.c("ai2-need-meta muted").text([KIND_LABEL[n.kind], n.title, when(n.at)].filter(Boolean).join(" · "));
			});
		});
		if (n.control === "decision" && n.options?.length) decision_control(n, () => remove($row));
		else if (n.control === "reply") reply_control(n, () => remove($row));
	});
	function remove($row){ $row.el.remove(); needs_soon(); }
}

/** The whole tab: nothing but the ranked list (deliverable 1 — "nothing else on the tab"). */
export function needs_view(){
	let $box;
	const $root = div.c("ai2-needs-list", () => { $box = div.c("ai2-needs-rows"); });
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

export default needs_view;
