import { Page, demo, md, code, div, h2 } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Previews",
	description: "previews() arranges, preview() draws — the parent's wall and the child's card.",
	icon: "grid_view",

	content(){

		demo(() => {
			const gallery = new Page({
				title: "Gallery",

				children: {
					Chart: {
						chart(){ return div.c("flex v gap wash pad", () =>
							[1, 2, 3, 4].forEach(() => div.c("surface").style("height", "0.9em")))
							.style({ "--gap": "0.35em", "--pad": "0.6em" }); },

						preview(nav){ return this.preview_card(nav, () => this.chart()); },
						content(){ this.chart(); } },

					Notes: { icon: "description",
						content(){ md("No `preview()` of its own — so it gets the default card."); } },
				},

				content(){ this.previews(); },
			});

			demo.app(gallery).style("height", "17em");
		}, "**Plural is the parent; singular is the child.** `previews()` is what *Gallery* calls to arrange its children. `preview(nav)` is what *Chart* overrides to say what its own card shows. Both are in that one wall: a thumb makes the card **bare**, and the card with only a label keeps its chrome.");

		md("The two are never a choice between each other — **a page calls `previews()` for its children and overrides `preview()` for itself**, and most pages do one or the other, never both.");

		h2("The parent arranges");

		code.js(`content(){ this.previews(); }     // my children, as a wall of cards
content(){ this.walls(); }        // my GRANDchildren, under each child's name
initialize(){ this.catalog(); }   // the same cards, as a rail beside a region`);

		md("Three arrangements of the same cards; the choice is **how deep the index goes**. [`walls()`](/framework/core/Page/api/walls/) is one rung per child — its name as a link, then that child's own `previews()` — and it stops at depth 1 on purpose: a wall already runs eleven columns at 3440, so another level costs a screen rather than a click. A child with no children of its own gets no rung. [`catalog()`](/framework/ext/catalog/) is declared from `initialize()` rather than `content()`, because the page's own prose becomes the rail's **first card** — a real child, at a real url.");

		h2("The child draws");

		code.js(`// the default, on every Page — icon and label, the whole card clickable
preview(nav){ return this.preview_card(nav); }

// the override — pass a thumb, and the card becomes a live render of this page
preview(nav){ return this.preview_card(nav, () => div.c("zoom-50", () => this.chart())); }`);

		md("`previews()` builds each entry with `nav_for(name)`, hands it to `child.preview(nav)` and gets out of the way — **a card is drawn by the page it points at.** Override that one method and the card is right in every wall, rail and ladder on the site at once, because all of them ask the same page.");

		md("⚠ **Build fresh DOM inside a thumb.** `render()` memoizes `this.view`, so a thumb returning it would *steal* the page's own view the moment the page rendered. Give the page a method that builds — `chart()` above — and call it from both `content()` and `preview()`.");

		h2("preview_card() and preview_link() are the shape");

		code.js(`preview_card(nav = this.nav(), thumb)   // the card — thumb above, link below
preview_link(nav)                       // the link — icon + label`);

		md("**Call these; never override them.** They are the shared markup, which is exactly why an override is one line and cannot drift from the default card. `nav` is optional: `page.preview()` on its own falls through to `this.nav()`.");

		md("⚠ **The thumb is inert, and the label below it is the anchor** — `pointer-events: none` on the thumb, and `.page-preview-link::after` stretched over the whole card so all of it stays clickable. That single constraint explains the shape: a live render can contain links of its own, and an `<a>` inside an `<a>` is invalid — the browser silently un-nests it and you get two anchors where you wrote one. **The label lives outside the render because it cannot live inside it.**");

		md("A thumb also changes the card's **look**, not just its contents: a thumbed card drops its surface, border and inset, because the render is already the card. Nothing to opt into — `Page.css` asks `:not(:has(> .page-preview-thumb))`.");

		h2("What a child claims");

		code.js(`export default new Page({
    meta: import.meta,
    title: "Dashboard",
    group: "Arrangements",   // heads the run of cards this one starts
    card: "two",            // "two" | "tall" | "big" — its footprint on the wall
});`);

		md("Both are **claims a child makes that the wall reads**. `previews()` drops an `h4` whenever `group` changes, so a run of children sharing a word gets one heading — categories before specifics, on a wall or in a rail. `card` rides along in `nav()`: `two` takes two columns, `tall` doubles the thumb's ceiling, `big` does both. A size is a claim, not a width — the wall still counts its own columns.");

		md("Retune a wall where it is built: `this.previews().style({ \"--column\": \"18em\", \"--thumb-max\": \"15em\" })`. The tokens sit on the wall, so one index picks its own scale in one place.");

		md("Fourteen of these running at once: the [Overview](/framework/core/Page/overview/) rail — every card in it is a live tree, drawn by `preview()`.");

		md("The full records — call sites, the wall's grid, and what each method is worth — are on [`previews()`](/framework/core/Page/api/previews/), [`preview()`](/framework/core/Page/api/preview/) and [`walls()`](/framework/core/Page/api/walls/).");

		md("Next: [Shell](/framework/core/Page/shell/) — the knobs on all of it, ending in your own app.");
	}
});
