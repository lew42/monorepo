import { View, div, p, span, a, icon } from "/app.js";
import { clean, nav_of, title_of } from "./blocks.js";
import { CONTENT_DRAW, PAGES } from "./content.js";

/* ⚠ `paging.css` is loaded by `paging.js`, not here. Every page that puts a Stage on
     screen is a page of this realm and so extends `Paging`; loading the sheet twice
     would put two identical <link>s in the head for one file. */

/* ── THE STAGE ─────────────────────────────────────────────────────────────────

   ONE BOX, and five words over it. Give it a configuration and it draws a whole,
   real page: chrome around a content box, a list of children, and a caption under
   it saying what your last click did.

       new Stage({ config: { navigation: "tabs", content: "article", … } })

   Everything in this realm is this class. A preset is a configuration; the hover
   toolbar edits one; the drawer prints one as JSON. There is no second renderer.

   ⚠ THE BOX NEVER MOVES unless the configuration says it should. That is the whole
     idea a "stage" names, and it is why the caption measures the box before and
     after every click instead of claiming anything: `stable` navigation reads
     "0px" out loud, and `columns`/`takeover` read the real number they moved it by.
     (Decision 5 of 2026-09-05 — stable navigation versus dynamic.)               */

export class PagingStage extends View {

	// ── state ────────────────────────────────────────────────────────────────
	// `open` is which child is showing (null = the page's own content). Held in
	// memory only, never in storage: a refresh puts the demo back to the page it is.
	/* ⚠ THE FIELDS ARE SET BEFORE `super.initialize()`, NOT AFTER. `View.initialize()`
	     IS the render — it calls `append(this.render)` — so anything assigned after it
	     is assigned to a view that has already drawn itself, and `render()` threw on an
	     undefined `pages` list. `PagingSwapper` in this realm already had it in this
	     order; the note was not written down until now. */
	initialize(){
		this.config = clean(this.config);
		this.pages ??= PAGES;
		this.open ??= null;
		super.initialize();
	}

	/* ⚠ THE CLASS NAME IS THE CSS CLASS. `View.classify()` walks the constructor chain
	     and adds each name lowercased, so a class called `Stage` wore the framework's
	     own `.stage` layout word — `container-type: inline-size; overflow: hidden` —
	     and shrink-wrapped itself to 307px inside a 1546px frame with nothing thrown
	     (measured 2026-09-05, 1920). A View's class name goes through the same
	     new-css-class check as a hand-written selector: `PagingStage` → `paging-stage`. */
	render(){
		this.paint();
		this.frame();
	}

	// ── the paint ────────────────────────────────────────────────────────────
	// Six classes, one per word, all on the frame — so a repaint is one remove and
	// one add, and two colours can never end up as one class fighting itself.
	paint(){
		const c = this.config;

		this.rc(...["plain", "card", "tint", "prim", "dark"].map(w => "paging-bg-" + w))
			.rc(...["compact", "regular", "display"].map(w => "paging-type-" + w))
			.rc(...["narrow", "reading", "wide", "full"].map(w => "paging-room-" + w))
			.rc(...["plain", "bar-top", "bar-bottom", "rail-left", "rail-right", "main-aside", "wall"].map(w => "paging-arr-" + w))
			.rc(...["none", "tabs", "rail", "rail-right", "columns", "takeover"].map(w => "paging-nav-" + w))
			.ac("paging-bg-" + c.background, "paging-type-" + c.type,
				"paging-room-" + c.room, "paging-arr-" + c.arrangement, "paging-nav-" + c.navigation);

		return this;
	}

	// ── the frame ────────────────────────────────────────────────────────────
	frame(){
		const c = this.config;

		// A takeover has eaten the stage: one trail back, then the child, alone.
		if (c.navigation === "takeover" && this.open !== null) return this.taken();

		if (c.room === "full") this.exit();
		if (c.arrangement === "bar-top") this.bar("top");

		div.c("paging-stage-body", () => {
			if (c.navigation === "rail" || c.arrangement === "rail-left") this.rail("left");

			div.c("paging-stage-mid", () => {
				if (c.navigation === "tabs") this.tabs();
				this.box();
				if (c.navigation === "columns" && this.open !== null) this.pane();
			});

			if (c.navigation === "rail-right" || c.arrangement === "rail-right") this.rail("right");
			if (c.arrangement === "main-aside") this.aside();
		});

		if (c.arrangement === "bar-bottom") this.bar("bottom");

		if (!this.inner) this.$cap = div.c("paging-cap", () => { this.caption(); });
	}

	/* THE BOX. The only element the caption measures, and the only one wearing the
	   CONTENT colour — which is the second of the owner's two independent colour
	   controls (the first is the frame's background, above). */
	box(){
		return this.$box = div.c("paging-canvas")
			.ac("paging-surface-" + this.config.surface)
			.append(() => { this.held(); });
	}

	// What the box holds: the child that is open, or the page's own content.
	held(){
		const child = this.open !== null && this.pages[this.open];

		// ⚠ Called from inside `box()`'s own captured callback, so the factories in
		// the drawing function append to the box on their own — nothing may `empty()`
		// the box from in here, which would clear the append that is still running.
		if (!child){
			// `draw` is the seam a page uses to put its OWN thing in the box — the
			// templates realm hands over a family's real machinery this way, so the
			// two colours and the type scale repaint a real magazine cover.
			if (this.draw) this.draw(this);
			else (CONTENT_DRAW[this.config.content] ?? CONTENT_DRAW.article)();

			return this.nest_box();
		}

		div.c("paging-held", () => {
			span.c("paging-eyebrow", "the box did not move — only this did");
			p.c("h2", child.title);
			p(child.text);
		});
	}

	/* A WHOLE PAGE INSIDE THIS ONE. `nest` is another configuration, and it is drawn
	   by this same class — so a nested page really navigates, really repaints, and
	   really wears its own two colours. The owner's ask: "we want to be able to put
	   any one of these page types inside any other." The drawer sets it; the `nest`
	   preset ships with one already in.
	   ⚠ `inner: true` on the nested one, and the method is `nest_box()` — a FIELD and a
	     METHOD of the same name is the shadowing trap this realm has already been bitten
	     by twice (`chosen`, `opens`): `this.nested` would have been a boolean where a
	     function was called. The inner stage drops its caption and cannot take the
	     screen: a page inside a box may not eat the screen. */
	nest_box(){
		if (!this.nest) return null;

		return div.c("paging-nest", () => {
			span.c("paging-eyebrow", "a whole page, running inside this box");
			new PagingStage({ config: { ...this.nest, room: "reading" }, inner: true });
		});
	}

	// ── the child list, drawn four ways ──────────────────────────────────────

	tabs(){
		return div.c("paging-strip", () => {
			this.pages.forEach((child, i) => this.tab(child, i));
		});
	}

	tab(child, i){
		return this.press(span.c("paging-strip-tab", child.title).ac(this.open === i && "on"), i);
	}

	rail(side){
		return div.c("paging-rail paging-rail-" + side, () => {
			span.c("paging-eyebrow", "pages");
			this.pages.forEach((child, i) => this.row(child, i));
		});
	}

	// A row, for the rail and for the two mechanisms that navigate. It carries the
	// icon of what clicking it will DO, which is the promise the row makes.
	row(child, i){
		const nav = nav_of(this.config.navigation);

		return this.press(span.c("paging-row").ac(this.open === i && "on").append(() => {
			icon(child.icon).ac("paging-row-glyph");
			span.c("paging-row-words", child.title);
			icon(nav.icon).ac("paging-sign");
		}), i);
	}

	// `columns` — the child opens as a pane to the RIGHT, inside the stage, and the
	// box shrinks to make room. Nothing else about the page changes.
	pane(){
		const child = this.pages[this.open];

		return div.c("paging-pane", () => {
			span.c("paging-eyebrow", "opened to the right — the box shrank to make room");
			p.c("h2", child.title);
			p(child.text);
			this.press(span.c("paging-back", () => { icon("close"); span("close this column"); }), this.open);
		});
	}

	// `takeover` — the child has the whole stage, and the trail is the way back.
	taken(){
		const child = this.pages[this.open];

		div.c("paging-trail", () => {
			this.press(span.c("paging-crumb", "Northwind"), this.open);
			icon("chevron_right");
			span.c("paging-crumb on", child.title);
		});

		div.c("paging-canvas").ac("paging-surface-" + this.config.surface).append(() => {
			div.c("paging-held", () => {
				span.c("paging-eyebrow", "this child took the whole stage — everything behind it is the trail above");
				p.c("h2", child.title);
				p(child.text);
			});
		});

		this.$cap = div.c("paging-cap", () => { this.caption(); });
	}

	// ── the chrome the ARRANGEMENT word adds ─────────────────────────────────
	// Real controls, not decoration: a bar of the same page's own actions.
	bar(where){
		return div.c("paging-bar paging-bar-" + where, () => {
			["Save", "Share", "History"].forEach(word => span.c("paging-bar-btn", word));
			span.c("paging-bar-gap");
			span.c("paging-bar-note", where === "top" ? "toolbar" : "footer");
		});
	}

	aside(){
		return div.c("paging-aside", () => {
			span.c("paging-eyebrow", "on this page");
			["Notes that other people can read", "What a child costs", "Writing a page"]
				.forEach(words => span.c("paging-aside-row", words));
		});
	}

	// The way out of a full-screen stage, always at the top-left where the eye is.
	exit(){
		return this.press(span.c("paging-exit", () => {
			icon("close_fullscreen");
			span("leave full screen");
		}), null, () => this.set("room", "reading"));
	}

	// ── clicking ─────────────────────────────────────────────────────────────
	/* ⚠ A CLICKABLE THAT IS NOT A `<button>`. The site theme styles every `button`
	     as a small uppercase CTA at (0,2,0) in the same layer, so a chip cannot win
	     that at its own specificity and the answer the styles docs already reached
	     is a clickable span. The keyboard half is what a button gave for free, so
	     it is restated here. */
	press($el, i, act){
		return $el.attr("role", "button").attr("tabindex", "0")
			.click(() => (act ?? (() => this.pick(i)))())
			.on("keydown", e => {
				if (e.key !== "Enter" && e.key !== " ") return;
				e.preventDefault();
				(act ?? (() => this.pick(i)))();
			});
	}

	/* ONE SEAM for every click on a child. Measures the box, redraws, measures again
	   — so the caption reports what happened rather than what was intended.
	   ⚠ `getBoundingClientRect()` flushes layout synchronously, so the "after" is
	     real and no frame has to be waited for. */
	pick(i){
		const was = this.open === null ? null : this.pages[this.open].title;
		const before = this.rect();

		this.open = this.open === i ? null : i;

		this.redraw();

		this.change = {
			from: was ?? "the page itself",
			to: this.open === null ? "the page itself" : this.pages[this.open].title,
			before, after: this.rect(),
		};

		this.$cap?.empty(() => { this.caption(); });
		return this;
	}

	// Change one word of the configuration. The toolbar, the drawer and the preset
	// dropdown all come through here, so "a chip" and "a line of code" are one call.
	set(axis, value){
		const was = this.config[axis];
		if (was === value) return this;

		const before = this.rect();
		this.config = { ...this.config, [axis]: value };

		// A navigation word that cannot hold an open child closes it rather than
		// leaving a stage in a state its own word does not describe.
		if (axis === "navigation" && value === "none") this.open = null;

		this.redraw();

		this.change = { axis, from: title_of(axis, was), to: title_of(axis, value), before, after: this.rect() };
		this.$cap?.empty(() => { this.caption(); });

		this.changed?.(axis, value);
		return this;
	}

	redraw(){ this.paint(); this.empty(() => { this.frame(); }); return this; }

	rect(){
		const box = this.$box?.el?.getBoundingClientRect();
		return box ? { w: Math.round(box.width), h: Math.round(box.height) } : null;
	}

	// ── the caption ──────────────────────────────────────────────────────────
	/* WHAT JUST CHANGED, and what it did to the box. Never a conclusion, never a
	   claim — a report, in the reader's own words and in pixels. ("Nothing on this
	   page navigates" and "Same box" were deleted on 2026-09-05: both are things you
	   only understand after you have already seen it work.) */
	caption(){
		const change = this.change;

		if (!change) return p.c("muted", "Click a page name. This line will say what changed.");

		const moved = this.moved(change.before, change.after);

		return p(() => {
			span.c("paging-cap-what", change.axis
				? title_of(change.axis, change.to)
				: change.from + " → " + change.to);
			span(" " + moved);
		});
	}

	moved(before, after){
		if (!before || !after) return "";

		const dw = after.w - before.w, dh = after.h - before.h;

		if (!dw && !dh) return "The box did not move: still " + after.w + " × " + after.h + "px.";
		if (dw && dh)   return "The box went from " + before.w + " × " + before.h + "px to " + after.w + " × " + after.h + "px.";
		if (dh)         return "The box is " + Math.abs(dh) + "px " + (dh > 0 ? "taller" : "shorter") + " — same width.";

		return "The box is " + Math.abs(dw) + "px " + (dw > 0 ? "wider" : "narrower") + " — same height.";
	}
}

export const Stage = PagingStage;
export default PagingStage;
