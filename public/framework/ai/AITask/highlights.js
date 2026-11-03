import { a, button, div, icon, span } from "../../core/View/View.js";

/* THE HIGHLIGHT — the one thing a task says about itself to a reader who was not
   there. It is a single line the task appends to its OWN `task.jsonl`:

     {"assign": {"highlight": {"icon": "explore", "title": "The layouts encyclopedia",
                               "line": "Thirteen named layouts, each drawn and tagged.",
                               "url": "/layouts/"}}}

   `assign` replays onto the manifest (ext/JSONL), so it arrives as `m.highlight`
   with no reader change. The task record stays the one source of truth: there is
   no curated list to keep in step, and a task that never marks itself is simply
   not on the wall — it is still on /framework/ai/log/, which holds everything.

   ⚠ The card links to `url` — THE THING, not the task. The owner opening this page
     is looking for the work, not for the log line about the work; the small `log`
     link in the corner is the way back to the record.
   ⚠ The card carries no date of its own. The DAY HEADING above its group is the
     date, and printing it twice on every card was noise (the owner, 2026-09-08). */

// The cap, not a target: everything the site has marked fits under it today, so
// the button below appears only once there is genuinely more to draw.
const WALL = 100;

const day_of = url => url.split("/").filter(Boolean).at(-2);
const at = t => Date.parse(t.m?.landed_at ?? t.m?.requested_at ?? "") || 0;

// ⚠ Parsed, never string-compared (board.js): logs carry both `…Z` and `…-05:00`.
//   The day dir leads, so a highlight with no timestamp still files under its day.
const newest = (x, y) => day_of(y.url).localeCompare(day_of(x.url)) || at(y) - at(x);

// ⚠ `new Date("2026-09-01")` is UTC midnight, which west of Greenwich renders as
//   the day before. Build the date from its parts.
const local = ymd => { const [y, m, d] = ymd.split("-").map(Number); return new Date(y, m - 1, d); };

const TODAY = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
const LONG = { weekday: "long", month: "long", day: "numeric" };

const label = ymd => {
	const day = local(ymd);
	return +day === +TODAY() ? "Today" : day.toLocaleDateString([], LONG);
};

/** Every task carrying a usable highlight, newest first. */
export const marked = list => list.filter(t => t.m?.highlight?.url && t.m.highlight.title).sort(newest);

/** The same rows as `[date, rows]` pairs — newest day first, because they arrive sorted. */
const by_day = rows => {
	const days = new Map();
	rows.forEach(t => {
		const d = day_of(t.url);
		if (!days.has(d)) days.set(d, []);
		days.get(d).push(t);
	});
	return [...days];
};

/* One card: the icon says what KIND of thing it is, the title names it, and the
   sentence says what it is for. The title's ::after spreads the link over the
   whole card, so the `log` link lifts itself above it the way `.ai-links` does. */
const card = t => {
	const h = t.m.highlight;
	return div.c("ai-hl surface", () => {
		icon(h.icon ?? "star").ac("ai-hl-icon");
		div.c("ai-hl-body", () => {
			a.c("ai-hl-title", h.title).href(h.url);
			// `div`, not `p`: only p/h1-h6 read backticks, and this text is data.
			if (h.line) div.c("ai-hl-line muted", h.line);
			div.c("ai-hl-foot muted", () => a.c("ai-hl-task", "log").href(t.url));
		});
	});
};

/**
 * The wall — a run of cards under each day's heading, newest day first, `WALL`
 * cards, then a button for the next `WALL`. The count lives in this closure and
 * nowhere else, so a refresh starts the reader at the top again (a demo does not
 * persist, and neither does a reading position nobody asked to keep). Returns
 * the box synchronously; `list` is already loaded.
 */
export function highlights(list){
	const rows = marked(list);
	let shown = WALL;

	return div.c("ai-highlights", $h => {
		const draw = () => $h.empty(() => {
			div.c("ai-group-title muted", () => {
				span("Highlights");
				span.c("ai-count", " " + rows.length);
			});

			if (!rows.length) div.c("muted", "No task has marked itself a highlight yet.");

			by_day(rows.slice(0, shown)).forEach(([date, items]) => {
				// The heading is the date AND the way into that day's own board.
				a.c("ai-hl-day muted", label(date)).href(`/framework/ai/${date}/`);
				div.c("ai-hl-wall grid auto gap", () => items.forEach(t => card(t)));
			});

			if (rows.length > shown) more(WALL, rows.length - shown, () => { shown += WALL; draw(); });
		});

		draw();
	});
}

/** The one button both walls use — it says how many more it is about to draw. */
export function more(chunk, left, next){
	return button.c("ai-more", `Show ${Math.min(chunk, left)} more of ${left}`)
		.on("click", () => next());
}

export default highlights;
