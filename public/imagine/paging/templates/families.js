import { div, p, h4, span, a, ui } from "/app.js";
import { Paging, MECHANISMS } from "../paging.js";

/* ── THE ELEVEN FAMILIES, AND THE REAL THING THAT DRAWS EACH ONE ───────────────
   One entry per template family. Everything a family page and a hub card need is
   here, said once:

     what        the first sentence — what the template is FOR and WHEN to use it
     card_line   the same thing in one line, for the hub card
     example     THE ICONIC EXAMPLE, drawn by the family's OWN machinery
     spec        the one line `Make` would need to build a page wearing it
     gap         what Make cannot say yet (null when the line already works)
     uses        which class runs, and where it lives
     members     the family itself, linked

   ⚠ NOTHING BELOW IS A COPY. Every import is read-only and points at the module
     that already ships this site: a magazine cover is `mag/page.js`'s own
     `column()`, a blog wall is `Post.wall()`, a screens split is `screens/screen.js`'s
     own `area()`, a shell is `Shell.rail()` + `Shell.main()`. If one of those
     modules changes, the picture on this page changes with it — which is the whole
     argument for building the templates realm this way rather than out of
     screenshots.

   ⚠ `example(page, full)` — `page` is the `Template` whose chips are live (null on a
     hub card, where there are none), `full` is false for the small version. A family
     that has a SURFACE reads `page.at("style")` and repaints itself in it; a family
     that has none ignores both arguments.                                          */

// ── the four the owner named, imported from where they live ──────────────────
import mag from "/imagine/mag/page.js";                          // the cover, and mag.css
import contents from "/imagine/mag/contents/page.js";            // the six real articles

import { Post } from "/blog/Post.js";                            // hero(), wall(), card()
import { featured } from "/blog/posts.js";                       // the manifest, data only
import blog_section from "/blog/framework/page.js";              // a real Section

import { area, frames } from "/imagine/screens/screen.js";       // sheet/area, screens.css

import { Shell } from "/imagine/shells/Shell.js";                // rail(), bar(), main()
import shells_index from "/imagine/shells/page.js";              // the ten, for the nav

// ── the other seven ──────────────────────────────────────────────────────────
import { region, quiet, statement, notes } from "/imagine/decks/deck.js";
import { shape } from "/framework/styles/layouts/preview.js";
import hero from "/framework/styles/sections/hero.js";
import stats from "/framework/styles/sections/stats.js";
import Pagination from "/framework/ux/Pagination/Pagination.js";
import Tags from "/framework/ux/Tags/Tags.js";
import "/framework/ui/crumbs/crumbs.js";                         // .ui-crumbs a { … }

/* THE SURFACE CHIP, TRANSLATED. Two families paint themselves rather than sitting on
   the page's surface — a section band and a magazine sheet carry their own tone — so
   the five paging surfaces map onto the four tone words `styles/sections/tone.js`
   already has. One table, so the translation is visible rather than guessed. */
const TONE = { plain: "wash", card: "surface", tint: "surface", prim: "prim", dark: "dark" };

const tone_of = page => TONE[page?.at?.("style") ?? "plain"] ?? "wash";

/* ONE MINI SHELL, built once. A real `Shell` — its own `rail()`, `bar()`, `main()`,
   `content()` and `verdict()` all run — parented to the real shells index so its
   chrome links to real shells at real urls, which is the finding that lab exists to
   make ("the chrome IS the nav").
   ⚠ Five of the ten, not all ten: a 9em rail in a 15em-tall miniature cannot hold a
     ten-item list without scrolling, and a scrollbar here would be a side effect
     rather than a decision. The family page links all ten underneath. */
const mini_shell = new Shell({
	name: "left",
	title: "Left rail",
	finding: "the rail lands where the eye already starts a line, and it shares the content's left edge — which is why every app you know does this.",
	head(){ return this.bar("head"); },
	left(){ return this.rail("left"); },
	shells(){ return [...this.parent.children.keys()].slice(0, 5).map(name => this.parent.nav_for(name)); },
});

mini_shell.parent = shells_index;

/* ⚠ `Shell.render()` IS NOT CALLED, and cannot be: it stamps `hides-nav` (which takes
     the site's own strip away) and attaches a window keydown listener, both of which
     belong to a shell that owns the screen. The five lines below are its body without
     those two — and `Shell.css`'s grid is keyed on `.page.shell`, while `.page` is
     `display: none` unless it is the active page, so `templates.css` restates the 3×3
     for `.templates-shell`. A one-line change in `Shell.css` would delete that
     restatement: doc/templates.md carries the diff as a proposal. */
const shell_box = full => div.c("shell templates-shell").ac(full && "templates-shell-full").append(() => {
	if (full) mini_shell.head();
	mini_shell.left();
	mini_shell.main();
});

/* A LABELLED TRACK PICTURE. The columns family is the one whose real example is the
   page you are standing on — every box on this screen is a column of one row — so its
   icon is the width words drawn to their own weights, with the measurement beside each. */
const track = (word, grow, note) => div.c("templates-track", () => {
	span.c("templates-track-word", word);
	span.c("templates-track-note", note);
}).style("--templates-grow", grow);

export const FAMILIES = [

	/* ════ 1 · MAGAZINE ═══════════════════════════════════════════════════════ */
	{
		name: "magazine",
		title: "Magazine",
		icon: "auto_stories",

		what: "**A magazine is a cover, a contents and a reading column — three pages of one row, and the cover shrinks as you go deeper.** Reach for it when you have a finite, curated, ORDERED set of long pieces that someone reads in sequence: an issue, a report, a chapter list. Reach for something else when the set is open-ended or the pieces are unrelated — that is the blog.",

		card_line: "A cover you click into. The whole issue is six real articles and one JSON file.",

		example(page, full){
			div.c("templates-mag", () => {
				// mag/page.js's OWN column(), re-classed: the two column words belong to a
				// full-screen page, and this is a miniature inside a box.
				mag.column().rc("page-column-body", "page-column-full").ac("templates-mag-cover");

				// The magazine's own index, drawn by Article.preview() — real entries,
				// real read-marks, real urls into the issue.
				if (full) div.c("templates-mag-contents", () => { contents.previews(); });
			});
		},

		spec: "The Column: magazine tint display launch",

		make: "A magazine is one line plus one pointer at its content. The words after the title are the template, the surface, the type scale and what a click on the contents does.",

		gap: "Make cannot say `magazine` or `display` yet — it knows a style, a content rung and a mechanism, and a template family is a fourth word it has no slot for. It also has nowhere to name the ISSUE the pages are built from.",

		uses: [
			["mag.column()", "/imagine/mag/", "imagine/mag/page.js — the cover"],
			["contents.previews()", "/imagine/mag/contents/", "imagine/mag/contents/page.js — the six articles"],
			["Article.preview(nav)", "/imagine/mag/readme/", "imagine/mag/Article.js — one contents entry"],
			["issue.json", "/imagine/mag/", "every word in the issue, fetched once"],
		],

		members: [
			["Cover", "/imagine/mag/", "one page in three CSS states — full, then 38.2%, then a fifth"],
			["Contents", "/imagine/mag/contents/", "the wall of entries, and the read-state record"],
			["An article", "/imagine/mag/contents/the-column/", "the 40em measure, quotes and figures bled to the column's inset"],
			["The design record", "/imagine/mag/readme/", "what it is made of, and what it cost"],
		],
	},

	/* ════ 2 · BLOG ════════════════════════════════════════════════════════════ */
	{
		name: "blog",
		title: "Blog",
		icon: "rss_feed",

		what: "**A blog is an open-ended stream: a front with one lead and a wall of cards, sections that are real ancestors, and a reading page with the measure hard left.** Reach for it when pieces arrive over time, stand alone, and want a feed and a social card each. Reach for the magazine instead when the set is finite and meant to be read in order.",

		card_line: "One lead, then the wall. Every card here is a real post from the blog's own manifest.",

		example(page, full){
			div.c("templates-blog", () => {
				Post.hero(featured());

				// A REAL Section drawing itself: its blurb, then Post.wall() over the
				// posts the manifest says are in it.
				if (full) div.c("templates-blog-wall", () => { blog_section.content(); });
			});
		},

		spec: "Field notes: blog plain regular launch",

		make: "A blog page is the front; its sections and its posts are children that follow from the manifest rather than from the line.",

		gap: "Make cannot say `blog` — and a blog template needs a SOURCE (which section's posts fill the wall), which no word in the spec line can carry.",

		uses: [
			["Post.hero(featured())", "/blog/", "blog/Post.js — the lead, sized in cqw off its own box"],
			["section.content()", "/blog/framework/", "blog/Section.js — a real section index"],
			["Post.wall(of_section(name))", "/blog/doc/front/", "blog/Post.js — the card wall"],
			["posts.js", "/blog/readme/", "the manifest — the one copy of every title"],
		],

		members: [
			["The front", "/blog/", "a magazine front: one hero, then every post as a card"],
			["A section", "/blog/framework/", "a real ancestor, so the rail can light up in-path"],
			["A post", "/blog/framework/no-build/", "the reading page — the measure left, exhibits beside it"],
			["The design record", "/blog/readme/", "the three things here that are unlike the rest of the site"],
		],
	},

	/* ════ 3 · SCREENS ═════════════════════════════════════════════════════════ */
	{
		name: "screens",
		title: "Screens",
		icon: "fullscreen",

		what: "**A screen is a page that takes the whole row, and a click divides it instead of replacing it.** Reach for it when the CONTENT is the whole experience — a kiosk, a walkthrough, a picker, anything with no chrome to keep. Reach for a shell instead when the app has rails and bars that must survive every click.",

		card_line: "Click an area and the screen splits. Nothing re-renders — a hop is one more column.",

		example(page, full){
			div.c("screens-screen templates-screens", () => {
				area("One", "The whole screen. Click to split it.", "/imagine/screens/divide/two/");
				area("Two", "A fill column joined the row; nothing re-rendered.", "/imagine/screens/divide/");
				if (full) area("Three", "Thirds, from three identical fill columns.", "/imagine/screens/divide/");
			});

			if (full) div.c("templates-frames", () => { frames("1", "1 1", "1 1 1", "1 1 1 1"); });
		},

		spec: "Walkthrough: screens dark regular takeover",

		make: "A screen is the `takeover` mechanism plus the screens template: the page fills the row, every ancestor collapses to the crumb strip, and each child divides what is left.",

		gap: "The mechanism half already works — `takeover` is a word Make knows. `screens` is not, and neither is the per-hop choice between `full` (replace) and `fill` (join), which is what a screens tree actually is.",

		uses: [
			["area(label, note, to)", "/imagine/screens/", "imagine/screens/screen.js — the two-box sheet"],
			["frames(...specs)", "/imagine/screens/readme/", "imagine/screens/screen.js — the card's diagram"],
			["Screen extends Page", "/imagine/screens/divide/", "column() with no head, no ×, no rail"],
		],

		members: [
			["Divide", "/imagine/screens/divide/", "1 → 2 → 3 → 4 columns, for free"],
			["Stack", "/imagine/screens/stack/", "the other axis — a band count is a screen"],
			["Uneven", "/imagine/screens/uneven/", "a basis IS a share: 61.8 / 38.2 at every width"],
			["Quad", "/imagine/screens/quad/", "a 2×2 menu that stacks when its column runs out"],
			["All eight", "/imagine/screens/", "and what each one measured"],
		],
	},

	/* ════ 4 · SHELLS ══════════════════════════════════════════════════════════ */
	{
		name: "shells",
		title: "Shells",
		icon: "dashboard",

		what: "**A shell is chrome that outlives the page inside it — rails, bars, a canvas — arranged by one 3×3 grid.** Reach for it when you are building an APP: a thing with persistent navigation someone lives in for an hour. Reach for a screen instead when the content should own the whole surface.",

		card_line: "Chrome, and the chrome is the nav. Six outer permutations are one grid — a part you do not declare costs 0px.",

		example(page, full){ shell_box(full); },

		spec: "Console: shells card compact takeover",

		make: "A shell takes over the row and brings its own chrome; the parts it declares are what the grid draws.",

		gap: "Make cannot say `shells`, and a shell is defined by WHICH PARTS it declares (`head` `left` `right` `foot`) — four booleans the spec line has no room for.",

		uses: [
			["mini_shell.rail(\"left\")", "/imagine/shells/left/", "imagine/shells/Shell.js — a chrome rail"],
			["mini_shell.bar(\"head\")", "/imagine/shells/head-foot/", "imagine/shells/Shell.js — a chrome bar"],
			["mini_shell.main()", "/imagine/shells/", "Shell.js — the content region and the shared document"],
			["nav_links()", "/imagine/shells/readme/", "the chrome IS the nav — real urls into the lab"],
		],

		members: [
			["Left rail", "/imagine/shells/left/", "the default app shape"],
			["Head + foot", "/imagine/shells/head-foot/", "bars top and bottom, no rail"],
			["Both rails", "/imagine/shells/both/", "nav left, inspector right"],
			["Canvas", "/imagine/shells/canvas/", "a stage that prints its own measured size"],
			["Inner chrome", "/imagine/shells/inner-rail/", "chrome inside chrome — a rule, not a fill"],
			["All ten", "/imagine/shells/", "and the four findings"],
		],
	},

	/* ════ 5 · DECKS ═══════════════════════════════════════════════════════════ */
	{
		name: "decks",
		title: "Decks",
		icon: "slideshow",

		what: "**A deck is a screen already cut into shares, and the share is a flex basis.** Reach for it for presentations, slides and posters — anywhere the composition matters more than the reading order.",

		card_line: "61.8 / 38.2 — a region is a share, and it measures the same fraction at 1920 and at 3440.",

		example(page, full){
			div.c("decks-slice templates-deck", () => {
				region(61.8, () => { statement("Issue 01", "61.8 / 38.2", "A region is a share, and the share is its flex basis."); });
				quiet(38.2, () => { notes("The minor share is not small", full
					? ["2125 / 1313 at 3440", "1185 / 733 at 1920", "the golden section at both, no breakpoint"]
					: ["the golden section at both widths"]); });
			});
		},

		spec: "Q3 review: decks prim display swap",

		make: "A deck is one screen per slide and `swap` between them, so the stage never moves and only what is on it changes.",

		gap: "Make cannot say `decks`, nor the CUT — `61.8 38.2` is the whole of a deck layout and there is no place to write it.",

		uses: [
			["region(share, build)", "/imagine/decks/golden/", "imagine/decks/deck.js — a share of the slide"],
			["statement(eyebrow, title, note)", "/imagine/decks/", "deck.js — the content kind that scales"],
			["notes(title, lines)", "/imagine/decks/aside/", "deck.js — the content kind that caps at its measure"],
		],

		members: [
			["Golden", "/imagine/decks/golden/", "61.8 / 38.2, measured at both widths"],
			["Half", "/imagine/decks/half/", "the even cut, and when it reads as indecision"],
			["Triptych", "/imagine/decks/triptych/", "three regions, and what survives a third"],
			["Poster", "/imagine/decks/poster/", "the one cut that scrolls on a phone"],
			["All nine", "/imagine/decks/", "and which content kind survives which piece"],
		],
	},

	/* ════ 6 · COLUMNS ═════════════════════════════════════════════════════════ */
	{
		name: "columns",
		title: "Columns",
		icon: "view_column",

		what: "**A columns page is a peer in a row you walk sideways, and its width is one word.** Reach for it for a world of siblings you browse rather than read — a finder, a workbench, this realm. You are inside one right now: every box on this screen is a column of one row.",

		card_line: "Five width words, one row. You are standing in it — this box is a column.",

		example(page, full){
			div.c("templates-tracks", () => {
				track("small", 1, "14–24em");
				track("default", 2, "40–46em");
				track("large", 3, "28–64em");
				if (full) track("fill", 4, "everything left");
			});

			if (full) p.c("muted", "Drawn to the weights core gives them. The row you are reading this in is the real one — press full on the layout chips above and this page takes the whole of it.");
		},

		spec: "Workbench: columns plain regular launch",

		make: "This one already works: `launch` IS a child column, and every page Make builds is a column of the row it is made in.",

		gap: null,

		uses: [
			["width: \"large\"", "/framework/core/Page/doc/columns/", "core/Page — the width words"],
			["launch", "/imagine/paging/mechanisms/launch/", "a child column, this realm's word for it"],
			["index: true", "/framework/core/Page/doc/columns/", "the page draws its own children, so core leaves its rail out"],
		],

		members: [
			["The columns doc", "/framework/core/Page/doc/columns/", "every width word, floored and capped"],
			["The finder", "/framework/core/Page/overview/columns/finder/", "Miller columns, built out of nothing new"],
			["Launch", "/imagine/paging/mechanisms/launch/", "a click that opens a column to the right"],
			["Sizes", "/imagine/paging/sizes/", "press a chip and read what the box did, in pixels"],
		],
	},

	/* ════ 7 · LAYOUTS ═════════════════════════════════════════════════════════ */
	{
		name: "layouts",
		title: "Layouts",
		icon: "grid_view",

		what: "**A layout is the arrangement of a whole page with nothing in it — where the regions are, and how they answer a wider screen.** Reach for one when you know the SHAPE before you know the content: seventeen are already named and measured.",

		card_line: "The arrangement, with nothing in it. Every card in the layouts tier shows this same picture.",

		example(page, full){
			div.c("templates-shapes", () => {
				shape("flex gap", ["basis", "flex-1"]).ac("surface");
				shape("grid gap auto", ["", "", "", "", "", ""], "2.5em").ac("surface");
				if (full) shape("flex v gap", ["", "flex-1", ""]).ac("surface");
			});

			if (full) p.c("muted", "Drawn by styles/layouts/preview.js's own shape() — the same function every layout word's card uses.");
		},

		spec: "Docs: layouts card regular launch",

		make: "A layout is the shape a made page starts in, before it has any content at all.",

		gap: "Make cannot say `layouts`, and it cannot name WHICH arrangement — `sidebar`, `dashboard`, `gallery` and fourteen more are all one family here.",

		uses: [
			["shape(classes, regions, column)", "/framework/styles/layouts/", "styles/layouts/preview.js — the arrangement picture"],
			[".flex.gap / .grid.auto", "/framework/styles/", "framework.css — the utility vocabulary the picture is built from"],
		],

		members: [
			["All seventeen", "/framework/styles/layouts/", "each with its picture and its measurements"],
			["Sidebar", "/framework/styles/layouts/sidebar/", "a fixed track beside a fluid one"],
			["Dashboard", "/framework/styles/layouts/dashboard/", "tiles against a real --column"],
			["Cols", "/framework/styles/layouts/cols/", "the row this site's examples are built from"],
			["The five approved", "/imagine/design/layout/approved/", "the closed set, and the contract that locks it"],
		],
	},

	/* ════ 8 · SECTIONS ════════════════════════════════════════════════════════ */
	{
		name: "sections",
		title: "Sections",
		icon: "view_agenda",

		what: "**A section is a full-width band with real content in it — a hero, a stats row, a pricing table — and fifteen of them stack into a landing page.** Reach for it when you are assembling a marketing or product page out of parts rather than designing one shape.",

		card_line: "A band is a tone plus a measure. The surface chips repaint this hero, because a band takes a tone word.",

		example(page, full){
			const tone = tone_of(page);

			div.c("templates-bands", () => {
				hero(tone).ac("templates-band");
				if (full) stats(tone === "dark" ? "prim" : "dark").ac("templates-band");
			});
		},

		spec: "Launch: sections dark display launch",

		make: "A landing page is a stack of bands, and each band takes one tone word — which is exactly what the surface chips above are switching.",

		gap: "Make cannot say `sections`, nor WHICH bands are in the stack or in what order — a landing page is a list, and the spec line holds one page.",

		uses: [
			["hero(tone)", "/framework/styles/sections/", "styles/sections/hero.js — the canonical band"],
			["stats(tone)", "/framework/styles/sections/", "styles/sections/stats.js — numbers as a band"],
			["band(tone)", "/framework/styles/sections/", "styles/sections/tone.js — four tones, no colour named"],
		],

		members: [
			["All fifteen", "/framework/styles/sections/", "in the rail, and the whole page composed"],
			["Hero", "/framework/styles/sections/hero/", "the canonical band — read this one first"],
			["Pricing", "/framework/styles/sections/pricing/", "a table that is a band"],
			["Features", "/framework/styles/sections/features/", "the tile wall as a band"],
		],
	},

	/* ════ 9 · UI ══════════════════════════════════════════════════════════════ */
	{
		name: "ui",
		title: "UI",
		icon: "widgets",

		what: "**A ui template is MARKUP you copy — nineteen of them, and there is nothing to import.** Reach for one when you need a card, a table, a badge or a toolbar inside a page you are already building. Reach for `ux/` instead when the thing needs to remember something.",

		card_line: "Markup you copy, not a component you import. This card is the template verbatim.",

		example(page, full){
			div.c("templates-ui", () => {
				div.c("grid auto gap", () => {
					[["card", "the one surface"], ["table", "rows you can scan"], ["badge", "a state, in a word"]]
						.forEach(([name, line]) => div.c("surface pad flex v gap", () => {
							h4.c("muted", "ui/");
							div.c("h3", name);
							p(line);
						}).style("--gap", "0.4em"));
				}).style("--column", "8em");

				if (full) ui.table(["component", "what it is"], [
					["card", "a surface, padded, in a wall"],
					["table", "the one row rhythm on the site"],
					["toolbar", "controls in a strip"],
				]);
			});
		},

		spec: "Components: ui card regular expand",

		make: "A ui page is a catalog: one child per component, and `expand` opens each in place.",

		gap: "Make cannot say `ui`. This family is the closest to working already, because a catalog IS a page with children — which Make can build today.",

		uses: [
			["div.c(\"surface pad flex v gap\")", "/framework/ui/card/", "the ui/card template, verbatim — nothing to import"],
			["ui.table(head, rows)", "/framework/ui/table/", "framework/ui/ui.js — the one table"],
		],

		members: [
			["All nineteen", "/framework/ui/", "card, table, badge, menu, tree, toolbar…"],
			["Card", "/framework/ui/card/", "the template every wall on this site is made of"],
			["Table", "/framework/ui/table/", "the only one with a function behind it"],
			["Words", "/framework/ui/words/", "the config words that re-skin any of them"],
		],
	},

	/* ════ 10 · UX ═════════════════════════════════════════════════════════════ */
	{
		name: "ux",
		title: "UX",
		icon: "layers",

		what: "**A ux is a CLASS you extend — a workflow that remembers something: a wizard, a filter, a tag field, a paginator.** Reach for it the moment markup is not enough because there is state; the next case is a subclass, never a fork.",

		card_line: "A class, not markup. Both of these are live — click them.",

		example(page, full){
			div.c("templates-ux flex v gap", () => {
				div.c("flex v gap", () => {
					h4.c("muted", "ux/Pagination");
					new Pagination({ pages: ["1", "2", "3", "…", "12"], current: 2 });
				}).style("--gap", "0.35em");

				if (full) div.c("flex v gap", () => {
					h4.c("muted", "ux/Tags");
					new Tags({ tags: ["core", "no-build", "esm"] });
				}).style("--gap", "0.35em");
			});
		},

		spec: "Signup: ux tint regular swap",

		make: "A ux page is one workflow; `swap` is the mechanism a multi-step flow wants, because the stage stays put and only the step changes.",

		gap: "Make cannot say `ux`, and a workflow needs its STEPS — a list, not a word.",

		uses: [
			["new Pagination({ pages, current })", "/framework/ux/Pagination/", "framework/ux/Pagination — a real class, live above"],
			["new Tags({ tags })", "/framework/ux/Tags/", "framework/ux/Tags — type to add, × to remove"],
		],

		members: [
			["All eight", "/framework/ux/", "Auth, Wizard, Tree, Course, Filter, Menu, Pagination, Tags"],
			["Wizard", "/framework/ux/Wizard/", "steps, and what a step owes the one before it"],
			["Filter", "/framework/ux/Filter/", "the one-wire pattern the others copy"],
			["The contract", "/framework/ux/", "ui/ hands you markup; ux/ hands you a class"],
		],
	},

	/* ════ 11 · NAVIGATION ═════════════════════════════════════════════════════ */
	{
		name: "navigation",
		title: "Navigation",
		icon: "alt_route",

		what: "**Navigation is not a template so much as the four answers to \"what does a click do\", plus the trail that says where you are.** Reach for this page when you are choosing between them — every other family in this realm has already made the choice.",

		card_line: "The trail, and the four things a click can do. Every item on this site wears one of these icons.",

		example(page, full){
			div.c("templates-nav", () => {
				div.c("ui-crumbs flex wrap v-center h4 gap", () => {
					a.c("page-link", "Imagine").href("/imagine/");
					span.c("muted", "/");
					a.c("page-link", "Paging").href("/imagine/paging/");
					span.c("muted", "/");
					span.c("muted", "Templates");
				}).style("--gap", "0.5em");

				div.c("paging-items", () => Object.entries(MECHANISMS)
					.slice(0, full ? 4 : 2)
					.forEach(([word, mech]) => new Paging.Item({
						tag: "a",
						url: "/imagine/paging/mechanisms/" + word + "/",
						words: word,
						glyph: "article",
						sign: mech.icon,
					})));
			});
		},

		spec: "Docs: navigation card regular launch",

		make: "Every made page already picks one of the four — the third word on its line is the mechanism.",

		gap: null,

		uses: [
			["div.c(\"ui-crumbs flex wrap v-center h4 gap\")", "/framework/ui/crumbs/", "the ui/crumbs template, verbatim"],
			["new Paging.Item({ … })", "/imagine/paging/mechanisms/", "imagine/paging/paging.js — one row, wearing its mechanism's icon"],
			["MECHANISMS", "/imagine/paging/doc/mechanisms.md", "imagine/paging/words.js — the four, said once"],
		],

		members: [
			["The four mechanisms", "/imagine/paging/mechanisms/", "launch, expand, swap, takeover — on one page"],
			["Crumbs", "/framework/ui/crumbs/", "the trail — markup, no CSS but one rule"],
			["Sidebar", "/framework/core/Sidebar/", "the site's own rail"],
			["Tabs", "/framework/ext/tabs/", "a bar and a panel, as a Page method"],
			["Right nav", "/imagine/paging/rightnav/", "the same list on the other edge"],
		],
	},
];

export const family = name => FAMILIES.find(f => f.name === name);

export default FAMILIES;
