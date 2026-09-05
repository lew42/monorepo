import { View, div, p, span, a, icon } from "/app.js";
import { clean, nav_of, title_of, NAVIGATION, ARRANGEMENT, ROOM, SURFACES, TYPE } from "./blocks.js";
import { CONTENT_DRAW, PAGES } from "./content.js";
import { from_url, write_url } from "./url.js";

// ⚠ ONE LIST PER WORD, and it is the list in `blocks.js`. These five used to be
//   hand-typed arrays of ids in `paint()` below — a sixth copy of the vocabulary,
//   which is exactly what the 2026-09-05 audit found five of.
const ids = list => list.map(entry => entry.id);

/* THE FILE BEHIND A MADE PAGE'S URL. `/imagine/paging/make/notes/` is the page;
   `/imagine/paging/made/notes/page.json` is the file it is drawn from (`make/made.js`
   owns that directory, and `make/page.js` says why the two differ). Anything else is
   fetched as it was given, so a `page.json` written by hand can be nested too. */
const file_for = url => (url.startsWith("/imagine/paging/make/")
	? url.replace("/imagine/paging/make/", "/imagine/paging/made/")
	: url).replace(/\/?$/, "/") + "page.json";

/* ⚠ `paging.css` is loaded by `paging.js`, not here. Every page that puts a Stage on
     screen is a page of this realm and so extends `Paging`; loading the sheet twice
     would put two identical <link>s in the head for one file. */

/* ── THE STAGE ─────────────────────────────────────────────────────────────────

   ONE BOX, and five words over it. Give it a configuration and it draws a whole,
   real page: chrome around a content box, a list of children, and a caption under
   it saying what your last click did.

       new Stage({ config: { navigation: "tabs", content: "article", … } })

   THIS IS THE ONE RENDERER FOR A CONFIGURED PAGE. A preset is a configuration; the
   bar edits one; the drawer prints one as JSON; a `?…` url names one — and every one
   of those goes through this class. What is NOT drawn here is the two tools that
   draw something else: the BUILDER draws a node you are still assembling
   (`build/stage.js`), and the navigation labs draw one gesture at a time
   (`navigation/lab.js`). The builder should be this class too, and the schema stopped
   being the reason it is not — `doc/builder.md` has the order it happens in.

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
		/* `base` is the page's OWN words, before the url gets a vote — the drawer's
		   link and `write_url()` both send only what differs from it, so a preset's
		   address stays clean until you change something. */
		this.base = clean(this.config);

		// ⚠ A NESTED STAGE NEVER READS OR WRITES THE ADDRESS. It is a page inside a
		//   box, not the page you are on; two stages writing one url would fight.
		const opening = this.inner ? { config: this.base, nest: undefined } : from_url(this.base, this.page?.url);

		this.config = opening.config;

		/* The page's OWN nested page, before the url gets a vote — the same idea as
		   `base`, and what the address falls back to when it says nothing.
		   ⚠ THE ADDRESS WINS, exactly as it does for the seven words. `??=` was here,
		     which meant a page that ships WITH a nested page (`library/nest/`) ignored
		     `?nest=magazine` entirely. `undefined` is "the address said nothing";
		     `null` is "the address said none" (`url.js`). */
		this.base_nest = this.nest ?? null;
		this.nest = opening.nest === undefined ? this.base_nest : opening.nest;
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

		this.rc(...ids(SURFACES).map(w => "paging-bg-" + w))
			.rc(...ids(TYPE).map(w => "paging-type-" + w))
			.rc(...ids(ROOM).map(w => "paging-room-" + w))
			.rc(...ids(ARRANGEMENT).map(w => "paging-arr-" + w))
			.rc(...ids(NAVIGATION).map(w => "paging-nav-" + w))
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
			if (c.navigation === "rail") this.rail("left");
			if (c.arrangement === "rail-left") this.panel("left");

			div.c("paging-stage-mid", () => {
				if (c.navigation === "tabs") this.tabs();
				this.box();
				if (c.navigation === "columns" && this.open !== null) this.pane();
			});

			if (c.navigation === "rail-right") this.rail("right");
			if (c.arrangement === "rail-right") this.panel("right");
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

	/* ── WHAT THE BOX HOLDS ───────────────────────────────────────────────────

	   ⚠ THE BOX RESERVES ITS HEIGHT. Every panel is drawn — the page's own content
	     AND all four children — stacked in ONE grid cell, and the ones you are not
	     reading are `visibility: hidden`: hidden, but still MEASURED. So the box is
	     always as tall as its tallest panel, the browser works that number out, and
	     clicking a tab cannot resize it.

	     This is `nav-stability`'s own rule (`navigation/navigation.css`,
	     `.paging-nav-reserve`), lifted here because the caption underneath is a
	     MEASUREMENT: before it, the first demo in the realm said "the box did not
	     move" over a line reading "the box is 335px shorter" (paging-audit-2, break
	     #2). `visibility`, never `display: none` — a display-hidden panel is not
	     measured, which is the whole thing being bought.

	   ⚠ STABLE NAVIGATION ONLY. `columns` and `takeover` are the DYNAMIC words
	     (decision 5, 2026-09-05): they are supposed to move things, so their child
	     opens beside the box or over the whole stage and the caption reports the
	     real pixels. Reserving there would hide the very thing they demonstrate. */
	held(){
		if (!this.swaps()) return this.own_panel();

		div.c("paging-nav-reserve", () => {
			this.slot(null);
			this.pages.forEach((child, i) => this.slot(i, child));
		});
	}

	/* Which navigation words change what is IN the box (rather than beside or over it)
	   — the STABLE ones, which is a flag `blocks.js` already carries on each word.
	   ⚠ `none` is stable and has nothing to swap: no child list is drawn at all, so
	     reserving four hidden panels would make the box as tall as its tallest unseen
	     child for nothing. (This used to be a hand-typed list of three ids here — the
	     second of three places the realm said stable-versus-dynamic; paging-audit-4b.) */
	swaps(){ return nav_of(this.config.navigation).stable && this.config.navigation !== "none"; }

	// One reserved panel. `i === null` is the page's own content.
	slot(i, child){
		return div.c("paging-slot").ac(this.open !== i && "paging-nav-hidden").append(() => {
			if (i === null) return void this.own_panel();

			div.c("paging-held", () => { this.child_panel(child, i); });
		});
	}

	/* ONE CHILD, DRAWN — and the SEAM a caller overrides to draw its own. The four
	   demo children are a title and a paragraph; a REAL child — a page you made —
	   also has a url, and then the panel carries the way to it. Before this a page you
	   made drew four canned samples and had no link to any of its own children
	   (paging-audit-4b); `make/page.js` hands the real ones in.

	   ⚠ `draw_child` IS THE OTHER HALF OF `draw`. `draw` puts the caller's own thing in
	     the box; `draw_child` puts the caller's own thing in a CHILD's panel. The
	     builder needs both — its panel says "the url did not change" under a page that
	     does not exist yet — and it is the seam `doc/builder.md` named as missing. */
	child_panel(child, i){
		if (this.draw_child) return this.draw_child(child, i, this);

		p.c("h2", child.title);
		p(child.text);

		if (child.url) a.c("paging-panel-link").href(child.url)
			.append(() => { span("open " + child.title + " as its own page — this is where the url changes"); icon("chevron_right"); });

		return this;
	}

	/* THE PAGE'S OWN CONTENT, and the list of children when the navigation word draws
	   that list inside the box (`columns` and `takeover` both do — before this, both
	   presets drew a box with nothing to click and the gesture could not be reached
	   at all). ⚠ Called from inside `box()`'s own captured callback, so the factories
	   append on their own — nothing here may `empty()` the box. */
	own_panel(){
		if (this.config.navigation === "columns" || this.config.navigation === "takeover") this.rows();

		// `draw` is the seam a page uses to put its OWN thing in the box — the
		// templates realm hands over a family's real machinery this way, so the
		// two colours and the type scale repaint a real magazine cover.
		if (this.draw) this.draw(this);
		else (CONTENT_DRAW[this.config.content] ?? CONTENT_DRAW.article)();

		return this.nest_box();
	}

	/* PUT A PAGE INSIDE THIS ONE (or take it out), and say so in the address — one
	   seam, so the drawer, a `?nest=` url and a preset all arrive the same way. */
	nest_to(preset){
		this.nest = preset ? (preset.config ? { ...preset.config, id: preset.id, title: preset.title } : preset) : null;
		this.redraw();
		if (!this.inner) write_url(this.config, this.base, this.nest, this.base_nest);
		return this;
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

			// A preset arrives with its words. Any other url arrives as a promise.
			if (this.nest.navigation) return void this.inside(this.nest);

			this.fetched(this.nest);
		});
	}

	inside(config, title){
		if (title) span.c("paging-nest-name", title);
		return new PagingStage({ config: { ...config, room: "reading" }, inner: true });
	}

	/* A PAGE YOU MADE, RUNNING INSIDE THIS ONE. `?nest=` takes any url now, and a url
	   that is not one of the twelve presets has to be READ before it can be drawn: a
	   made page is a `page.json` under `made/`, and its seven words are in its `mode`.

	   ⚠ NO DOM AFTER THE AWAIT. The box is captured synchronously and filled in the
	     callback — the realm's oldest trap, and the reason this is not one `await`.
	   ⚠ THE URL AND THE FILE ARE DIFFERENT PATHS. A made page lives at
	     `/imagine/paging/make/notes/` and its file at `/imagine/paging/made/notes/`
	     (`make/page.js` says why), so the url is translated rather than fetched. */
	fetched(nest){
		return div.c("paging-nest-fetch", $box => {
			$box.append(() => { p.c("muted", "Reading " + nest.url + "…"); });

			fetch(file_for(nest.url), { cache: "no-cache" })
				.then(res => (res.ok ? res.json() : Promise.reject(res.status)))
				.then(node => $box.empty(() => { this.inside({ ...clean(node.mode), room: "reading" }, node.title); }))
				.catch(() => $box.empty(() => {
					p.c("muted", "There is no page at " + nest.url + " to put inside this one.");
					a.c("page-link", "Every page you have made →").href("/imagine/paging/make/");
				}));
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

	// The same rows, listed INSIDE the box — what `columns` and `takeover` navigate
	// from. A page that opens its children as columns lists them; that is the gesture.
	rows(){
		return div.c("paging-rows", () => {
			span.c("paging-eyebrow", "pages under this one");
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
			this.child_panel(child, this.open);
			this.press(span.c("paging-back", () => { icon("close"); span("close this column"); }), this.open);
		});
	}

	/* `takeover` — the child has the whole stage, and the trail is the way back.
	   ⚠ THE WAY OUT IS DRAWN TWICE, on purpose: the crumb (back to the page that was
	     here) and, when the stage has the whole screen, the exit chip (back to the
	     app). Before this, a takeover on a `full` stage had NEITHER — `frame()`
	     returned here before the `full` branch ran, so at 1280 the only way out of
	     `/library/takeover/` was the browser's Back button (paging-audit-2, break
	     #4). A gesture that fills the screen owes the reader a door. */
	taken(){
		const child = this.pages[this.open];

		if (this.config.room === "full") this.exit();

		div.c("paging-trail", () => {
			this.press(span.c("paging-crumb", () => { icon("arrow_back"); span("Northwind"); }), this.open);
			icon("chevron_right");
			span.c("paging-crumb on", child.title);
		});

		div.c("paging-canvas").ac("paging-surface-" + this.config.surface).append(() => {
			div.c("paging-held", () => {
				span.c("paging-eyebrow", "this child took the whole stage — everything behind it is the trail above");
				this.child_panel(child, this.open);
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

	/* ── A PANEL IS NOT A RAIL ────────────────────────────────────────────────
	   `arrangement: rail-left` and `navigation: rail` both put a column beside the
	   content, and they hold DIFFERENT THINGS: a navigation rail lists this page's
	   children, and an arrangement panel is anything else — a filter, the properties
	   of the thing you are reading. `blocks.js` has said so in words since 2026-09-05
	   and this renderer drew the children for both, which made the distinction the
	   vocabulary insists on invisible on screen. */
	panel(side){
		return div.c("paging-aside", () => {
			span.c("paging-eyebrow", side === "left" ? "filters" : "properties");
			(side === "left"
				? ["Everything", "Only mine", "Shared with me", "Archived"]
				: ["Anyone with the link can read", "Edited 2 hours ago", "4 pages under this one", "Comments on"])
				.forEach(words => span.c("paging-aside-row", words));
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

		/* ⚠ WHICH CHILD IS OPEN LIVES HERE, and a caller that REBUILDS this view on
		     every press needs to know it — the builder redraws its whole middle column
		     when you touch a control, so without this hook the tab you were on reset
		     itself. One hook, same shape as `changed`. */
		this.picked?.(this.open);
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

		/* THE ADDRESS IS THE CONFIGURATION. One `replaceState` per change, so the page
		   you are looking at is always the page the url names — copy it, send it, open
		   it cold, and you get this. `url.js` has the whole seam. */
		if (!this.inner) write_url(this.config, this.base, this.nest, this.base_nest);

		this.change = { axis, from: title_of(axis, was), to: title_of(axis, value), before, after: this.rect() };
		this.$cap?.empty(() => { this.caption(); });

		this.changed?.(axis, value);
		return this;
	}

	redraw(){ this.paint(); this.empty(() => { this.frame(); }); return this; }

	/* ── ARRIVING AT A PAGE THAT WAS ALREADY BUILT ────────────────────────────
	   A page in this realm is built ONCE: core caches it, and the second time you
	   arrive `activate()` re-appends the view it already has. So a stage that read the
	   address when it was built is still showing that answer — and the realm's FRONT
	   page is worse, because it is built at boot and merely hidden, so a link into it
	   carrying a configuration (`cross/`'s nine cells) reached a stage that had made up
	   its mind before the link existed. Measured 2026-09-05.

	   This re-reads the address and redraws. When the address says nothing about this
	   page, the words go back to the page's own — which is decision 4, a demo does not
	   persist. `paging.js` calls it on arrival. */
	reopen(){
		if (this.inner) return this;

		const opening = from_url(this.base, this.page?.url);

		this.config = opening.config;
		// ⚠ `undefined` is "the address said nothing", so the page keeps its own nest;
		//   `null` is "the address said none", which is a nest you clicked off and sent.
		this.nest = opening.nest === undefined ? this.base_nest : opening.nest;
		this.open = null;
		this.change = null;

		this.redraw();
		this.changed?.();        // the toolbar writes its dropdowns back
		return this;
	}

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

		// ⚠ The invitation has to match the page. On a stage whose navigation word is
		//   `none` there are no page names to click, and the line said to click one.
		if (!change) return p.c("muted", this.config.navigation === "none"
			? "Change a word in the bar above. This line will say what changed, in pixels."
			: "Click a page name, or change a word in the bar above. This line will say what changed.");

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
