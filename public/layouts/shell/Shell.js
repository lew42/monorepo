import { div, a, span, p, h2, button } from "/app.js";
import Tree from "/framework/ux/Tree/Tree.js";
import grip from "/framework/ext/grip/grip.js";

/* ── /layouts/shell/Shell.js — the sidebar, the handle that resizes it, and the
      tree of designs inside it ────────────────────────────────────────────────

   The page owns two regions and nothing else; everything about the left one lives
   here, one method per part, so a page that wants a different head or a different
   foot overrides one method instead of forking the shell.

   THE THREE THINGS THE SIDEBAR HAS TO DO
   1. Not move. It is a sticky box inside a track that is exactly as tall as the
      shell, and the shell is exactly as tall as the region — so switching designs,
      or scrolling one, cannot shift it by a pixel. Measured: `doc/pages.md`.
   2. Be any size. Drag its right edge; 12rem to half the room. The width is written
      as one token on the page's own view, and remembered with `page.store()`.
   3. Show a deep tree whole. Every row is a real link, so five levels are five
      links and the browser does the rest.                                        */

export default class Shell {

	constructor(...args){ this.assign(...args); }
	assign(...args){ return Object.assign(this, ...args); }

	/* ── the sidebar ─────────────────────────────────────────────────────────
	   The TRACK is the box that stretches; the RAIL is the box that sticks inside
	   it. They cannot be the same element — a box that is exactly as tall as its
	   own content has no travel, and `position: sticky` on it can never fire
	   (`/layouts/practice/` learned this with a 330px panel beside a 2,270px wall). */
	rail(){
		return div.c("std-shell-track", $track => {
			div.c("std-shell-rail", () => {
				this.head();
				this.tree();
				this.foot();
			});

			this.grab();
			this.watch($track);
		});
	}

	head(){
		return div.c("std-shell-rail-head", () => {
			h2.c("std-shell-rail-title", "Designs");
			this.fold();
			p.c("std-shell-rail-say", "Each one is the design above it with one thing added, changed or taken away.");
		});
	}

	/* THE NARROW-SCREEN CONTROL, and the only one. Below 44rem the two regions
	   stack and the sidebar becomes a top strip; this folds the strip down to its
	   own title so the design gets the whole screen back. It is `display: none`
	   at every wider width — there is nothing to fold when the rail is beside the
	   viewport rather than on top of it. */
	fold(){
		const $fold = button.c("std-shell-fold", "Hide");

		$fold.click(() => $fold.text(this.page.view.tc("std-shell-folded").hc("std-shell-folded") ? "Show" : "Hide"));

		return $fold;
	}

	/* THE TREE. Only the design subtree — `doc` is a child of the shell too, and it
	   is documentation, not a design, so it lives in the foot instead. The two
	   numbers that must agree are the designs on disk and the rows drawn here, and
	   they agree because this walks the real pages. */
	tree(){
		const root = this.page.children.get("home");
		if (!root) return;

		return this.$tree = new this.constructor.Tree({
			nodes: [this.node(root)],
			indent: "0.9em",
		});
	}

	/* ⚠ A page's children are `null` until something loads them, so this reads the
	   subtree the shell's own `depth` already fetched — see `page.js`. `filter`,
	   not a guard inside the map, or an unloaded name becomes a row with no text. */
	node(page){
		return {
			text: page.title,
			href: page.url,
			open: true,
			children: [...page.children.values()].filter(Boolean).map(child => this.node(child)),
		};
	}

	foot(){
		return div.c("std-shell-rail-foot", () => {
			a.c("std-shell-rail-doc", "How pages derive").href(this.page.url + "doc/pages/");
			span.c("std-shell-rail-width muted", $width => { this.$width = $width; });
		});
	}

	/* The readout is the only thing on screen that says the width out loud, and it
	   is how a reader knows the drag did something. Quiet on purpose — the owner's
	   rule for a remembered preference is a dot, not an alert.

	   ⚠ A ResizeObserver rather than a call from the drag, for two reasons. The
	     track has NO BOX when this is built — a page is built detached, so every
	     rect reads 0 and no number of frames will give it one. And the width also
	     changes when nobody dragged: the ceiling is half the room, so resizing the
	     browser moves it. The observer fires for both. (Core watches its own column
	     row the same way — `Page.reveal_column`.) */
	watch($track){
		return new ResizeObserver(() => this.say_width($track)).observe($track.el);
	}

	say_width($track){
		const px = $track.el.getBoundingClientRect().width;
		this.$width?.text(px ? Math.round(px / this.rem() * 10) / 10 + "rem" : "");
	}

	/* The ROOT font size, not the body's — the body's is a viewport clamp on this
	   site, so an `em` there is fluid and a readout built on it would disagree with
	   the `rem` floor the stylesheet clamps against. */
	rem(){ return parseFloat(getComputedStyle(document.documentElement).fontSize) || 16; }

	/* ── THE HANDLE ──────────────────────────────────────────────────────────
	   `ext/grip`, shared with `core/Sidebar`'s own rail (merged 2026-09-18 — this
	   file's own copy of the pointer-capture gesture and Sidebar's, byte-for-byte
	   the same shape, are now the one file). `page.size_rail(px)` already clamps
	   nothing (the CSS `clamp()` does) and already SAVES on every call, so there is
	   no separate `done` here — `write` alone does the whole job, every frame of
	   the drag, the same as before. `size_rail()` with no argument is the reset
	   `page.js` already wrote, so `reset` just calls it again with nothing. */
	grab(){
		return grip({
			from: "start",
			write: px => this.page.size_rail(px),
			reset: () => this.page.size_rail(),
		});
	}
}

/* ── THE TREE CLASS ──────────────────────────────────────────────────────────
   One change to `ux/Tree`: in a navigation sidebar a row IS a url, so the browser
   and the router own what "selected" means, not the tree's own highlight.

   ⚠ The class NAME is a CSS class — `View.classify()` kebab-cases every constructor
     in the chain — so it carries the module's `std-shell-` prefix rather than
     minting a bare `.shell-tree` in the global namespace.

   A second override used to live here (`Shell.Tree.Row`, forcing every row — branch
   or leaf — to render as `<a>`), because `Tree.Row.prerender()` used to decide the
   tag as `!kids && href`, so a branch could never be a link. `ux/Tree` fixed that at
   its own source (2026-09-17, ux/Tree/doc/decisions.md): `prerender()` now reads
   `this.node.href ? "a" : "div"` with no kids check, so `Shell.Tree` gets a real
   `<a>` on every href'd row, branch or leaf, by plain inheritance — the override is
   deleted, not left dormant. */
Shell.Tree = class StdShellTree extends Tree {

	/* SELECTION IS THE ROUTER'S. Every row below is a real `<a>`, and
	   `Router.mark_links()` stamps `.active` on the one you are on and `.in-path` on
	   its ancestors after every navigation — a click, a cold deep link and a Back
	   press alike. `ux/Tree`'s own `ui-tree-selected` answers the same question
	   more quietly and only ever agrees after a click, so it is turned off here
	   rather than styled into a second, disagreeing highlight. */
	select(){ return this; }
};
