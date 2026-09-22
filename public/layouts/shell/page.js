import { Page, View, div } from "/app.js";
import Shell from "./Shell.js";
import { mount } from "/framework/ext/Ask/chat.js";

/* ── /layouts/shell/ — a sidebar that stays put, and a viewport that renders
      anything ─────────────────────────────────────────────────────────────────

   WHAT THIS PAGE IS. Two regions, edge to edge, and nothing else on screen: a left
   sidebar you can drag to any width, and a viewport beside it showing one homepage
   design. The designs are a TREE — a base design, and under it children that each
   change exactly one thing — so the sidebar's shape IS the logic of how they
   relate. Click a row, the viewport shows that design. The site's own navigation
   is still above; this is a second sidebar, inside the page, and it is the one the
   lab is about.

   LAYOUT, the five questions.
   1. CONTAINER. A page in `app.$pages` under `/layouts/`, so the ordinary page
      region — but this page has no page GRID: `render()` is its own, and the shell
      replaces the three tracks. Not under a columns host.
   2. SIZE. The whole region, at every width, and exactly the region's HEIGHT: the
      shell never scrolls. The sidebar is 12rem at its floor, half the room at its
      ceiling, 18rem when nobody has said. Below 44rem the two regions stack and
      the sidebar becomes a top strip.
   3. OWN LAYOUT. A flex row of two: a fixed-basis track and a viewport that takes
      the rest. The viewport is a container, so what it holds responds to IT and
      not to the window.
   4. REGIONS. Two. The sidebar's three parts (head, tree, foot) are its own.
   5. PREVIEW. The card on `/layouts/`, drawn from `description` below.

   ⚠ OWN `render()`, WHICH OWES THREE THINGS (core/Page readme): set `this.view`,
     carry `.page`, and never nest a second `.page` inside it. The designs ARE
     `.page`s, and they are not nested inside this one's markup — they are core's
     own children, mounted in `this.$pages`, which is how every region on this site
     holds pages. `/resume/` is the other page that owns its render.

   ⚠ `depth: 5`. A page loads two levels of children by default, and the sidebar
     draws the WHOLE design tree — four levels of designs under this page. Without
     this the deepest two rows would simply not be there, and nothing would say so.

   ⚠ demo.steps() was tried here (2026-09-18, ai/2026-09-18/steps-demo) and reverted:
     wrapping this row as demo.steps()'s own `stage:` gives the numbered list an
     ancestor box (`.demo-steps-stage`) with no height of its own, and this page's
     entire "never scrolls, exactly the region" contract depends on `.std-shell`
     itself carrying `height:100%` — one level up from where it landed. Measured:
     the shell's own track+viewport grew to its full CONTENT height (9,671px)
     instead of filling the region, because `height:100%` two boxes down resolves
     against an ancestor with no definite height of its own. Fixing it needs a rule
     in shell.css this task could not touch. The steps DO exist for this lab — at
     doc/page.js, driving a small stand-in rather than the real live regions, which
     never has this fight because it lives in ordinary page flow. */

View.stylesheet(import.meta, "shell.css");

export default new Page({
	meta: import.meta,
	title: "Shell",
	icon: "view_sidebar",
	description: "A sidebar that never moves, resizable to any width, and a viewport beside it holding a tree of homepage designs derived one change at a time.",

	children: "home doc",
	depth: 5,

	render(){
		if (this.view) return this.view;

		this.shell = new Shell({ page: this });

		this.view = div.c("page solo std-shell", () => {
			this.shell.rail();

			/* THE VIEWPORT. It is a region like any other on this site: a page's
			   children mount here because `container()` walks up looking for the
			   nearest `$pages`. Nothing routes to the base design, so this builds
			   it — and hands down `app`, exactly as core's columns host does for
			   its own default column. */
			this.$pages = div.c("std-shell-view", () => this.default_design()?.assign({ app: this.app }).render());

			// A sibling of `.std-shell-view`, not inside it — `position: fixed`, so
			// it does not touch the "never scrolls, exactly the region" height
			// contract the file's own note above explains.
			mount({ app: this.app, url: this.url });
		}).ac("page--shell");

		/* The remembered width, applied before anything is on screen so the rail
		   never renders at one size and jumps to another. */
		const saved = this.store().get({ px: null }).px;
		if (saved) this.view.style("--std-shell-rail", saved + "px");

		return this.view;
	},

	/* The design shown when no design is routed to. `default` is the arrangement
	   contract's own word for "shown without being routed to", so the base design
	   opts in with the word it already knows and `shell.css` stands it down the
	   moment a real one opens beside it. Core's `default_column()` is the same
	   method for the columns host; this is the two-region version of it. */
	default_design(){
		return [...this.children.values()].find(child => child?.classes?.split(/\s+/).includes("default"));
	},

	/* ── THE WIDTH ───────────────────────────────────────────────────────────
	   The drag writes ONE token on this page's own view, and `shell.css` clamps it
	   between 12rem and half the room. Clamping in CSS rather than here is what
	   keeps it honest when the WINDOW changes size: a number clamped in JS at drag
	   time would be stale the moment the browser is resized, and the rail would
	   own more than half a narrow screen with nothing to correct it.

	   ⚠ NOT named `width`. `width` is a page WORD (`words()` reads it, `render()`
	     stamps `page-w-<width>` from it), so a method by that name would be read
	     back as a class name — `.ac("page-w-" + function)`. Same family of trap as
	     `naming()` and `chips()`; every name here is checked against core's own.

	   ⚠ No px = back to the default: `setProperty(prop, "")` REMOVES the
	     declaration, so the stylesheet's own 18rem is what the rail reads again.
	     That is the double-click, and it is why nothing here keeps a previous
	     value to restore. */
	size_rail(px){
		const width = px ? Math.round(px) : null;

		this.view?.style("--std-shell-rail", width ? width + "px" : "");
		this.store().patch({ px: width });

		return width;
	},

	/* What is on screen right now, read off the box rather than off the token —
	   the token is what was ASKED for and the clamp may have said otherwise. The
	   readout in the sidebar's foot watches the same box with a ResizeObserver. */
	rail_px(){ return this.view?.el.querySelector(".std-shell-track")?.getBoundingClientRect().width ?? 0; },
});
