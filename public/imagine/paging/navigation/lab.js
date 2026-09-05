import { View, div, span, p, h3, icon } from "/app.js";
import { press } from "../paging.js";

/* ── THE LAB — the same two gestures, twice, side by side ──────────────────────
   One box behaves like most of this site does today; the other has one rule
   changed on each half. Press the buttons in both and read the numbers underneath.

   ⚠ THE NUMBERS ARE MEASURED AGAINST THE LAB'S OWN BOX, not the viewport. A panel
     that grows moves the page under it, and the browser's scroll anchoring can
     absorb part of that — so a viewport reading would report a number that depends
     on where you happened to be scrolled. An offset inside the box cannot.

   ⚠ The class name IS the CSS name: `classify()` turns `PagingNavLab` into
     `.paging-nav-lab`, so the module prefix has to be in the class name or the
     view wears an unprefixed `.nav-lab` nobody reserved.                          */

// Two panels of very different heights, because that IS the vertical problem.
const PANELS = [
	"One short line.",
	"A much longer panel. Four lines of it, so the difference in height between this panel and the short one is impossible to miss. This is what a tab switch does every time you press a tab: the box under the strip becomes a different height. Nothing slid sideways — but everything below it is somewhere else now.",
];

const NAMES = ["A", "B", "C", "D", "E", "F"];

// Which column is "the one you were reading" — the third, so there is a column on
// each side of it. Watching the first would report 0 for everything: the leftmost
// column has nothing to its left to give up width.
const WATCHED = 2;

export class PagingNavLab extends View {

	initialize(){
		this.n ??= 0;             // which panel is showing
		this.open ??= 3;          // how many columns are open
		this.change ??= null;     // the last gesture's two numbers
		super.initialize();
	}

	render(){
		this.ac(this.steady ? "paging-nav-steady" : "paging-nav-fluid");

		h3.c("paging-nav-name", () => {
			icon(this.steady ? "check_circle" : "warning");
			span(this.steady ? "Stable" : "Dynamic");
		});

		p.c("paging-nav-lede", this.says);

		this.$row = div.c("paging-nav-row", () => { this.row(); });
		this.$panel = div.c("paging-nav-panel", () => { this.panel(); });

		// The line the vertical number is read off: the first thing below the panel.
		div.c("paging-nav-after", "the next thing on the page");

		div.c("flex gap wrap", () => {
			this.chip("add", "add a column", () => this.grow());
			this.chip("swap_horiz", "swap the panel", () => this.turn());
			this.chip("restart_alt", "reset", () => this.back());
		});

		this.$note = div.c("paging-nav-note", () => { this.note(); });
	}

	// ── the two halves of the picture ────────────────────────────────────────
	row(){
		NAMES.slice(0, this.open).forEach((name, i) =>
			div.c("paging-nav-col", name).ac(i === WATCHED && "paging-nav-watched"));
	}

	/* THE WHOLE OF THE STABLE PANEL IS THIS SECOND BRANCH. Both panels are always in
	   the DOM, stacked in one grid cell, and the one you are not reading is only
	   `visibility: hidden` — so the box is always as tall as the TALLEST panel, and
	   the browser is the thing that works that number out rather than us.
	   `.paging-nav-reserve` in navigation.css is the whole rule, and it is two lines. */
	panel(){
		if (!this.steady) return p.c("paging-nav-face", PANELS[this.n]);

		div.c("paging-nav-reserve", () => PANELS.forEach((text, i) =>
			p.c("paging-nav-face", text).ac(i !== this.n && "paging-nav-hidden")));
	}

	chip(sign, label, act){
		return press(span.c("paging-chip").append(() => { icon(sign); span(label); }), act);
	}

	// ── the measurement ──────────────────────────────────────────────────────
	// Offsets INSIDE the lab, so a page scrolling under us cannot fake a number.
	spot(){
		const mine = this.el.getBoundingClientRect();
		const at = sel => {
			const box = this.el.querySelector(sel)?.getBoundingClientRect();
			return box ? { x: Math.round(box.left - mine.left), y: Math.round(box.top - mine.top) } : null;
		};
		return { col: at(".paging-nav-watched"), after: at(".paging-nav-after") };
	}

	/* ⚠ `getBoundingClientRect()` flushes layout synchronously, so reading straight
	   after the repaint gives the real numbers rather than an estimate — the same
	   move `Paging.pick()` makes. */
	gesture(did, act){
		const before = this.spot();
		act();
		const after = this.spot();

		this.change = {
			did,
			moved: Math.abs(after.col.x - before.col.x),
			jumped: Math.abs(after.after.y - before.after.y),
		};

		this.$note.empty(() => { this.note(); });
		return this;
	}

	grow(){
		if (this.open >= NAMES.length) return this.back();

		return this.gesture("added a column", () => {
			this.open++;
			this.$row.empty(() => { this.row(); });
		});
	}

	turn(){
		return this.gesture("swapped the panel", () => {
			this.n = (this.n + 1) % PANELS.length;
			this.$panel.empty(() => { this.panel(); });
		});
	}

	back(){
		this.open = 3;
		this.n = 0;
		this.change = null;
		this.$row.empty(() => { this.row(); });
		this.$panel.empty(() => { this.panel(); });
		this.$note.empty(() => { this.note(); });
		return this;
	}

	note(){
		if (!this.change) return p.c("paging-nav-hint", "Press a button. The two numbers appear here.");

		const { did, moved, jumped } = this.change;

		div.c("paging-nav-nums", () => {
			span.c("paging-nav-did", did);
			this.num("column C moved sideways", moved);
			this.num("the line below moved", jumped);
		});
	}

	num(label, px){
		return div.c("paging-nav-num").ac(px === 0 && "paging-nav-zero").append(() => {
			span.c("paging-nav-px", px + "px");
			span.c("paging-nav-what", label);
		});
	}
}

/* ── THE STACK — one box, several panels, and a choice about its height ────────
   The vertical half of the same argument, on its own so `stage/` and `tabs/` can
   each show it wearing different chrome. `reserved: true` is the only difference
   between a box that jumps and a box that does not; `tabbed: true` only changes
   what the picker looks like. */

export const FACES = [
	["Overview", ["Two lines. This panel is deliberately the short one, so the box has an obvious smallest size."]],

	["Pricing", [
		"The tall one — and it has to be tall at 3440 as well as at 1280, which is why it is three paragraphs rather than one long sentence. A box 2950px wide fits a great deal of text on one line, and a panel that is only wordy stops being taller than its neighbours the moment the screen is wide.",
		"Every tab strip on this site does exactly this. Press a tab, the panel becomes a different height, and everything under it is somewhere else — on the site's own tabs page the difference is 1720px at 1280 and 1933px at 3440.",
		"That is the whole vertical problem, and the box below this one is the whole fix.",
	]],

	["Contact", [
		"Three lines. Enough to be a third distinct height, so you can see that the reserved box settles on the TALLEST of the three rather than on whichever panel you happen to open first.",
		"Press Overview and then Pricing and then this one, in any order: in the reserved box the dashed line never moves.",
	]],
];

export class PagingNavStack extends View {

	initialize(){
		this.n ??= 0;
		this.change ??= null;
		super.initialize();
	}

	render(){
		div.c("paging-nav-set").ac(this.tabbed && "paging-tabs").append(() => {
			this.picker();
			this.$stage = div.c("paging-nav-stage")
				.ac(this.tabbed && "paging-tab-panel")
				.ac(this.reserved && "paging-nav-reserve")
				.append(() => { this.faces(); });
		});

		div.c("paging-nav-after", "the next thing on the page");

		this.$note = div.c("paging-nav-note", () => { this.note(); });
	}

	// THE SEAM. Chips by default; a tab strip when the page asks for one. Same
	// gesture, same measurement — only the paint changes.
	picker(){
		if (this.tabbed) return div.c("paging-tab-bar", () => FACES.forEach(([label], i) => this.one(i, "paging-tab", label)));

		div.c("flex gap wrap", () => FACES.forEach(([label], i) => this.one(i, "paging-chip", label)));
	}

	one(i, cls, label){
		const on = i === this.n;
		return press(span.c(cls, label).ac(on && "on").attr("aria-pressed", String(on)), () => this.turn(i));
	}

	/* Reserved: every face stays in the DOM and the unread ones are only invisible,
	   so the grid cell is as tall as the tallest of them. Unreserved: one face at a
	   time, and the box is whatever that face needs. */
	faces(){
		if (!this.reserved) return div.c("paging-nav-face", () => FACES[this.n][1].forEach(line => p(line)));

		FACES.forEach(([, lines], i) =>
			div.c("paging-nav-face", () => lines.forEach(line => p(line))).ac(i !== this.n && "paging-nav-hidden"));
	}

	spot(){
		const mine = this.el.getBoundingClientRect();
		const box = this.el.querySelector(".paging-nav-after").getBoundingClientRect();
		return { y: Math.round(box.top - mine.top), h: Math.round(this.$stage.el.getBoundingClientRect().height) };
	}

	turn(i){
		if (i === this.n) return this;

		const before = this.spot();
		this.n = i;
		this.$stage.empty(() => { this.faces(); });

		// The picker has to be redrawn too — which face is showing is part of it.
		this.el.querySelectorAll(".paging-chip, .paging-tab").forEach((el, at) => el.classList.toggle("on", at === i));

		const after = this.spot();
		this.change = { moved: 0, jumped: Math.abs(after.y - before.y), was: before.h, now: after.h };

		this.$note.empty(() => { this.note(); });
		return this;
	}

	note(){
		if (!this.change) return p.c("paging-nav-hint", "Press a panel name. The numbers appear here.");

		const { jumped, was, now } = this.change;

		div.c("paging-nav-nums", () => {
			span.c("paging-nav-did", "the box was " + was + "px, now " + now + "px");
			div.c("paging-nav-num").ac(jumped === 0 && "paging-nav-zero").append(() => {
				span.c("paging-nav-px", jumped + "px");
				span.c("paging-nav-what", "the line below moved");
			});
		});
	}
}
