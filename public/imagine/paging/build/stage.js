import { View, div, p, h3, h4, span, a, icon, md } from "/app.js";
import { blocks_of, default_index, is_default } from "./words.js";
import { config_of, nav_of, layout_of } from "../blocks.js";

/* ── THE STAGE — the page you are building, drawn live ─────────────────────────

   The middle column of the builder. It takes ONE node — the plain JSON object in
   the box on the right — and draws the page that node describes: the surface it
   wears, the navigation around it, and its blocks in the arrangement you picked.

   IT IS A PICTURE, AND IT IS HONEST ABOUT BEING ONE. The tabs really swap, the rail
   really selects, the prose is really `md()`; what it cannot be is ROUTED, because
   the page it is drawing does not exist until you press Save. The line under the
   screen says which of those two you are looking at.

   ⚠ THE SCREEN IS A WHITE CARD ON PURPOSE (the owner, 2026-09-05: "make sure the
     stage they're swapping on is visually evident. it could be a white card, and a
     new white card comes in"). Every swap this stage does happens INSIDE a drawn
     rectangle, so a reader can point at what is about to change before they click —
     which is the thing an underlined tab strip with a transparent panel never says.

   ⚠ NAMED `BuildStage`, NOT `Stage`. `View.classify()` adds a class per constructor
     in the chain, and `stage` is one of the five layout words — a class called
     `Stage` would silently wear `styles/`'s stage layout. (The `code` skill's trap;
     a Playground rail met it for real in 2026-08.)                                */

export class BuildStage extends View {

	render(){
		const config = this.config = config_of(this.node);
		const nav = nav_of(config.navigation);

		this.ac("build-screen-" + config.surface);

		// The trail. Core draws this on the COLUMNS HOST after every activation, not
		// on the page — so it is here for the same reason it is there: to say where
		// you are. It is drawn whatever the navigation is, because you cannot turn it
		// off per page today. (`/imagine/layouts/` added the switch; it is the host's.)
		this.crumbs();

		if (config.arrangement === "bar-top") this.chrome_bar("top");

		if (nav.id === "tabs") this.tabbar();

		div.c("build-screen-row").ac(nav.id === "rail-right" && "build-screen-flip").append(() => {
			if (nav.id === "rail" || nav.id === "rail-right") this.rail();
			if (config.arrangement === "rail-left") this.side_panel("left");

			div.c("build-sheet flex-1", () => {
				// The PAGE's title, always. The tab's own title is the panel's heading below,
				// and showing the child here too printed the same words twice in one box.
				h3.c("build-sheet-title", () => { icon(this.node.icon ?? "description"); span(this.node.title); });

				if (nav.id === "tabs" || nav.id === "rail" || nav.id === "rail-right"){ this.panel(); return; }

				this.blocks();
				if (nav.id === "columns" || nav.id === "takeover") this.rows(nav);
			});

			if (config.arrangement === "rail-right") this.side_panel("right");
			if (config.arrangement === "main-aside") this.aside();
		});

		if (config.arrangement === "bar-bottom") this.chrome_bar("bottom");
	}

	/* ── THE CHROME THE ARRANGEMENT WORD ADDS ─────────────────────────────────
	   Step 4 sets one of the realm's seven arrangement words, so the picture in the
	   middle has to SHOW that word or the control is a lie — a bar, a footer, a side
	   panel, an aside. These three methods wear `paging.css`'s own chrome classes, so
	   the toolbar Build draws and the toolbar a real page draws are the same picture.

	   ⚠ THIS IS THE ONE THING LEFT TO DELETE. `../doc/builder.md` has the plan: this
	     class should BE a `PagingStage`, which already draws every one of these. The
	     schema had to become one first, and now it has. */
	chrome_bar(where){
		return div.c("paging-bar paging-bar-" + where, () => {
			["Save", "Share", "History"].forEach(word => span.c("paging-bar-btn", word));
			span.c("paging-bar-gap");
			span.c("paging-bar-note", where === "top" ? "toolbar" : "footer");
		});
	}

	// A panel is NOT the navigation rail: a rail lists this page's children, a panel
	// is anything else beside the content. `../blocks.js` draws the same distinction.
	side_panel(side){
		return div.c("paging-aside", () => {
			span.c("paging-eyebrow", side === "left" ? "filters" : "properties");
			(side === "left"
				? ["Everything", "Only mine", "Shared with me", "Archived"]
				: ["Anyone with the link can read", "Edited 2 hours ago", "Comments on"])
				.forEach(words => span.c("paging-aside-row", words));
		});
	}

	aside(){
		return div.c("paging-aside", () => {
			span.c("paging-eyebrow", "on this page");
			["What this page is for", "What a child costs", "Writing a page"]
				.forEach(words => span.c("paging-aside-row", words));
		});
	}

	// ── the chrome ───────────────────────────────────────────────────────────
	crumbs(){
		return div.c("build-crumbs", () => {
			["imagine", "paging", "build"].forEach(word => { span.c("build-crumb", word); icon("chevron_right"); });
			span.c("build-crumb on", this.node.title);
		});
	}

	kids(){ return this.node.children ?? []; }

	// The child a tab or a rail row is showing. `default_index()` is the child marked
	// default — one of the four things you configure about a tab.
	showing(){
		const kids = this.kids();
		if (!kids.length) return null;
		return kids[Math.min(this.page.tab ?? default_index(this.node), kids.length - 1)];
	}

	at(){ return this.kids().indexOf(this.showing()); }

	tabbar(){
		return div.c("build-tabs", () => {
			if (!this.kids().length){ p.c("muted build-tabs-empty", "No tabs yet — “Add a page” on the left adds one."); return; }
			this.kids().forEach((kid, i) => this.tab(kid, i));
		});
	}

	rail(){
		return div.c("build-rail", () => {
			if (!this.kids().length){ p.c("muted", "No pages yet."); return; }
			this.kids().forEach((kid, i) => this.tab(kid, i));
		});
	}

	// ONE TAB, and a rail row is the same view with a different parent — which is the
	// whole argument for treating "top tabs" and "left tabs" as one control.
	tab(kid, i){
		return span.c("build-tab").ac(i === this.at() && "on")
			.attr("role", "button").attr("tabindex", "0")
			.append(() => { icon(kid.icon ?? "description"); span(kid.title); if (is_default(kid)) icon("star").ac("build-tab-default"); })
			.click(() => this.swap(i))
			.on("keydown", event => { if (event.key === "Enter" || event.key === " "){ event.preventDefault(); this.swap(i); } });
	}

	/* THE SWAP. One index, one repaint of the PANEL only — the screen's rectangle
	   never moves, which is the point of the whole mechanism (`../mechanisms/swap/`).
	   The url does not change either, and the panel says so out loud. */
	swap(i){
		this.page.tab = i;
		this.page.redraw();
		return this;
	}

	panel(){
		const kid = this.showing();

		if (!kid) return div.c("build-panel", () => { p.c("muted", "Add a page and it appears here, in this rectangle."); });

		return div.c("build-panel", () => {
			h4(kid.title);
			p(kid.description || "This page has no description yet. Give it one in the controls and it shows on its card, in its preview and here.");
			this.blocks();
			p.c("muted build-panel-note", "The url did not change. A tab is a swap, so this panel cannot be linked to — the child gets its own address when you save it and open it as a column.");
		});
	}

	// The children as ROWS you click — core's own shape for a columns page.
	rows(nav){
		if (!this.kids().length) return p.c("muted build-rows-empty", "No pages under this one yet.");

		return div.c("build-rows", () => this.kids().forEach(kid => div.c("build-row", () => {
			icon(kid.icon ?? "description");
			span.c("build-row-title", kid.title);
			icon(nav.id === "takeover" ? "open_in_full" : "chevron_right").ac("build-row-mech");
		})));
	}

	// ── the blocks, in the arrangement ───────────────────────────────────────
	/* ⚠ THE NUMBERED LAYOUT IS DERIVED, NEVER STORED. `layout_of()` (`../blocks.js`)
	     answers which of the four numbered layouts an arrangement word compiles to, so
	     the builder cannot say `wall` and lay the blocks out in one column. It used to
	     store its own `arrange` key beside a control labelled "Layout", which is the
	     one-word-two-meanings defect this pass deleted (paging-audit-3, item 2). */
	blocks(){
		const blocks = blocks_of(this.node);

		if (!blocks.length) return p.c("muted build-blocks-empty", "No blocks yet. Add a block on the left and it appears here.");

		const layout = layout_of(config_of(this.node).arrangement);

		return div.c("build-blocks").ac("build-arrange-" + layout.replace(".", "-"))
			.append(() => blocks.forEach((block, i) => this.block(block, i)));
	}

	block(block, i){
		if (block.type === "prose") return div.c("build-block build-block-prose", () => md(block.text ?? ""));
		if (block.type === "cards") return this.cards(block);
		return this.template(block);
	}

	/* A CARD WALL. `from: "children"` is core's own `previews()` shape drawn from the
	   node (the pages do not exist yet, so this draws what `previews()` will draw);
	   `from: "templates"` is the eleven template families, read from the templates
	   realm's own list. */
	cards(block){
		if ((block.from ?? "children") === "templates") return this.families();

		const kids = this.kids();

		return div.c("build-block build-cards", () => {
			if (!kids.length){ p.c("muted", "A card wall of this page's children — and it has none yet. Add a page on the left."); return; }
			kids.forEach(kid => div.c("build-card-item", () => {
				icon(kid.icon ?? "description");
				span.c("build-card-title", kid.title);
				p.c("muted", kid.description || "No description yet.");
			}));
		});
	}

	/* ⚠ THE FAMILIES ARE IMPORTED LAZILY, and that is not caution — `families.js`
	     pulls the magazine, the blog's manifest, the shells and two ux modules down
	     with it, which is a lot to load on a page that may never ask for a template
	     block. The import is fired on first use and the box is filled in a CALLBACK:
	     nothing may build DOM after an `await`. */
	families(){
		return div.c("build-block build-cards", $wall => {
			$wall.append(() => { p.c("muted", "Reading the template families..."); });

			import("../templates/families.js")
				.then(({ FAMILIES }) => $wall.empty(() => FAMILIES.forEach(it => div.c("build-card-item", () => {
					icon(it.icon);
					a.c("build-card-title", it.title).href("/imagine/paging/templates/" + it.name + "/");
					p.c("muted", it.card_line);
				}))))
				.catch(() => $wall.empty(() => { p.c("muted", "The template families did not load. They live at /imagine/paging/templates/."); }));
		});
	}

	// ONE FAMILY, drawn by the family's OWN module — the same call its own page makes.
	template(block){
		return div.c("build-block build-block-template", $box => {
			$box.append(() => { p.c("muted", "Loading the " + (block.family ?? "magazine") + " family..."); });

			import("../templates/families.js")
				.then(({ family }) => {
					const it = family(block.family ?? "magazine");
					$box.empty(() => {
						if (it) it.example(this.page, false);
						else p.c("muted", "There is no family called " + block.family + ".");
					});
				})
				.catch(() => $box.empty(() => { p.c("muted", "That family did not load."); }));
		});
	}
}

export default BuildStage;
