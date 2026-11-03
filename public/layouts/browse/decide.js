/* ── THE DECISION BOX — Approve/Improve, and the verdict as it stands ────────────
   Shared by /layouts/browse/ (the wall) and /layouts/explorer/ (the single view) —
   one verdict store, one key function, one box, so a press on either page shows up
   on the other with no extra wiring (the owner, 2026-10-03, roadmap item 7: "put
   the Approve/Improve buttons and the verdict on the explorer's centre ... keep
   browse as the wall view of the same verdicts"). Moved out of browse/page.js,
   which used to define this box for itself alone (Law 6 — one of everything).

   Needs the dev server AND the dev rail's edit switch (`verdicts.writable()`) to
   write — reading always works, off localhost too, same as `verdicts.js` itself. */

import { div, span, b, p, a, button, input, icon, View } from "/app.js";
import { verdicts } from "./verdicts.js";

View.stylesheet(import.meta, "browse.css");

export { verdicts };

/* ── THE KEY ── a wire id (the twelve layout-standard drawings have no real page
   of their own, so they keep their short catalogue id) or a real page's own url —
   the SAME key `ext/Ask`'s corner control writes when the owner approves a page
   from the page itself (mastermind decision `verdict-keyspace`, 2026-09-18), so a
   verdict cast from the page, from browse, or from explorer never disagrees about
   which item it was cast on. `real_url` is `browse/page.js`'s own rename of a raw
   `items.json` entry's `url` (`Page` already reserves `.url`); explorer's nodes
   never needed the rename, so `node.url` alone covers them. */
export const vkey = item => item.wire ? item.id : (item.real_url ?? item.url);

/* ── LIVE BOXES ── a verdict cast in this window, in another one, or on the item's
   own page, arrives off the dev socket as one line, and every box registered here
   redraws itself. Off localhost there is no socket and the marks are simply
   whatever the file said when the page loaded. */
const boxes = new Set();

verdicts.watch(() => boxes.forEach(box => {
	if (!box.$box.el.isConnected) return void boxes.delete(box);
	box.$box.empty(() => { box.draw(); });
}));

// Fired at module eval: a socket that is already warm by the time anything asks
// for it costs nothing more to start early.
verdicts.load();

export function live($box, draw){
	boxes.add({ $box, draw });
	$box.empty(() => { draw(); });
	return $box;
}

/* ── THE DECISION BOX — the verdict as it stands, and the two buttons that change
   it, in the one box on the page. Call once per item; it keeps itself current. */
export function decide(item){
	return live(div.c("std-browse-decide"), () => {
		verdict_line(item);
		acts(item);
	});
}

function verdict_line(item){
	const verdict = verdicts.latest(vkey(item));

	return div.c("std-browse-verdict", () => {
		if (verdict){
			span.c("std-browse-mark is-" + verdict.say, () => { icon(verdict.say === "approve" ? "check_circle" : "edit"); });
			b(verdict.say === "approve" ? "Approved" : "To improve");
			if (verdict.note) span(verdict.note);
			span.c("std-browse-when", when(verdict.at));
			return;
		}

		span.c("std-browse-said", "No verdict cast here yet.");
		if (item.badge) span.c("std-browse-said muted", "It was " + item.badge + ", before this page existed.");
	});
}

function acts(item){
	if (!verdicts.writable())
		return void p.c("std-browse-said muted", "Approve and Improve write a line to `verdicts.jsonl` through the dev server, so they only appear on localhost with the dev rail's edit switch on. Everything above is read from the same file and works anywhere.");

	return div.c("std-browse-acts", $acts => {
		button.c("btn", () => { icon("check"); span("Approve"); })
			.on("click", () => press($acts, item, "approve", ""));

		button.c("btn", () => { icon("edit"); span("Improve"); })
			.on("click", () => note($acts, item));
	});
}

// IMPROVE, pressed: the row becomes a one-line field, in place. A control that
// pushes the page down when you press it reads as a mistake.
function note($acts, item){
	let $field;

	$acts.empty(() => {
		$field = input.c("std-browse-note")
			.attr("type", "text")
			.attr("placeholder", "What has to change? One line.")
			.on("keydown", event => { if (event.key === "Enter") press($acts, item, "improve", $field.el.value.trim()); });

		button.c("btn", () => { icon("send"); span("Save"); })
			.on("click", () => press($acts, item, "improve", $field.el.value.trim()));

		// `href` is decorative — the click is always prevented — but an `<a>` reads
		// as interactive to assistive tech the way a plain span doesn't; `item.url`
		// is this item's own page when it has one (browse), "#" when it doesn't
		// (explorer's wire-only nodes).
		a.c("std-browse-said muted").href(item.url || "#")
			.on("click", event => { event.preventDefault(); $acts.empty(() => { acts_in($acts, item); }); })
			.append(() => { span("cancel"); });
	});

	$field.el.focus();
}

// The two buttons again, after a cancel — the same pair `acts()` builds, without
// rebuilding the row that holds them.
function acts_in($acts, item){
	button.c("btn", () => { icon("check"); span("Approve"); })
		.on("click", () => press($acts, item, "approve", ""));

	button.c("btn", () => { icon("edit"); span("Improve"); })
		.on("click", () => note($acts, item));
}

// A PRESS. The row says "saving" and then does nothing more: the appended line
// comes back off the dev socket, every live box redraws, and this whole row is
// rebuilt from the file. One code path, and the server is the only orderer.
function press($acts, item, say, text){
	$acts.empty(() => { span.c("std-browse-said muted", "saving…"); });

	verdicts.say(vkey(item), say, text).catch(error => {
		$acts.empty(() => {
			span.c("std-browse-said", "That did not save: " + error.message);
			button.c("btn", "Try again").on("click", () => press($acts, item, say, text));
		});
	});
}

// A verdict's timestamp, as a reader reads one: the date, and the time of day.
export function when(at){
	const date = new Date(at);
	return isNaN(date) ? String(at) : date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

/* ── THE MARK — a check when the newest verdict approves, a pen when it asks for a
   change, nothing when the owner has not looked yet (nothing is the honest picture
   of "not judged" — a grey dot on every card would read as a state the owner put
   there). Its own small `live()` box, so it updates itself without a wall rebuild. */
export function mark(item){
	const $mark = span.c("std-browse-mark");
	return live($mark, () => draw_mark($mark, item));
}

function draw_mark($mark, item){
	$mark.rc("is-approve is-improve");

	const verdict = verdicts.latest(vkey(item));
	if (!verdict) return;

	$mark.ac("is-" + verdict.say).attr("title", verdict.say === "approve" ? "Approved" : "To improve: " + (verdict.note || "no note"));
	icon(verdict.say === "approve" ? "check_circle" : "edit");
}

/* ── THE APPROVED LIST — roadmap item 7's fourth deliverable: "an approved list
   that page reviews check against." One async read of the same file every card
   already reads, filtered to the newest verdict on each id being "approve" — so
   a page review (`Server/review.mjs`, `layout-check.mjs`, or any future tool) can
   ask "is this id on the approved list?" without duplicating the verdict store.
   `ids`, if given, narrows the list to just those (browse's own tier strip already
   does this filtering by hand — `verdicts.approved(ids)` does the count; this does
   the list); omitted, every id with ANY verdict cast gets checked, which only
   ever returns ids that this page itself knows about (nothing crawls). */
export async function approved_list(ids){
	await verdicts.load();
	const all = verdicts.rows().map(row => row.item);
	const candidates = ids ?? [...new Set(all)];
	return candidates.filter(id => verdicts.latest(id)?.say === "approve");
}
