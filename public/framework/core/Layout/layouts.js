/* ── THE CATALOGUE ─────────────────────────────────────────────────────────────

   Thirty layouts, as DATA. Nothing here was invented: every entry is a port, and
   every entry keeps the prose its source wrote for it.

     18   /imagine/layouts/system.js        the distributions, written as data already
     11   ext/DesignTool/library/patterns.js the measured cases, each one shot at 4 widths
      1   styles/layouts/masonry            the one shape the other two never say

   Imports nothing, so a page, a card, a filter and a doc can all read the same list
   and never disagree — the vocabulary-file pattern `imagine/paging/words.js` uses.

   WHAT AN ENTRY HOLDS — the prop table in readme.md says it in one line each.

     name · title           the url segment, and the name a reader says out loud
     columns                1 · 2 · 3 · 4 ("four or more") — the band it lands in
     intro · when · note    the prose, verbatim from the source
     room                   which of the five framework words it compiles to
     word                   the class it IS, and where that class lives
     config                 the one line of page code that makes it
     decl                   the declarations that ARE the layout, applied and printed
     boxes                  the tracks; `kind` says which fixture pours into each one
     widths                 [floor, ceiling] — the range it is PROVEN at
     fallback               the 1-column layout it becomes below its floor
     grows · overflow       does content length break it, and what happens if it does
     wraps                  does the track count follow the room (item-count fixtures)
     tags                   facets, from /imagine/design/vocabulary/tags.js
     accepts · allowed_in · denies    the rules; all three default to "any" / none
     variations             the same arrangement, distributed differently
     alternatives           a different arrangement that answers the same question
     approved               the date the fixtures last passed at every strip width

   ⚠ THE CEILING IS 3440 FOR EVERY ENTRY, on purpose. All thirty are proven to the
     top of the strip, and above a ceiling a layout holds and centres rather than
     scaling up (the owner, addendum 4). The FLOOR is the number that carries
     information: it is where the viewport opens, and it is LayoutRule #1.

   ⚠ `decl` — not `rules`. `rules` on this site now means LayoutRules (rules.js);
     these are CSS declarations, which is what `ext/DesignTool/library` calls `decl`. */

const gap = "var(--gap)";

const COLS  = "/framework/styles/layouts/cols/";
const WORDS = "/framework/styles/doc/layout-system.md";
const LIB   = "/framework/ext/DesignTool/library/";

export const LAYOUTS = [

	/* ══ ONE COLUMN ════════════════════════════════════════════════════════════
	   Rows only first — the simplest, most useful shapes — then the two ways one
	   column still divides: into rows, and into scroll sections. */

	{
		name: "stack", title: "Stack", columns: 1,
		intro: "The baseline: nothing is divided at all. Boxes follow each other down the page, each one as tall as its own content.",
		when: "Reach for it whenever the page is a sequence — an article, a form, a feed. It is the default, so it costs no CSS.",
		room: "page",
		word: { label: "no class at all", href: WORDS },
		config: 'new Page({ content(){ p("First"); p("Second"); p("Third"); } })',
		decl: { display: "block" },
		boxes: [
			{ label: "First", note: "as tall as its content", kind: "prose", decl: { "margin-bottom": gap } },
			{ label: "Second", note: "and so is this one", kind: "prose", decl: { "margin-bottom": gap } },
			{ label: "Third", note: "no area was divided", kind: "prose" },
		],
		widths: [400, 3440],
		tags: ["single-column"],
		variations: ["measure", "reading-column"],
		alternatives: ["rows", "section-band"],
		approved: "2026-09-06",
		source: "imagine/layouts",
	},

	{
		name: "measure", title: "Measure", columns: 1,
		intro: "One column with a ceiling on it: 40em, about 80 characters, centred in whatever room it was given. The room is not the measure — the leftover stays leftover.",
		when: "Every reading page. It is the site's own default page track, and the reason a 3440 screen does not hand a paragraph a 3410px line.",
		room: "page",
		word: { label: ".page / .measure", href: WORDS },
		config: 'new Page({ content(){ md("A reading page needs no class."); } })',
		decl: { display: "grid", "grid-template-columns": "min(var(--measure, 40em), 100%)", "justify-content": "center", gap },
		boxes: [
			{ label: "Prose", note: "capped at --measure", kind: "prose" },
			{ label: "More prose", note: "the same cap, the same axis", kind: "prose" },
		],
		widths: [400, 3440],
		tags: ["single-column", "docs"],
		variations: ["stack", "reading-column"],
		alternatives: ["reading-grid"],
		approved: "2026-09-06",
		source: "imagine/layouts",
	},

	{
		name: "reading-column", title: "Reading column", columns: 1,
		intro: "Prose bounded at 52em — the default track of every standard page.",
		when: "A page that is only words. `.page.standard` already puts every child in this track, so a page of prose declares nothing at all.",
		note: "⚠ **Measured, 52em is not 75 characters on this site.** This copy reads **103 a line at every width** — the em box scales with the root font, so the ratio never moves — and `measure` reports it medium. Copy with more capitals and inline code runs wider per character and lands near 83. The band that is safe for *any* copy in Montserrat is about **42em**; 52em straddles the 85 mark, which is why `measure` fires on some prose pages and not others.\n\nThe second finding is the widescreen one: at 3440 this column uses 27% of the window. That is a real finding, not a false positive — and the fix is a second column, not a wider one.",
		see: `Widescreen: [Reading grid](${LIB}reading-grid/). The don't: [Prose with no ceiling](${LIB}bad/prose-with-no-ceiling/).`,
		room: "page",
		word: { label: ".measure.start", href: "/framework/framework.css" },
		config: 'div.c("measure start flow").style("--measure", "52em", () => { … })',
		decl: { "max-width": "min(52em, 100%)", display: "flex", "flex-direction": "column", gap },
		boxes: [{ label: "The article", kind: "prose", repeat: 4 }],
		widths: [400, 3440],
		tags: ["single-column", "docs"],
		variations: ["measure"],
		alternatives: ["reading-grid", "rail-and-content"],
		approved: "2026-09-06",
		source: "DesignTool/library",
	},

	{
		name: "section-band", title: "Section band", columns: 1,
		intro: "Full width with a gutter — a painted band whose prose stays on the measure.",
		when: "A landing page's bands, a hero, a call to action: anywhere the colour is the design and the words still have to be readable.",
		note: "**Two boxes, because they answer to different things.** The band spans the window because the colour is the design; the text inside it stops at a measure because reading does not get better at 3440 characters.\n\n⚠ `.page.full` zeroes `--measure` **and** `--page-pad`, and the page title renders outside anything `content()` builds — so a full-width page with a gutter declares the two tokens rather than taking `full` and adding padding back on an inner wrapper.",
		see: "Every section on [Sections](/framework/styles/sections/) is one. The don't: [Band with no gutter](" + LIB + "bad/band-with-no-gutter/).",
		room: "page",
		word: { label: ".wash + .measure.start", href: "/framework/styles/sections/" },
		config: 'div.c("wash").style({ paddingInline: "clamp(1.5em, 3.5%, 3.5em)" }, () => div.c("measure start flow", …))',
		decl: { display: "block", background: "var(--wash)", "padding-block": "calc(var(--pad) * 1.5)", "padding-inline": "clamp(1.5em, 3.5%, 3.5em)", "border-radius": "6px" },
		boxes: [{ label: "The band's prose", note: "back on the measure", kind: "prose", decl: { "max-width": "min(40em, 100%)" } }],
		widths: [400, 3440],
		tags: ["single-column", "landing"],
		variations: ["stack"],
		alternatives: ["measure"],
		approved: "2026-09-06",
		source: "DesignTool/library",
	},

	{
		name: "wide-table", title: "Wide table", columns: 1,
		intro: "More columns than the measure holds — the wrapper scrolls, the page does not.",
		when: "Reference data with six or more columns. A table is authored, not wrapped: it has a width below which it stops being readable.",
		note: "**One box scrolls sideways so the document never has to.** `overflow-x: auto` on a wrapper is the affordance that admits it.\n\nThe block also claims `wide` on a standard page — a six-column table squeezed into the 52em prose measure is the single most common “displays awkwardly” bug on this site.\n\n⚠ **`dead-space` misreads this one, and the entry keeps it to show why.** The rule spans the text blocks over 20 characters, and in a table only one column has any — so it reports 13% of a 1920px viewport used while the table fills the width.",
		see: "The don't: [Table with no scroller](" + LIB + "bad/table-with-no-scroller/).",
		room: "page",
		word: { label: "overflow-x: auto", href: "/framework/styles/elements/table/" },
		config: 'div().style("overflow-x", "auto", () => ui.table(head, rows).style("min-width", "44em"))',
		decl: { display: "block", "overflow-x": "auto" },
		boxes: [{ label: "The table", note: "min-width: 44em", kind: "table", decl: { "min-width": "44em" } }],
		widths: [400, 3440],
		tags: ["docs"],
		alternatives: ["dashboard-row"],
		approved: "2026-09-06",
		source: "DesignTool/library",
	},

	{
		name: "toolbar-cluster", title: "Toolbar cluster", columns: 1,
		intro: "Controls on one line — `flex gap v-center wrap`, targets at 2.2em.",
		when: "A row of controls, and the one place raggedness is the point: a wrapped last control is better than one off the right edge.",
		note: "**A UI cluster is spaced on `gap`, never on `flow`.** Flow's rhythm resolves against each element's own font size, which is how a card title once sat 72px under its icon.\n\n`2.2em` is about 35px, comfortably over the 24px WCAG 2.2 minimum the `hit-size` rule enforces — and `wrap` is what keeps the last control on screen at 400px instead of off the right edge.",
		see: "Live in the site: [Toolbar](/framework/ui/toolbar/). The rhythm rule: [Cascade and rhythm](/framework/styles/rules/).",
		room: "page",
		word: { label: ".flex.gap.v-center.wrap", href: "/framework/framework.css" },
		config: 'div.c("flex gap v-center wrap", () => { span("Filter"); …buttons })',
		decl: { display: "flex", "flex-wrap": "wrap", "align-items": "center", gap, padding: "var(--pad)", border: "1px solid var(--line)", "border-radius": "6px" },
		boxes: [{ label: "Controls", kind: "controls" }],
		widths: [400, 3440],
		wraps: true,
		tags: ["dashboard"],
		alternatives: ["stat-strip"],
		approved: "2026-09-06",
		source: "DesignTool/library",
	},

	{
		name: "rows", title: "Rows", columns: 1,
		intro: "One column, split down the OTHER axis: a header and a footer take their content height and the body takes everything left. This is a split — a fixed area divided into pieces — even though there is only one column.",
		when: "Any screen that must fill its room exactly once: an app shell, a panel, a takeover. The body is the only piece allowed to scroll.",
		room: "solo",
		word: { label: ".page.full.fill.flex.v", href: "/framework/styles/layouts/shell/" },
		config: 'new Page({ width: "full", content(){ div.c("page full fill flex v", () => { … }); } })',
		decl: { display: "grid", "grid-template-rows": "auto minmax(0, 1fr) auto", height: "16em", overflow: "hidden", gap },
		boxes: [
			{ label: "Header", note: "auto — its content", kind: "bare", decl: { "max-height": "3.5em", overflow: "hidden" } },
			{ label: "Body", note: "1fr — the leftover", kind: "prose", decl: { "overflow-y": "auto", "min-height": "0" } },
			{ label: "Footer", note: "auto again", kind: "bare", decl: { "max-height": "3.5em", overflow: "hidden" } },
		],
		widths: [400, 3440],
		grows: false, overflow: "scroll",
		tags: ["single-column"],
		variations: ["shell"],
		alternatives: ["stack"],
		approved: "2026-09-06",
		source: "imagine/layouts",
	},

	{
		name: "sections", title: "Scroll sections", columns: 1,
		intro: "One column, divided into pieces that are each about a screen tall, with the scroll snapping from one to the next. The area is the viewport and the pieces are as many as you like.",
		when: "A story you walk through in order — a landing page, a tour, a deck. Never for reference material, where a reader wants to land mid-page.",
		room: "solo",
		word: { label: "scroll-snap-type", href: "/framework/styles/layouts/carousel/" },
		config: 'div.c("flex v").style({ height: "100dvh", overflow: "auto", scrollSnapType: "y proximity" }, …)',
		decl: { display: "block", height: "16em", overflow: "auto", "scroll-snap-type": "y proximity" },
		boxes: [
			{ label: "Section 1", note: "scroll-snap-align: start", kind: "prose", decl: { height: "12em", overflow: "hidden", "scroll-snap-align": "start", "margin-bottom": gap } },
			{ label: "Section 2", note: "the scroll stops here", kind: "prose", decl: { height: "12em", overflow: "hidden", "scroll-snap-align": "start", "margin-bottom": gap } },
			{ label: "Section 3", note: "and here", kind: "prose", decl: { height: "12em", overflow: "hidden", "scroll-snap-align": "start" } },
		],
		widths: [400, 3440],
		grows: false, overflow: "scroll",
		tags: ["single-column", "landing"],
		alternatives: ["stack", "rows"],
		approved: "2026-09-06",
		source: "imagine/layouts",
	},

	/* ══ TWO COLUMNS ═══════════════════════════════════════════════════════════
	   One decision: how the room is shared. Below the floor every one of these is
	   its `fallback`, which is the thing being judged there. */

	{
		name: "equal", title: "Equal", columns: 2,
		intro: "Two tracks, 50 / 50. Neither piece is the main one, which is exactly what a comparison wants and exactly what a page with a subject does not.",
		when: "Two things of the same kind side by side — before and after, code and result, two options.",
		room: "page",
		word: { label: ".cols.half", href: COLS },
		config: 'div.c("cols half gap", () => { div("Left"); div("Right"); })',
		decl: { display: "flex", "flex-wrap": "wrap", gap },
		boxes: [
			{ label: "Left", note: "50%", kind: "prose", decl: { flex: "1 1 max(calc(50% - " + gap + "), calc((34rem - 100%) * 999))", "min-width": "0" } },
			{ label: "Right", note: "50%", kind: "prose", decl: { flex: "1 1 max(calc(50% - " + gap + "), calc((34rem - 100%) * 999))", "min-width": "0" } },
		],
		widths: [700, 3440], fallback: "stack",
		wraps: true,
		tags: ["split-view"],
		variations: ["golden", "fr", "main-aside"],
		alternatives: ["thirds"],
		approved: "2026-09-06",
		source: "imagine/layouts",
	},

	{
		name: "golden", title: "Golden", columns: 2,
		intro: "Two tracks at 61.8 / 38.2 — the one ratio that reads as composed rather than measured. The wide piece holds the subject; the narrow one holds what sits beside it.",
		when: "A page with a clear main thing and a real second thing — an article with a wide sidebar, a picture with its story.",
		room: "page",
		word: { label: ".cols-row.cols-golden", href: COLS },
		config: 'div.c("cols-row cols-golden", () => { div("Main"); div("Aside"); })',
		decl: { display: "grid", "grid-template-columns": "minmax(0, 61.8fr) minmax(0, 38.2fr)", gap },
		boxes: [
			{ label: "Main", note: "61.8", kind: "prose" },
			{ label: "Aside", note: "38.2", kind: "list" },
		],
		widths: [700, 3440], fallback: "stack",
		tags: ["split-view"],
		variations: ["equal", "main-aside", "fr"],
		alternatives: ["rail-and-content"],
		approved: "2026-09-06",
		source: "imagine/layouts",
	},

	{
		name: "main-aside", title: "Main + aside", columns: 2,
		intro: "68 / 32, with the aside CAPPED at 26rem. A share is right for a stage or a wall; a list does not scale, and 32% of 3440 is 1100px of a 400px list.",
		when: "The commonest two-column page there is: content, and a rail of links or metadata beside it.",
		room: "page",
		word: { label: ".cols.main-aside", href: COLS },
		config: 'div.c("cols main-aside gap", () => { div("Main"); div("Aside"); })',
		decl: { display: "grid", "grid-template-columns": "minmax(0, 1fr) minmax(0, min(32%, 26rem))", gap },
		boxes: [
			{ label: "Main", note: "the leftover", kind: "prose" },
			{ label: "Aside", note: "32%, capped", kind: "list" },
		],
		widths: [700, 3440], fallback: "stack",
		tags: ["rail-and-content", "split-view"],
		variations: ["golden", "equal", "fixed-fluid"],
		alternatives: ["rail-main-aside"],
		approved: "2026-09-06",
		source: "imagine/layouts",
	},

	{
		name: "fixed-fluid", title: "Fixed + fluid", columns: 2,
		intro: "One track is a measurement and the other takes everything left. The fixed track never moves when the area does, which is what makes it a place a reader can learn.",
		when: "A navigation rail beside a body. The rail is `em` on purpose — it holds type, and type on this site scales with the viewport.",
		room: "rail",
		word: { label: ".basis + .flex-1", href: "/framework/styles/layouts/sidebar/" },
		config: 'div.c("flex gap", () => { div.c("basis"); div.c("flex-1"); })',
		decl: { display: "grid", "grid-template-columns": "clamp(8em, 20%, 16em) minmax(0, 1fr)", gap },
		boxes: [
			{ label: "Rail", note: "8–16em, fixed", kind: "list" },
			{ label: "Body", note: "1fr", kind: "prose" },
		],
		widths: [700, 3440], fallback: "stack",
		tags: ["rail-and-content"],
		variations: ["main-aside", "rail-and-content"],
		alternatives: ["rail-main-aside"],
		approved: "2026-09-06",
		source: "imagine/layouts",
	},

	{
		name: "fr", title: "fr tracks", columns: 2,
		intro: "Two grid tracks at 2fr and 1fr. `fr` divides the LEFTOVER, so the gap comes off first and the ratio is exact at every width — which is the difference from two flex children with a shared basis.",
		when: "Whenever you want a named ratio and nothing needs to wrap. Grid does not wrap; if it must, the answer is flex.",
		room: "page",
		word: { label: ".cols-row.cols-two-one", href: COLS },
		config: 'div.c("cols-row cols-two-one", () => { div("2fr"); div("1fr"); })',
		decl: { display: "grid", "grid-template-columns": "minmax(0, 2fr) minmax(0, 1fr)", gap },
		boxes: [
			{ label: "2fr", note: "two shares", kind: "prose" },
			{ label: "1fr", note: "one share", kind: "list" },
		],
		widths: [700, 3440], fallback: "stack",
		tags: ["split-view"],
		variations: ["equal", "golden", "main-aside"],
		alternatives: ["thirds"],
		approved: "2026-09-06",
		source: "imagine/layouts",
	},

	{
		name: "rail-and-content", title: "Rail and content", columns: 2,
		intro: "A fixed-width nav beside an article that takes the slack.",
		when: "Any documentation page without a table of contents. It is the near-universal shell — and the one that wraps to a stack on a phone with no media query.",
		note: "**A rail is the fixed half of a row.** `basis`, never `flex-1` — as `flex-1` the nav splits the slack with the article and ends up wider than the reading.\n\n`align-self: flex-start` is what gives a sticky rail something to stick to; stretched, it has no spare height to scroll within. `flex-wrap: wrap` and a `24em` basis on the body are the whole responsive story: below about 40em the rail drops above the article, with no media query.\n\n⚠ **The body still needs its own measure.** Written without the inner track this ran 160 characters a line at 1920 and 261 at 3440 — `flex: 1` means *take the slack*, and prose is the one thing that must not. Bounded, the pair then uses **18% of a 3440 screen** and `dead-space` says so; the site's answer to that is a **third** region, which is what the Docs layout is.",
		see: "Three regions instead of two: [Docs](/framework/styles/layouts/docs/). The don't: [Rail that never wraps](" + LIB + "bad/rail-that-never-wraps/).",
		room: "rail",
		word: { label: ".basis + .flex-1, wrapping", href: "/framework/framework.css" },
		config: 'div.c("flex gap wrap", () => { div.c("basis").style("--basis","15em"); div.c("flex-1"); })',
		decl: { display: "flex", "flex-wrap": "wrap", gap },
		boxes: [
			{ label: "On this page", kind: "list", decl: { flex: "0 0 15em", "min-width": "0", "align-self": "flex-start" } },
			{ label: "The article", kind: "prose", repeat: 3, decl: { flex: "1 1 24em", "min-width": "0", "max-width": "min(34em, 100%)" } },
		],
		widths: [700, 3440], fallback: "stack",
		wraps: true,
		tags: ["rail-and-content", "docs"],
		variations: ["fixed-fluid", "main-aside"],
		alternatives: ["rail-main-aside", "reading-grid"],
		approved: "2026-09-06",
		source: "DesignTool/library",
	},

	{
		name: "list-and-detail", title: "List and detail", columns: 2,
		intro: "Two panes, each with its own scrollbar — the inbox shape.",
		when: "A set you pick from and one thing you read, both on screen at once: mail, a file browser, a queue.",
		note: "**`overflow-y: auto` on all three boxes, not on one.** Side by side each pane is stretched to the row and scrolls itself; wrapped, the panes go content-tall and the **row** scrolls them. Declaring it once, on the panes only, is how a split silently stops scrolling on a phone.\n\n`min-width: 0` on both panes, because a flex item's automatic minimum is its content and one long subject line would push the other pane out of the box. A two-track grid does the same job above 600px and cannot wrap below it — measured, the first track collapsed to 62px at 400 and the detail prose laddered at 9.6 characters a line.",
		see: "Live in the site: [Mail](/framework/styles/layouts/mail/), [List · detail](/framework/styles/layouts/split/). The don't: [Scroller in a wrapping row](" + LIB + "bad/scroller-in-a-wrapping-row/).",
		room: "stage",
		word: { label: ".flex.gap.wrap + two scrollers", href: "/framework/styles/layouts/split/" },
		config: 'div.c("flex gap wrap").style({ height: "22em", overflowY: "auto" }, () => { …list; …detail })',
		decl: { display: "flex", "flex-wrap": "wrap", gap, height: "22em", "min-height": "0", "overflow-y": "auto" },
		boxes: [
			{ label: "The list", kind: "list", decl: { flex: "0 0 18em", "min-width": "0", "overflow-y": "auto", border: "1px solid var(--line)", "border-radius": "6px" } },
			{ label: "The message", kind: "prose", repeat: 2, decl: { flex: "1 1 24em", "min-width": "0", "overflow-y": "auto", border: "1px solid var(--line)", "border-radius": "6px" } },
		],
		widths: [700, 3440], fallback: "stack",
		grows: false, overflow: "scroll", wraps: true,
		tags: ["split-view"],
		variations: ["fixed-fluid"],
		alternatives: ["scroll"],
		approved: "2026-09-06",
		source: "DesignTool/library",
	},

	/* ══ THREE COLUMNS ═════════════════════════════════════════════════════════
	   Where a layout starts having a middle. */

	{
		name: "thirds", title: "Thirds", columns: 3,
		intro: "Three peers, 1 : 1 : 1, with a higher floor than a two-column row — thirds of 544px are 170px each. Below 52rem it is a stack, never a 2 + 1 orphan.",
		when: "Three things of the same kind: three tiers, three steps, three panels of one dashboard.",
		room: "page",
		word: { label: ".cols-row.cols-thirds", href: COLS },
		config: 'div.c("cols-row cols-thirds", () => { div("One"); div("Two"); div("Three"); })',
		decl: { display: "grid", "grid-template-columns": "repeat(3, minmax(0, 1fr))", gap },
		boxes: [
			{ label: "One", kind: "prose" },
			{ label: "Two", kind: "prose" },
			{ label: "Three", kind: "prose" },
		],
		widths: [1000, 3440], fallback: "stack",
		tags: ["single-column"],
		variations: ["quarters", "equal"],
		alternatives: ["tile-wall"],
		approved: "2026-09-06",
		source: "imagine/layouts",
	},

	{
		name: "rail-main-aside", title: "Rail + main + aside", columns: 3,
		intro: "A fixed rail, then 70 / 30 of what is left, with the aside capped at 22rem. Three tracks that a two-column vocabulary genuinely cannot say.",
		when: "A documentation site: navigation, the article, its table of contents. The shape core's own docs pages wear.",
		room: "rail",
		word: { label: ".cols-row.cols-rail-main-aside", href: COLS },
		config: 'div.c("cols-row cols-rail-main-aside", () => { … })',
		decl: { display: "grid", "grid-template-columns": "clamp(8em, 16%, 16em) minmax(0, 1fr) minmax(0, min(24%, 22rem))", gap },
		boxes: [
			{ label: "Rail", note: "fixed, em", kind: "list" },
			{ label: "Article", note: "70 of the rest", kind: "prose", repeat: 2 },
			{ label: "Contents", note: "30, capped", kind: "list" },
		],
		widths: [1000, 3440], fallback: "stack",
		tags: ["docs-three-region", "rail-and-content", "toc-rail", "docs"],
		variations: ["rail-and-content", "shell"],
		alternatives: ["scroll"],
		approved: "2026-09-06",
		source: "imagine/layouts",
	},

	{
		name: "card", title: "The card", columns: 3,
		intro: "The technique this whole catalogue is drawn with: a narrow intro, a wide live stage, a narrow readout column. The middle piece is the subject and the two outside it are about it.",
		when: "Any time you are SHOWING something and talking about it at once — a demo, a specimen, a measured result. It works at 3440 and at any height.",
		room: "stage",
		word: { label: ".layouts-card", href: "/imagine/layouts/" },
		config: "new Entry({ entry }).render()   // this realm's own card class",
		decl: { display: "grid", "grid-template-columns": "minmax(0, 17%) minmax(0, 1fr) minmax(0, 23%)", gap },
		boxes: [
			{ label: "Intro", note: "title, two sentences, the controls", kind: "prose" },
			{ label: "Stage", note: "the thing itself, live", kind: "media" },
			{ label: "Readouts", note: "numbers, config, feedback", kind: "list" },
		],
		widths: [1000, 3440], fallback: "stack",
		tags: ["docs-three-region", "docs"],
		variations: ["rail-main-aside"],
		alternatives: ["golden"],
		approved: "2026-09-06",
		source: "imagine/layouts",
	},

	{
		name: "dashboard-row", title: "Dashboard row", columns: 3,
		intro: "A full-row item whose INSIDE is gridded — identity, detail, figures.",
		when: "A feed of records that must stay rows: a file list, a run log, a leaderboard. Three named places beat one concatenated line.",
		note: "**Keep the row, give its inside places.** A feed item that stays a row at 3440 turns its extra width into a 3000px line of crammed text unless the row itself has columns.\n\n⚠ **The inside has to be able to stack too.** As a fixed three-track grid this laddered at 400: the detail column was crushed to 16px and reported 2.4 characters a line. `flex-wrap` with a `20em` basis on the detail is the same three places above ~34em and one column below it, with no breakpoint written down.",
		see: "Live in the site: [Feed](/framework/styles/layouts/feed/), [Dashboard](/framework/styles/layouts/dashboard/). The don't: [Stacked forever](" + LIB + "bad/stacked-forever/).",
		room: "page",
		word: { label: ".flex.gap.wrap, three basis", href: "/framework/styles/layouts/feed/" },
		config: 'div.c("flex gap wrap").style("align-items","baseline", () => { …identity; …detail; …figures })',
		decl: { display: "flex", "flex-wrap": "wrap", "align-items": "baseline", gap, "padding-block": "0.7em", "padding-inline": "clamp(1em, 3.5%, 3.5em)", border: "1px solid var(--line)", "border-radius": "6px" },
		boxes: [
			{ label: "Identity", kind: "bare", decl: { flex: "0 0 12em", "min-width": "0" } },
			{ label: "Detail", kind: "prose", decl: { flex: "1 1 20em", "min-width": "0" } },
			{ label: "Figures", kind: "bare", decl: { flex: "0 1 auto", "min-width": "0", "margin-inline-start": "auto", "font-variant-numeric": "tabular-nums" } },
		],
		widths: [1000, 3440], fallback: "stack",
		wraps: true,
		tags: ["dashboard"],
		alternatives: ["wide-table", "stat-strip"],
		approved: "2026-09-06",
		source: "DesignTool/library",
	},

	{
		name: "rows-in-columns", title: "Rows in columns", columns: 3,
		intro: "Three columns where the third is split again, into two rows. A split can hold a split — the pieces of an area are areas.",
		when: "When one column carries two unrelated things of different weight: a preview above its properties, a chart above its legend.",
		room: "stage",
		word: { label: "a grid inside a grid track", href: "/framework/styles/layouts/dashboard/" },
		config: 'div.c("grid gap").style("grid-template-columns","1fr 1.6fr 1fr", () => { …; div.c("grid gap"); })',
		decl: { display: "grid", "grid-template-columns": "minmax(0, 1fr) minmax(0, 1.6fr) minmax(0, 1fr)", height: "15em", overflow: "hidden", gap },
		boxes: [
			{ label: "Left", kind: "prose", decl: { "overflow-y": "auto", "min-height": "0" } },
			{ label: "Centre", kind: "prose", decl: { "overflow-y": "auto", "min-height": "0" } },
			{
				label: "Right", kind: "bare",
				decl: { display: "grid", "grid-template-rows": "minmax(0, 1fr) minmax(0, 1fr)", gap },
				kids: [
					{ label: "Top row", kind: "prose", decl: { "overflow-y": "auto", "min-height": "0" } },
					{ label: "Bottom row", kind: "prose", decl: { "overflow-y": "auto", "min-height": "0" } },
				],
			},
		],
		widths: [1000, 3440], fallback: "stack",
		grows: false, overflow: "scroll",
		tags: ["dashboard"],
		variations: ["quad"],
		alternatives: ["thirds"],
		approved: "2026-09-06",
		source: "imagine/layouts",
	},

	{
		name: "scroll", title: "Scrolling centre", columns: 3,
		intro: "Three columns where only the middle one scrolls, in snapping sections, while the two rails stay exactly where they are. The area is fixed; what moves inside one piece of it is that piece's business.",
		when: "A reader who must keep their bearings while walking a long thing — a mail app, a spec beside its examples, a deck with notes.",
		room: "stage",
		word: { label: "overflow + scroll-snap on ONE track", href: "/framework/styles/layouts/mail/" },
		config: 'div.c("grid gap").style({ gridTemplateColumns: "12em 1fr 12em", height: "100dvh" }, …)',
		decl: { display: "grid", "grid-template-columns": "clamp(6em, 18%, 12em) minmax(0, 1fr) clamp(6em, 18%, 12em)", height: "16em", overflow: "hidden", gap },
		boxes: [
			{ label: "Rail", note: "does not move", kind: "list", decl: { overflow: "hidden", "min-height": "0" } },
			{
				label: "Sections", kind: "bare",
				decl: { display: "block", overflow: "auto", "min-height": "0", "scroll-snap-type": "y proximity" },
				kids: [
					{ label: "1 of 3", kind: "prose", decl: { height: "10em", overflow: "hidden", "scroll-snap-align": "start", "margin-bottom": gap } },
					{ label: "2 of 3", kind: "prose", decl: { height: "10em", overflow: "hidden", "scroll-snap-align": "start", "margin-bottom": gap } },
					{ label: "3 of 3", kind: "prose", decl: { height: "10em", overflow: "hidden", "scroll-snap-align": "start" } },
				],
			},
			{ label: "Rail", note: "nor does this", kind: "list", decl: { overflow: "hidden", "min-height": "0" } },
		],
		widths: [1000, 3440], fallback: "stack",
		grows: false, overflow: "scroll",
		tags: ["docs-three-region", "split-view"],
		variations: ["rail-main-aside"],
		alternatives: ["list-and-detail"],
		approved: "2026-09-06",
		source: "imagine/layouts",
	},

	/* ══ FOUR OR MORE ══════════════════════════════════════════════════════════
	   Past three columns the honest question is whether the count is fixed at all.
	   The walls answer no: they name a column WIDTH and let the room decide. */

	{
		name: "tile-wall", title: "Tile wall", columns: 4,
		intro: "Cards that reflow on their own from phone to mega — `grid auto gap`.",
		when: "A region of same-shaped children: an index, a dashboard, a gallery. The one arrangement that needs no breakpoint.",
		note: "**One `--column` and the browser does the rest.** No media query, no breakpoint list: the track count is a consequence of the width. Here `1fr` as the maximum is correct — a card stretching to fill its track is fine, and it is what keeps the last row flush.\n\n`min(14em, 100%)` is the load-bearing half: without it a 14em floor overflows a 320px phone.\n\n⚠ `auto-fill`, never `auto-fit`: measured 2026-08-17, `auto-fit` made two cards 1,623px each at 3440.",
		see: "This is the wall every preview list draws. Prose needs the other shape — [Reading grid](" + LIB + "reading-grid/). The don't: [Fixed-track wall](" + LIB + "bad/fixed-track-wall/).",
		room: "wall",
		word: { label: ".grid.auto.gap", href: WORDS },
		config: 'div.c("grid auto gap").style("--column", "14em", () => items.forEach(card))',
		decl: { display: "grid", "grid-template-columns": "repeat(auto-fill, minmax(min(14em, 100%), 1fr))", gap },
		boxes: [{ label: "Card", kind: "tiles", repeat: 8 }],
		widths: [400, 3440],
		wraps: true,
		tags: ["preview-wall", "gallery"],
		variations: ["media-gallery", "stat-strip", "masonry"],
		alternatives: ["thirds", "quarters"],
		approved: "2026-09-06",
		source: "DesignTool/library",
	},

	{
		name: "wall", title: "Wall", columns: 4,
		intro: "Not a split at all: a wall names a COLUMN WIDTH and lets the room decide how many fit. Four tracks at 3440, one at 400, and never a squeezed pair.",
		when: "A region of same-shaped children — an index, a gallery, a dashboard of tiles. The one arrangement that scales without a single breakpoint.",
		room: "wall",
		word: { label: ".wall / .grid.auto", href: WORDS },
		config: 'div.c("wall").style("--column", "18em", () => items.forEach(card))',
		decl: { display: "grid", "grid-template-columns": "repeat(auto-fill, minmax(min(var(--column, 18em), 100%), 1fr))", gap },
		boxes: [{ label: "Tile", kind: "tiles", repeat: 6 }],
		widths: [400, 3440],
		wraps: true,
		tags: ["preview-wall", "gallery"],
		variations: ["tile-wall", "media-gallery"],
		alternatives: ["quarters"],
		approved: "2026-09-06",
		source: "imagine/layouts",
	},

	{
		name: "media-gallery", title: "Media gallery", columns: 4,
		intro: "Tiles of one shape — `aspect-ratio` on the tile, not a height.",
		when: "Pictures. A gallery's job is one silhouette repeated, and a chosen height clips on the first tile whose content grows.",
		note: "**A gallery's job is one silhouette repeated.** `aspect-ratio` on the tile gives every cell the same shape at every track width, which is what stops `ragged-row` — tallest ÷ shortest in one row — from firing when one caption wraps to two lines.\n\nA chosen `height` would do it too, and would clip on the first tile whose content grew. The ratio scales; the pixel does not.",
		see: "Same grid, free-height cards: [Tile wall](" + LIB + "tile-wall/). Live in the site: [Gallery](/framework/styles/layouts/gallery/).",
		room: "wall",
		word: { label: ".grid.auto + aspect-ratio", href: "/framework/styles/layouts/gallery/" },
		config: 'div.c("grid auto gap").style("--column", "12em", () => plates.forEach(tile))',
		decl: { display: "grid", "grid-template-columns": "repeat(auto-fill, minmax(min(12em, 100%), 1fr))", gap },
		boxes: [{ label: "Plate", kind: "media", repeat: 8 }],
		widths: [400, 3440],
		wraps: true,
		tags: ["gallery", "preview-wall"],
		variations: ["tile-wall", "masonry"],
		alternatives: ["wall"],
		approved: "2026-09-06",
		source: "DesignTool/library",
	},

	{
		name: "masonry", title: "Masonry", columns: 4,
		intro: "A ragged wall with no gaps — CSS columns, three words of CSS and no JavaScript, correct at every width on its own.",
		when: "A wall nobody reads in order. ⚠ It flows **top-to-bottom within each column**, so the second note sits *below* the first rather than beside it, and the whole sequence reshuffles every time the column count changes. Wrong for anything ranked, dated or alphabetical — that one is [Packed](/framework/styles/layouts/masonry/packed/).",
		room: "wall",
		word: { label: ".masonry", href: "/framework/styles/layouts/masonry/" },
		config: 'div.c("masonry").style("--column", "15em", () => notes.forEach(card))',
		decl: { columns: "15em", gap },
		boxes: [{ label: "Note", kind: "tiles", repeat: 10, ragged: true, decl: { "break-inside": "avoid", "margin-block-end": gap } }],
		widths: [400, 3440],
		wraps: true,
		tags: ["gallery", "preview-wall", "notes"],
		variations: ["tile-wall", "media-gallery"],
		alternatives: ["wall"],
		approved: "2026-09-06",
		source: "styles/layouts",
	},

	{
		name: "stat-strip", title: "Stat strip", columns: 4,
		intro: "A row of figures — narrow tracks, tabular numerals, value before label.",
		when: "A header of numbers over a dashboard. A figure needs about nine ems, so a strip of them wraps to two rows on a phone and stays one row from a laptop up.",
		note: "**The same auto grid at a quarter of the column.** `tabular-nums` is the only type rule here: numbers meant to be compared have to share a column width, or the eye reads the digits as ragged.\n\n⚠ **At 400 this scores B, and the finding is the tool's.** Six `alignment` near-misses, all of them 11.2px — which is this tile's own `0.8em` padding. A padded box's children always sit one padding off their parent's lane, and the rule's 3–12px window is exactly the site's padding scale.",
		see: "Wider items belong in a [Dashboard row](" + LIB + "dashboard-row/).",
		room: "wall",
		word: { label: ".grid.auto, --column: 9em", href: "/framework/styles/layouts/dashboard/" },
		config: 'div.c("grid auto gap").style("--column", "9em", () => stats.forEach(metric))',
		decl: { display: "grid", "grid-template-columns": "repeat(auto-fill, minmax(min(9em, 100%), 1fr))", gap },
		boxes: [{ label: "Metric", kind: "tiles", repeat: 6 }],
		widths: [400, 3440],
		wraps: true,
		tags: ["dashboard"],
		variations: ["tile-wall"],
		alternatives: ["toolbar-cluster", "quarters"],
		approved: "2026-09-06",
		source: "DesignTool/library",
	},

	{
		name: "reading-grid", title: "Reading grid", columns: 4,
		intro: "Prose that uses a widescreen — tracks bounded at both ends.",
		when: "Long copy on a big screen, when one 27%-wide column is the honest complaint and a wider column is the wrong fix.",
		note: "**A reading track needs a ceiling as well as a floor.** `.grid.auto` is `minmax(min(--column, 100%), 1fr)`, and `1fr` is unbounded: the moment the container fits only one column, that column takes the whole width. `38em` as the maximum is what keeps the single-column case readable.\n\n`auto-fill`, not `auto-fit`: two articles must not become two enormous ones.",
		see: "The unbounded version, measured: [Prose with no ceiling](" + LIB + "bad/prose-with-no-ceiling/). Tiles want the opposite — [Tile wall](" + LIB + "tile-wall/).",
		room: "wall",
		word: { label: "auto-fill, minmax(min(34em,100%), 38em)", href: "/framework/framework.css" },
		config: 'div().style({ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(34em, 100%), 38em))" }, …)',
		decl: { display: "grid", "grid-template-columns": "repeat(auto-fill, minmax(min(34em, 100%), 38em))", gap },
		boxes: [{ label: "Column", kind: "prose", repeat: 4 }],
		widths: [400, 3440],
		wraps: true,
		tags: ["docs", "single-column"],
		variations: ["tile-wall"],
		alternatives: ["reading-column", "measure"],
		approved: "2026-09-06",
		source: "DesignTool/library",
	},

	{
		name: "quarters", title: "Quarters", columns: 4,
		intro: "Four equal tracks. Past three peers the row is really a wall, and the honest question becomes whether the count is fixed or whether it should follow the room.",
		when: "Exactly four things that belong together and must stay on one line — four metrics, four steps.",
		room: "page",
		word: { label: "repeat(4, minmax(0, 1fr))", href: "/framework/styles/layouts/dashboard/" },
		config: 'div.c("grid gap").style("grid-template-columns", "repeat(4, minmax(0, 1fr))", …)',
		decl: { display: "grid", "grid-template-columns": "repeat(4, minmax(0, 1fr))", gap },
		boxes: [
			{ label: "One", kind: "prose" }, { label: "Two", kind: "prose" },
			{ label: "Three", kind: "prose" }, { label: "Four", kind: "prose" },
		],
		widths: [1400, 3440], fallback: "stack",
		tags: ["dashboard"],
		variations: ["thirds"],
		alternatives: ["tile-wall", "stat-strip"],
		approved: "2026-09-06",
		source: "imagine/layouts",
	},

	{
		name: "quad", title: "Quad (2 x 2)", columns: 4,
		intro: "Two columns, each split into two rows — four pieces from two splits rather than one. The rows can be different heights, which four equal tracks can never be.",
		when: "Four panels that pair up: two comparisons, or a chart with its controls above two readouts.",
		room: "stage",
		word: { label: "a grid inside each track", href: "/framework/styles/layouts/wire/" },
		config: 'div.c("cols half gap", () => { div.c("grid gap"); div.c("grid gap"); })',
		decl: { display: "grid", "grid-template-columns": "minmax(0, 1fr) minmax(0, 1fr)", height: "15em", overflow: "hidden", gap },
		boxes: [
			{
				label: "Left column", kind: "bare",
				decl: { display: "grid", "grid-template-rows": "1.4fr 1fr", "min-height": "0", gap },
				kids: [
					{ label: "A", note: "1.4fr", kind: "prose", decl: { "overflow-y": "auto", "min-height": "0" } },
					{ label: "B", note: "1fr", kind: "prose", decl: { "overflow-y": "auto", "min-height": "0" } },
				],
			},
			{
				label: "Right column", kind: "bare",
				decl: { display: "grid", "grid-template-rows": "1fr 1.4fr", "min-height": "0", gap },
				kids: [
					{ label: "C", note: "1fr", kind: "prose", decl: { "overflow-y": "auto", "min-height": "0" } },
					{ label: "D", note: "1.4fr", kind: "prose", decl: { "overflow-y": "auto", "min-height": "0" } },
				],
			},
		],
		widths: [1400, 3440], fallback: "stack",
		grows: false, overflow: "scroll",
		tags: ["dashboard", "split-view"],
		variations: ["rows-in-columns", "quarters"],
		alternatives: ["thirds"],
		approved: "2026-09-06",
		source: "imagine/layouts",
	},

	{
		name: "shell", title: "Shell", columns: 4,
		intro: "Four regions rather than four columns: a rail, a body, an aside, and a bar under all three. The row is split first, then the whole thing is split again down the block axis.",
		when: "A real application screen. It is `rows` and `rail-main-aside` composed, which is why neither of them needed a fifth word.",
		room: "solo",
		word: { label: "styles/layouts/shell", href: "/framework/styles/layouts/shell/" },
		config: 'new Page({ width: "full", content(){ div.c("page full fill flex v", () => { … }); } })',
		decl: { display: "grid", "grid-template-rows": "minmax(0, 1fr) auto", height: "16em", overflow: "hidden", gap },
		boxes: [
			{
				label: "The row", kind: "bare",
				decl: { display: "grid", "grid-template-columns": "clamp(6em, 18%, 12em) minmax(0, 1fr) clamp(6em, 20%, 14em)", "min-height": "0", gap },
				kids: [
					{ label: "Rail", kind: "list", decl: { "overflow-y": "auto", "min-height": "0" } },
					{ label: "Body", kind: "prose", repeat: 2, decl: { "overflow-y": "auto", "min-height": "0" } },
					{ label: "Aside", kind: "list", decl: { "overflow-y": "auto", "min-height": "0" } },
				],
			},
			{ label: "Status bar", note: "auto", kind: "bare", decl: { "max-height": "3.5em", overflow: "hidden" } },
		],
		widths: [1400, 3440], fallback: "rows",
		grows: false, overflow: "scroll",
		tags: ["holy-grail", "docs-three-region"],
		variations: ["rail-main-aside", "rows"],
		alternatives: ["scroll"],
		approved: "2026-09-06",
		source: "imagine/layouts",
	},
];

/* ── THE BANDS ─────────────────────────────────────────────────────────────────
   Declared, in the owner's order — one column first, and rows-only before the two
   shapes that split the column itself. Never derived from `columns`: the order
   inside a band is "simplest and most useful first", which no sort expresses. */
export const BANDS = {
	"One column":   "stack measure reading-column section-band wide-table toolbar-cluster rows sections",
	"Two columns":  "equal golden main-aside fixed-fluid fr rail-and-content list-and-detail",
	"Three columns": "thirds rail-main-aside card dashboard-row rows-in-columns scroll",
	"Four or more": "tile-wall wall media-gallery masonry stat-strip reading-grid quarters quad shell",
};

/* The seven widths every layout is previewed and proven at (deliverable 16). */
export const STRIP = [400, 700, 1000, 1400, 2000, 2800, 3440];

export const by_name = name => LAYOUTS.find(entry => entry.name === name);

export default LAYOUTS;
