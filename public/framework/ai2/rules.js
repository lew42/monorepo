import { archive_card, append_card, is_folder_id } from "./inbox.js";
import { needs_for } from "./needs.js";

/**
 * RULES — read/unread, archiving a row, and automatic resolution, all three
 * together in one small file (the mastermind's own correction, 2026-09-30:
 * "a later task carries this module elsewhere wholesale" — so it is kept as
 * one clean piece on purpose, not spread across `inbox.js`/`card.js`). No DOM
 * here — the row (`faces.js`) and the shell (`page.js`) call these and draw
 * the result; this file only decides.
 */

/* ── read / unread ──────────────────────────────────────────────────────
 * TWO WAYS IN, per this task's own brief: pressing the row's dot (`faces.js`),
 * and opening the card (`card.js`'s `activated()`) — "opening a row marks it
 * read", the brief's own words. ⚠ This is NOT the 2026-09-22 decision
 * `inbox.js`'s `Says` class still documents — that one was a SHARED `read`
 * line (`verdicts.jsonl`) that made a row vanish for every viewer the moment
 * anyone opened it, and the owner's answer was "No no no. I need them all
 * unread again." This is a per-BROWSER `localStorage` flag that only un-bolds
 * a title; the row itself never moves or disappears, and nobody else's copy
 * changes. The two ideas share a word, not a behaviour.
 *
 * Stored in THIS BROWSER only (`localStorage`, wrapped in try/catch the same
 * way `page.js`'s own `store` already is — a private window or blocked site
 * data must not stop the rail from drawing). No Servex write, no new schema:
 * the smallest version that is still a real, remembered toggle, matching the
 * brief's "usage is over pace, don't refactor beyond it." */
const READ_KEY = "ai2-read-ids";

function read_set(){
	try { return new Set(JSON.parse(localStorage.getItem(READ_KEY) ?? "[]")); }
	catch { return new Set(); }
}
function save_read(set){
	try { localStorage.setItem(READ_KEY, JSON.stringify([...set])); } catch {}
}

export function is_read(id){ return read_set().has(id); }

export function mark_read(id, val = true){
	const set = read_set();
	val ? set.add(id) : set.delete(id);
	save_read(set);
}

/* ── archive, straight from the row ─────────────────────────────────────
 * THE SAME WRITE a card's own page already makes with its "clear" button
 * (`on.clear`, `page.js`) — never a second idea of what archiving means.
 * `is_folder_id` (inbox.js) tells a card folder (`2026/09/24/...`, only
 * Servex writes into it) from an old board-born card (`topic-...`, its own
 * RPC straight onto `board.jsonl`); each writes through the route it already
 * had. "Nothing is ever deleted" (inbox.js) — this only sets `status`. */
export async function archive_row(it){
	return is_folder_id(it.id) ? append_card(it.id, { status: "archived", by: "owner" }) : archive_card(it.id);
}

/* ── automatic resolution ─────────────────────────────────────────────────
 * THE RULE (brief D, written down here, the one place — nowhere else decides
 * this): a row resolves — leaves the Inbox by itself, no button pressed —
 * for exactly three facts, each already true elsewhere before this file
 * named it:
 *   1. "a card marked done"        → its own `status` is "done".
 *   2. "a task landed or stopped"  → it is a `kind: "landed"` row (`inbox.js`
 *                                    only makes one once the task already has).
 *   3. "an ask answered / a question replied to" → a `type: "question"` or
 *      `"task"` card (the only card types that ever carry a Decision or
 *      Question) with nothing left open on `needs-rule.js`'s shared scan.
 * ⚠ 2026-09-30 FIX (review finding #2): the first cut of this function was
 * `needs_for(it.id).length === 0`, full stop — true for almost every plain
 * card and "You said…" row, since NOTHING ever asked about them either, so
 * it dimmed most of the rail. `needs_for()` only answers "anything open on
 * it RIGHT NOW" — it cannot tell "never asked" from "asked, now answered"
 * apart, so it is only trusted here for the card TYPES that can actually
 * carry an ask. Archived and the Live card are never "resolved" — archived
 * already has its own word, and the Live card is never a thing you resolve. */
export function is_resolved(it){
	if (it.kind === "live" || it.status === "archived") return false;
	if (it.status === "done") return true;
	if (it.kind === "landed") return true;
	if (it.kind !== "card" || !["question", "task"].includes(it.type)) return false;
	return needs_for(it.id).length === 0;
}
