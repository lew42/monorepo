import { a, div, span } from "../../core/View/View.js";

/**
 * NEEDS YOU — the handful of things only the owner can do, shortest first.
 *
 * A bot can do almost everything on this site. It cannot log into Cloudflare,
 * it cannot pay for an account, and it cannot press deploy. When a run hits one
 * of those, the whole thread behind it stops — so that one sentence outranks
 * every card on the board, and it has to say how long it will take, because
 * "five minutes" and "an afternoon" are different decisions.
 *
 * An **ask** or a **decision** says so by carrying `needs`:
 *
 *     {"ask": {"id": "sqlite-status", …,
 *              "needs": {"owner": "Cloudflare login and wrangler d1 create",
 *                        "minutes": 5}}}
 *
 * Every one of them renders as one line: the minutes, what it is, and a link to
 * the work waiting on it. Shortest first, because the five-minute ones are the
 * ones that get done. A line disappears on its own — an ask's when the ask
 * lands, a decision's when the owner has answered it — so nothing has to be
 * crossed off by hand. See `doc/ranking.md`.
 */

/**
 * IS THE OWNER STILL BEING WAITED ON?
 *
 * The off switch is `needs.done` — one date, stamped by a later line on the
 * same id, and the line goes.
 *
 * ⚠ It is NOT the ask's own `status`, and the ask this was built against is
 *   exactly why. `sqlite-status` is marked **landed** — the scout finished its
 *   report — while the owner has still never logged into Cloudflare, which is
 *   the whole thing the thread is stopped on. An ask's status says what the
 *   BOT's half of the work is doing; `needs.done` says what the OWNER's half is
 *   doing, and reading one off the other loses the item you most needed to see.
 *
 * A decision has a second, free off switch: a verdict. "Say whether ranking
 * should stay a drag" is answered by pressing Approve or Improve on it, which
 * moves its status off `open` — so nothing has to be stamped twice.
 */
const open_ask = ask => !ask.needs.done;
const open_decision = d => !d.needs.done && (d.status ?? "open") === "open";

/* The page a reader should land on to actually do the thing: the task doing the
   work, or failing that the log that wrote the line down. */
const work = (item, base) => {
	const day = base.replace(/[^/]+\/$/, "");
	const slug = item.tasks?.[0];
	return slug ? { url: day + slug + "/", label: slug } : { url: base, label: base.split("/").filter(Boolean).at(-1) };
};

/**
 * Every owner item in one task's log.
 *
 * @param m    a TaskJSONL
 * @param base that task's dir url, e.g. `/framework/ai/2026-09-17/run/`
 */
export function needs_of(m, base){
	if (!m) return [];

	const from = (rows, keep) => (rows ?? [])
		.filter(row => row.needs?.owner && keep(row))
		.map(row => ({ what: row.needs.owner, minutes: row.needs.minutes, id: row.id, ...work(row, base) }));

	return [...from(m.asks, open_ask), ...from(m.decisions, open_decision)].sort(soonest);
}

/* Shortest first — and an item that never said how long it would take goes
   last, because an unknown cost is not a five-minute one. */
const soonest = (x, y) => (x.minutes ?? 1e9) - (y.minutes ?? 1e9);

/** Every owner item across a whole board's worth of tasks, shortest first. */
export const needs_all = rows => rows.flatMap(row => needs_of(row.m, row.url)).sort(soonest);

/* One line. The minutes lead: this is a list you scan for "what can I clear
   right now", and the number is the answer to that question. */
function line(item){
	// ⚠ No `gap` utility here — the row's spacing is in its own em (`ai.css`).
	div.c("ai-need flex v-baseline wrap", () => {
		span.c("ai-need-mins", item.minutes != null ? item.minutes + " min" : "?");
		span.c("ai-need-what", item.what);
		a.c("ai-link ai-need-where", item.label).href(item.url);
	});
}

/**
 * The strip itself — silent when there is nothing waiting on the owner, which
 * is the normal state and deserves no box of its own.
 *
 * `items` is already sorted; `needs_all()` and `needs_of()` both answer with the
 * shape it wants.
 */
export function needs_strip(items, title = "Needs you"){
	if (!items.length) return;

	return div.c("ai-needs surface", () => {
		div.c("ai-needs-head flex split v-baseline wrap", () => {
			span.c("ai-group-title", title);
			span.c("muted", total(items));
		});
		items.forEach(item => line(item));
	});
}

/* What the whole strip costs, in one phrase — the owner's real question is
   "can I clear this before bed", and n lines does not answer it. */
function total(items){
	const known = items.filter(i => i.minutes != null);
	const mins = known.reduce((sum, i) => sum + i.minutes, 0);
	const said = `${items.length} thing${items.length === 1 ? "" : "s"} only you can do`;
	return known.length === items.length ? `${said} · about ${mins} min in all` : said;
}

export default needs_strip;
