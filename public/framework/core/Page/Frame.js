import { View, div, p, span, a, icon, details, summary, is } from "../View/View.js";

/* ── THE PAGE FRAME — the box each of the six page words opens ─────────────────

   A page says a word and this is what draws it: the chrome its `arrangement` word
   asks for, its children drawn the way its `navigation` word says, and its content
   in the middle. `Page.render()` builds one only when the page said a word that
   needs a box, so a page that says none of the six has no frame at all and renders
   exactly the markup it rendered before this file existed.

   It is the graduated half of `imagine/paging/stage.js` — the lab's renderer, one
   level up, where every page can reach it. What did NOT come with it is the lab's
   FURNITURE: the canned filter rows, the eight sample articles, the caption that
   measures the box. Core ships boxes; what goes in one is the page's own.

   ⚠ `PageFrame`, never `Frame` or `Stage`. `View.classify()` mints a CSS class from
     every constructor name in the chain, so a class called `Stage` wears the
     framework's own `.stage` — `container-type: inline-size; overflow: hidden` — and
     shrink-wraps itself: 307px inside a 1546px frame, with nothing thrown (measured
     2026-09-05). That is why the lab's class is called `PagingStage`.
   ⚠ NEVER PASS IT A `name`. `classify()` ends with `if (this.name) this.ac(this.name)`,
     so a `name` field becomes a bare, unprefixed CSS class.
   ⚠ IT IMPORTS `View`, NEVER `Page`. It reaches its page through `this.page`, so
     there is no parent↔child import cycle — and that kind of cycle breaks only on a
     deep reload, which is the worst moment to find one.                          */

/* WHICH NAVIGATION WORDS SWAP WHAT IS IN THE BOX — and so need the box's height
   reserved. `expand` grows the row, `columns` is `Page.columns()` and `takeover` is
   `width: "full"`: all three are MEANT to move things, and reserving there would
   hide the very thing they do.
   ⚠ `tabs` IS DELIBERATELY NOT HERE — LEAVE IT OUT. It is the one place this list
     differs from the paging lab's own `swaps` flag, and the difference is not an
     oversight: `ext/tabs` brings its OWN panel and fills this same `regions` Map, so
     adding `tabs` here reserves a second panel and the child is drawn twice, once in
     each. Whoever reads the lab's list and this one side by side: the lab reserves for
     `tabs` because the lab draws its own tab strip; core delegates to `ext/tabs`, which
     has already done it. (Decided 2026-09-06, slice 2.) */
const SWAPS = ["rail", "rail-right"];

export default class PageFrame extends View {

	// The page's shape: chrome where the arrangement word puts it, the children drawn
	// the way the navigation word says, the content in the middle. One method per
	// piece below, so a subclass replaces ONE of them.
	render(){
		const page = this.page;

		if (page.arrangement === "bar-top") this.bar("top");

		div.c("page-frame-body", () => {
			if (page.navigation === "rail") this.rail("left");
			if (page.arrangement === "rail-left") this.panel("left");

			div.c("page-frame-mid", () => {
				if (page.navigation === "tabs") this.tabs();
				this.box();
			});

			if (page.navigation === "rail-right") this.rail("right");
			if (page.arrangement === "rail-right") this.panel("right");
			if (page.arrangement === "main-aside") this.aside();
		});

		if (page.arrangement === "bar-bottom") this.bar("bottom");
	}

	/* THE BOX. THE ONLY element wearing the CONTENT colour, which is the second of the
	   two independent colour controls — the first is the page's own background, and
	   `word_classes()` puts that, and only that, on the page.
	   ⚠ ONE WORD, ONE CLASS, ONE ELEMENT. `page-surface-*` was stamped up on the page
	     as well for one build, so `surface: "card"` drew a bordered, shadowed card and
	     then drew a second one inside it. `Page.word_classes()` is where that was fixed
	     and why. */
	box(){
		return this.$box = div.c("page-canvas")
			.ac(this.page.surface && "page-surface-" + this.page.surface)
			.append(() => this.reserve());
	}

	/* ── WHAT THE BOX HOLDS ───────────────────────────────────────────────────

	   ⚠ THE BOX RESERVES ITS HEIGHT. The page's own content and the region a child
	     mounts in share ONE grid cell, so the browser has measured both and opening a
	     child cannot resize the box. The one you are not reading is hidden but still
	     MEASURED: `visibility`, never `display: none` — a display-hidden panel is not
	     measured, which is the whole thing being bought. (`imagine/paging`'s first
	     demo said "the box did not move" over a line reading "the box is 335px
	     shorter" before this rule existed.) */
	reserve(){
		const page = this.page;

		if (!SWAPS.includes(page.navigation)) return this.content();

		return div.c("page-nav-reserve", () => {
			div.c("page-slot page-frame-own").append(() => this.content());

			// ONE panel, every child name — the shape `ext/tabs` already uses, so a
			// routed child mounts here through `container()` with no new rule to write.
			const $panel = div.c("page-slot page-frame-panel");
			page.children.forEach((child, name) => this.regions().set(name, $panel));
		});
	}

	// The page's own content, plus the child list when the navigation word draws that
	// list INSIDE the box: `expand` draws the rows themselves, and `columns` and
	// `takeover` list the rows you navigate FROM.
	content(){
		const page = this.page;

		if (page.navigation === "expand") this.expander();
		else if (page.navigation === "columns" || page.navigation === "takeover") this.rows();

		return page.render_content();
	}

	// ── the child list, drawn three ways ─────────────────────────────────────

	/* ext/tabs, never a second tab implementation — this site has exactly one, and
	   `app.js` imports it for every page here, so the fallback line below is a
	   development message rather than a normal path. Core still imports no `ext`. */
	tabs(){
		if (is.fn(this.page.tabs)) return this.page.tabs();
		return p.c("muted", 'navigation: "tabs" needs `import "/framework/ext/tabs/tabs.js"`.');
	}

	/* A COLUMN OF THIS PAGE'S CHILDREN, beside the content.
	   ⚠ A RAIL IS NOT A PANEL. A navigation rail lists MY children; an arrangement
	     panel is anything else — a filter, a contents list, the properties of what you
	     are reading. `imagine/paging/blocks.js` has said so in words since 2026-09-05
	     and its renderer drew the children for both, which made the distinction the
	     vocabulary insists on invisible on screen. */
	rail(side){
		return div.c("page-rail page-rail-" + side, () => {
			span.c("page-eyebrow", "pages");
			this.rows();
		});
	}

	/* THE SAME ROWS, LISTED INSIDE THE BOX — what `columns` and `takeover` navigate
	   from, and what the rail is made of. One drawing, so a label here is the label
	   everywhere else: `nav_for()` is the page's own answer for a child's url, label
	   and icon.
	   ⚠ A LIST WITH NOTHING IN IT SAYS SO. A page with no children handing back an
	     empty box is how the lab ended up listing four strangers on somebody's page. */
	rows(){
		const page = this.page;

		return div.c("page-rows", () => {
			if (!page.children.size) return void p.c("muted page-no-pages", "No pages under this one yet.");

			page.children.forEach((child, name) => {
				const nav = page.nav_for(name);

				a.c("page-row").href(nav.url).append(() => {
					if (nav.icon) icon(nav.icon);
					span.c("page-row-words", nav.label);
				});
			});
		});
	}

	/* ── `expand` — THE CHILD OPENS IN THE ROW ────────────────────────────────
	   A `<details>` per child, and the browser's own gesture: there is no JavaScript
	   in it at all. The row grows downward and nothing above it moves. It is the one
	   navigation word that never changes the address, so an opened row cannot be
	   linked to or reached with Back.
	   ⚠ THE ROW IS THE CHILD'S REGION, so navigating to a child mounts it in the same
	     box it opened in — one seam, not two. */
	expander(){
		const page = this.page;

		return div.c("page-expand", () => {
			if (!page.children.size) return void p.c("muted page-no-pages", "No pages under this one yet.");

			page.children.forEach((child, name) => {
				const nav = page.nav_for(name);

				details.c("page-expand-item", () => {
					summary.c("page-expand-head", () => {
						if (nav.icon) icon(nav.icon);
						span(nav.label);
					});

					this.region(name, div.c("page-expand-body"));
				});
			});
		});
	}

	/* ── the chrome the ARRANGEMENT word adds ─────────────────────────────────
	   CORE SHIPS BOXES, NEVER FURNITURE. Each of these opens a REGION under a fixed
	   name and a declared child of that name mounts in it — exactly the way an
	   `ext/tabs` child mounts in a panel today. The lab draws four canned filter rows
	   and four canned property rows inside these; those stayed in the lab.
	   ⚠ `bar`, `panel` and `aside` are Map KEYS, never fields or methods on `Page`.
	     All three are already page words somewhere — `imagine/blogx/Blog.js` declares
	     `rail()` and `aside()` as page methods, `framework/ui/page.js` declares
	     `bar()` — and a Map key shadows nothing. */
	bar(where){ return this.region("bar", div.c("page-bar page-bar-" + where)); }

	panel(side){ return this.region("panel", div.c("page-panel page-panel-" + side)); }

	aside(){ return this.region("aside", div.c("page-aside")); }

	/* ONE REGION: the Map `Page.container()` already reads, plus the child it holds,
	   drawn as `default`. The `default` matters — nothing ROUTES to a bar, so without
	   it the arrangement contract would hide the child the region was opened for.
	   ⚠ `app` is handed down here the way `Page.child()` and `render_column()` do it:
	     a child that is never routed to still needs it to mark its own links. */
	region(name, $view){
		const page = this.page;
		this.regions().set(name, $view);

		const child = page.children.get(name)?.assign({ app: page.app });
		if (child) $view.append(() => { child.render().ac("default"); });

		return $view;
	}

	// The page's own region Map — the one `container()` reads, shared with `ext/tabs`.
	regions(){ return this.page.regions ??= new Map(); }
}
