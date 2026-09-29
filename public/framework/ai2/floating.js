import { div, nav, a, span } from "/framework/core/View/View.js";

/*
 * THE FLOATING PAGE — a page with its own left nav, floating centred in whatever room it is given.
 *
 *   floating(box, { nav: [{ label, href, active }], content: fn })
 *
 * Use it when a region is much wider than one page should be (a card's detail area is ~1,200px at
 * 3440 even with a chat column beside it) and a flush, full-width column would read as cramped text
 * in an empty hall. The nav and the page travel together as ONE unit: the nav on the left, the page
 * beside it capped at a reading-friendly width, and the pair centred in the leftover. In a narrow
 * box the nav becomes a strip of links above the page, and the page takes the full width.
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
 * two boxes. Sizes are tokens, so a caller re-sizes by declaring them on any ancestor:
 * `--floating-nav` (the nav's width, 13em) and `--floating-measure` (the page's cap, 64em).
 *
 * Written for AI 2's workspace view (`?view=workspace` on a card), and meant to be lifted into
 * core/Page's Layout tab as its "Floating page" word. It imports nothing but core/View, and its
 * stylesheet is the string below, in `@layer site`, added once per document — so moving it is
 * one file. Every class is `floating-…`.
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
		this.$root = div.c("floating", () => {
			this.$nav = nav.c("floating-nav", () => { this.links(this.items); });
			this.$page = div.c("floating-page", () => { this.content?.(this); });
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
	.floating-page { min-width: 0; }

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
