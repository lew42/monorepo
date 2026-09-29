import { div, nav, a, span } from "/framework/core/View/View.js";

/*
 * THE FLOATING PAGE — a page with its own left nav, floating in a gray "well"
 * with a white page on top, centred in whatever room it is given.
 *
 *   floating(box, { nav: [{ label, href, active }], content: fn })
 *
 * Use it when a region is much wider than one page should be (a card's detail area is ~1,200px at
 * 3440 even with a chat column beside it) and a flush, full-width column would read as cramped text
 * in an empty hall. The nav and the page travel together as ONE unit: the nav on the left, the page
 * beside it capped at a reading-friendly width, and the pair centred in a medium-gray well. In a
 * narrow box the nav becomes a strip of links above the page, and the page takes the full width.
 *
 *   box       the View to draw into. Leave it out (null) to draw into the current captor, the way
 *             every factory call does inside a capture callback.
 *   nav       the links, in order. `{ label, href, active }` is a link; `active: true` marks the one
 *             you are on (aria-current). An item with a `label` and no `href` is a small heading
 *             that starts a new section of the nav ("Requests").
 *   content   draws the page. It runs inside the page box, so call factories bare in it, and end
 *             it in a statement (a returned View is appended a second time, which MOVES it).
 *
 * Returns the Floating: `.nav(items)` redraws the nav alone (the page is never touched, so a
 * live redraw of the links cannot close anything you have open), `.$nav` and `.$page` are the
 * two boxes, `.$well` is the gray outer box. Sizes are tokens, so a caller re-sizes by declaring
 * them on any ancestor: `--floating-nav` (the nav's width, 13em) and `--floating-measure` (the
 * page's cap, 64em).
 *
 * THE WELL, the page and the nav (2026-09-29, owner spec via servex-mastermind):
 *   - The well is a medium gray, a couple of shades darker than the site's light-gray rails, so
 *     the whole region reads as its own space — `--fill-a16`, the framework's own alpha rung, not
 *     an invented colour.
 *   - The well carries `padding-top: var(--pad)` (the framework's own clamp token, so it scales
 *     at 3440 with no new number): the white page's top edge sits BELOW the top of whatever
 *     scrolls this box, with gray showing above it, around the nav, and down the right of the
 *     page (the well is wider than the page's `--floating-measure` cap). Scroll the ambient page
 *     and that gray top strip is the first thing to go — the white page's own top edge then
 *     scrolls up and off, clipped by the viewport, exactly like any normal block.
 *   - The nav is `position: sticky; top: 0` — it already was, in the version this replaces — so
 *     at rest its top lines up with the page's top (both start after the same padding-top), and
 *     once you scroll it stays pinned to the viewport top while the page scrolls past beside it.
 *     Its own colours are untouched.
 *   - The page itself is `background: var(--surface)` (white in light mode) with its own padding,
 *     so there is no seam — no border, no shadow, no gap — between the gray well and the white
 *     page; the colour change alone is the edge.
 *
 * Written for AI 2's workspace view (`?view=workspace` on a card) and lifted here into core/Page's
 * Layout tab as its "Floating page" word — this is the ONE copy; `ai2/floating.js` re-exports it,
 * so AI 2 needs no other change. It imports nothing but core/View, and its stylesheet is the
 * string below, in `@layer site`, added once per document. Every class is `floating-…`.
 */
export class Floating {
	constructor(...args){ this.assign(...args); this.initialize(); }
	assign(...args){ return Object.assign(this, ...args); }

	initialize(){
		this.constructor.style();
		const draw = () => { this.draw(); };
		this.box ? this.box.append(draw) : draw();
	}

	draw(){
		this.$well = div.c("floating-well", () => {
			this.$root = div.c("floating", () => {
				this.$nav = nav.c("floating-nav", () => { this.links(this.items); });
				this.$page = div.c("floating-page", () => { this.content?.(this); });
			});
		});
	}

	/** Redraw the links only. */
	nav(items){
		this.items = items;
		this.$nav?.empty(() => { this.links(items); });
		return this;
	}

	links(items = []){
		items.forEach(item => { item.href ? this.link(item) : this.heading(item); });
	}

	link(item){
		const $a = a.c("floating-link").href(item.href).text(item.label);
		if (item.active) $a.attr("aria-current", "page");
		if (item.title) $a.attr("title", item.title);
	}

	heading(item){ span.c("floating-heading").text(item.label); }

	/** The stylesheet, once per document. */
	static style(){
		if (typeof document === "undefined" || document.getElementById("floating-css")) return;
		const el = document.createElement("style");
		el.id = "floating-css";
		el.textContent = this.css;
		document.head.append(el);
	}
}

/* The whole look. `container-type` is on `.floating`, so the queries below restyle its
   CHILDREN (a box cannot restyle its own container). Spacing is the site's own clamps. */
Floating.css = `
@layer site {
	.floating-well {
		background: var(--fill-a16);
		padding: var(--pad);
		padding-top: var(--pad);
	}
	/* Fills the whole region at rest, even when the current tab is short. NOT a
	   percentage: this box's ancestor is a CSS-grid row sized "auto" (Page.css sets
	   grid-template-columns for its main/wide/bleed tracks, never grid-template-rows),
	   so a row holding only this box sizes to ITS content and a percentage height on
	   this box has nothing definite to be a percentage OF — both resolve to each
	   other and the well ends up content-height, not full-bleed (found live, 2026-09-29:
	   a 656px-tall well in a 1080px-tall page). 100dvh sidesteps that: a caller whose
	   region is not the full viewport (AI 2's workspace, a smaller panel) overrides it
	   by declaring --floating-min-height on any ancestor.
	   The extra + var(--pad) is on purpose too: without it, a short tab's well is
	   EXACTLY one screen tall and there is nothing left to scroll, so the "the top
	   edge clips away as you scroll" behaviour would have nothing to demonstrate it on.
	   One padding's worth of headroom guarantees a short tab still scrolls.
	   The :not(.ui-section) is load-bearing — a page that explains this component by
	   wrapping a SECOND, illustrative "floating-well" in ui/section (core/Page/layout/
	   floating/page.js's own Overview tab does exactly this) is not the real thing, and
	   this rule must not reach it: found live, 2026-09-29, a 700px gray gap under a
	   60px diagram box, because the diagram's own label box inherited a floor meant only
	   for the real one. ui/section always adds "ui-section" alongside the classes it is
	   asked to label, so that is the one reliable way to tell the two apart. */
	.floating-well:not(.ui-section) {
		min-height: calc(var(--floating-min-height, 100dvh) + var(--pad));
	}
	.floating {
		container: floating / inline-size;
		display: grid;
		grid-template-columns: var(--floating-nav, 13em) minmax(0, var(--floating-measure, 64em));
		justify-content: center;
		align-items: start;
		gap: var(--flow, 2em);
	}
	.floating-nav {
		position: sticky;
		top: 0;
		display: flex;
		flex-direction: column;
		gap: 0.15em;
		min-width: 0;
	}
	.floating-link {
		display: block;
		padding: 0.35em 0.7em;
		border-radius: 0.4em;
		color: inherit;
		text-decoration: none;
		overflow-wrap: anywhere;
	}
	.floating-link:hover { background: var(--tint, rgba(127, 127, 127, 0.1)); }
	.floating-link[aria-current] {
		background: var(--tint, rgba(127, 127, 127, 0.12));
		box-shadow: inset 3px 0 0 var(--prim, currentColor);
		font-weight: 600;
	}
	.floating-heading {
		margin: 0.9em 0 0.2em;
		padding-inline: 0.7em;
		font-size: 0.78em;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		opacity: 0.65;
	}
	/* The page: white, its own padding, no border — the colour change alone is the seam. */
	.floating-page {
		min-width: 0;
		background: var(--surface);
		padding: var(--pad-card);
	}

	@container floating (width < 44em) {
		.floating-nav {
			position: static;
			flex-direction: row;
			flex-wrap: wrap;
			grid-column: 1 / -1;
		}
		.floating-heading { display: none; }
		.floating-link[aria-current] { box-shadow: inset 0 -2px 0 var(--prim, currentColor); }
		.floating-page { grid-column: 1 / -1; }
	}
}
`;

/** `floating(box, { nav, content })` — see the header above. */
export default function floating(box, { nav: items = [], content, ...rest } = {}){
	return new Floating({ box, items, content, ...rest });
}

export { floating };
