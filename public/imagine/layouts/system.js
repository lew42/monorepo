/* ── THE CATALOGUE ─────────────────────────────────────────────────────────────
   Every layout in this realm is DATA, and the data is the CSS. An entry's `rules`
   object is applied to the live box AND printed in the readout column, so the code
   a reader sees is the code that ran — there is only one copy of it.

   Imports nothing (the vocabulary file pattern `imagine/paging/words.js` uses), so a
   page, a card, a full-screen route and a doc can all read the same list and never
   disagree.

   THE NUMBERING. `n` is how many columns the layout has at its widest — 1, 2, 3, or
   4 for "four or more". `id` is the word after the dot, and the two together are the
   name a reader says out loud: `2.golden`. The url is the same two parts:
   /imagine/layouts/2/golden/.

   WHAT AN ENTRY HOLDS

     id · n · title       the name, split in two
     intro                two sentences: what it divides, and what goes in each piece
     when                 one sentence: when this is the right answer
     rules                the declarations that ARE the layout, applied and printed
     boxes                the tracks; a box with `kids` is a column split into rows
     word                 the framework word this compiles to, and where it lives
     config               the one line of config that makes a page from it
     split                false for a STACK (no area is divided), true for a SPLIT   */

/* Apply an entry's declarations to a live element. `setProperty` rather than
   `el.style[prop]`, so a custom property and a kebab-case property go in by the same
   call and neither depends on the CSSOM's dashed-attribute aliases. */
export const apply = ($el, rules) => {
	for (const prop in rules) $el.el.style.setProperty(prop, rules[prop]);
	return $el;
};

// The same object, printed. One source, so the readout cannot drift from the result.
export const spell = rules => Object.entries(rules).map(([prop, value]) => prop + ": " + value + ";").join("\n");

/* ── THE FIVE SURFACES ── paging's vocabulary, and the class each one wears here. */
export const SURFACES = ["plain", "card", "tint", "prim", "dark"];

export const SURFACE_CLASS = {
	plain: "layouts-plain",
	card: "layouts-card-surface",
	tint: "layouts-tint",
	prim: "layouts-prim",
	dark: "layouts-dark",
};

export const SURFACE_MEANS = {
	plain: "no frame at all — the layout sits on whatever is under it",
	card: "a white card with a hairline and a shadow: the surface that says 'this is one thing'",
	tint: "one subtle step off the parent, for a panel that is part of the page",
	prim: "10% of the accent mixed into the surface — an island you are meant to notice",
	dark: "an always-dark island; it declares color-scheme, so every token inside flips",
};

/* ── THE THREE PADDING STEPS ── multiples of the two spacing clamps, never a
   constant. `default` writes nothing and lets framework.css answer. */
export const PADS = ["tight", "default", "airy"];

export const PAD_CLASS = { tight: "layouts-tight", default: "", airy: "layouts-airy" };

export const PAD_MEANS = {
	tight: "half the clamps — a dense control panel, a table, a rail of rows",
	default: "clamp(1em, 1.3%, 2em) padding and clamp(1em, 0.4em + 0.5vw, 1.6em) gap, the site's own",
	airy: "double the clamps — a landing band, a hero, anything with one idea in it",
};

/* ── THE SIX NAVIGATION TYPES ── each one drawn around the layout, so a reader sees
   what the navigation costs the layout under it. Every one names the real module it
   stands for. */
export const NAVS = ["none", "crumbs", "tabs", "left rail", "right rail", "bottom bar"];

export const NAV_MEANS = {
	"none": "nothing — the layout is the whole page and the way back is the browser. A chip bar like the one on the left is the fifth option: `/imagine/paging/`'s toolbar, which is navigation that changes the page in place rather than leaving it.",
	"crumbs": "a thin trail above the layout — core's own `page-crumbs`, derived from the page chain so it cannot be wrong.",
	"tabs": "a row of tabs whose active one JOINS the panel below it — `ext/tabs`. The area that swaps is drawn, which is what an underline alone never says.",
	"left rail": "a fixed column of links before the layout — `ext/layout`'s left region, or core's `.rail`.",
	"right rail": "the same column after it, for a table of contents or a properties panel — `ext/layout`'s right region.",
	"bottom bar": "a row of destinations under the layout — a phone shell's tab bar, and what `ext/drawer` collapses to on a narrow screen.",
};

/* ── THE FOUR WAYS TO DIVIDE ── the owner's own list ("%, flex-grow/basis, etc —
   fixed divisions, or..?"), answered with the four that exist. The hub's split frame
   flips between them. */
export const DIVISIONS = [
	{
		id: "%",
		title: "by percent",
		note: "Each track is a share of the area. They must add to 100, so the gap has to come out of the boxes rather than out of the row.",
		rules: { display: "grid", "grid-template-columns": "50% 30% 20%" },
	},
	{
		id: "fixed",
		title: "by fixed size",
		note: "Two tracks are a measurement and the third takes what is left. A fixed track is a PLACE, so it never moves when the area does.",
		rules: { display: "grid", "grid-template-columns": "7em 10em minmax(0, 1fr)", gap: "var(--gap, var(--gap-default))" },
	},
	{
		id: "flex",
		title: "by flex-grow / basis",
		note: "Every track starts from a basis and the leftover is split by grow. This is the only one of the four where the tracks can WRAP when the area gets small.",
		rules: { display: "flex", "flex-wrap": "wrap", gap: "var(--gap, var(--gap-default))" },
		weights: ["1 1 8em", "2 1 12em", "1 1 8em"],
	},
	{
		id: "fr",
		title: "by fr tracks",
		note: "`fr` is grid's own unit for a share of the LEFTOVER — the gaps come off first, then the fractions divide what remains. The one to reach for by default.",
		rules: { display: "grid", "grid-template-columns": "1fr 2fr 1fr", gap: "var(--gap, var(--gap-default))" },
	},
];

/* The three boxes both sides of the comparison hold. Same content, two arrangements
   — which is the whole of the demonstration. */
export const THREE = [
	{ label: "One", note: "a box" },
	{ label: "Two", note: "the same box" },
	{ label: "Three", note: "and again" },
];

export const STACK_RULES = { display: "block" };

/* ── THE ENTRIES ───────────────────────────────────────────────────────────────── */

const gap = "var(--gap, var(--gap-default))";

const cols = href => ({ label: "styles/layouts/cols", href: href ?? "/framework/styles/layouts/cols/" });

export const ENTRIES = [

	/* ══ 1.* — ONE COLUMN ══════════════════════════════════════════════════════
	   A one-column layout is where a STACK is the whole answer — until the column
	   itself is divided into rows, which is a split down the other axis. */

	{
		id: "stack", n: 1, title: "Stack",
		split: false,
		intro: "The baseline: nothing is divided at all. Boxes follow each other down the page, each one as tall as its own content.",
		when: "Reach for it whenever the page is a sequence — an article, a form, a feed. It is the default, so it costs no CSS.",
		rules: { display: "block" },
		boxes: [
			{ label: "First", note: "as tall as its content", rules: { "margin-bottom": gap } },
			{ label: "Second", note: "and so is this one", rules: { "margin-bottom": gap } },
			{ label: "Third", note: "no area was divided" },
		],
		word: { label: "no class at all", href: "/framework/styles/doc/layout-system.md" },
		config: 'new Page({ content(){ p("First"); p("Second"); p("Third"); } })',
	},

	{
		id: "measure", n: 1, title: "Measure",
		split: false,
		intro: "One column with a ceiling on it: 40em, about 80 characters, centred in whatever room it was given. The room is not the measure — the leftover stays leftover.",
		when: "Every reading page. It is the site's own default page track, and the reason a 3440 screen does not hand a paragraph a 3410px line.",
		rules: { display: "grid", "grid-template-columns": "min(var(--measure, 40em), 100%)", "justify-content": "center", gap },
		boxes: [
			{ label: "Prose", note: "capped at --measure" },
			{ label: "More prose", note: "the same cap, the same axis" },
		],
		word: { label: ".page / .measure", href: "/framework/styles/doc/layout-system.md" },
		config: 'new Page({ content(){ md("A reading page needs no class."); } })',
	},

	{
		id: "rows", n: 1, title: "Rows",
		split: true,
		intro: "One column, split down the OTHER axis: a header and a footer take their content height and the body takes everything left. This is a split — a fixed area divided into pieces — even though there is only one column.",
		when: "Any screen that must fill its room exactly once: an app shell, a panel, a takeover. The body is the only piece allowed to scroll.",
		rules: { display: "grid", "grid-template-rows": "auto minmax(0, 1fr) auto", height: "16em", gap },
		boxes: [
			{ label: "Header", note: "auto — its content" },
			{ label: "Body", note: "1fr — the leftover" },
			{ label: "Footer", note: "auto again" },
		],
		word: { label: ".page.full.fill.flex.v", href: "/framework/styles/layouts/shell/" },
		config: 'new Page({ width: "full", content(){ div.c("page full fill flex v", () => { … }); } })',
	},

	{
		id: "sections", n: 1, title: "Scroll sections",
		split: true,
		intro: "One column, divided into pieces that are each about a screen tall, with the scroll snapping from one to the next. The area is the viewport and the pieces are as many as you like.",
		when: "A story you walk through in order — a landing page, a tour, a deck. Never for reference material, where a reader wants to land mid-page.",
		rules: { display: "block", height: "16em", overflow: "auto", "scroll-snap-type": "y proximity" },
		boxes: [
			{ label: "Section 1", note: "scroll-snap-align: start", rules: { height: "12em", "scroll-snap-align": "start", "margin-bottom": gap } },
			{ label: "Section 2", note: "the scroll stops here", rules: { height: "12em", "scroll-snap-align": "start", "margin-bottom": gap } },
			{ label: "Section 3", note: "and here", rules: { height: "12em", "scroll-snap-align": "start" } },
		],
		word: { label: "scroll-snap-type", href: "/framework/styles/layouts/carousel/" },
		config: 'div.c("flex v").style({ height: "100dvh", overflow: "auto", scrollSnapType: "y proximity" }, …)',
	},

	/* ══ 2.* — TWO COLUMNS ═════════════════════════════════════════════════════
	   The distribution words `styles/layouts/cols/` already has, one entry each. */

	{
		id: "equal", n: 2, title: "Equal",
		split: true,
		intro: "Two tracks, 50 / 50. Neither piece is the main one, which is exactly what a comparison wants and exactly what a page with a subject does not.",
		when: "Two things of the same kind side by side — before and after, code and result, two options.",
		rules: { display: "flex", "flex-wrap": "wrap", gap },
		boxes: [
			{ label: "Left", note: "50%", rules: { flex: "1 1 max(calc(50% - " + gap + "), calc((34rem - 100%) * 999))" } },
			{ label: "Right", note: "50%", rules: { flex: "1 1 max(calc(50% - " + gap + "), calc((34rem - 100%) * 999))" } },
		],
		word: { label: ".cols.half", href: "/framework/styles/layouts/cols/" },
		config: 'div.c("cols half gap", () => { div("Left"); div("Right"); })',
	},

	{
		id: "golden", n: 2, title: "Golden",
		split: true,
		intro: "Two tracks at 61.8 / 38.2 — the one ratio that reads as composed rather than measured. The wide piece holds the subject; the narrow one holds what sits beside it.",
		when: "A page with a clear main thing and a real second thing — an article with a wide sidebar, a picture with its story.",
		rules: { display: "grid", "grid-template-columns": "61.8fr 38.2fr", gap },
		boxes: [
			{ label: "Main", note: "61.8" },
			{ label: "Aside", note: "38.2" },
		],
		word: { label: ".cols-row.cols-golden", href: "/framework/styles/layouts/cols/" },
		config: 'div.c("cols-row cols-golden", () => { div("Main"); div("Aside"); })',
	},

	{
		id: "main-aside", n: 2, title: "Main + aside",
		split: true,
		intro: "68 / 32, with the aside CAPPED at 26rem. A share is right for a stage or a wall; a list does not scale, and 32% of 3440 is 1100px of a 400px list.",
		when: "The commonest two-column page there is: content, and a rail of links or metadata beside it.",
		rules: { display: "grid", "grid-template-columns": "minmax(0, 1fr) minmax(0, min(32%, 26rem))", gap },
		boxes: [
			{ label: "Main", note: "the leftover" },
			{ label: "Aside", note: "32%, capped" },
		],
		word: { label: ".cols.main-aside", href: "/framework/styles/layouts/cols/" },
		config: 'div.c("cols main-aside gap", () => { div("Main"); div("Aside"); })',
	},

	{
		id: "fixed-fluid", n: 2, title: "Fixed + fluid",
		split: true,
		intro: "One track is a measurement and the other takes everything left. The fixed track never moves when the area does, which is what makes it a place a reader can learn.",
		when: "A navigation rail beside a body. The rail is `em` on purpose — it holds type, and type on this site scales with the viewport.",
		rules: { display: "grid", "grid-template-columns": "clamp(8em, 20%, 16em) minmax(0, 1fr)", gap },
		boxes: [
			{ label: "Rail", note: "8–16em, fixed" },
			{ label: "Body", note: "1fr" },
		],
		word: { label: ".basis + .flex-1", href: "/framework/styles/layouts/sidebar/" },
		config: 'div.c("flex gap", () => { div.c("basis"); div.c("flex-1"); })',
	},

	{
		id: "fr", n: 2, title: "fr tracks",
		split: true,
		intro: "Two grid tracks at 2fr and 1fr. `fr` divides the LEFTOVER, so the gap comes off first and the ratio is exact at every width — which is the difference from two flex children with a shared basis.",
		when: "Whenever you want a named ratio and nothing needs to wrap. Grid does not wrap; if it must, the answer is flex.",
		rules: { display: "grid", "grid-template-columns": "2fr 1fr", gap },
		boxes: [
			{ label: "2fr", note: "two shares" },
			{ label: "1fr", note: "one share" },
		],
		word: { label: ".cols-row.cols-two-one", href: "/framework/styles/layouts/cols/" },
		config: 'div.c("cols-row cols-two-one", () => { div("2fr"); div("1fr"); })',
	},

	/* ══ 3.* — THREE COLUMNS ═══════════════════════════════════════════════════ */

	{
		id: "thirds", n: 3, title: "Thirds",
		split: true,
		intro: "Three peers, 1 : 1 : 1, with a higher floor than a two-column row — thirds of 544px are 170px each. Below 52rem it is a stack, never a 2 + 1 orphan.",
		when: "Three things of the same kind: three tiers, three steps, three panels of one dashboard.",
		rules: { display: "grid", "grid-template-columns": "repeat(3, minmax(0, 1fr))", gap },
		boxes: [{ label: "One" }, { label: "Two" }, { label: "Three" }],
		word: { label: ".cols-row.cols-thirds", href: "/framework/styles/layouts/cols/" },
		config: 'div.c("cols-row cols-thirds", () => { div("One"); div("Two"); div("Three"); })',
	},

	{
		id: "rail-main-aside", n: 3, title: "Rail + main + aside",
		split: true,
		intro: "A fixed rail, then 70 / 30 of what is left, with the aside capped at 22rem. Three tracks that a two-column vocabulary genuinely cannot say.",
		when: "A documentation site: navigation, the article, its table of contents. The shape core's own docs pages wear.",
		rules: { display: "grid", "grid-template-columns": "clamp(8em, 16%, 16em) minmax(0, 1fr) minmax(0, min(24%, 22rem))", gap },
		boxes: [
			{ label: "Rail", note: "fixed, em" },
			{ label: "Article", note: "70 of the rest" },
			{ label: "Contents", note: "30, capped" },
		],
		word: { label: ".cols-row.cols-rail-main-aside", href: "/framework/styles/layouts/cols/" },
		config: 'div.c("cols-row cols-rail-main-aside", () => { … })',
	},

	{
		id: "card", n: 3, title: "The card",
		split: true,
		intro: "The technique this whole catalogue is drawn with: a narrow intro, a wide live stage, a narrow readout column. The middle piece is the subject and the two outside it are about it.",
		when: "Any time you are SHOWING something and talking about it at once — a demo, a specimen, a measured result. It works at 3440 and at any height.",
		rules: { display: "grid", "grid-template-columns": "minmax(0, 17%) minmax(0, 1fr) minmax(0, 23%)", gap },
		boxes: [
			{ label: "Intro", note: "title, two sentences, the controls" },
			{ label: "Stage", note: "the thing itself, live" },
			{ label: "Readouts", note: "numbers, config, feedback" },
		],
		word: { label: ".layouts-card", href: "/imagine/layouts/" },
		config: 'new Entry({ entry }).render()   // this realm\'s own card class',
	},

	{
		id: "rows-in-columns", n: 3, title: "Rows in columns",
		split: true,
		intro: "Three columns where the third is split again, into two rows. A split can hold a split — the pieces of an area are areas.",
		when: "When one column carries two unrelated things of different weight: a preview above its properties, a chart above its legend.",
		rules: { display: "grid", "grid-template-columns": "minmax(0, 1fr) minmax(0, 1.6fr) minmax(0, 1fr)", height: "15em", gap },
		boxes: [
			{ label: "Left" },
			{ label: "Centre" },
			{
				label: "Right", nest: true,
				rules: { display: "grid", "grid-template-rows": "1fr 1fr", gap },
				kids: [{ label: "Top row" }, { label: "Bottom row" }],
			},
		],
		word: { label: "a grid inside a grid track", href: "/framework/styles/layouts/dashboard/" },
		config: 'div.c("grid gap").style("grid-template-columns","1fr 1.6fr 1fr", () => { …; div.c("grid gap"); })',
	},

	{
		id: "scroll", n: 3, title: "Scrolling centre",
		split: true,
		intro: "Three columns where only the middle one scrolls, in snapping sections, while the two rails stay exactly where they are. The area is fixed; what moves inside one piece of it is that piece's business.",
		when: "A reader who must keep their bearings while walking a long thing — a mail app, a spec beside its examples, a deck with notes.",
		rules: { display: "grid", "grid-template-columns": "clamp(6em, 18%, 12em) minmax(0, 1fr) clamp(6em, 18%, 12em)", height: "16em", gap },
		boxes: [
			{ label: "Rail", note: "does not move" },
			{
				label: "Sections", nest: true, sections: true,
				rules: { display: "block", overflow: "auto", "scroll-snap-type": "y proximity" },
				kids: [
					{ label: "1 of 3", rules: { height: "10em", "scroll-snap-align": "start", "margin-bottom": gap } },
					{ label: "2 of 3", rules: { height: "10em", "scroll-snap-align": "start", "margin-bottom": gap } },
					{ label: "3 of 3", rules: { height: "10em", "scroll-snap-align": "start" } },
				],
			},
			{ label: "Rail", note: "nor does this" },
		],
		word: { label: "overflow + scroll-snap on ONE track", href: "/framework/styles/layouts/mail/" },
		config: 'div.c("grid gap").style({ gridTemplateColumns: "12em 1fr 12em", height: "100dvh" }, …)',
	},

	/* ══ 4.* — FOUR OR MORE ════════════════════════════════════════════════════ */

	{
		id: "quarters", n: 4, title: "Quarters",
		split: true,
		intro: "Four equal tracks. Past three peers the row is really a wall, and the honest question becomes whether the count is fixed or whether it should follow the room.",
		when: "Exactly four things that belong together and must stay on one line — four metrics, four steps.",
		rules: { display: "grid", "grid-template-columns": "repeat(4, minmax(0, 1fr))", gap },
		boxes: [{ label: "One" }, { label: "Two" }, { label: "Three" }, { label: "Four" }],
		word: { label: "repeat(4, minmax(0, 1fr))", href: "/framework/styles/layouts/dashboard/" },
		config: 'div.c("grid gap").style("grid-template-columns", "repeat(4, minmax(0, 1fr))", …)',
	},

	{
		id: "quad", n: 4, title: "Quad (2 x 2)",
		split: true,
		intro: "Two columns, each split into two rows — four pieces from two splits rather than one. The rows can be different heights, which four equal tracks can never be.",
		when: "Four panels that pair up: two comparisons, or a chart with its controls above two readouts.",
		rules: { display: "grid", "grid-template-columns": "minmax(0, 1fr) minmax(0, 1fr)", height: "15em", gap },
		boxes: [
			{
				label: "Left column", nest: true,
				rules: { display: "grid", "grid-template-rows": "1.4fr 1fr", gap },
				kids: [{ label: "A", note: "1.4fr" }, { label: "B", note: "1fr" }],
			},
			{
				label: "Right column", nest: true,
				rules: { display: "grid", "grid-template-rows": "1fr 1.4fr", gap },
				kids: [{ label: "C", note: "1fr" }, { label: "D", note: "1.4fr" }],
			},
		],
		word: { label: "a grid inside each track", href: "/framework/styles/layouts/wire/" },
		config: 'div.c("cols half gap", () => { div.c("grid gap"); div.c("grid gap"); })',
	},

	{
		id: "wall", n: 4, title: "Wall",
		split: false,
		intro: "Not a split at all: a wall names a COLUMN WIDTH and lets the room decide how many fit. Four tracks at 3440, one at 400, and never a squeezed pair.",
		when: "A region of same-shaped children — an index, a gallery, a dashboard of tiles. The one arrangement that scales without a single breakpoint.",
		rules: { display: "grid", "grid-template-columns": "repeat(auto-fill, minmax(min(var(--column, 14em), 100%), 1fr))", gap },
		boxes: [{ label: "Tile" }, { label: "Tile" }, { label: "Tile" }, { label: "Tile" }, { label: "Tile" }, { label: "Tile" }],
		word: { label: ".wall / .grid.auto", href: "/framework/styles/doc/layout-system.md" },
		config: 'div.c("wall").style("--column", "18em", () => items.forEach(card))',
	},

	{
		id: "shell", n: 4, title: "Shell",
		split: true,
		intro: "Four regions rather than four columns: a rail, a body, an aside, and a bar under all three. The row is split first, then the whole thing is split again down the block axis.",
		when: "A real application screen. It is `1.rows` and `3.rail-main-aside` composed, which is why neither of them needed a fifth word.",
		rules: { display: "grid", "grid-template-rows": "minmax(0, 1fr) auto", height: "16em", gap },
		boxes: [
			{
				label: "The row", nest: true,
				rules: { display: "grid", "grid-template-columns": "clamp(6em, 18%, 12em) minmax(0, 1fr) clamp(6em, 20%, 14em)", gap },
				kids: [{ label: "Rail" }, { label: "Body" }, { label: "Aside" }],
			},
			{ label: "Status bar", note: "auto" },
		],
		word: { label: "styles/layouts/shell", href: "/framework/styles/layouts/shell/" },
		config: 'new Page({ width: "full", content(){ div.c("page full fill flex v", () => { … }); } })',
	},
];

/* ── LOOKUPS ──────────────────────────────────────────────────────────────────── */

export const NUMBERS = [
	{
		n: 1, title: "One column",
		blurb: "A stack, and the two ways one column still divides: into rows, and into scroll sections.",
		lead: "**One column is where a stack is the whole answer — until you divide the column itself.** The first two entries below are stacks: nothing is divided, and the container is as tall as its content added up. The last two are splits down the *block* axis, which is the thing most people do not expect a one-column layout to be able to do.",
	},
	{
		n: 2, title: "Two columns",
		blurb: "Five distributions — equal, golden, main + aside, fixed + fluid, fr tracks.",
		lead: "**Two columns is one decision: how the room is shared.** These five are the distributions that have earned a name, in order of how opinionated they are — an even split, a composed ratio, a main thing with something beside it, a place plus the leftover, and grid's own share unit. Scroll from one to the next and the same two boxes are re-divided each time.",
	},
	{
		n: 3, title: "Three columns",
		blurb: "Thirds, the documentation shape, the card technique, rows inside a column, and a scrolling centre.",
		lead: "**Three columns is where a layout starts having a middle.** Two of them are peers-and-a-ratio; the third is the card technique this whole catalogue is drawn with. The last two show what a column can do once it exists as an area of its own: hold a split of its own, and scroll while its neighbours stay put.",
	},
	{
		n: 4, title: "Four or more",
		blurb: "Quarters, a 2 x 2, a wall that counts its own tracks, and a four-region shell.",
		lead: "**Past three columns, the honest question is whether the count is fixed at all.** Four equal tracks and a 2 x 2 are still splits with a number in them. A wall is not — it names a column *width* and lets the room decide how many fit, which is the only one of the four that needs no breakpoint. The shell is all of it composed: a row split three ways, inside a column split two ways.",
	},
];

export const of_number = n => ENTRIES.filter(entry => entry.n === n);

export const name_of = entry => entry.n + "." + entry.id;

// The flat reading order the full-screen catalogue walks: 1.* then 2.* then 3.* then
// 4.*, which is the order ENTRIES is already written in. One list, so `next` and
// `previous` cannot disagree with the numbering.
export const ORDER = ENTRIES;

export const step = (entry, by) => ORDER[(ORDER.indexOf(entry) + by + ORDER.length) % ORDER.length];

export const url_of = entry => "/imagine/layouts/" + entry.n + "/" + entry.id + "/";
