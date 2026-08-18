import { Page, Doc, md, code, demo, div, p } from "/app.js";
import { sample } from "/framework/ext/demo/sample.js";

export default new Doc({
	meta: import.meta,
	title: "Catalog",
	description: "previews() as a persistent rail beside the region the children mount in — the mechanism behind every Doc Overview tab.",
	icon: "view_sidebar",

	subject: Page,
	methods: "catalog browse",
	notes: "decisions",
	files: "catalog.js catalog.css browse.js browse.css page.js readme.md",

	content(){

		code.js(`export default new Page({
    meta: import.meta,
    title: "Web",
    children: "html css js http",
    initialize(){ this.catalog(); },   // the whole conversion
    content(){ p("Nine topics, one rail."); },
});`);

		demo.stage(() => demo.app(sample({
			initialize(){ this.catalog(); },
			content(){ p("Nine topics, one rail."); },
		})).style("height", "24em")).ac("wide");

		md("One line. The rail is `previews()` unchanged — the same cards a wall draws, live thumbs and all — turned into a sticky column, and the region beside it is a `$pages` the children mount into. **Click a card**: the child renders on the right and the rail never moves.");

		md("**The page's own `content()` becomes the rail's first card.** That is why the call sits in `initialize()` rather than in `content()`: the intro is a real child at a real url, so it gets a card, a deep link and the marking every other entry has. The region is never blank — the intro renders from the start wearing `default`, the tab panel's contract, and steps aside the moment a real navigation lands. A rail of one hides itself, and below `64em` the column turns back into a strip above the detail.");

		md("## The one line that decides wall or rail");

		div.c("flex gap wide auto", () => {
			demo.app(sample({
				content(){ p("Nine topics, one wall."); },
			})).style("height", "16em");

			demo.app(sample({
				initialize(){ this.catalog(); },
				content(){ p("Nine topics, one rail."); },
			})).style("height", "16em");
		});

		code.js(`content(){ this.previews(); }     // left  — a wall: every card, once, on arrival
initialize(){ this.catalog(); }   // right — a rail: the same cards, pinned beside a region`);

		md("Same tree, same cards, same `previews()` underneath both. A wall answers *what is here*; a rail answers that once and then stays, so clicking one card never re-asks it. **This is the call to reach for** when a module's variants would otherwise be a wall of `demo()` boxes stacked down the page: `overview:` on a [`Doc`](/framework/ext/Doc/) is this same method, spelled for sibling directories instead of a hand call.");

		md("## …and `browse()` is the third answer");

		code.js(`const BANDS = { Surfaces: "card toolbar panel", Data: "table timeline" };

content(){ return this.browse(BANDS, { "--column": "18em" }); }`);

		md("A wall answers *what is here* and a rail answers it once — but at twenty peers a wall is a scroll and a rail is a column six cards tall. [`browse()`](/framework/ext/catalog/api/browse/) is the same `previews()` cards **banded and filterable**: a sticky rail of band counts and a search on the left, one grid per band on the right, every card visible at once. Two pages are one call to it — [Layouts](/framework/styles/layouts/) (29 cards, four bands) and [UI](/framework/ui/) (19 components, four bands).");

		md("The distinction against `catalog()` is whether the reader is **choosing from** the set or **reading it in order**. ⚠ Band sizes are load-bearing: a band is its own grid and `auto-fit` stretches it to fill the row, so a band of three on a 2750px wall draws three cards a thousand pixels wide.");

		md("## `overview:` *is* this method");

		code.js(`// ext/Doc/Doc.js — overview_section()
content: this.content,
initialize(){ this.catalog(); },`);

		md("A `Doc`'s Overview tab is a `catalog()` under the hood — `overview: \"basic variants advanced\"` names sibling directories, `Doc` turns them into children, and this exact method makes the first one (your `content()`) the intro and the rest a rail beside it. Nothing new to learn: a module that wants the same arrangement **outside** a `Doc` — an index, a component library, a dashboard — writes the one line above directly. [View](/framework/core/View/) demonstrates the `Doc` side of this; the sites below demonstrate the direct side.");

		md("## On the site");

		md(`| page | children |
|---|---|
| [UI](/framework/ui/) | one intro — the 19 components are a browse() wall inside it |
| [AI](/framework/ai/) | one entry per working day |
| [Sections](/framework/styles/sections/) | fifteen page bands |
| [400](/framework/styles/layouts/400/) | five specs, one column at 400px |
| [Forms](/framework/styles/elements/forms/) | every control |
| [Navigation](/web/nav/) | eleven patterns — this page IS the pattern |
| [Layout](/web/layout/) | seven principles |`);

		md("And every `Doc` Overview on the site is this method too, called from `overview_section()` rather than by hand — eight pages now, this one included, [View](/framework/core/View/) among the rest. Full caller list, with what each uses it for: [readme.md](./readme.md).");

		md("Next: [Layout](/framework/ext/layout/) — the toolbar that pushes arrangements around.");

		md.details(import.meta, "readme.md", "Readme");
	},
});
