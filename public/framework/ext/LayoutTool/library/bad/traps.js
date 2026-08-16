/* The don'ts. Each one is a plausible layout — the shape someone actually
 * writes, not a minimal rule-tripper — deliberately broken in one way, live, so
 * the tool can put a number on how badly.
 *
 * Every entry names the rule it trips, the width where it stops working, and
 * the library entry that replaces it. A don't with no alternative is a
 * complaint, not doctrine. */

import { div, p, h2, h3, h4, span, a, ui } from "/app.js";

const LIB = "/framework/ext/LayoutTool/library/";

const PROSE = "The framework has no build step, so everything under public/ is served exactly as "
	+ "written and runs in the browser as native ES modules. Import paths are real URLs, a page is a "
	+ "file on disk, and the thing you read in the editor is the thing the browser executes.";

const WORDS = "A heading and a sentence or two, which is all a card ever holds.";

const cards = (n, style) => Array.from({ length: n }, (_, i) =>
	div().style({ padding: "1em", border: "1px solid var(--line)", borderRadius: "6px", ...style })
		.append(() => { h3(`Card ${i + 1}`); p(WORDS); }));

export const traps = [

	{
		group: "Widths", title: "Fixed-track wall", rule: "escape · dead-space",
		short: "Three 320px tracks: off the edge of a phone, and two thirds empty at 3440.",
		decl: `display: grid;
gap: 1em;
grid-template-columns: repeat(3, 320px);   /* ✗ a count and a pixel */`,
		caption: "**A track list that names a count and a pixel has decided the viewport.** At 400 the wall is "
			+ "1024px wide inside a 370px page and the document scrolls sideways; at 3440 it is still 1024px and "
			+ "leaves two thirds of the monitor as background. One declaration, broken at both ends.\n\n"
			+ "The auto grid never states a count. It states the *narrowest a card may be* and lets the width "
			+ "decide how many fit — which is the same declaration on a phone and on a mega monitor.",
		see: `Instead: [Tile wall](${LIB}tile-wall/).`,
		build(){
			div().style({ display: "grid", gap: "1em", gridTemplateColumns: "repeat(3, 320px)" })
				.append(() => cards(6));
		},
	},

	{
		group: "Widths", title: "Prose with no ceiling",
		rule: "measure",
		short: "A reading grid built on `1fr` — 112 characters a line the moment it drops to one column.",
		decl: `display: grid;
gap: 2em;
grid-template-columns: repeat(auto-fill, minmax(min(40em, 100%), 1fr));   /* ✗ unbounded max */`,
		caption: "**This is the advice the `layout-design` skill used to give, and the analyzer failed it.** "
			+ "`1fr` is a *maximum*, and an unbounded one: at two columns it looks perfect, and at one column the "
			+ "track takes the entire width and the paragraph runs to 112 characters.\n\n"
			+ "The failure is invisible at the width you designed at. It appears when the container is between "
			+ "one and two columns wide — around 1100–1280px on this site — which is exactly the band nobody "
			+ "opens the browser at.",
		see: `Instead: [Reading grid](${LIB}reading-grid/) — the same grid with a \`38em\` ceiling. Why \`1fr\` is still right for tiles: [Tile wall](${LIB}tile-wall/).`,
		build(){
			div().style({ display: "grid", gap: "2em", gridTemplateColumns: "repeat(auto-fill, minmax(min(40em, 100%), 1fr))" })
				.append(() => [1, 2].forEach(i => div.c("flow").append(() => { h3(`Column ${i}`); p(PROSE); p(PROSE); })));
		},
	},

	{
		group: "Widths", title: "Stacked forever",
		rule: "measure · dead-space",
		short: "A mobile-first feed that never unstacks — one 3000px line of text per row at 3440.",
		decl: `display: flex;
flex-direction: column;
gap: 0.5em;
/* ✗ nothing inside the row ever becomes a column */`,
		caption: "**Stacking is a decision about the phone that gets left on at 3440.** Each row here keeps its "
			+ "full width and spends it on one line of running text, which is the widescreen version of unreadable: "
			+ "the eye cannot find the start of the next line.\n\n"
			+ "Keeping the row is right — a feed is a list. What is missing is that the *inside* of the row has "
			+ "no columns, so extra width turns into line length instead of into places.",
		see: `Instead: [Dashboard row](${LIB}dashboard-row/) — identity | detail | figures, one grid inside the row.`,
		build(){
			div.c("flex v").style({ gap: "0.5em" }).append(() =>
				["probe.js", "rules.js", "polish.js", "score.js", "sweep.js"].forEach(name =>
					div().style({ padding: "0.7em 1em", border: "1px solid var(--line)", borderRadius: "6px" })
						.append(() => p(`${name} — ${PROSE}`))));
		},
	},

	{
		group: "Regions", title: "Rail that never wraps",
		rule: "measure",
		short: "A 260px nav pinned beside an article with `nowrap` — the article ladders on a phone.",
		decl: `display: flex;
flex-wrap: nowrap;             /* ✗ the row can never become a stack */
gap: 2em;

.rail { width: 260px; flex: 0 0 auto }
.body { flex: 1 }              /* ✗ no min-width, no basis */`,
		caption: "**`nowrap` is the whole bug.** The rail keeps its 260px at every width, so at 400 the article "
			+ "gets about 90px and the prose ladders — two words a line for a dozen lines, which the `measure` "
			+ "rule reports as its low end rather than its high one.\n\n"
			+ "**Clean at 1280, 1920 and 3440. Broken at 400.** That asymmetry is the whole entry: the layout is "
			+ "correct at every width its author looked at. Wrapping costs one word and needs no breakpoint — give "
			+ "the body a `24em` basis and the row breaks itself where the two no longer fit.",
		see: `Instead: [Rail and content](${LIB}rail-and-content/).`,
		build(){
			div().style({ display: "flex", flexWrap: "nowrap", gap: "2em" }).append(() => {
				div.c("flex v").style({ width: "260px", flex: "0 0 auto", gap: "0.3em" }).append(() => {
					h4("On this page");
					["Overview", "Tracks", "Utilities", "Responsiveness"].forEach(t =>
						a(t).attr("href", "#").style({ minHeight: "2.2em", display: "flex", alignItems: "center" }));
				});
				div().style({ flex: "1" }).append(() =>
					div.c("measure start flow").append(() => { h2("The article"); p(PROSE); p(PROSE); }));
			});
		},
	},

	{
		group: "Regions", title: "Scroller in a wrapping row",
		rule: "nothing — a blind spot",
		short: "Two scrolling panes in a `wrap` row — both stop scrolling the moment the row wraps.",
		decl: `display: flex;
flex-wrap: wrap;               /* ✗ a flex LINE sizes to its content */
height: 22em;

.pane { flex: 1 1 20em; overflow-y: auto }`,
		caption: "**A wrapping row cannot hold a scroller.** A flex line sizes itself to its content, so once the "
			+ "row wraps each pane grows to its full content height and `overflow-y: auto` has nothing to do — the "
			+ "declared `22em` is then a lie the panes overflow, and the page below is pushed down or the content "
			+ "is cut.\n\n"
			+ "⚠ **The tool scores this clean at every width, and that is the finding.** Nothing overlaps, "
			+ "nothing escapes sideways, no box clips — the panes simply grow past a `22em` row whose `overflow` "
			+ "is `visible`, and every rule here measures the horizontal axis or a clip. The only findings it "
			+ "reports are `alignment` near-misses that are really this pane's own padding. **Vertical overflow "
			+ "of a visible box is the analyzer's standing blind spot**, and the honest detector for it is a "
			+ "`sweep()`: the row's height signature changes at the width where it wraps.",
		see: `Instead: [List and detail](${LIB}list-and-detail/) — a grid whose tracks cannot wrap, with \`min-height: 0\` on all three boxes.`,
		build(){
			div().style({ display: "flex", flexWrap: "wrap", gap: "1em", height: "22em" }).append(() =>
				[1, 2].forEach(i => div.c("flex v").style({ flex: "1 1 20em", overflowY: "auto", gap: "0.3em", border: "1px solid var(--line)", borderRadius: "6px", padding: "0.6em" })
					.append(() => Array.from({ length: 12 }, (_, j) =>
						div().style({ padding: "0.4em 0.5em" }).append(() => span(`Pane ${i} · item ${j + 1}`))))));
		},
	},

	{
		group: "Boxes", title: "Chosen height",
		rule: "clipped",
		short: "A 220px panel holding 400px of list — the rest exists and cannot be reached.",
		decl: `height: 220px;
overflow: hidden;              /* ✗ a clip with no affordance */`,
		caption: "**`overflow: hidden` with no scrollbar hides content from the reader and from the browser's "
			+ "find.** It is the one departure from normal flow that fails silently: nothing overlaps, nothing "
			+ "escapes, the page looks composed, and four rows are simply gone.\n\n"
			+ "A height is the author claiming to know how tall content will be. Where the box genuinely must be "
			+ "bounded — a pane in a fixed shell — the bound belongs on the *container* and the box scrolls.",
		see: `Instead: [List and detail](${LIB}list-and-detail/), or let the content size the box. A deliberate crop — \`max-height\` with a fade — is a different thing, and the tool exempts it.`,
		build(){
			div().style({ height: "220px", overflow: "hidden", border: "1px solid var(--line)", borderRadius: "6px", padding: "1em" })
				.append(() => { h3("Recent runs"); Array.from({ length: 10 }, (_, i) => p(`Run ${i + 1} — ${WORDS}`)); });
		},
	},

	{
		group: "Boxes", title: "Unbreakable child",
		rule: "escape",
		short: "A flex item's `min-width: auto` refuses to shrink below one long token.",
		decl: `display: flex;
gap: 1em;

.pane { flex: 1 }              /* ✗ min-width: auto — the content is the floor */`,
		caption: "**A flex or grid item's automatic minimum is its content**, so one unbreakable token — a url, a "
			+ "hash, a file path — sets a floor the row cannot go below, and the pane pushes its sibling out of "
			+ "the box.\n\n"
			+ "`min-width: 0` is the fix on flex; `minmax(0, 1fr)` is the same fix spelled for a grid track. Both "
			+ "say the same thing: this item may be narrower than what is inside it, and what is inside it will "
			+ "handle that.\n\n"
			+ "**A phone finding.** At 1920 the token fits and the row is clean; at 400 it is 83% outside its "
			+ "parent and the page scores D. A layout that only breaks below a width is not a layout that only "
			+ "*sometimes* breaks — it is one that was never measured there.",
		see: `The full table of what breaks nesting: [Nesting](/framework/styles/rules/nesting/). Both fixes in place: [List and detail](${LIB}list-and-detail/).`,
		build(){
			div().style({ display: "flex", gap: "1em" }).append(() => {
				div().style({ flex: "1", padding: "1em", border: "1px solid var(--line)", borderRadius: "6px" })
					.append(() => { h3("Source"); p("/framework/ext/LayoutTool/library/bad/unbreakable-child/averyveryverylongunbreakabletokenthatcannotwrap"); });
				div().style({ flex: "1", padding: "1em", border: "1px solid var(--line)", borderRadius: "6px" })
					.append(() => { h3("Detail"); p(WORDS); });
			});
		},
	},

	{
		group: "Boxes", title: "Pixel padding",
		rule: "pad-scale",
		short: "The same 20px on a 240px card and on a 1000px one — right once, wrong once.",
		decl: `padding: 20px;                 /* ✗ one number, two jobs */`,
		caption: "**Padding has two floors and a pixel clears only one.** 20px is 8.3% of a 240px card and reads "
			+ "as generous; the same 20px is 2% of a 1000px card and reads as a frame that forgot to grow. Mike's "
			+ "original phrasing, and the reason `pad-scale` exists.\n\n"
			+ "`clamp(0.75em, 3.5%, 3.5em)` clears both: the em floor is about legibility (can the text breathe "
			+ "next to the edge), the percentage is about composition (is the frame proportionate to what it "
			+ "holds), and the em ceiling stops a 3000px box getting a 100px margin.\n\n"
			+ "Read the table across: at **400** the 20px is genuinely proportionate and nothing fires — the "
			+ "narrow card is not the bug. At **1280 and 1920** `pad-scale` reports the wide one low, wanting "
			+ "35px and 55px. At **3440** it goes quiet again, and that is a **gap, not a pass**: past 85% of the "
			+ "viewport the rule stops treating a box as a card and hands it to `gutter`, which measures against "
			+ "the font size (20px ÷ 18px = 1.1×) and lets it through. A 3300px band with a 20px inset is a "
			+ "layout neither rule can see.",
		see: `Instead: [Section band](${LIB}section-band/) and every card in [Tile wall](${LIB}tile-wall/). Live proof at three widths: [Proportion](/framework/styles/rules/proportion/).`,
		build(){
			div.c("flex v gap").append(() => {
				div().style({ width: "240px", padding: "20px", border: "1px solid var(--line)", borderRadius: "6px" })
					.append(() => { h3("240px"); p(WORDS); });
				div().style({ padding: "20px", border: "1px solid var(--line)", borderRadius: "6px" })
					.append(() => { h3("As wide as the page"); p(WORDS); p(WORDS); p(WORDS); });
			});
		},
	},

	{
		group: "Boxes", title: "Band with no gutter",
		rule: "gutter · cramped",
		short: "A full-bleed section whose text starts at the window's edge.",
		decl: `--measure: none;
padding-inline: 0;             /* ✗ full width taken literally */`,
		caption: "**Full width is about the paint, not about the text.** Dropping the measure without putting an "
			+ "inset back leaves prose starting at the pixel the background does, which the `gutter` rule measures "
			+ "as region-edge-to-text over font size — under 0.12× is text touching a line it can see. Measured "
			+ "here: **0.00×**, at every width.\n\n"
			+ "Dropping the measure costs twice, and the second cost rides along in the declaration: the prose "
			+ "runs 198 characters a line at 1920 and 261 at 3440.\n\n"
			+ "⚠ The specific way this ships: a page takes `.page.full`, notices the text is flush, and adds "
			+ "padding on an inner wrapper. The page **title** renders outside anything `content()` builds, so it "
			+ "stays flush and the two no longer line up.",
		see: `Instead: [Section band](${LIB}section-band/) — declare \`--measure\` and \`--page-pad\`, never \`full\` plus an inner wrapper.`,
		build(){
			div.c("wash").style({ paddingBlock: "2em", paddingInline: "0", borderRadius: "6px" })
				.append(() => { h2("A banded section"); p(PROSE); });
		},
	},

	{
		group: "Data", title: "Table with no scroller",
		rule: "doc-overflow · escape",
		short: "Six columns that cannot compress — so the whole document scrolls sideways.",
		decl: `table { min-width: 60em }      /* ✗ and nothing around it scrolls */`,
		caption: "**The document must never carry a table's width.** A table has a width below which it stops "
			+ "being readable, which is legitimate — what is not legitimate is pushing the *page* past the "
			+ "viewport to get it. At 400 this runs 461px past the window and 135% outside its own parent; at "
			+ "1280 and above the 60em fits and every rule goes quiet, which is exactly how it ships.\n\n"
			+ "One box scrolls, and it is the box that has something to scroll. `overflow-x: auto` on a wrapper is "
			+ "eight characters and it is also the affordance — a scrollbar is how the reader learns there is more.",
		see: `Instead: [Wide table](${LIB}wide-table/).`,
		build(){
			ui.table(["Rule", "Measurement", "high", "medium", "low", "Tier"], [
				["cramped", "text-to-frame ÷ font-size", "< 0.12", "—", "< 0.35", "broken"],
				["measure", "characters per line", "> 95", "85–95", "—", "broken"],
				["escape", "overflow ÷ parent width", "> 0.15", "> 0.02", "—", "broken"],
				["dead-space", "content span ÷ viewport", "—", "< 0.40", "< 0.55", "broken"],
			]).style("min-width", "60em");
		},
	},
];

export default traps;
