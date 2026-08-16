/* The catalog: the arrangements this site is actually built from, each written
 * the way a page would write it. The `decl` shown beside a case is the CSS the
 * case runs — quote a utility class and the build must use that class.
 *
 * Breakage is never in here. The don'ts are `bad/traps.js`, and each of these
 * entries is what one of those links to. */

import { div, p, h2, h3, h4, span, a, button, ui } from "/app.js";

const LIB = "/framework/ext/LayoutTool/library/";

const PROSE = "The framework has no build step, so everything under public/ is served exactly as "
	+ "written and runs in the browser as native ES modules. Import paths are real URLs, a page is a "
	+ "file on disk, and the thing you read in the editor is the thing the browser executes.";

const WORDS = "A heading and a sentence or two, which is all a card ever holds.";

const PAD = "clamp(0.75em, 3.5%, 3.5em)";
const FRAME = { padding: PAD, border: "1px solid var(--line)", borderRadius: "6px" };

const cards = (n, style) => Array.from({ length: n }, (_, i) =>
	div().style({ ...FRAME, ...style }).append(() => { h3(`Card ${i + 1}`); p(WORDS); }));

const column = (i) => div.c("flow").append(() => { h3(`Column ${i}`); p(PROSE); });

export const patterns = [

	{
		group: "Reading", title: "Reading column",
		short: "Prose bounded at 52em — the default track of every standard page.",
		decl: `/* framework.css */
.measure { --measure: 34em; max-width: min(var(--measure), 100%); margin-inline: auto }
.measure.start { margin-inline: 0 }

/* this block */
--measure: 52em;`,
		caption: "**The house default.** `.page.standard` already puts every child in this track, so a page of "
			+ "prose declares nothing at all.\n\n"
			+ "⚠ **Measured, 52em is not 75 characters on this site.** This copy reads **103 a line at every "
			+ "width** — the em box scales with the root font, so the ratio never moves — and `measure` reports it "
			+ "medium. Copy with more capitals and inline code runs wider per character and lands near 83. The "
			+ "band that is safe for *any* copy in Montserrat is about **42em**; 52em straddles the 85 mark, which "
			+ "is why `measure` fires on some prose pages and not others.\n\n"
			+ "The second finding is the widescreen one: at 3440 this column uses 27% of the window. That is a "
			+ "real finding, not a false positive — and the fix is a second column, not a wider one.",
		see: `Widescreen: [Reading grid](${LIB}reading-grid/). The don't: [Prose with no ceiling](${LIB}bad/prose-with-no-ceiling/). The measurement: [Characters per line](/framework/ext/LayoutTool/knowledge/characters-per-line/).`,
		build(){
			div.c("measure start flow").style("--measure", "52em")
				.append(() => { h2("A reading column"); p(PROSE); p(PROSE); p(PROSE); p(PROSE); });
		},
	},

	{
		group: "Reading", title: "Reading grid",
		short: "Prose that uses a widescreen — tracks bounded at both ends.",
		decl: `display: grid;
gap: 2em;
grid-template-columns: repeat(auto-fill, minmax(min(34em, 100%), 38em));`,
		caption: "**A reading track needs a ceiling as well as a floor.** `.grid.auto` is `minmax(min(--column, "
			+ "100%), 1fr)`, and `1fr` is unbounded: the moment the container fits only one column, that column "
			+ "takes the whole width. `38em` as the maximum is what keeps the single-column case readable.\n\n"
			+ "`auto-fill`, not `auto-fit`: two articles must not become two enormous ones.",
		see: `The unbounded version, measured: [Prose with no ceiling](${LIB}bad/prose-with-no-ceiling/). Tiles want the opposite — [Tile wall](${LIB}tile-wall/).`,
		build(){
			div().style({ display: "grid", gap: "2em", gridTemplateColumns: "repeat(auto-fill, minmax(min(34em, 100%), 38em))" })
				.append(() => [1, 2, 3, 4].forEach(column));
		},
	},

	{
		group: "Walls", title: "Tile wall",
		short: "Cards that reflow on their own from phone to mega — `grid auto gap`.",
		decl: `/* framework.css */
.grid.auto { grid-template-columns: repeat(auto-fit, minmax(min(var(--column), 100%), 1fr)) }
.gap { gap: var(--gap, 1em) }

/* this block */
--column: 14em;`,
		caption: "**One `--column` and the browser does the rest.** No media query, no breakpoint list: the track "
			+ "count is a consequence of the width. Here `1fr` as the maximum is correct — a card stretching to "
			+ "fill its track is fine, and it is what keeps the last row flush.\n\n"
			+ "`min(14em, 100%)` is the load-bearing half: without it a 14em floor overflows a 320px phone.",
		see: `This is the wall every preview list draws. Prose needs the other shape — [Reading grid](${LIB}reading-grid/). The don't: [Fixed-track wall](${LIB}bad/fixed-track-wall/).`,
		build(){
			div.c("grid auto gap").style("--column", "14em").append(() => cards(8));
		},
	},

	{
		group: "Walls", title: "Media gallery",
		short: "Tiles of one shape — `aspect-ratio` on the tile, not a height.",
		decl: `--column: 12em;                 /* .grid.auto gap */

.tile { aspect-ratio: 4 / 3; overflow: hidden }
.tile > img { width: 100%; height: 100%; object-fit: cover }`,
		caption: "**A gallery's job is one silhouette repeated.** `aspect-ratio` on the tile gives every cell the "
			+ "same shape at every track width, which is what stops `ragged-row` — tallest ÷ shortest in one row "
			+ "— from firing when one caption wraps to two lines.\n\n"
			+ "A chosen `height` would do it too, and would clip on the first tile whose content grew. The ratio "
			+ "scales; the pixel does not.",
		see: `Same grid, free-height cards: [Tile wall](${LIB}tile-wall/). Live in the site: [Gallery](/framework/styles/layouts/gallery/).`,
		build(){
			div.c("grid auto gap").style("--column", "12em").append(() =>
				Array.from({ length: 8 }, (_, i) => div.c("flex v").style({ gap: "0.4em" }).append(() => {
					div.c("wash").style({ aspectRatio: "4 / 3", borderRadius: "6px" });
					span(`Plate ${i + 1}`).ac("muted");
				})));
		},
	},

	{
		group: "Walls", title: "Stat strip",
		short: "A row of figures — narrow tracks, tabular numerals, value before label.",
		decl: `--column: 9em;                  /* .grid.auto gap */

.metric { font-variant-numeric: tabular-nums }`,
		caption: "**The same auto grid at a quarter of the column.** A figure needs about nine ems, so a strip of "
			+ "them wraps to two rows on a phone and stays one row from a laptop up.\n\n"
			+ "`tabular-nums` is the only type rule here: numbers meant to be compared have to share a column "
			+ "width, or the eye reads the digits as ragged.\n\n"
			+ "⚠ **At 400 this scores B, and the finding is the tool's.** Six `alignment` near-misses, all of them "
			+ "11.2px — which is this tile's own `0.8em` padding. A padded box's children always sit one padding "
			+ "off their parent's lane, and the rule's 3–12px window is exactly the site's padding scale.",
		see: `The tool's own report is one of these. Wider items belong in a [Dashboard row](${LIB}dashboard-row/). Why the near-misses: [Padding is not a misalignment](/framework/ext/LayoutTool/knowledge/padding-is-not-a-misalignment/).`,
		build(){
			div.c("grid auto gap").style("--column", "9em").append(() =>
				[["116", "pages"], ["4.2 ms", "per run"], ["25 µs", "per node"], ["13", "rules"], ["64 / 64", "corpus"], ["0", "at runtime"]]
					.forEach(([value, name]) => div.c("flex v").style({ gap: "0.1em", padding: "0.6em 0.8em", background: "var(--tint)", borderRadius: "6px" })
						.append(() => {
							span(value).style({ fontSize: "1.15em", fontWeight: "700", fontVariantNumeric: "tabular-nums" });
							span(name).ac("muted");
						})));
		},
	},

	{
		group: "Regions", title: "Rail and content",
		short: "A fixed-width nav beside an article that takes the slack.",
		decl: `.row  { display: flex; flex-wrap: wrap; gap: 2em }
.rail { flex: 0 0 var(--basis, 15em); min-width: 0; align-self: flex-start }
.body { flex: 1 1 24em; min-width: 0 }
.body > .measure.start { max-width: min(34em, 100%) }   /* the reading, bounded */`,
		caption: "**A rail is the fixed half of a row.** `basis`, never `flex-1` — as `flex-1` the nav splits the "
			+ "slack with the article and ends up wider than the reading.\n\n"
			+ "`align-self: flex-start` is what gives a sticky rail something to stick to; stretched, it has no "
			+ "spare height to scroll within. `flex-wrap: wrap` and a `24em` basis on the body are the whole "
			+ "responsive story: below about 40em the rail drops above the article, with no media query.\n\n"
			+ "⚠ **The body still needs its own measure.** Written without the inner track this ran 160 characters "
			+ "a line at 1920 and 261 at 3440 — `flex: 1` means *take the slack*, and prose is the one thing that "
			+ "must not. Bounded, the pair then uses **18% of a 3440 screen** and `dead-space` says so; the site's "
			+ "answer to that is a **third** region, which is what the Docs layout is.",
		see: `Three regions instead of two: [Docs](/framework/styles/layouts/docs/). Two panes that each scroll: [List and detail](${LIB}list-and-detail/). The don't: [Rail that never wraps](${LIB}bad/rail-that-never-wraps/).`,
		build(){
			div.c("flex gap wrap").style("--gap", "2em").append(() => {
				div.c("basis flex v gap").style({ "--basis": "15em", alignSelf: "flex-start", "--gap": "0.4em" }).append(() => {
					h4("On this page");
					["Overview", "Tracks", "Utilities", "Responsiveness", "Previews"]
						.forEach(t => a(t).attr("href", "#").style({ padding: "0.3em 0", minHeight: "2.2em", display: "flex", alignItems: "center" }));
				});
				div().style({ flex: "1 1 24em", minWidth: "0" }).append(() =>
					div.c("measure start flow").append(() => { h2("The article"); p(PROSE); p(PROSE); p(PROSE); p(PROSE); }));
			});
		},
	},

	{
		group: "Regions", title: "List and detail",
		short: "Two panes, each with its own scrollbar — the inbox shape.",
		decl: `.row    { display: flex; flex-wrap: wrap; gap: 1em; height: 22em;
          min-height: 0; overflow-y: auto }
.list   { flex: 0 0 18em; min-width: 0; overflow-y: auto }
.detail { flex: 1 1 24em; min-width: 0; overflow-y: auto }`,
		caption: "**`overflow-y: auto` on all three boxes, not on one.** Side by side each pane is stretched to "
			+ "the row and scrolls itself; wrapped, the panes go content-tall and the **row** scrolls them. "
			+ "Declaring it once, on the panes only, is how a split silently stops scrolling on a phone.\n\n"
			+ "`min-width: 0` on both panes, because a flex item's automatic minimum is its content and one long "
			+ "subject line would push the other pane out of the box. A two-track grid does the same job above "
			+ "600px and cannot wrap below it — measured, the first track collapsed to 62px at 400 and the "
			+ "detail prose laddered at 9.6 characters a line.\n\n"
			+ "⚠ **The `alignment` cluster on this page is the tool's, not the layout's.** Sixteen near-misses, "
			+ "every one of them 9.4px — the message row's own `0.6em` padding, which its text will always sit "
			+ "inside of.",
		see: `Live in the site: [Mail](/framework/styles/layouts/mail/), [List · detail](/framework/styles/layouts/split/). The don't: [Scroller in a wrapping row](${LIB}bad/scroller-in-a-wrapping-row/).`,
		build(){
			div.c("flex gap wrap").style({ height: "22em", minHeight: "0", overflowY: "auto" }).append(() => {
				div.c("flex v").style({ flex: "0 0 18em", minWidth: "0", overflowY: "auto", gap: "0.3em", border: "1px solid var(--line)", borderRadius: "6px", padding: "0.6em" })
					.append(() => Array.from({ length: 14 }, (_, i) =>
						div().style({ padding: "0.5em 0.6em", background: i === 1 ? "var(--tint)" : "none", borderRadius: "4px" })
							.append(() => { span(`Message ${i + 1}`).style({ fontWeight: "600" }); p(WORDS).ac("muted"); })));

				div().style({ flex: "1 1 24em", minWidth: "0", overflowY: "auto", border: "1px solid var(--line)", borderRadius: "6px", padding: "1em" })
					.append(() => div.c("measure start flow").append(() => { h3("Message 2"); p(PROSE); p(PROSE); }));
			});
		},
	},

	{
		group: "Regions", title: "Section band",
		short: "Full width with a gutter — a painted band whose prose stays on the measure.",
		decl: `/* the band: edge to edge, its own inset */
--measure: none;
padding-inline: clamp(1.5em, 3.5%, 3.5em);

/* the prose inside it: back on the measure */
.measure.start { max-width: min(var(--measure, 34em), 100%); margin-inline: 0 }`,
		caption: "**Two boxes, because they answer to different things.** The band spans the window because the "
			+ "colour is the design; the text inside it stops at a measure because reading does not get better at "
			+ "3440 characters.\n\n"
			+ "⚠ `.page.full` zeroes `--measure` **and** `--page-pad`, and the page title renders outside anything "
			+ "`content()` builds — so a full-width page with a gutter declares the two tokens rather than taking "
			+ "`full` and adding padding back on an inner wrapper.",
		see: `Every section on [Sections](/framework/styles/sections/) is one. The don't: [Band with no gutter](${LIB}bad/band-with-no-gutter/).`,
		build(){
			div.c("wash").style({ paddingBlock: "2.5em", paddingInline: "clamp(1.5em, 3.5%, 3.5em)", borderRadius: "6px" })
				.append(() => div.c("measure start flow").style("--measure", "40em")
					.append(() => { h2("A banded section"); p(PROSE); button("Read the record").style({ minHeight: "2.2em" }); }));
		},
	},

	{
		group: "Data", title: "Dashboard row",
		short: "A full-row item whose INSIDE is gridded — identity, detail, figures.",
		decl: `.row      { display: flex; flex-wrap: wrap; gap: 1.5em; align-items: baseline }
.identity { flex: 0 0 12em }
.detail   { flex: 1 1 20em; min-width: 0 }
.figures  { flex: 0 0 auto; margin-inline-start: auto; font-variant-numeric: tabular-nums }`,
		caption: "**Keep the row, give its inside places.** A feed item that stays a row at 3440 turns its extra "
			+ "width into a 3000px line of crammed text unless the row itself has columns — three named places "
			+ "beat one concatenated line of dots and abbreviations.\n\n"
			+ "⚠ **The inside has to be able to stack too.** As a fixed three-track grid this laddered at 400: "
			+ "the detail column was crushed to 16px and reported 2.4 characters a line. `flex-wrap` with a `20em` "
			+ "basis on the detail is the same three places above ~34em and one column below it, with no "
			+ "breakpoint written down.",
		see: `Live in the site: [Feed](/framework/styles/layouts/feed/), [Dashboard](/framework/styles/layouts/dashboard/). The don't: [Stacked forever](${LIB}bad/stacked-forever/).`,
		build(){
			div.c("flex v gap").style("--gap", "0.5em").append(() =>
				[["probe.js", "the browser read, in one walk", "9.1 kB"], ["rules.js", "the geometry that fails", "12.0 kB"],
					["polish.js", "what is off rather than broken", "13.0 kB"], ["score.js", "weights, grade, leading issues", "3.4 kB"],
					["sweep.js", "coarse stride, then bisect", "2.2 kB"]]
					.forEach(([name, why, size]) => div.c("flex gap wrap").style({
						alignItems: "baseline", paddingBlock: "0.7em", paddingInline: "clamp(1em, 3.5%, 3.5em)",
						"--gap": "1.5em", border: "1px solid var(--line)", borderRadius: "6px",
					}).append(() => {
						span(name).style({ fontWeight: "700", flex: "0 0 12em" });
						span(why).ac("muted").style({ flex: "1 1 20em", minWidth: "0" });
						span(size).style({ flex: "0 0 auto", marginInlineStart: "auto", fontVariantNumeric: "tabular-nums" });
					})));
		},
	},

	{
		group: "Data", title: "Wide table",
		short: "More columns than the measure holds — the wrapper scrolls, the page does not.",
		decl: `.scroller { overflow-x: auto }
.scroller > table { min-width: 44em }`,
		caption: "**One box scrolls sideways so the document never has to.** A table is authored, not wrapped: it "
			+ "has a width below which it stops being readable, and `overflow-x: auto` on a wrapper is the "
			+ "affordance that admits it.\n\n"
			+ "The block also claims `wide` on a standard page — a six-column table squeezed into the 52em prose "
			+ "measure is the single most common “displays awkwardly” bug on this site.\n\n"
			+ "⚠ **`dead-space` misreads this one, and the entry keeps it to show why.** The rule spans the text "
			+ "blocks over 20 characters, and in a table only one column has any — so it reports 13% of a 1920px "
			+ "viewport used while the table fills the width. A rule that measures prose cannot see a grid of "
			+ "short cells.",
		see: `The don't: [Table with no scroller](${LIB}bad/table-with-no-scroller/). Where a block claims a wider track: [Page shapes](/framework/styles/layouts/fit/).`,
		build(){
			div().style({ overflowX: "auto" }).append(() =>
				ui.table(["Rule", "Measurement", "high", "medium", "low", "Tier"], [
					["cramped", "text-to-frame ÷ font-size", "< 0.12", "—", "< 0.35", "broken"],
					["measure", "characters per line", "> 95", "85–95", "—", "broken"],
					["escape", "overflow ÷ parent width", "> 0.15", "> 0.02", "—", "broken"],
					["dead-space", "content span ÷ viewport", "—", "< 0.40", "< 0.55", "broken"],
					["pad-scale", "padding vs min(3.5%, 3.5em)", "—", "short by 3×", "short at all", "polish"],
				]).style("min-width", "44em"));
		},
	},

	{
		group: "Data", title: "Toolbar cluster",
		short: "Controls on one line — `flex gap v-center wrap`, targets at 2.2em.",
		decl: `/* framework.css */
.flex.wrap { flex-wrap: wrap }
.flex.v-center { align-items: center; align-content: center }
.gap { gap: var(--gap, 1em) }

/* this block */
button { min-height: 2.2em }`,
		caption: "**A UI cluster is spaced on `gap`, never on `flow`.** Flow's rhythm resolves against each "
			+ "element's own font size, which is how a card title once sat 72px under its icon.\n\n"
			+ "`2.2em` is about 35px, comfortably over the 24px WCAG 2.2 minimum the `hit-size` rule enforces — "
			+ "and `wrap` is what keeps the last control on screen at 400px instead of off the right edge.",
		see: `Live in the site: [Toolbar](/framework/ui/toolbar/). The rhythm rule: [Cascade and rhythm](/framework/styles/rules/).`,
		build(){
			div.c("flex gap v-center wrap").style({ ...FRAME }).append(() => {
				span("Filter").style({ fontWeight: "600" });
				["All", "Broken", "Polish", "Waived"].forEach(t => button(t).style({ minHeight: "2.2em", padding: "0 0.9em" }));
				a("Reset").attr("href", "#").style({ minHeight: "2.2em", display: "inline-flex", alignItems: "center" });
			});
		},
	},
];

export default patterns;
