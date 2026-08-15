import { Page, md, h2, div, code } from "/app.js";
import docs from "/framework/styles/layouts/docs/page.js";
import shell from "/framework/styles/layouts/shell/page.js";
import mail from "/framework/styles/layouts/mail/page.js";

export default new Page({
	meta: import.meta,
	title: "Layouts",
	description: "A Layout tab on the Page class page: ten whole-page layouts, each card a phone beside a 3440 monitor.",
	icon: "space_dashboard",

	content(){

		md("**[/framework/styles/layouts/](/framework/styles/layouts/)** — a ninth tab on the `Page` class page, between Page flow and API. Ten whole-page layouts, one content object under all ten, and **every card is the layout twice: a whole 390px phone screen beside a whole 3440px monitor screen, both live, neither cropped.** Three of them, running, right here:");

		div.c("page-previews wide", () => [docs, shell, mail].forEach(page => page.preview(page.nav())))
			.style({ "--column": "20em", "--gap": "1em" });

		md("Click one: the pair opens on a stage with the handle between them, and dragging it moves both simulated widths in opposite directions. **The stage is auto-height** — the taller pane sets it and the shorter page grows to meet it, so you get the whole layout at both widths instead of a strip. The layout bar is wired to the wide pane, the source is open below, and **the layout's regions are chips in the right drawer** — [App shell](/framework/styles/layouts/shell/) has five, and turning all five off leaves you looking at [Document](/framework/styles/layouts/document/).");

		h2("Second pass — the four things review caught");

		md(`| reported | cause | now |
|---|---|---|
| *"the split view loses half the site"* | both panes were levelled DOWN to a fixed 440px strip of screen | auto height: the taller pane sets it, the shorter page takes a \`min-height\` floor to meet it. A floor can only add, so no width can crop anything — and the extra is absorbed by each layout's own \`flex-1\` band, so footers, status bars and composers still land on the bottom edge |
| *"the rail does a funky chicken"* | the render was IN FLOW, so an un-zoomed 1440px viewport sized the pane until the observer fitted it. Measured at 1600: **1440px tall → 344px → 79px**, three layouts ~300ms apart | \`aspect-ratio\` on the pane and \`position: absolute\` on the render — the pane's height comes from its own width now, so nothing un-zoomed can size it. Plus \`visibility: hidden\` until the first fit, because a card is built detached and cannot be measured synchronously. **One state, from first paint** |
| *"make the rail wider"* | \`--rail\` was ext/catalog's 19em default | one \`render()\` override declaring the token — no rule in \`catalog.css\`, no other page affected. 295px → 404px, thumbs 79px → 134px |
| *"previews don't render right — they cut content"* | the phone was cropped to the monitor's height | a pane is now as wide a share of the card as its device is wide a share of its own height, so fitting both by width lands them on one height with **nothing cropped and no dead space** |`).ac("wide");

		md("**The lever nobody expects: prose length.** The same words stack about four times taller at 390 than at 3440, so the phone always sets a two-up's height. Cutting `blurb` to one sentence, `sections()` to one paragraph and the per-layout counts by a third took the exhibits from **1880–2310px to 1020–1160**, with nothing hidden at either width. Volume was never the lesson.");

		h2("Zero new CSS, zero new mechanisms");

		md("The tab cost **no change to `ext/classdoc` at all.** `classdoc.page()` already builds its bar as `[\"overview\", …children, \"api\", \"docs\"]`, so a top tab was one word added to `children:` in `core/Page/page.js`. The brief asked for the smallest visible extension; it turned out to be none.");

		md("Four files carry the whole library, and there is **no stylesheet in the directory**:");

		md(`| file | what it is |
|---|---|
| \`web.js\` | the fictional site's content as parts — header, menu, hero, sections, toc, cards, rows, tiles, toolbar, footer |
| \`twin.js\` | the two-pane card: fixed device widths, measured zoom, one \`ResizeObserver\` for every pane on the page |
| \`detail.js\` | \`styles/layouts/detail.js\` with \`demo.responsive()\` where that one has \`demo.stage()\`, plus \`parts:\` |
| ten \`page.js\` | one \`layout(site)\` each, 20–30 lines, all of it class strings |`);

		code.js(`layout(site){
    return div.c("page full fill flex v", () => {
        if (this.shows("header")) site.topbar();

        div.c("flex gap wrap flex-1", () => {
            if (this.shows("rail")) div.c("basis pad", () => site.menu()).style("--basis", "15em");
            div.c("flow pad", () => site.sections(8)).style({ flex: "1 1 24em", minWidth: "0" });
            if (this.shows("toc")) div.c("basis pad", () => site.toc()).style("--basis", "13em");
        }).style({ minHeight: "0", overflowY: "auto" });

        if (this.shows("footer")) site.footer();
    });
}`);

		md("That is the whole of [Docs](/framework/styles/layouts/docs/) — `detail.js` hands `site` in, so **no layout page imports content and no layout page writes any.** The only non-utility declarations in the directory are `overflow-y` and `position: sticky`, inline, because they are per-layout state rather than a look.");

		h2("What actually broke between 390 and 3440");

		md(`| symptom | cause |
|---|---|
| a pane with \`overflow-y: auto\` stops scrolling the moment the row wraps | a flex LINE sizes to its content, so a scroller one level deeper never engages. The band that wraps is the band that scrolls — and where two panes genuinely want their own bars ([List · detail](/framework/styles/layouts/split/), [Mail](/framework/styles/layouts/mail/)), all three boxes declare it |
| a sticky rail that never sticks | a stretched flex item has nothing left to stick to. \`align-self: flex-start\` |
| a nav rail wider than the article it serves | it was \`flex-1\`, the FLUID half of a row. A rail is the fixed half — \`basis\` |
| the 3440 pane a third the height of the phone beside it, board showing under it | one rendered height paints at two zooms. \`level()\` reads back the zoom the fit just wrote and floors the short page to the tall one's visual height |
| every card showing the transparency board through its own page | a browser paints a ground behind every page and a \`div\` does not. \`frame()\` paints one, in the one place that knows it is simulating a screen |`).ac("wide");

		h2("Decisions worth arguing with");

		md("- **One card, two panes** — not two cards. The comparison *is* the lesson, and a wall would put two cards on two rows. Fitted by measurement rather than a `zoom-25` rung, because a rail card, a wall card and the `< 64em` strip are three different widths.\n- **A card is a picture of a screen; the stage is the page.** `frame(height)` takes its height from the caller for exactly that reason. Full *pages* in a card was tried and is geometrically hopeless — a phone page is ~10× its own width, so an aspect-proportional phone pane would be 26px on a 430px card.\n- **Checkboxes, not variants.** `parts:` + `this.shows(name)` + `layout.context()` in the existing right drawer. The app shell alone would have been 2⁵ sibling pages.\n- **A toggle re-runs `layout()`**; it does not patch the DOM. The panel survives because the registration sits on the render, which is *emptied* rather than replaced.");

		h2("Open");

		md("- **A two-up gets tall on a wide monitor.** `demo.responsive` does not cap its fit, so at 3440 the phone pane is ~525px wide and renders its 390px page at **135%**. Exhibits measure 700–1070px at 1440 and 2000–3500px at 3440 — the whole layout either way, but a cap at 100% belongs in `ext/demo`, where `stage.js`'s width presets already have one.\n- **The wide pane has room under its content.** The phone sets a two-up's height and the monitor's page is floored to meet it — 5044px on `document`, which no real monitor is. What you see is genuine (footer on the bottom edge of a very tall window) but it reads as empty; dragging the handle toward the middle closes it. The real fix would be a two-up that can stack its panes, and that is `ext/demo`'s call, not this folder's.\n- **Two `web()`s now exist** — `ext/demo/web.js` is the fictional site as a **`Page` tree**, this one is the same site's **page content**, and `core/Page/nav/page.js` imports one while `core/Page/layout/detail.js` imports the other, two doors apart. The name was in the brief so it stands; the cheaper rename is `ext/demo/web.js` → `tree()`, three call sites.\n- **The `Docs` tab already has a note called `layout`** (`doc/layout.md`, which is really the CSS record). No collision in code or url — `/docs/layout/` beside `/layout/` — but `notes: \"declaring labels css\"` would read better than either. It changes a public url, so it wants your word.\n- **Only the wide pane is steerable.** `demo.exhibit()` steers one target, so the bar and click-to-select are the 3440 pane; the phone renders and re-renders but cannot be inspected.\n- **One content shape for ten layouts.** `web()` is a marketing/docs site, which flatters the reading layouts and stretches for Mail and Chat — those two write their own bubbles and headers. `web({ topics: … })` is already the door to a second one.");

		md("Verified in a real browser: all ten detail pages plus the tab index at **390, 900, 1440, 1600 and 3440** — no console errors, no failed requests, no horizontal overflow, both panes level at every width, and the part chips toggling a rail in and out of a live render and back. The load sequence was sampled frame by frame at 120–3100ms: **one card state throughout**, where it used to be three.");

		md("Record: [readme.md beside the pages](/framework/styles/layouts/) · sibling sessions [stage](/framework/ai/2026-08-12/stage/), [apps](/framework/ai/2026-08-12/apps/), [unify](/framework/ai/2026-08-12/unify/).");
	},
});
