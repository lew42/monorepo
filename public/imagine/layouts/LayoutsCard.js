import { View, div, span, a, p, pre, icon } from "/app.js";
import { apply, spell, SURFACES, SURFACE_CLASS, SURFACE_MEANS, PADS, PAD_CLASS, PAD_MEANS,
         NAVS, NAV_MEANS, name_of, url_of } from "./system.js";

/* ── THE 3-COLUMN CARD ─────────────────────────────────────────────────────────
   One class, and every entry in the catalogue is drawn with it — the owner's own
   shape:

     LEFT    a small title, a two-sentence intro, and the chips
     CENTRE  the layout itself, live, in a viewport whose width the reader sets
     RIGHT   the readouts — the CSS it is, the widths it measured, the config line

   The three columns are `LayoutsCard.Intro`, `.Stage` and `.Reads`, hung on the
   constructor as statics so a subclass inherits the whole machine and can replace one
   column without touching the other two (`this.constructor.Stage`, never
   `LayoutsCard.Stage`).

   ⚠ THE CLASS NAMES ARE THE CSS CLASSES. `View.classify()` adds one class per
     constructor in the chain, kebab-cased — so `LayoutsIntro` IS `.layouts-intro` and
     nothing has to type it. That is also why every name here carries the realm's
     prefix: a part called `Card` or `Stage` would wear `.card` / `.stage`, and
     `.stage` is one of the five framework layout words (aspect-ratio, a ceiling,
     `pointer-events: none`) — a part named after a layout word silently inherits it.

   NOTHING IS REMEMBERED. Not in storage, not in the url — the night's rule 4. A card
   that has been changed says so in its own intro column and offers the way back, so a
   reader three chips deep is never quietly looking at something other than the base
   example.                                                                          */

/* A CLICKABLE THAT IS NOT A <button>. The site theme styles every button as a small
   uppercase CTA at (0,2,0) in the same layer, so a chip cannot win that fight at its
   own specificity — the answer the styles docs reached is a clickable span, and the
   keyboard half is what the button was giving us for free. Restated here rather than
   imported from `imagine/paging/paging.js`, which would load that realm's stylesheet
   onto every page in this one. */
export const press = (view, act) => view
	.attr("role", "button").attr("tabindex", "0")
	.click(act)
	.on("keydown", event => {
		if (event.key !== "Enter" && event.key !== " ") return;
		event.preventDefault();
		act();
	});

// The widths the viewport chip offers. `fit` is the room the card actually has.
export const VIEWS = ["fit", "400", "1280", "1920", "3440"];

export class LayoutsCard extends View {

	// ════ THE STATE ═══════════════════════════════════════════════════════════
	// Four axes, all in memory. `surface` opens on `card` because a stage that is
	// not visually evident is exactly what the owner reported about swapping: you
	// have to be able to SEE the area that changed.
	opening(){ return { pad: "default", surface: "card", nav: "none", view: "fit" }; }

	base(){ return this.opened ??= { ...this.opening(), ...this.mode }; }

	state(){ return this.picked ??= { ...this.base() }; }

	at(axis){ return this.state()[axis]; }

	// Has the reader moved anything off the base example?
	modified(){ const base = this.base(); return Object.keys(base).some(key => base[key] !== this.at(key)); }

	/* THE ONE SEAM. Every chip is this call, and each axis touches exactly the one
	   thing it names: `surface` and `pad` restamp one class group on the frame and
	   nothing else; `nav` rebuilds the frame's body, because a navigation is an
	   element and not a class; `view` sets the viewport's width and zoom. Then the
	   widths are re-read, because three of the four can move them. */
	pick(axis, value){
		if (this.at(axis) === value) return this;

		this.picked = { ...this.state(), [axis]: value };

		if (axis === "surface" || axis === "pad") this.dress();
		if (axis === "nav") this.$frame?.empty(() => { this.body(); });
		if (axis === "view") this.fit();

		return this.refresh();
	}

	reset(){
		this.picked = { ...this.base() };
		this.dress();
		this.$frame?.empty(() => { this.body(); });
		this.fit();
		return this.refresh();
	}

	// The three things that report on the state, re-drawn together so no two of them
	// can disagree about what the card is showing.
	refresh(){
		this.$chips?.empty(() => { this.chips(); });
		this.$why?.empty(() => { this.why(); });
		this.remeasure();
		return this;
	}

	// ════ THE CARD ════════════════════════════════════════════════════════════
	render(){
		new this.constructor.Intro({ card: this });
		new this.constructor.Stage({ card: this });
		new this.constructor.Reads({ card: this });
	}

	// ── the intro column ──
	intro(){
		const entry = this.entry;

		span.c("layouts-eyebrow", name_of(entry));
		p.c("layouts-name", entry.title);
		p.c("layouts-blurb", entry.intro);

		this.$chips = div.c("layouts-chips", () => { this.chips(); });

		p.c("layouts-when", entry.when);

		if (this.full) return;

		a.c("layouts-chip").href(url_of(entry)).append(() => {
			icon("open_in_full");
			span("open full screen");
		});
	}

	chips(){
		this.group("padding", PADS, "pad");
		this.group("surface", SURFACES, "surface");
		this.group("navigation", NAVS, "nav");

		if (!this.modified()) return;

		// Night rule 4: a demo that is no longer the base example says so, and the
		// way back sits right beside the mark.
		div.c("layouts-group", () => {
			span.c("layouts-mark", () => { icon("edit"); span("modified"); });
			press(span.c("layouts-chip").append(() => { icon("restart_alt"); span("reset"); }), () => this.reset());
		});
	}

	group(label, values, axis){
		div.c("layouts-group", () => {
			span.c("layouts-axis", label);
			values.forEach(value => this.chip(axis, value, value));
		});
	}

	chip(axis, value, words){
		const on = this.at(axis) === value;

		return press(span.c("layouts-chip", words).ac(on && "on")
			.attr("aria-pressed", String(on))
			.attr("data-axis", axis)
			.attr("data-value", value), () => this.pick(axis, value));
	}

	// ── the centre column: the frame, and the viewport it lives in ──
	stage(){
		this.$stagebox = div.c("layouts-stage-box", () => {
			this.$viewport = div.c("layouts-viewport", () => {
				this.$frame = div.c("layouts-frame", () => { this.body(); });
			});
		});

		this.dress();

		div.c("layouts-scale", () => { this.views(); });

		/* The first measurement has to wait for a layout: the card is built before it
		   is in the document, so there is nothing to read yet. A timeout rather than
		   `requestAnimationFrame`, because a hidden or background tab never paints —
		   and this realm's own probe runs in one. */
		setTimeout(() => { this.fit(); this.remeasure(); }, 0);
		this.watch();
	}

	views(){
		span.c("layouts-axis", "viewport");
		VIEWS.forEach(view => this.chip("view", view, view === "fit" ? "fit" : view + "px"));
		this.$zoom = span.c("layouts-navnote");
	}

	/* THE FRAME'S BODY — the navigation type, drawn around the layout. A navigation
	   is an ELEMENT, so it is the one axis that rebuilds rather than restamps. */
	body(){
		const nav = this.at("nav");

		if (nav === "crumbs") this.crumbline();
		if (nav === "tabs") this.tabs();

		if (nav === "left rail" || nav === "right rail"){
			div.c("layouts-navrow", () => {
				if (nav === "left rail") this.rail();
				this.layout();
				if (nav === "right rail") this.rail();
			});
		} else {
			this.layout();
		}

		if (nav === "bottom bar") this.bar();
	}

	crumbline(){
		return div.c("layouts-crumbline", () => {
			span("Home"); icon("chevron_right"); span("Section"); icon("chevron_right"); span("This page");
		});
	}

	tabs(){ return div.c("layouts-tabs", () => ["Overview", "Detail", "Notes"].forEach((word, i) => span.c("layouts-tab", word).ac(!i && "on"))); }

	rail(){ return div.c("layouts-rail", () => ["Home", "Docs", "Notes", "About"].forEach(word => span(word))); }

	bar(){ return div.c("layouts-bar", () => ["Home", "Search", "Saved", "You"].forEach(word => span(word))); }

	// THE LIVE LAYOUT. Every declaration comes from the entry's own `rules` object —
	// the same object the readout column prints.
	layout(){
		this.$layout = apply(div.c("layouts-layout"), this.entry.rules);
		this.$layout.append(() => this.entry.boxes.forEach(node => this.box(node)));
		return this.$layout;
	}

	box(node){
		// A track that holds tracks is a `.layouts-nest`, never a `.layouts-box` — the
		// box class centres its content, which a container must not do to its children.
		const $box = div.c(node.nest ? "layouts-nest" : "layouts-box").ac(node.sections && "layouts-sections");

		apply($box, node.rules ?? {});

		$box.append(() => {
			if (node.kids) return void node.kids.forEach(kid => this.box(kid));
			span.c("layouts-box-label", node.label);
			if (node.note) span.c("layouts-box-note", node.note);
		});

		return $box;
	}

	// ── the paint: two class groups, restamped from the state ──
	dress(){
		if (!this.$frame) return this;

		this.$frame
			.rc(...SURFACES.map(word => SURFACE_CLASS[word]))
			.rc(...PADS.map(word => PAD_CLASS[word]))
			.ac(SURFACE_CLASS[this.at("surface")])
			.ac(PAD_CLASS[this.at("pad")]);

		return this;
	}

	/* ── THE RESPONSIVE VIEWPORT ───────────────────────────────────────────────
	   The viewport is given a real width in pixels and then zoomed to fit the room
	   the card has. Every arrangement in the catalogue is percentage or fr
	   arithmetic off its parent, so a 3440px box shown at 18% divides exactly as a
	   3440px screen would — with the one honest exception `styles/layouts/cols/`
	   already measured: `rem` is 16px in both and `em` is not. The caption says
	   which width you are looking at and at what scale, every time. */
	fit(){
		const $box = this.$stagebox, $vp = this.$viewport;
		if (!$box || !$vp) return this;

		const view = this.at("view");

		if (view === "fit"){
			$vp.style({ width: "auto" });
			$vp.el.style.removeProperty("zoom");
			this.$zoom?.text("the room this card actually has");
			return this;
		}

		const style = getComputedStyle($box.el);
		const room = $box.el.clientWidth - parseFloat(style.paddingLeft || 0) - parseFloat(style.paddingRight || 0);
		const target = Number(view);
		const zoom = room > 0 ? Math.min(1, room / target) : 1;

		$vp.style({ width: target + "px", zoom: String(zoom) });
		this.$zoom?.text(target + "px wide, shown at " + Math.round(zoom * 100) + "%");
		return this;
	}

	/* Re-fit and re-measure when the card's own room changes — the reader dragging a
	   column seam, or the window. Guarded, and nothing depends on it: a hidden tab
	   gets no ResizeObserver callbacks at all, so the timeout above is what makes
	   the first measurement land. */
	watch(){
		if (typeof ResizeObserver !== "function" || !this.$stagebox) return this;
		this.observer = new ResizeObserver(() => { this.fit(); this.remeasure(); });
		this.observer.observe(this.$stagebox.el);
		return this;
	}

	/* WHAT THE TRACKS ACTUALLY MEASURED. `offsetWidth`, never
	   `getBoundingClientRect()` — the viewport is zoomed, and a rect follows the
	   zoom while `offsetWidth` stays in the CSS pixels of the width being simulated,
	   which is the number a reader wants. */
	tracks(){ return this.$layout ? [...this.$layout.el.children].map(el => ({ w: Math.round(el.offsetWidth), top: el.offsetTop })) : []; }

	/* ⚠ SAY WHEN THE ROW HAS STACKED. Every distribution here carries a floor — 34rem
	     for two tracks, 52rem for three — and under it the row deliberately puts each
	     track on its own line. Without this note the readout said "481px · 481px" for
	     two boxes inside a 481px layout, which reads exactly like a broken measurement
	     instead of the layout doing the one thing it promises (2026-09-05, pressing
	     `left rail` on `2.equal` at 1920: the rail took the row under its floor). */
	remeasure(){
		this.$tracks?.empty(() => {
			const boxes = this.tracks();
			boxes.forEach(box => span.c("layouts-px", box.w + "px"));

			const lines = new Set(boxes.map(box => box.top)).size;

			if (boxes.length > 1 && lines > 1)
				span.c("layouts-navnote", "on " + lines + " lines — this width is under the layout's stacking floor, which is the layout keeping its promise, not failing.");
		});
		return this;
	}

	// ── the readout column ──
	reads(){
		const entry = this.entry;

		div.c("layouts-read", () => {
			div.c("layouts-read-head", "the css it is");
			pre.c("layouts-code", spell(entry.rules));
		});

		div.c("layouts-read", () => {
			div.c("layouts-read-head", "measured tracks");
			this.$tracks = div.c("layouts-tracks");
		});

		div.c("layouts-read", () => {
			div.c("layouts-read-head", "one line of config");
			pre.c("layouts-code", entry.config);
		});

		div.c("layouts-read", () => {
			div.c("layouts-read-head", "the word it compiles to");
			a.c("layouts-chip", entry.word.label).href(entry.word.href);
		});

		this.$why = div.c("layouts-read", () => { this.why(); });
	}

	/* What the three chips currently say, in words — the feedback half of a readout
	   column, and how a reader confirms that a chip changed only what it names. */
	why(){
		div.c("layouts-read-head", "what the chips say");
		p.c("layouts-navnote", "Padding " + this.at("pad") + " — " + PAD_MEANS[this.at("pad")] + ".");
		p.c("layouts-navnote", "Surface " + this.at("surface") + " — " + SURFACE_MEANS[this.at("surface")] + ".");
		p.c("layouts-navnote", "Navigation " + this.at("nav") + " — " + NAV_MEANS[this.at("nav")]);
	}
}

/* ── THE THREE COLUMNS ─────────────────────────────────────────────────────────
   Each one is a View over the card, so a page can replace one of them without the
   card knowing. They hold no state: the card is the only thing that has any. Their
   class NAMES are their CSS classes (see the note at the top). */

LayoutsCard.Intro = class LayoutsIntro extends View {
	render(){ this.card.intro(); }
};

LayoutsCard.Stage = class LayoutsStage extends View {
	render(){ this.card.stage(); }
};

LayoutsCard.Reads = class LayoutsReads extends View {
	render(){ this.card.reads(); }
};

export default LayoutsCard;
