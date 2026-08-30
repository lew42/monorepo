import View, { div } from "../../core/View/View.js";

/* css: `.demo-mini` and its parts — one drawing language, in mini.css. */
View.stylesheet(import.meta, "mini.css");

/**
 * mini(word) — a **picture** of a page shape, for a preview card.
 *
 *     preview(nav){ return this.preview_card(nav, () => mini("tabs")); }
 *
 * A few grey boxes suggesting an arrangement: no chrome, no text, no live app, and
 * nothing to read. The layout skill's rule is the whole brief — *a preview is a
 * picture, never a live instance* — and a wall of these is a PALETTE: you see what a
 * block is before you click it.
 *
 * Every picture is composed from the dozen parts below, so the set reads as one hand
 * drawing at one scale. A new word is one entry in `mini.pictures`; a shape the parts
 * cannot say yet is one rule in mini.css.
 *
 * ⚠ It draws into a `.page-preview-thumb` — a `.stage`: `overflow: hidden`, a 16/10
 *   aspect and a `--stage-max` ceiling, so its HEIGHT is whatever the card's width
 *   leaves. Every part is flex-sized for that reason; nothing here fixes a height.
 */
export function mini(word){
	return div.c("demo-mini demo-mini--" + word, mini.pictures[word] ?? mini.pictures.prose);
}

/* ── the parts ─────────────────────────────────────────────────────────────────
   ⚠ `demo-mini--<word>` on the root, TWO dashes — a picture is named after the
   block it draws and half of those names are parts too, so `.demo-mini-tabs` on
   the root wore the tab STRIP's padding and border, and `.demo-mini-crumbs` wore
   its `align-items: center`, which shrank the whole picture to its content
   (measured 2026-08-26). The `page--<name>` stamp is the same convention.

   `box` is one div with the prefix on — ⚠ never `div.c(cls, fn)` with an absent
   `fn`, which appends the string "undefined". `run` is n identical children with
   an optional lit one: every nav in the framework marks the open page, and that
   mark is most of what makes a shape readable at this size. */
const box = (cls, fn) => fn ? div.c("demo-mini-" + cls, fn) : div.c("demo-mini-" + cls);
const run = (cls, item, n, on) => box(cls, () => {
	for (let i = 0; i < n; i++) div.c("demo-mini-" + item).ac(i === on && "on");
});

const head  = () => div.c("demo-mini-head");
const lines = (n = 4) => run("lines", "line", n);
const pane  = (fn = () => lines()) => box("pane", fn);
const slot  = (cls = "", fn) => box("slot " + cls, fn);
const tabs  = (cls = "tabs") => run(cls, "tab", 3, 0);
const list  = (cls = "list", n = 5, on = 1) => run(cls, "item", n, on);
const track = (flex, fn) => box("track", fn).style("--mini-track", flex);
const bar   = w => slot().style({ "--mini-w": w, "--mini-flex": "0 0 0.9em" });

/* An INBOX row — a title and a line of the page behind it, so it is taller than a
   `.demo-mini-item` and the column it sits in is worth its width. That difference is the
   whole of what `list` means since 2026-08-27; a plain stack of rows is `rail`. */
const previews = (n = 4, on = 1) => box("previews", () => {
	for (let i = 0; i < n; i++)
		box("preview", () => { div.c("demo-mini-key"); div.c("demo-mini-line"); }).ac(i === on && "on");
});

const tiles = (n, cell, gap) => run("tiles", "tile", n)
	.style(gap === undefined ? { "--mini-cell": cell } : { "--mini-cell": cell, "--mini-gap": gap });

/**
 * The palette. The keys are the page-generator's own block words plus core/Page's
 * overview concepts — so this object IS the list of things a page can be made of,
 * and `core/Page/page.js` reads a picture out of it by the card's own name.
 */
mini.pictures = {

	/* ── blocks: WHERE a child goes when you pick it (core/Page/generator) ── */
	tabs:   () => { tabs(); pane(); },
	vtabs:  () => box("row", () => { tabs("tabs v"); pane(); }),
	list:   () => box("row", () => { previews(); pane(); }),
	wall:   () => { head(); tiles(6, "6em"); },
	prose:  () => { head(); pane(() => lines(7)); },

	/* ── patterns: shapes composed from the blocks, no word of their own ── */
	rail:   () => box("row", () => { list("rail", 5, 1); pane(); }),
	grid:   () => { head(); tiles(12, "3em"); },
	flush:  () => tiles(12, "3em", "0"),
	crumbs: () => { run("crumbs", "crumb", 3, 2); pane(); },

	/* ── pages are navigation ── */
	page:     () => box("pad", () => slot("v", () => { head(); lines(3); })).style("--mini-pad", "1.5em"),
	children: () => box("pad v", () => { slot(); box("pad", () => { slot(); slot(); slot(); }); }),
	mounts:   () => box("pad", () => slot("", () => box("pad", () => slot("on")))),
	replace:  () => box("pad", () => { slot("off"); slot("on"); }),
	route:    () => box("pad", () => { slot(); slot("dash"); }),

	/* ── the box ── */
	shell:   () => box("stack", () => { bar("52%"); bar("76%"); bar("100%"); }),
	measure: () => box("row", () => { track("1 1 0"); track("0 0 52%", () => pane(() => lines(5))); track("1 1 0"); }),
	inset:   () => box("pad", () => slot("", () => lines(3))).style("--mini-pad", "1.4em"),
	region:  () => box("pad v", () => { slot("dash"); slot("on"); }),
	full:    () => slot("v", () => { head(); lines(5); }),
	// ⚠ `() => pane()`, never a bare `pane`: `append(fn)` calls it with the View as
	// its first argument, and `pane`'s parameter is its content.
	width:   () => box("cols", () => { track("0 0 22%", () => pane()); track("0 0 32%", () => pane()); track("1 1 0", () => pane()); }),

	/* ── recipes ── */
	catalog:   () => box("row", () => { run("cards", "tile", 4); pane(); }),
	dashboard: () => { head(); tiles(5, "5em"); },
	strip:     () => { head(); run("strip", "tile", 6); },

	columns: () => {
		run("crumbs", "crumb", 3, 2);

		box("cols", () => {
			track("0 0 26%", () => { head(); list("list", 3, 2); });
			track("0 0 34%", () => { head(); list("list", 3, 1); });
			track("1 1 0", () => { head(); lines(4); });
		});
	},

	landing: () => run("bands", "band", 5),
	docs:    () => { head(); box("row", () => { list("rail", 5, 1); pane(() => lines(5)); }); },
	site:    () => { tabs(); run("bands", "band", 3); },

	/* ── two names for one entry, and a page that draws its own box ── */
	labels: () => box("pad v", () => [0, 1, 2].forEach(i => box("row", () => {
		div.c("demo-mini-key").ac(!i && "on");
		div.c("demo-mini-line").ac(!i && "on");
	}))),

	render: () => box("pad", () => slot("on", () => lines(3))),
};

export default mini;
