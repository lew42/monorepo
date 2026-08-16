import { Page, md, h2, code } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "The layout model",
	label: "The model",
	description: "Seven sentences, twelve words, three page shapes — the whole system, before any of the layouts.",
	icon: "menu_book",
	group: "Read this first",

	content(){

		md("**The whole layout model is seven sentences.**\n\n"
			+ "1. **A page is three tracks** — `main | wide | bleed`. Everything you write lands in a 52em reading column unless it claims `wide` (a breakout) or `bleed` (edge to edge). One left edge; the slack goes right.\n"
			+ "2. **The page's own shape is one word.** Say nothing and you get those tracks (`standard`); `full` drops the measure and the inset, so the layout *is* the page; `fill` hands it the region's height to divide.\n"
			+ "3. **Inside a track, arrange with the utility words** — `flex grid gap auto wrap basis measure pad surface wash muted`, about a dozen of them, all in `framework.css`. A module's own CSS is layout only, and rare: not one layout in this catalog ships a stylesheet.\n"
			+ "4. **Responsiveness is intrinsic.** Tracks, `clamp()`, `auto-fit` and `flex-wrap` answer to the width of the *box*, so no layout here holds a media query and one class string is right in a card, in a sidebar, and across a 3440 monitor.\n"
			+ "5. **A page declares `children:`**, a child mounts in the nearest `$pages` region, and the router marks the active chain — anything shown *without* being routed to wears `default`, and that is the whole arrangement contract.\n"
			+ "6. **Every child draws its own `preview()`.** A parent arranges those cards as a wall (`previews()`), grouped into sections by each child's `group:` — which is exactly what [the index](/framework/styles/layouts/) is.\n"
			+ "7. **A detail page is one `demo.exhibit()`** — stage, layout bar, definition. `demo.layout()` is the config that makes a whole-page layout into one; a quoted example inside prose is `demo()`.");

		md("| | | |\n|---|---|---|\n"
			+ "| **tracks** | `main` `wide` `bleed` | where a child of a `standard` page lands. `main` is the default, and it is the 52em measure |\n"
			+ "| **shapes** | `standard` `full` `fill` | the page itself — tracks, edge to edge inside the region, or the region's full height ([Fit](/framework/styles/layouts/fit/)) |\n"
			+ "| **arrange** | `flex` `grid` `gap` `auto` `wrap` `three` `v` `v-center` `split` `basis` `flex-1` | each one word from its neighbour: nine at [Flex](/framework/styles/layouts/flex/), three at [Grid](/framework/styles/layouts/grid/) |\n"
			+ "| **walls** | `masonry` `packed` | the two ragged walls, and the difference is reading order ([Masonry](/framework/styles/layouts/masonry/)) |\n"
			+ "| **box** | `pad` `measure` `surface` `wash` `muted` `flow` `zoom-*` | an inset, a centred column, the three looks, prose rhythm, and a live thumbnail |\n"
			+ "| **previews** | `preview()` `previews()` `catalog()` | one card · a wall of them · that wall as a rail, beside the live child |\n"
			+ "| **demo** | `demo()` `demo.stage()` `demo.exhibit()` `demo.app()` | a quoted box · a bare resizable render · a whole detail page · a `Page` tree playing app |");

		h2("The cards");

		md("**Every card on [the index](/framework/styles/layouts/) is a live page, not a picture.** Click one and it opens on a stage you can drag narrower, with the layout bar wired to it and the function that built it open underneath — the same [exhibit](/framework/ext/demo/) every detail page on this site is.");

		md("Most of the cards are the layout **twice**: a whole 390px phone screen on the left, a whole 3440px monitor screen on the right, both live, neither cropped. The two panes run the same function at two widths, which is the only honest way to show a layout with no breakpoints in it — and the stage behind them is that pair with a handle between it.");

		h2("One content object, many arrangements");

		md("`web()` is the fictional site the whole-page layouts render — a header, a menu, a hero, sections, a table of contents, cards, rows, tiles, ragged notes and a footer. Every one of them imports the same `site` and **writes no content of its own**. What differs between two of these pages is where the boxes go, and that is a class string:");

		code.js(`layout(){
    return div.c("page full fill flex v", () => {
        site.topbar();

        div.c("flex gap wrap flex-1", () => {
            div.c("basis pad", () => site.menu()).style("--basis", "15em");
            div.c("flow pad", () => site.sections(8)).style({ flex: "1 1 24em" });
            div.c("basis pad", () => site.toc()).style("--basis", "13em");
        }).style({ minHeight: "0", overflowY: "auto" });

        site.footer();
    });
}`);

		md("That is the whole of [Docs](/framework/styles/layouts/docs/) — and a layout's regions are **checkboxes in the right drawer**, not sibling pages. Turn the rail, the toc and the footer off and the same article is [Document](/framework/styles/layouts/document/), live, without leaving the page.");

		h2("The two arrangements");

		md("[Flex](/framework/styles/layouts/flex/) is nine class strings, each one word from its neighbour. [Grid](/framework/styles/layouts/grid/) is three, and one token between them. **Every layout in the wall is built out of those twelve words and nothing else** — not one of them ships a stylesheet, which is the claim the whole catalog exists to make falsifiable.");

		md("Not one of them contains a media query: they respond to the width of the *box*, which is why the same class string is correct in a sidebar, in a card, and across a 3440px monitor. Open the panel on any layout and drag `--column` — the break widths are a consequence, never a design.");

		md("A page layout is a class string too. Saying nothing gives you the reading column; `standard`, `full` and `fill` are the three stances on the two tokens behind it, and they combine with the utility words — `full fill flex v` is a five-region application page. [Page shapes](/framework/styles/layouts/fit/) is the long version, with the breakout tracks.");

		h2("What the two extremes actually cost");

		md("Three things break between 390 and 3440, and all three are in the wall:\n\n- **A wrapping row cannot hold a scroller inside it.** A flex line sizes to its content, so a pane with `overflow-y: auto` stops scrolling the moment the row wraps. The band that wraps is the band that scrolls — and where two panes genuinely want their own scrollbars ([List · detail](/framework/styles/layouts/split/), [Mail](/framework/styles/layouts/mail/)), *all three* boxes declare it.\n- **A sticky rail must not be stretched.** `align-self: flex-start` is what gives it somewhere to stick to.\n- **A rail is the fixed half of a row.** `basis`, never `flex-1` — as `flex-1` a nav splits the slack with the article and renders wider than the reading.");

		md("And one that is not about CSS at all: **the same words stack about four times taller at 390 than at 3440**, so the phone always sets the height of a two-up. `web()`'s prose is one sentence per section for that reason — every extra line costs the stage four of its own.");

		h2("Seventeen samples of a space that does not end");

		md("Every `layout()` in the wall is the same tree — a nest of class strings whose leaves call parts of `web.js`. So a layout is a **string**, and [Layout space](/framework/styles/layouts/space/) is that claim as an instrument: type six lines of text, watch them render live on five screens at once, or take an integer and get a layout back. The seventeen directories here are the curriculum; that page is the search.");

		md("Next: [Sections](/framework/styles/sections/) — these layouts, filled with real elements and components.");

		// ⚠ `../readme.md` — md.file resolves against import.meta, and this page's own
		// directory holds no record. The tier's record is one level up.
		md.details(import.meta, "../readme.md", "Design record — why the index became a browser, the card that is two screens, and what will bite you");
	},
});
