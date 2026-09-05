import { View, div, span, p, a, h3, icon } from "/app.js";
import { SURFACES } from "../paging/blocks.js";

// The sheet travels with the class, not with one page: four pages in this realm draw
// sections and every one of them imports this file.
View.stylesheet(import.meta, "sections.css");

/* ── ONE SECTION ───────────────────────────────────────────────────────────────

   A SECTION is a horizontal band of a page, divided into 2, 3 or 4 columns, with an
   optional head above them and an optional foot below. It is the /imagine/layouts/
   3-column card made a first-class, stackable thing: that card is a fixed
   intro | stage | readout, this is any number of columns, any distribution, any
   colour, stacked down a page or filling a screen.

   THE FIVE PARTS, in the order they sit in the row:

       Head    a strip above every column, spanning the whole section
       Side    the left column        (3 and 4 columns only)
       Main    the middle column      — the demo, the article, the stage
       Aside   the right column       — controls, notes, a contents list
       Notes   a fourth column        (4 columns only)
       Foot    a strip below every column, spanning the whole section

   THE FRAME. When Head, Side, Aside and Foot all wear ONE colour and Main wears a
   different one, and there is no gutter between them, the four surround the middle
   and the middle reads as FRAMED. That is the owner's own sentence and it is why the
   inside of a section has no gap: the seams are hairlines. `chrome` is the word for
   the frame's colour, `face` for the middle's, `back` for the section's own.

   ⚠ THE CLASS NAME IS THE CSS CLASS. `View.classify()` adds one kebab-cased class per
     constructor in the chain, so `SectionsSide` IS `.sections-side` and nothing types
     it. That is also why nothing here is called `Section`: `/blog/Section.js` already
     exports one, `.section` is a real rule in `core/new/1/`, and a part called `Card`
     or `Main` would wear a framework layout word's CSS by accident.

   ⚠ STICKY LIVES ON A CHILD, NOT ON THE COLUMN. A sticky sidebar and a framed
     sidebar want opposite things — `align-self: start` shrinks the cell to its
     content, which stops it painting the frame's full height. So the CELL stretches
     and paints, and a `.sections-hold` INSIDE it is what sticks. Its containing block
     is the cell, so it can never leave the section: the next section's sidebar takes
     over on its own, with nothing watching the scroll. (Measured — doc/decisions.md.) */

/* A clickable that is not a `<button>`: the site theme styles every button as a small
   uppercase CTA at (0,2,0) in the same layer, so a chip cannot win that fight at its
   own specificity. Restated from `/imagine/layouts/LayoutsCard.js` rather than
   imported, for the reason that file gives — importing across realms drags the other
   realm's stylesheet onto every page in this one. */
export const press = (view, act) => view
	.attr("role", "button").attr("tabindex", "0")
	.click(act)
	.on("keydown", event => {
		if (event.key !== "Enter" && event.key !== " ") return;
		event.preventDefault();
		act();
	});

/* ── THE WORDS ────────────────────────────────────────────────────────────────
   Every one of them is a chip, and each touches exactly the one thing it names. */

// The five colours, imported from the paging realm's own list so the two vocabularies
// cannot drift. `blocks.js` imports nothing, so this costs no stylesheet.
export const SKINS = SURFACES;

export const COLS = [2, 3, 4];

export const FRAMES = [
	{ id: "card",  means: "The section is one card: a hairline, a radius, and the page's own inset on both sides." },
	{ id: "flush", means: "The section is full bleed: it reaches the edges of whatever holds it, with square corners." },
];

export const SPACES = [
	{ id: "0",    means: "Stacked with no gap at all. The sections butt, separated by a hairline — one continuous page." },
	{ id: "gap",  means: "One gap ramp between them: 15px at 1280, 46px at 3440." },
	{ id: "airy", means: "The airy spacing level: the same ramp times 1.6, and everything inside breathes with it." },
];

/* THE DISTRIBUTIONS — how the row divides. Same names as `/framework/styles/layouts/cols/`,
   said as grid tracks instead of flex bases. Every track has a floor and a ceiling:
   `minmax(0, …)` is the floor that cannot overflow. */
export const DISTRIBUTIONS = [
	{ id: "equal",           title: "Equal",       means: "Every column takes the same share. At three columns that is thirds." },
	{ id: "thirds",          title: "Thirds",      means: "Three equal peers — the same rule as equal, named for the case people ask for." },
	{ id: "golden",          title: "Golden",      means: "The middle takes 61.8% of the row and the others split the rest. The one ratio that reads as composed." },
	{ id: "main-aside",      title: "Main + aside", means: "The middle takes whatever is left; every other column is capped, so a list of controls never grows to 1100px at 3440." },
	{ id: "rail-main-aside", title: "Rail + main + aside", means: "A fixed rail measured in em, so it holds the same number of characters at 400 and at 3440; a fluid middle; a capped aside." },
	{ id: "fixed-fluid",     title: "Fixed + fluid", means: "Every column except the middle is fixed at the rail width. The frame is exactly symmetric and the middle absorbs the screen." },
];

const FLUID = "minmax(0, 1fr)";
const RAIL  = "var(--sections-rail)";
const CAP   = "minmax(0, var(--sections-aside))";

// Which column is the middle. At two columns there is no left side, so the first
// column IS the main; at three and four the main is second.
export const main_index = n => n === 2 ? 0 : 1;

/* One `grid-template-columns` string from two numbers. Computed here rather than in
   the stylesheet because a chip changes it live and 6 distributions x 3 counts is 18
   rules for what is four lines of arithmetic. */
export const tracks = (word, n) => {
	const dist = (word === "rail-main-aside" && n < 3) ? "main-aside" : word;
	const main = main_index(n);
	const list = [];

	for (let i = 0; i < n; i++){
		if (dist === "golden")               list.push("minmax(0, " + (i === main ? "61.8" : (38.2 / (n - 1)).toFixed(2)) + "fr)");
		else if (dist === "main-aside")      list.push(i === main ? FLUID : CAP);
		else if (dist === "rail-main-aside") list.push(i === 0 ? RAIL : i === main ? FLUID : CAP);
		else if (dist === "fixed-fluid")     list.push(i === main ? FLUID : RAIL);
		else                                 list.push(FLUID);
	}

	return list.join(" ");
};

export const means_of = (list, id) => list.find(entry => entry.id === String(id))?.means ?? "";

/* ── THE SECTION ─────────────────────────────────────────────────────────────── */

export class SectionsBand extends View {

	// ════ THE STATE — eight words, all in memory, nothing remembered ═══════════
	// A refresh resets a demo to the section it is (the night's rule 4).
	opening(){
		return { cols: "3", dist: "golden", frame: "flush", chrome: "tint", face: "card",
		         back: "plain", stick: "on", inner: "off" };
	}

	/* The section a page ASKED for — the defaults, with every word the caller named
	   written over them. ⚠ Read off the instance, because a caller says
	   `new SectionsBand({ cols: 2 })` and `assign()` puts that on the instance, not in
	   the state; and stringified, because a chip's value is always a string and
	   `2 !== "2"` would make the chip for the current value look unpressed. */
	base(){
		if (this.opened) return this.opened;

		const opening = this.opening();
		this.opened = { ...opening };
		Object.keys(opening).forEach(key => { if (this[key] != null) this.opened[key] = String(this[key]); });

		return this.opened;
	}

	state(){ return this.picked ??= { ...this.base() }; }

	at(axis){ return this.state()[axis]; }

	modified(){ const base = this.base(); return Object.keys(base).some(key => base[key] !== this.at(key)); }

	/* THE ONE SEAM. `cols` rebuilds the row, because the number of columns is the
	   number of elements; everything else restamps a class or one custom property. */
	pick(axis, value){
		if (this.at(axis) === String(value)) return this;

		this.picked = { ...this.state(), [axis]: String(value) };

		if (axis === "cols") return this.rebuild();

		this.dress();
		return this.refresh();
	}

	reset(){ this.picked = { ...this.base() }; return this.rebuild(); }

	rebuild(){
		this.$grid?.empty(() => { this.parts(); });
		return this.dress().measure().readouts();
	}

	/* DYNAMIC NAVIGATION, in one method: the section grows a FOURTH column and
	   everything already on screen shifts left to pay for it. This is the whole
	   difference from `SectionsNav`'s stable mode, and it is why the two have
	   different names — 2026-09-05 decision 5. */
	launch(item){
		this.notes = band => {
			span.c("sections-axis", "opened by the nav");
			item.draw();
			press(span.c("sections-chip").append(() => { icon("close"); span("close this column"); }), () => band.pick("cols", 3));
		};

		this.picked = { ...this.state(), cols: "4" };
		return this.rebuild();
	}

	refresh(){
		this.$chips?.empty(() => { this.chips(); });
		this.readouts();
		return this;
	}

	// ════ THE BOX ══════════════════════════════════════════════════════════════
	render(){
		this.$grid = div.c("sections-grid", () => { this.parts(); });
		this.dress();

		/* The first measurement has to wait for a layout: the band is built before it
		   is in the document. A timeout rather than requestAnimationFrame, because a
		   hidden or background tab never paints — and this realm's probe runs in one. */
		setTimeout(() => { this.measure().readouts(); }, 0);
		this.watch();
	}

	// The parts that exist at this column count, in row order.
	parts(){
		const n = Number(this.at("cols"));
		const kind = this.constructor;

		if (this.head) new kind.Head({ band: this });
		if (n > 2) new kind.Side({ band: this });
		new kind.Main({ band: this });
		new kind.Aside({ band: this });
		if (n > 3) new kind.Notes({ band: this });
		if (this.foot) new kind.Foot({ band: this });

		return this;
	}

	/* ── the paint: every axis is a class or a custom property ── */
	dress(){
		const n = Number(this.at("cols"));

		this.rc("sections-card", "sections-flush", "bleed", "sections-n2", "sections-n3", "sections-n4")
			.ac("sections-" + this.at("frame"))
			.ac("sections-n" + n)
			.tc("sections-stuck", this.at("stick") === "on")
			.tc("sections-inner", this.at("inner") === "on")
			.style({ "--sections-tall": String(this.tall ?? 0) });

		this.$grid?.style({ "--sections-cols": tracks(this.at("dist"), n) });

		this.skin(this, "back");
		[this.$head, this.$side, this.$aside, this.$notes, this.$foot].forEach(part => this.skin(part, "chrome"));
		this.skin(this.$main, "face");

		return this;
	}

	skin($part, axis){
		$part?.rc(...SKINS.map(entry => "sections-skin-" + entry.id)).ac("sections-skin-" + this.at(axis));
		return this;
	}

	/* ── THE SCREEN, MEASURED ──────────────────────────────────────────────────
	   A sidebar with its own scroll is capped at ONE SCREEN — but "one screen" here
	   is the box that actually scrolls, which under a columns host is the column, not
	   the window. `100dvh` there is taller than the column, so the pinned footer would
	   sit below the fold and never be seen. So the band reads its own scrolling
	   ancestor's height once and writes it as `--sections-screen`; with no JS at all
	   the stylesheet falls back to `100dvh`, which is right on a full-screen page. */
	scroller(){
		let el = this.el.parentElement;

		while (el && el !== document.documentElement){
			const style = getComputedStyle(el);
			if (/(auto|scroll)/.test(style.overflowY) && el.clientHeight) return el;
			el = el.parentElement;
		}

		return null;
	}

	measure(){
		const box = this.scroller();
		return this.style({ "--sections-screen": (box ? box.clientHeight : window.innerHeight) + "px" });
	}

	watch(){
		if (typeof ResizeObserver !== "function") return this;
		this.observer = new ResizeObserver(() => { this.measure().readouts(); });
		this.observer.observe(this.el);
		return this;
	}

	// What the tracks actually measured, written into the aside when a section asks.
	readouts(){
		if (!this.$read || !this.$grid) return this;

		const cells = [...this.$grid.el.children].filter(el => !el.classList.contains("sections-head") && !el.classList.contains("sections-foot"));

		this.$read.empty(() => {
			cells.forEach(el => span.c("sections-px", Math.round(el.offsetWidth) + "px"));
			if (new Set(cells.map(el => el.offsetTop)).size > 1)
				span.c("sections-note", "Stacked — this width is under the section's floor, which is the section keeping its promise.");
		});

		return this;
	}

	// ════ WHAT IS IN EACH PART ═════════════════════════════════════════════════
	/* A slot is a string (one plain sentence) or a function (anything). Both are
	   optional; the aside falls back to the chips, because that is what a section on
	   this site is for. ⚠ `void`, so a builder's RETURN VALUE is never appended a
	   second time by the captor. */
	draw(slot){
		const value = this[slot];

		if (typeof value === "function") return void value.call(this, this);
		if (value) return void p.c("sections-text", value);
		if (slot === "aside") this.controls();
	}

	// The live control strip. `draw()` puts it in the aside when a section gives the
	// aside nothing else; a section that wants both calls this itself.
	controls(){ return this.$chips = div.c("sections-chips", () => { this.chips(); }); }

	// ── the chips: every word this section offers, live ──
	chips(){
		(this.axes ?? ["cols", "dist", "frame", "chrome", "face", "stick"]).forEach(axis => this.group(axis));

		if (this.readout) this.$read = div.c("sections-reads");

		if (!this.modified()) return;

		div.c("sections-group", () => {
			span.c("sections-mark", () => { icon("edit"); span("changed"); });
			press(span.c("sections-chip").append(() => { icon("restart_alt"); span("reset"); }), () => this.reset());
		});
	}

	group(axis){
		const list = {
			cols:   COLS.map(n => ({ id: String(n), title: n + " columns" })),
			dist:   DISTRIBUTIONS,
			frame:  FRAMES,
			chrome: SKINS, face: SKINS, back: SKINS,
			stick:  [{ id: "on" }, { id: "off" }],
			inner:  [{ id: "off" }, { id: "on" }],
		}[axis] ?? [];

		const label = {
			cols: "columns", dist: "distribution", frame: "frame",
			chrome: "the frame's colour", face: "the middle's colour", back: "the section's own",
			stick: "sticky sides", inner: "the sidebar scrolls itself",
		}[axis];

		div.c("sections-group", () => {
			span.c("sections-axis", label);
			list.forEach(entry => this.chip(axis, entry.id, entry.title ?? entry.id));
		});
	}

	chip(axis, value, words){
		const on = this.at(axis) === String(value);

		return press(span.c("sections-chip", words).ac(on && "on")
			.attr("aria-pressed", String(on))
			.attr("data-axis", axis)
			.attr("data-value", value)
			.attr("title", means_of({ dist: DISTRIBUTIONS, frame: FRAMES, chrome: SKINS, face: SKINS, back: SKINS }[axis] ?? [], value)),
			() => this.pick(axis, value));
	}
}

/* ── THE PARTS ─────────────────────────────────────────────────────────────────
   Each one is a View over the band, so a page can replace one without the band
   knowing. They hold no state: the band is the only thing that has any. A part
   registers itself on the band (`$side`, `$main`, …) so `dress()` can repaint it.

   Side, Aside and Notes wrap their content in a `.sections-hold` — the box that
   sticks, and the box that gets its own scroll and a pinned footer. Head, Main and
   Foot do not: nothing about them sticks. */

/* ⚠ NO CLASS FIELDS ON A PART. `View`'s constructor calls `render()` from
   `initialize()`, and a subclass's class fields are assigned only AFTER `super()`
   returns — a `slot = "side"` field would still be undefined when the part drew
   itself. The slot is an argument instead. */
const hold = (part, slot) => div.c("sections-hold", () => {
	div.c("sections-body", () => { part.band.draw(slot); });
	if (part.band.pin) div.c("sections-pin", () => { part.band.draw("pin"); });
});

SectionsBand.Head = class SectionsHead extends View {
	render(){ this.band.$head = this; this.band.draw("head"); }
};

SectionsBand.Side = class SectionsSide extends View {
	render(){ this.band.$side = this; hold(this, "side"); }
};

SectionsBand.Main = class SectionsMain extends View {
	render(){ this.band.$main = this; this.band.draw("main"); }
};

SectionsBand.Aside = class SectionsAside extends View {
	render(){ this.band.$aside = this; hold(this, "aside"); }
};

SectionsBand.Notes = class SectionsNotes extends View {
	render(){ this.band.$notes = this; hold(this, "notes"); }
};

SectionsBand.Foot = class SectionsFoot extends View {
	render(){ this.band.$foot = this; this.band.draw("foot"); }
};

/* ── A STACK OF SECTIONS ───────────────────────────────────────────────────────
   The only thing above a section: how much room there is between them. Three words,
   and every one of them is the gap ramp — 0, the ramp, or the ramp at the airy
   spacing level, which also opens up the inside of every section in the stack. */
export class SectionsStack extends View {
	render(){
		this.space ??= "gap";
		this.ac("sections-space-" + this.space);
		if (this.bands) this.bands.call(this, this);
	}

	// The one control above a section. A page puts this wherever it likes.
	chips(){
		return this.$chips = div.c("sections-chips", () => { this.space_group(); });
	}

	space_group(){
		div.c("sections-group", () => {
			span.c("sections-axis", "space between sections");
			SPACES.forEach(entry => press(span.c("sections-chip", entry.id === "0" ? "none" : entry.id)
				.ac(entry.id === this.space && "on")
				.attr("aria-pressed", String(entry.id === this.space))
				.attr("data-axis", "space").attr("data-value", entry.id)
				.attr("title", entry.means), () => { this.set(entry.id); }));
		});
	}

	set(space){
		this.rc(...SPACES.map(entry => "sections-space-" + entry.id)).ac("sections-space-" + (this.space = space));
		this.$chips?.empty(() => { this.space_group(); });
		return this;
	}
}

/* ── A NAV INSIDE A SECTION ────────────────────────────────────────────────────
   The owner's question, answered by doing it. Two behaviours, and the difference is
   the whole of the 2026-09-05 stable/dynamic ruling:

     switch   STABLE. Every panel is in the DOM, stacked in one grid cell, and the
              ones you are not reading are `visibility: hidden` — hidden but still
              measured. So the middle is always as tall as its tallest panel and
              clicking cannot move anything. Head, Side, Aside and Foot never budge.

     launch   DYNAMIC. Clicking opens a FOURTH column. Everything on screen shifts
              left to pay for it. Useful, and it moves what you were looking at —
              which is exactly why it is a different word.                        */
export class SectionsNav extends View {
	render(){
		/* THE MOBILE COLLAPSE. The bar is hidden above the section's stacking floor
		   and the list is always open; below it the bar appears and the list is closed
		   until you press it. One class, no second arrangement. */
		press(div.c("sections-nav-bar", () => { icon("menu"); span(this.label ?? "Menu"); }), () => { this.tc("open"); });

		div.c("sections-nav-list", () => {
			this.items.forEach((item, i) => {
				press(div.c("sections-nav-item", item.title).ac(i === (this.here ?? 0) && "on"), () => { this.go(i); });
			});
		});
	}

	go(index){
		this.here = index;

		this.el.querySelectorAll(".sections-nav-item").forEach((el, i) => el.classList.toggle("on", i === index));

		if (this.mode === "launch") return this.band.launch(this.items[index]);

		this.$panels?.el.querySelectorAll(".sections-panel").forEach((el, i) => el.classList.toggle("sections-off", i !== index));
		return this;
	}

	// The middle: every panel at once, one on top of the other, the tallest one
	// deciding the height. Call this from the band's `main` slot.
	panels(){
		return this.$panels = div.c("sections-reserve", () => {
			this.items.forEach((item, i) => {
				div.c("sections-panel").ac(i !== (this.here ?? 0) && "sections-off").append(() => { item.draw(); });
			});
		});
	}
}

/* ── FILLER, so a demo has something to be about ──────────────────────────────
   Plain sentences and plain tiles. Nothing here is part of the vocabulary. */
export const lines = (n, word = "This is the middle column. It is the part of a section that holds the thing you came for — an article, a demo, a dashboard, a wall of cards.") => {
	for (let i = 0; i < n; i++) p.c("sections-text", word);
};

export const heading = text => h3.c("sections-title", text);

export const tiles = (n, label = "Tile") => div.c("sections-tiles", () => {
	for (let i = 1; i <= n; i++) div.c("sections-tile", () => { span.c("sections-tile-name", label + " " + i); });
});

export const link = (href, text, glyph = "arrow_forward") => a.c("sections-link").href(href).append(() => {
	span(text); icon(glyph);
});

export default SectionsBand;
