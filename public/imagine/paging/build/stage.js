import { View, div, p, h3, h4, span, icon } from "/app.js";
import { default_index } from "./words.js";
import { config_of } from "../blocks.js";
import { PagingStage } from "../stage.js";
import { draw_blocks } from "./draw.js";

/* ── THE STAGE — the page you are building, drawn live ─────────────────────────

   The middle column of the builder. It takes ONE node — the plain JSON object in
   the box on the right — and draws the page that node describes.

   IT IS A `PagingStage`, and that is the whole file. The realm has ONE renderer for
   a configured page, and until 2026-09-05 that was only true if you did not look at
   the builder: this class drew its own tabs, its own rail, its own toolbar, its own
   side panels and its own surfaces — 232 lines that had already started to disagree
   with the original (four properties rows against three; paging-audit-4b). Now the
   node's seven words go straight to `PagingStage` and everything in the picture is
   the thing a real page draws.

   WHAT IS LEFT HERE is the three things a builder has and a page does not:

       crumbs      where you are, which core draws on the columns host of a real page
       the title   the node's own name, above the box
       the panel   a child's panel, which has to say the url did not change because
                   the page it is describing does not exist until you press Save

   The last one is `draw_child`, and `draw` is the blocks — the two seams `stage.js`
   grew for this. `../doc/builder.md` has the four steps this was done in.

   ⚠ NAMED `BuildStage`, NOT `Stage`. `View.classify()` adds a class per constructor
     in the chain, and `stage` is one of the five layout words — a class called
     `Stage` would silently wear `styles/`'s stage layout. (The `code` skill's trap;
     a Playground rail met it for real in 2026-08.)                                */

export class BuildStage extends View {

	render(){
		const node = this.node;
		const kids = node.children ?? [];

		this.crumbs();

		// The PAGE's title, always. The tab's own title is the panel's heading, and
		// showing the child here too printed the same words twice in one box.
		h3.c("build-sheet-title", () => { icon(node.icon ?? "description"); span(node.title); });

		/* ⚠ `inner: true`. A picture of a page is not the page you are on: no caption,
		     no `?…` in the address, and it cannot take the screen. And `open` comes
		     from the PAGE, because Build rebuilds this whole view on every control
		     press — `picked` writes it back so the tab you were on survives. */
		this.$stage = new PagingStage({
			config: config_of(node),
			pages: kids.map(kid => ({ title: kid.title, icon: kid.icon ?? "description", text: kid.description })),
			open: kids.length ? Math.min(this.page.tab ?? default_index(node), kids.length - 1) : null,
			inner: true,
			draw: () => this.blocks(),
			draw_child: (child, i) => this.panel(child, i),
			picked: i => { this.page.tab = i; },
		});
	}

	// Where you are. Core draws this on the columns host after every activation on a
	// real page; the page being built has no url, so the builder draws it itself.
	crumbs(){
		return div.c("build-crumbs", () => {
			["imagine", "paging", "build"].forEach(word => { span.c("build-crumb", word); icon("chevron_right"); });
			span.c("build-crumb on", this.node.title);
		});
	}

	/* ── THE BLOCKS ───────────────────────────────────────────────────────────
	   ⚠ ONE RENDERER, TWO CALLERS, and it lives in `draw.js`. The blocks used to be
	     drawn here and only here, so everything Build's fifth control collected was
	     saved to disk and shown on no page (paging-audit-4b). A page you made draws
	     the same call through this same `draw` seam now. */
	blocks(){
		if (!draw_blocks(this.node, this.page))
			p.c("muted build-blocks-empty", "No blocks yet. Add a block on the left and it appears here — and on the page once you save it.");

		if (!(this.node.children ?? []).length)
			p.c("muted build-tabs-empty", "No pages under this one yet. “Add a page” on the left adds one, and the navigation word above decides whether it is a tab or a row.");

		return this;
	}

	/* ONE CHILD'S PANEL — the `draw_child` seam. Everything a real page's panel has,
	   plus the one sentence only a builder can say: this child has no address yet. */
	panel(child, i){
		h4(child.title);
		p(child.description || child.text || "This page has no description yet. Give it one in the controls and it shows on its card, in its preview and here.");

		this.blocks();

		return p.c("muted build-panel-note", "The url did not change. A tab is a swap, so this panel cannot be linked to — the child gets its own address when you save it and open it as a column.");
	}
}

export default BuildStage;
