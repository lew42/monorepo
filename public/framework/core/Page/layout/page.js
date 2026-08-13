import { Page, md, h2, code } from "/app.js";

/* A card here is two screens side by side, so it wants more room than a rail of
   single thumbs does — `--rail` is ext/catalog's own knob and this is the one page
   that turns it. A token on the page, not a rule in catalog.css. */
const RAIL = "26em";

export default new Page({
	meta: import.meta,
	title: "Layout",
	description: "Ten whole-page layouts, each card a phone beside a 3440 monitor — the same content in all of them.",
	icon: "space_dashboard",

	children: "document landing docs split dashboard gallery shell feed mail chat",

	// Ten live layouts as the rail, the page you are reading as its first card.
	initialize(){ this.catalog(); },

	render(){ return Page.prototype.render.call(this).style("--rail", RAIL); },

	content(){

		md("**Every card in the rail is the layout twice** — a whole 390px phone screen on the left, a whole 3440px monitor screen on the right, both live, each painted down to fit its share. Neither is cropped: a pane is as wide a share of the card as its device is wide a share of its own height, so fitting both by width lands them on one height. Nothing here is a picture, and nothing is a screenshot of the other one — the two panes run the same function at two widths, which is the only honest way to show a layout with no breakpoints in it.");

		md("Click one and the pair opens on a stage with a handle between them: drag it and both simulated widths follow, in opposite directions. **The stage is auto-height** — the taller pane sets it and the shorter page grows to meet it, so the whole layout is visible at both widths rather than a strip of it. The layout bar is wired to the wide pane, the source is open underneath, and the layout's **regions are checkboxes in the right drawer** — turn the rail, the aside, the toolbar and the footer off and the app shell becomes the document layout, live, without leaving the page.");

		h2("One content object, ten arrangements");

		md("`web()` is the fictional site every one of these renders — a header, a menu, a hero, eight sections, a table of contents, cards, rows, tiles and a footer. `detail.js` hands it to every `layout(site)`, so **no layout page imports content and no layout page writes any**. What differs between two of these pages is where the boxes go, and that is a class string:");

		code.js(`layout(site){
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

		md("That is the whole of [Docs](/framework/core/Page/layout/docs/). Nine words from [Flex](/framework/styles/layouts/flex/) and [Grid](/framework/styles/layouts/grid/), four from the [page shapes](/framework/styles/layouts/fit/), and **zero new CSS in this directory** — the two `overflow` lines are live widget state, not a stylesheet.");

		h2("What the two extremes actually cost");

		md("Three things break between 390 and 3440, and all three are in the rail:\n\n- **A wrapping row cannot hold a scroller inside it.** A flex line sizes to its content, so a pane with `overflow-y: auto` stops scrolling the moment the row wraps. The band that wraps is the band that scrolls — and where two panes genuinely want their own scrollbars ([List · detail](/framework/core/Page/layout/split/), [Mail](/framework/core/Page/layout/mail/)), *all three* boxes declare it.\n- **A sticky rail must not be stretched.** `align-self: flex-start` is what gives it somewhere to stick to.\n- **A rail is the fixed half of a row.** `basis`, never `flex-1` — as `flex-1` a nav splits the slack with the article and renders wider than the reading.");

		md("And one that is not about CSS at all: **the same words stack about four times taller at 390 than at 3440**, so the phone always sets the height of a two-up. `web()`'s prose is one sentence per section for that reason — every extra line costs the stage four of its own.");

		md("Next: [Sections](/framework/styles/sections/) — the bands these layouts are filled with, one page each.");

		md.details(import.meta, "readme.md", "Design record — where the tab lives, the two-pane card, and toggles instead of variants");
	},
});
