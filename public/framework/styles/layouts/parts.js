import { div, p } from "/app.js";

/* The filler every layout is drawn with.
 *
 * Real headings and real copy, so a layout shrunk to a thumbnail on the index
 * reads as a page rather than as a wireframe. The tint is an inline token value
 * and not a stylesheet rule: layouts.css stays layout-only, and
 * styles/util/page.js tints its demo cells exactly this way.
 */
const tint = { background: "var(--wash)", border: "1px solid var(--line)", borderRadius: "var(--radius)" };

const copy = [
	"A region is a box with a job. This one holds the prose.",
	"Nothing on the index is a picture — every preview is this same function, rendered small.",
	"Utilities first: `flex`, `gap`, `auto`, `three`. A rule is the last resort.",
	"Resize the window and watch which columns wrap. No media query is involved.",
];

const words = ["Overview", "Install", "Layouts", "Tokens", "Utilities", "Theme"];

// A labelled region. `box("Nav", () => items(4))` — the heading is an h4, the
// type scale's annotation level, so no size is invented here.
export const box = (heading, ...args) => div.c("pad flow", () => {
	if (heading) div.c("h4", heading);
	return args;
}).style(tint);

export const lines = (n = 2) => { for (let i = 0; i < n; i++) p(copy[i % copy.length]); };

export const items = (n = 4) => { for (let i = 0; i < n; i++) p(words[i % words.length]); };

// one label, one big number
export const tile = (heading, value) => box(heading, () => div.c("h2", value));
