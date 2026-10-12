import { Page, View, div, p, b, a, code, small, img, figure, figcaption, h2, li, ul } from "/app.js";

View.stylesheet(import.meta, "la.css");

/* ── layout, answered before the first factory call ───────────────────────────
   1 CONTAINER  a task page under the day board — the ordinary `main` reading column.
   2 SIZE       one screen: the picture, the four chains, five sentences, the rule.
                The two shots and the chain diagram are the widest things and take
                `wide`; every word rides `main` at the measure.
   3 OWN LAYOUT `.flow` for the prose. The chains are a 2-column grid (name · bar),
                not cards — four rows that must line up on one left edge.
   4 REGIONS    four: what it is, the chains, why, the rule. The counts are a child.
   5 PREVIEW    the day board's own card; one line. */

/* Measured on this worktree's own server at a 1920 window, BEFORE the rule change.
   The rail's inline edge is at x=256 on all four, so every number is the distance
   from the sidebar to the thing named. */
const CHAINS = [
	{
		url: "/framework/styles/", what: "an ordinary page",
		pays: [],
		text: "0px", note: "the title is ON the sidebar's edge - ext/toc replaced the template and the two gutter tracks went with it",
	},
	{
		url: "/framework/ai/days/", what: "the AI board",
		pays: [[26, ".v3-days"]],
		text: "26px", note: "the board zeroes the page gutter, then its own card pays --pad",
	},
	{
		url: "/framework/ext/Doc/", what: "a doc page",
		pays: [[67, ".doc-section"], [8, ".page-previews"], [16, ".page-preview"]],
		text: "91px", note: "three boxes, none of which knows about the other two",
	},
	{
		url: "/framework/ux/", what: "the UX index",
		pays: [[67, ".doc-section"], [61, ".page--intro"]],
		text: "128px", note: "a page inside a page - each one pays a full gutter",
	},
];

/* ⚠ `p()` reads backticks and NOTHING else, so these render their `code` spans by
   themselves — and a stray backtick in here would take out every page on the site. */
const WHY = [
	["The gutter is not padding - it is two empty columns of the page's grid.",
		"So any rule that rewrites `grid-template-columns` deletes the page's whole inset, with no error and nothing overflowing. `ext/toc` does exactly that above 1312px, which is why five top-level pages look right on a laptop and put their title flush against the sidebar on a wide screen."],
	["One rule in the whole site gives a page its gutter. Nineteen take it away, and eight hand it back by name.",
		"So the normal way to build a new shell is to inherit no inset at all and then remember to pay for it - and forgetting is silent."],
	["Eight different kinds of box pay that first inset, depending on which page you are on.",
		"A page grid track on 73 pages, `ext/Doc`'s title well on 52, the region's own default padding on 3, and one-off boxes on the AI board, the columns host, the layouts shell and the resume. There is no single number to change when a page looks wrong."],
	["The one rule that does give the gutter answers differently depending on where it lands.",
		"`clamp(2em, 4%, 5em)` is 4% of whatever box it is measured in, so the same page is inset 42px beside the sidebar and 51px without one. Across 133 pages the first heading sits at ten different distances at one single width."],
	["A page nested inside a page pays the gutter twice, because each one is a whole page shell with its own tracks.",
		"`/framework/ux/` spends 128px getting to its first sentence where its sibling `/framework/ext/Doc/` spends 91 and an ordinary page spends 67. That is the double padding in the complaint, measured."],
];

const CHECKS = [
	["No ink closer than one rung to the region's edge",
		"On every listed page at 400 / 1280 / 1920 / 3440: no visible text nearer the content region's inline-start edge than `--gap-25`, and none past it. Skip ink inside a box that really scrolls sideways - a code block, a wide table - because measuring against the scroller's own edge reported a real 28px inset as 1px. A page that wants a zero gutter belongs on a short named allow-list, never a class test."],
	["Every page with a non-zero gutter has non-zero padding",
		"This is the assert that would have caught the toc bug the moment it was written: the inset has to live somewhere a template cannot delete. Read `padding-inline-start` off the live element, never the token - a custom property hands back its own text, not a length."],
	["Pages listed and pages measured, printed side by side",
		"A page that failed to render has to fail the check, not quietly drop out of the count. This run: 133 listed, 133 measured."],
];

export default new Page({
	meta: import.meta,
	title: "layout-analysis",
	icon: "straighten",
	description: "Why every page is inset differently - and the one rule that now pays the gutter where nothing can delete it.",

	children: "counts",

	preview(nav){
		return this.preview_card(nav, () => p.c("muted", "Ten different insets at one width, eight boxes paying them. One rule took the violating pages from six to one."));
	},

	content(){
		p(b("A page's inset used to be two empty columns of its grid, so any rule that replaced the grid deleted it."), " That is what put the title of `/framework/styles/` hard against the sidebar on a wide screen. The gutter is now ", b("padding on the page"), ", which no template can reach, and a `bleed` child is the only way out of it.");

		div.c("la-shots wide", () => {
			figure(() => {
				img().attr("src", new URL("shots/styles-1920-before.png", import.meta.url).pathname)
					.attr("alt", "The Styles page at 1920 before the change: the title touches the sidebar");
				figcaption("Before - /framework/styles/ at 1920. The pink line is the sidebar's edge.");
			});
			figure(() => {
				img().attr("src", new URL("shots/styles-1920-after.png", import.meta.url).pathname)
					.attr("alt", "The same page after the change: the title is inset from the sidebar");
				figcaption("After - the same page, one rule changed. 0px became 67px.");
			});
		});

		h2("Where the padding comes from");
		p("Four real pages at a 1920 window, drawn at actual size. The line on the left is the sidebar's edge; each block is a box that pays part of the inset, as wide as the pixels it pays.");

		div.c("wide", () => CHAINS.forEach(c => div.c("la-chain", () => {
			div.c("la-chain-name", () => {
				a(c.url).href(c.url);
				small(c.what);
			});
			div.c("la-bar", () => {
				/* The blocks are unlabelled on purpose: at 8px and 26px a name does not
				   fit, and a clipped `.doc-sectio` reads as a rendering bug. The names
				   are spelled out after the bar, where there is room for them. */
				c.pays.forEach(([px, name]) => div.c("la-pays").style({ width: px + "px" }).attr("title", name + " pays " + px + "px"));
				div.c("la-text", () => {
					b(c.text);
					small(" = " + (c.pays.length ? c.pays.map(([px, name]) => name + " " + px) .join(" + ") : "nothing pays"));
					small.c("la-note", c.note);
				});
			});
		})));

		h2("Why it is hard");
		WHY.forEach(([claim, detail], i) => p(b((i + 1) + ". " + claim + " "), detail));

		h2("The one rule");
		p(b("A page always pays its gutter as padding; a bleed child is the only opt-out."), " Three declarations in `core/Page/Page.css`: the two gutter tracks come out of the template and go into `padding`; `.page > .bleed` spends them back with a negative margin; and `--page-pad: initial` stops the opt-out inheriting into nested pages. Nothing else on the site changed.");

		p(b("Measured over the same 133 pages at 400, 1280, 1920 and 3440: "), "pages with text closer to the region edge than one rung went from ", b("six to one"), ", and the one left is `/framework/ai2/`, a `.page.full` that asks for a zero gutter itself. Seven pages moved at all, and none gained a sideways scrollbar. ", a("All the numbers").href(this.url + "counts/"));

		p(b("No overrides were deleted, on purpose."), " The eight rules that hand the gutter back to a bled wall still work unchanged, because a bleed still reaches the edge - so this model lands without touching eight other stylesheets. Retiring them means deciding that a wall of cards should stop bleeding by default, which is a separate change with its own risk.");

		p(b("The alternative was to put the gutter on the region instead of the page, "), "so that no page-level rule could touch it at all. It was rejected because it makes `bleed` impossible: no page could ever paint to the window's edge, which would flatten the homepage's bands, the blog hero and every `/imagine/` realm.");

		p(b("The one known cost: "), "a bleed child lands 3px short at 1280 and 5px at 1920. `--gutter-x` is a clamp holding a percentage, and a percentage in a child's margin is measured against the child's containing block - the page's content box, already two gutters narrower. Removing it means expressing the gutter in a unit that does not re-resolve, which changes the gutter's own formula and is the owner's call.");

		h2("The check that keeps it true");
		p("Three things `padding-check.mjs` has to assert, in this order:");
		ul(() => CHECKS.forEach(([claim, detail]) => li(() => {
			b(claim);
			p.c("muted", detail);
		})));
		p("It belongs in `finish-task`, run on the pages the task touched before the landing line goes in, and on the whole list in the health crawl - which is the only thing that ever looks at a page nobody edited.");
	},
});
