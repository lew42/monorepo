import { Page } from "../Page/Page.class.js";
import View, { div, p, h2, h3, span, a, code, button, table, thead, tbody, tr, th, td } from "../View/View.js";
import { stage } from "../../ext/demo/stage.js";
import pane from "../../ext/demo/pane.js";
import { FIXTURES, arrange, tone_of, apply } from "./fixtures.js";
import { STRIP } from "./layouts.js";
import { check, warn, prove, fatal } from "./rules.js";
import { strip } from "./strip.js";

View.stylesheet(import.meta, "Layout.css");

/* ── A LAYOUT PAGE ─────────────────────────────────────────────────────────────

   A Layout is a Page that declares AN ARRANGEMENT OF NAMED BOXES, the width range
   it is proven at, and the rules about where it may go — and owns no content. The
   stress fixtures are what goes in the boxes, and they are the separation: a
   layout that only looks right with particular content is a draft page, not a
   layout (the owner, addendum 2).

   Every prop is a plain page prop, so a filter reads `layout.columns`,
   `layout.tags`, `layout.widths[0]` with nothing to register and no schema. The
   whole catalogue is `layouts.js`; readme.md has the prop table.

   ⚠ `Layout extends Page`, and `Page` is NOT a `View` — so `View.classify()` never
     sees this class and no CSS class is minted from its name. Every VIEW part
     built below is named `PageLayout*`, which mints `.page-layout-*`: `page-` is
     core/Page's reserved prefix and `layout-` belongs to `ext/layout`
     (styles/css-scopes.txt). `core/Page/Frame.js`'s `PageFrame` is the precedent.

   ⚠ `words()` IS OVERRIDDEN TO DO NOTHING. Core's `words()` does
     `this.width ??= this.room`, and `room` here means the framework layout word a
     layout compiles to (`page` `rail` `wall` `stage` `solo`) — not a page width.
     Without this override every layout page would stamp a bogus `page-w-page`.

   ⚠ NO CLASS FIELDS FOR DEFAULTS. A subclass's field initializers run AFTER
     `super()` has finished, so a field here would overwrite the config that was
     just assigned. The defaults are on the prototype at the bottom of this file,
     where an assigned value shadows them the ordinary way.                       */

export class Layout extends Page {

	words(){ return this; }

	/* ── THE PAGE ──────────────────────────────────────────────────────────────
	   One screen first: the sentence that says what this divides, then the layout
	   itself at its floor width with the handle, and the strip beside it. Every
	   word after that is one scroll down. */
	content(){
		p(this.intro);

		div.c("page-layout-top wide flex gap wrap", () => {
			this.viewport();
			div.c("page-layout-aside", () => {
				h3("How it responds");
				p.c("muted", `Seven widths, ${this.widths[0]}px to 3440. A pane below ${this.widths[0]} draws ${this.fallback} instead — below its floor this layout stacks, and the fallback is the thing being judged there.`);
				strip(this, this.fixture());
			});
		});

		h2("When to reach for it");
		p(this.when);
		if (this.note) this.prose(this.note);
		if (this.see) this.prose(this.see);

		h2("What it declares");
		this.props();

		h2("Variations");
		p.c("muted", "The same arrangement, distributed differently.");
		this.wall(this.variations);

		h2("Alternatives");
		p.c("muted", "A different arrangement that answers the same question.");
		this.wall(this.alternatives);

		h2("Is it approved?");
		this.approval();
	}

	// The fixture currently poured into the boxes. One place, so the viewport, the
	// strip and the chips can never disagree about what is on screen.
	fixture(){ return this.showing ??= FIXTURES[4]; }

	/* name → fixture kind. DERIVED from `boxes`, never declared beside it: written
	   twice, the two are one edit away from disagreeing about what a slot holds.
	   ⚠ A METHOD, not a getter. `assign()` writes with [[Set]], and a prototype
	     accessor with no setter throws on the way in — a config that happened to
	     carry a `slots` key would take the whole page down. */
	slots(){ return Object.fromEntries((this.boxes ?? []).map(box => [box.label, box.kind ?? "bare"])); }

	/* THE VIEWPORT — the site's one resizable stage (`ext/demo/stage.js`), opened at
	   this layout's own FLOOR, because the floor is where a layout is hardest and
	   where a reader learns the most. The handle and the strip are how you leave it.
	   ⚠ `bleed` on the stage zeroes `.demo-screen`'s padding, so the render is the
	     stage's width to the pixel and the readout says the number that was asked
	     for. Without it the render is 3rem narrower than the floor and the proof
	     "it opens at its floor" quietly fails by 48px. */
	viewport(){
		/* ⚠ THE FLEX BASIS IS THE FLOOR, not a token. A `1 1 24em` viewport gets
		   whatever the row hands it, and the stage's `max-width: 100%` then caps a
		   1400px layout at 602px on a 1280 screen with nothing thrown — measured
		   before this line existed. The basis asks the ROW for the floor, and the
		   aside wraps below when there is not room for both. */
		return div.c("page-layout-viewport").style("flex", `1 1 ${this.widths[0]}px`).append(() => {
			this.chips();

			const { $stage, $render } = stage(() => this.render_fixture(), "", STRIP.map(w => [w, String(w)]));

			this.$render = $render;
			$stage.ac("bleed page-layout-stage").style({ flex: "0 0 auto", width: this.widths[0] + "px", maxWidth: "100%" });

			return $stage;
		});
	}

	/* The arrangement with the current fixture in it, and the rules checked against
	   the box it landed in.
	   ⚠ THE BOX HAS NO SIZE YET. A page is built detached, so every rect right now
	     reads 0 and rule 1 would fire on all thirty. The observer fires the moment
	     it gets a size — and again on every drag of the handle, which is exactly
	     when the width rule needs asking again. */
	render_fixture(){
		const $box = apply(div.c("page-layout-host"), tone_of(this.fixture()));

		$box.append(() => arrange(this, this.fixture()));

		new ResizeObserver(() => {
			$box.rc("page-layout-warn");
			$box.el.querySelector(":scope > .page-layout-warn-badge")?.remove();
			warn($box, check(this, $box.el));
		}).observe($box.el);

		return $box;
	}

	// One chip per fixture. Clicking one redraws the render and the strip — the
	// whole point of the fixtures is that you can see the layout survive them.
	chips(){
		return div.c("page-layout-chips flex gap wrap v-center", () => {
			span.c("muted", "Fixture");

			FIXTURES.forEach(fixture => button.c("page-layout-chip", fixture.chip)
				.attr("title", fixture.label)
				.ac(fixture === this.fixture() && "prim")
				.click(() => { this.showing = fixture; this.redraw(); }));
		});
	}

	// ⚠ A page memoizes its view, so redrawing means emptying the box we own and
	//   building it again — never `render()`, which hands back the cached view.
	redraw(){
		const view = this.view;
		this.view = null;
		view?.el.replaceWith(this.render().el);
	}

	/* THE PROPS, AS A TABLE. Everything a filter reads, in the order the readme's
	   prop table lists them — one drawing, so a prop that exists is a prop that
	   shows. */
	props(){
		const rows = [
			["columns", String(this.columns), "1 · 2 · 3 · 4 (four or more) — the band it lands in"],
			["room", this.room, "which of the five framework words it compiles to"],
			["widths", this.widths.join(" – ") + "px", "the range it is PROVEN at; the floor is where the viewport opens"],
			["fallback", this.fallback, "the 1-column layout it becomes below its floor"],
			["grows", String(this.grows), this.grows ? "a stack — content length can never break it" : "a bounded box: content longer than it has to go somewhere"],
			["overflow", this.overflow ?? "—", this.grows ? "not asked of a growing layout" : "what happens to content longer than the box"],
			["wraps", String(this.wraps), this.wraps ? "the track count follows the room — proven at 1 · 2 · 3 · 5 · 7 items" : "a fixed number of tracks"],
			["tags", (this.tags ?? []).join(" · ") || "—", "facets, from /imagine/design/vocabulary/"],
			["accepts", this.accepts, "what may go inside it"],
			["allowed_in", this.allowed_in, "what it may go inside"],
			["denies", (this.denies ?? []).join(" · ") || "—", "the deny list — three rules exist, and most layouts use none"],
			["approved", this.approved ?? "draft", this.approved ? "the date the fixtures last passed at every strip width" : "the fixtures have not passed yet — see below"],
		];

		table.c("page-layout-props", () => {
			thead(() => tr(() => ["Prop", "This layout", "What it means"].forEach(h => th(h))));
			tbody(() => rows.forEach(([key, value, means]) => tr(() => {
				td(() => code(key));
				td(() => span.c("page-layout-value", value));
				td(() => span.c("muted", means));
			})));
		});

		div.c("page-layout-word", () => {
			span.c("muted", "It compiles to ");
			a.c("page-link", this.word.label).href(this.word.href);
			span.c("muted", " — one line of page code:");
		});

		code.c("page-layout-config", this.config);
	}

	/* A WALL OF SIBLINGS, drawn with the same card the tree uses — `preview()` is
	   the layout's own, so there is one card shape on this site and not a second
	   one here (the browse() rule). */
	wall(names){
		const kin = (names ?? []).map(name => this.parent?.children.get(name)).filter(Boolean);

		if (!kin.length) return p.c("muted", "None recorded yet.");

		return div.c("page-previews wide", () => kin.forEach(page => page.preview(this.parent.nav_for(page.name))));
	}

	/* THE FIXTURE RUN, ON A BUTTON. 8 fixtures x 7 widths is 56 renders for one
	   layout, which is why it is a click and not something that happens on load.
	   The verdict written back into `layouts.js` came from the headless probe,
	   which sets the REAL viewport to each width — a fixed-width box here answers
	   container queries but not `@media`, and the button says so. */
	approval(){
		const page = this;

		p(this.approved
			? "Approved " + this.approved + " — every fixture passed at every width in the strip."
			: "Draft. The fixtures have not all passed yet; run them below to see which.");

		let $out;

		// ⚠ `click` binds `this` to the BUTTON's View, so the page is reached through
		//   the closure above — the shape every other button in core takes.
		// ⚠ One frame before the run: 56 renders block the paint, and a button that
		//   never says "Running…" reads as a button that did nothing.
		button.c("prim page-layout-run", "Run the fixtures at all seven widths").click(function(){
			const label = this.el.textContent;
			this.text("Running…");

			requestAnimationFrame(() => {
				const found = STRIP.flatMap(width => prove(page, width));
				this.text(label);
				page.report($out, found);
			});
		});

		p.c("muted", "A box here is a fixed width, so it answers container queries and clamps but not `@media`; the recorded date comes from the headless run, which sets the real viewport to each width.");

		return $out = div.c("page-layout-verdict");
	}

	report($out, found){
		const bad = found.filter(fatal);

		$out.empty(() => {
			p(bad.length ? `${bad.length} finding${bad.length === 1 ? "" : "s"} — this is a draft.` : "Every fixture passed at every width. Approved.");

			found.slice(0, 40).forEach(one => div.c("page-layout-finding")
				.ac(fatal(one) && "page-layout-bad")
				.append(() => {
					span.c("page-layout-value", one.width + "px · " + one.fixture + " · " + one.kind);
					span.c("muted", one.says);
				}));
		});
	}

	prose(text){ return p.c("muted", text); }

	/* ── THE CARD ──────────────────────────────────────────────────────────────
	   A PICTURE, never a live instance (the layout skill's rule): the arrangement
	   drawn as grey boxes, at the card's size, with nothing to read. It is the
	   layout's own shape rather than a generic word, which is what makes a wall of
	   thirty a palette you can pick from.
	   ⚠ The thumb is a `.stage` — 16/10, `overflow: hidden` — so the picture is
	     flex-sized and `height` is dropped from the declarations. A ported entry
	     that says `height: 16em` would otherwise be twice the thumb. */
	preview(nav){
		return this.preview_card(nav, () => pane({ width: 900, height: 560 }, () => this.picture()));
	}

	/* ⚠ DRAWN AT 900px AND PAINTED DOWN, not drawn at the card's own width. A rail
	   is `15em` and a measure is `40em` — real lengths — so a picture built inside a
	   200px thumb would show a wrapped stack for every one of the thirty and the
	   wall would be thirty identical grey rectangles. `ext/demo/pane.js` lays the
	   box out at a fixed width and fits it to the room, which is exactly this. */
	picture(){
		const { height, ...decl } = this.decl ?? {};

		return apply(div.c("page-layout-picture"), stacked(decl))
			.append(() => (this.boxes ?? []).forEach(box => this.blocks(box)));
	}

	// One block per track — and per REPEAT, capped at eight, so a wall looks like a
	// wall rather than like one box. `kids` recurses: a split inside a split.
	blocks(box){
		for (let i = 0; i < Math.min(box.repeat ?? 1, 8); i++){
			const { height, ...decl } = box.decl ?? {};
			const $block = apply(div.c("page-layout-block"), decl);

			if (box.kids) $block.append(() => box.kids.forEach(kid => this.blocks(kid)));
		}
	}
}

/* A picture of a STACK is a column of bars: `display: block` (and a decl that says
   no display at all) becomes a flex column here, so the boxes share the height
   instead of collapsing to three hairlines at the top of the card. `columns:` is
   left alone — masonry's whole picture IS its columns. */
const stacked = decl => (decl.columns || (decl.display && decl.display !== "block"))
	? decl : { ...decl, display: "flex", "flex-direction": "column" };

/* The defaults every layout inherits — on the PROTOTYPE, so a declared value
   shadows one without a line of code. `accepts: "any"` and `allowed_in: "any"` are
   the owner's own instruction: a layout that says nothing restricts nothing. */
Object.assign(Layout.prototype, {
	columns: 1,
	room: "page",
	widths: [400, 3440],
	fallback: "stack",
	grows: true,
	wraps: false,
	accepts: "any",
	allowed_in: "any",
	denies: [],
	tags: [],
	variations: [],
	alternatives: [],
	icon: "view_quilt",
	leaf: true,
});

export default Layout;
