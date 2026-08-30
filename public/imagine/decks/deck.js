import { Page, View, div, p, a, icon, md } from "/app.js";

View.stylesheet(import.meta, "decks.css");

/* PRESENTATIONAL LAYOUTS — a screen cut into regions, and what belongs in each.

   This lab stands on /imagine/screens/, which found the two words a whole screen is
   made of (`full` REPLACES, `fill` JOINS) and the box a display word must be sized by.
   Nothing here re-litigates that. The question here is one rung in: once you have the
   screen, HOW DO YOU CUT IT, and what kind of content survives the piece it lands in.

   A SLICE IS A SHARE, not a column. Screens divided the row by opening columns, so
   every region cost a hop; a slide shows all its regions at once, so the regions are
   flex items of ONE screen and the share is their BASIS — `61.8%` beside `38.2%` is the
   golden section at every width, with no arithmetic and no media query. (Grow weights
   were the first try and they are off by 2.3%: decks.css says why, with the numbers.)

   The five content kinds below are the vocabulary. They differ in ONE property — how
   they answer a wider region — and that is the whole finding (doc/regions.md):

     statement  scales with it   — the type is a fraction of its own block
     wall       adds columns     — the best citizen of a fraction
     stage      scales with it   — an aspect box takes whatever it is given
     notes      caps and centres — prose is its own measure whatever the region does
     list       DOES NOT SCALE   — past ~28em a row is a label with a chasm after it */

export class Deck extends Page {

	/* One screen: the slice, and an optional strip under it. Core's column head and its
	   automatic nav rows are left out for the reason /imagine/screens/ left them out —
	   on a full screen the REGIONS are the navigation. */
	column(host){
		return div.c("page-column-body decks-screen", () => {
			const $slice = div.c("decks-slice", () => this.content());

			/* A presentation advances when you click it. ⚠ A real link inside the slide
			   has to win, or a click on the strip would step forwards instead of going
			   where it points (screens/deck, 2026-08-29). */
			if (this.advance && this.next)
				$slice.ac("decks-advance").on("click", event => {
					if (!event.target.closest("a")) this.go(this.next);
				});

			if (this.ring) foot(this.ring, this.name);
		}).ac("page-column-" + (this.width ?? "full"));
	}

	/* ⚠ NOT `this.app.router`. A column marked `default` is BUILT by its host rather
	     than routed to, so the `app` it was adopted with at module scope may still be
	     undefined. The chain's root always has one. (screens/deck, 2026-08-29.) */
	go(url){ return this.chain().find(page => page.app).app.router.go(url); }

	/* The card is a PICTURE OF THE CUT, and each cell is toned by the content kind that
	   belongs in it — so the wall of cards is the map, not a wall of grey rectangles. */
	preview(nav){
		return div.c("page-preview", () => {
			div.c("page-preview-thumb decks-thumb", () => diagram(...this.shapes ?? []));
			this.preview_link(nav);
			if (nav.description) p.c("page-preview-desc", nav.description);
		});
	}
}

export const base = new URL(".", import.meta.url).pathname;

/* THE RING. The six slices navigate each other through their own strip, so the lab is
   walked with the furniture it is about — "content as navigation", said literally. */
export const slices = [
	["half", "50 / 50"], ["golden", "61.8 / 38.2"], ["aside", "70 / 30"],
	["triptych", "25 / 50 / 25"], ["poster", "20 / 60 / 20"], ["four", "2 × 2"],
].map(([name, label]) => ({ name, label, to: base + name + "/" }));

/* ── the screen ─────────────────────────────────────────────────────────────
   A REGION. `share` is a PERCENT of the row and it is the ratio itself — the one number
   an experiment varies, so it arrives as a token rather than as a class per value. The
   shares on a screen sum to 100; omit it and the region takes the row.
   ⚠ A percent, never a grow weight. `flex: 61.8 1 0` measures 1.527, not 1.618 — a zero
     basis is a zero BORDER box and a padded region floors at its own padding
     (decks.css). */
export const region = (share, build) => div.c("decks-region", build).style("--decks-share", share + "%");

/* A SUPPORTING region — one tone step down, so the cut is visible. The lead region
   keeps the paper; a cut of peers uses none of these. */
export const quiet = (share, build) => region(share, build).ac("decks-quiet");

/* A region split the other way: the 2×2 is two of these. */
export const col = (share, build) => div.c("decks-col", build).style("--decks-share", share + "%");

/* ── the five content kinds ─────────────────────────────────────────────────
   A DISPLAY STATEMENT. The block is the composition: capped, centred, and the query
   container — so the type is 13% of its own block rather than of however much screen
   was left over (screens/doc/decisions.md measured that fix). */
export const statement = (eyebrow, title, note) => div.c("decks-block", () => {
	if (eyebrow) div.c("decks-eyebrow", eyebrow);
	div.c("decks-rule");
	div.c("decks-title", title);
	if (note) div.c("decks-note", note);
});

/* A CARD WALL — the kind that answers a wider region with MORE COLUMNS. `--column` is
   the only knob and a wall is the same wall at 400 and at 3440. */
export const wall = items => div.c("decks-wall", () => items.forEach(item =>
	(item.to ? a.c("decks-card").href(item.to) : div.c("decks-card")).ac(item.on && "decks-on").append(() => {
		if (item.k) div.c("decks-card-k", item.k);
		div.c("decks-card-name", item.name);
		if (item.note) div.c("decks-card-note", item.note);
	})));

/* A NAV LIST — rows, and the one kind that does not scale. A row's width is its label,
   so a list handed 1031px is a label with 880px before its chevron (`doc/columns.md`
   measured exactly that on a widened rail). The second line is what earns the width;
   without one, this kind wants a FIXED track and not a share. */
export const list = items => div.c("decks-list", () => items.forEach(item =>
	(item.to ? a.c("decks-row").href(item.to) : div.c("decks-row")).ac(item.on && "decks-on").append(() => {
		div.c("decks-row-name", item.name);
		if (item.note) div.c("decks-row-note", item.note);
	})));

/* A MEDIA STAGE — a figure that takes whatever it is given. There is no photograph on
   a static site that ships none, so the frame is drawn; what matters is that it is an
   aspect box, which is the kind that never has a wrong width. */
export const stage = (caption, build) => div.c("decks-stage", () => {
	div.c("decks-frame", build ?? (() => div.c("decks-frame-mark", () => icon("image"))));
	if (caption) div.c("decks-cap", caption);
});

/* A rail's head over its rows, sharing one left edge. */
export const stack = build => div.c("decks-stack", build);

/* CAPTIONS — prose, and prose is its own measure whatever the region does. Capped and
   centred, so the leftover is a margin instead of a corner.
   ⚠ `md()`, not `p()`. Only `p()` and `h1`–`h6` read backticks and NONE of them read
     `**bold**` — a note written with asterisks renders the asterisks, silently. */
export const notes = (title, lines) => div.c("decks-notes", () => {
	if (title) div.c("decks-notes-title", title);
	lines.forEach(line => md(line).ac("decks-p"));
});

/* ── the strip ──────────────────────────────────────────────────────────────
   A footer redrawn identically on every screen. Every hop here is a SWAP, and the
   strip still reads as persistent — which is the third answer to the head-to-head
   (persist/ vs swap/): a 3em band costs no region and buys most of what a rail does. */
export const foot = (items, here) => div.c("decks-foot", () => items.forEach(item =>
	a.c("decks-chip", item.label).href(item.to).ac(item.name === here && "decks-on")));

/* ── the keyboard ───────────────────────────────────────────────────────────
   Arrow keys take the SAME path a click does — `go()` calls the method the Router's own
   click handler calls — so the keyboard can never drift from the links. Three ⚠s, all
   three measured on /imagine/screens/deck/ (2026-08-29) rather than reasoned:
   ⚠ ONE reference, stored on the page, so the pair added and removed is the same
     function; a fresh arrow function per visit leaves a listener behind.
   ⚠ ONLY THE PAGE YOU ARE ON MAY ACT. Going deeper never deactivates an ancestor, so a
     host's listener outlives its screen — ArrowRight on slide three walked BACK to two.
   ⚠ The HOST carries this too. The slide you see at a deck's root is `default`: it was
     BUILT by the host rather than activated, so its own `activated()` never ran and the
     keyboard was dead until the first click. */
export const arrows = {
	activated(){
		this.keys ??= event => {
			if (location.pathname !== this.url) return;

			const to = { ArrowRight: this.next, ArrowLeft: this.prev }[event.key];

			if (to) this.go(to);
		};
		addEventListener("keydown", this.keys);
	},
	deactivated(){ removeEventListener("keydown", this.keys); },
};

/* ── the card's picture ─────────────────────────────────────────────────────
   One frame per hop, chevrons between. A cell is `weight` or `weight:kind`, where the
   kind tones it — s statement, w wall, l list, g stage, n notes. A leading `v` stacks
   the frame; `q` is the 2×2. */
export const diagram = (...specs) => specs.forEach((spec, i) => {
	if (i) icon("chevron_right");

	const vertical = spec.startsWith("v"), quad = spec === "q";
	const cells = quad ? ["1:s", "1:w", "1:n", "1:l"] : spec.replace(/^v/, "").trim().split(/\s+/);

	div.c("decks-diagram").ac(vertical && "decks-diagram-v").ac(quad && "decks-diagram-q").append(() =>
		cells.forEach(token => {
			const [weight, kind] = token.split(":");

			div.c("decks-cell").ac(kind && "decks-cell-" + kind).style("flex", weight);
		}));
});

export default Deck;
