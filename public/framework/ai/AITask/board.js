import { div, h4, span } from "../../core/View/View.js";
import { card } from "./card.js";

/* The board as one list on a time spine — a card per row, newest first, and a
   heading only where the label CHANGES. Today reads as a run of times; every
   past day collapses into a single weekday. */

const day_of = url => url.split("/").filter(Boolean).at(-2);
const stamp = t => t.m?.landed_at ?? t.m?.requested_at ?? "";

/* ⚠ Parsed, never string-compared: logs carry both `…T17:22:30.464Z` and
   `…T12:22:30-05:00`, and as text the UTC one sorts an afternoon late. The day
   dir leads, so a task with no timestamp still files under the day that holds it. */
const at = t => Date.parse(stamp(t)) || 0;
export const newest = (x, y) => day_of(y.url).localeCompare(day_of(x.url)) || at(y) - at(x);

// ⚠ `new Date("2026-08-15")` is UTC midnight, which west of Greenwich renders as
// the day before. Build the date from its parts.
const local = ymd => { const [y, m, d] = ymd.split("-").map(Number); return new Date(y, m - 1, d); };

const today = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };

const TIME = { hour: "numeric", minute: "2-digit" };
const WEEKDAY = { weekday: "long" };
const WEEKDAY_DATE = { weekday: "long", month: "short", day: "numeric" };

// A weekday name alone names two different days once a week has gone by.
function heading(t){
	const day = local(day_of(t.url)), now = today();
	if (+day === +now) return stamp(t) ? new Date(stamp(t)).toLocaleTimeString([], TIME) : "TODAY";
	return day.toLocaleDateString([], (now - day) / 864e5 > 6 ? WEEKDAY_DATE : WEEKDAY).toUpperCase();
}

/** Cards in the order given, one per row. */
export const list = rows => div.c("ai-list", () => rows.forEach(t => card(t)));

/** The same list on its time spine — newest first, headed wherever the clock turns over. */
export function dated(rows){
	let last;

	return div.c("ai-list", () => [...rows].sort(newest).forEach(t => {
		const label = heading(t);
		if (label !== last) h4.c("ai-when muted", label);
		last = label;
		card(t);
	}));
}

/** A titled run of cards — the day's states, the index's Active. */
export const group = (title, rows, render = list) => div.c("ai-group", () => {
	div.c("ai-group-title muted", () => { span(title); span.c("ai-count", " " + rows.length); });
	render(rows);
});

export default dated;
