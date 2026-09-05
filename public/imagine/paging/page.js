import { div, p, h2, h3, span, a, ol, li, icon, md, ui } from "/app.js";
import { Paging, MECHANISMS, LAYOUT_MEANS, RUNGS } from "./paging.js";
import { DEMOS } from "./demos.js";

/* ── layout, answered before the first factory call ────────────────────────────
   1 CONTAINER  /imagine/ is a columns host, so this is ONE COLUMN in its row.
                There is no page grid down here: content sits in
                `.page-column-prose`, `wide` is meaningless, only `bleed` reaches
                the edge (core/Page/doc/columns.md).
   2 SIZE       `large` — 28–64em: 421px at 1280, 1005 at 1920, 1152 at 3440. Wide
                enough for four teaching miniatures and a table, capped so the
                prose above them stays readable.
   3 OWN LAYOUT prose, then four teaching blocks (a heading, one sentence, a live
                miniature, a link), then the reference sections. One rhythm per
                box, `gap` throughout.
   4 REGIONS    one — core's. The children are columns of the SAME row, not regions
                of this page. `index: true`, so core leaves its rail out: the
                `previews()` wall at the bottom already shows every child once.
   5 PREVIEW    core's default card, on /imagine/'s rail and its Start wall.

   ⚠ THE HUB HAS NO MODE TOOLBAR AND NO STAGE, on purpose. It is the page that
     TEACHES the vocabulary, so it must not also be a page that demonstrates it —
     a reader meeting five chip groups before meeting the four words has been given
     controls for a thing they cannot name yet. Every other page in the realm has
     the toolbar; this one has the explanation and four things you can click.
     (Before 2026-09-04 the hub carried the toolbar and a five-stop "walk" of bare
     links; the owner's report was that the realm was confusing to enter.
     doc/decisions.md.)                                                          */

/* THE THREE STEPS. Written as a real list with real links so "how to explore this"
   is itself explorable, rather than a paragraph describing a journey. */
const STEPS = [
	["Examples", "/imagine/paging/examples/", "Five pages, each showing the result on one side and the four lines of code that made it on the other. Read them in order and you have seen the whole vocabulary used."],
	["Sizes", "/imagine/paging/sizes/", "Press the size chips and watch the SAME sample grow. A caption under the box tells you what just changed, in pixels."],
	["Make", "/imagine/paging/make/", "Type a name, pick three words, and a real page appears with a real url. Nothing is written to disk — it lives in your browser until you press Reset."],
];

/* WHICH THING THE SITE ALREADY BUILT SHOWS UP WHERE. The owner's ask was to use as
   much of what exists as possible rather than inventing placeholder prose; this is
   the honest list, and every row is a link you can go and check. */
const BUILT = [
	["ext/tabs", "/framework/ext/tabs/", "the swap example on this page — its real `.tabs` `.tab-bar` `.tab` `.tab-panel` strip"],
	["ui/accordion", "/framework/ui/accordion/", "the expand example on this page — `<details class=\"ui-accordion-item\">`, no JavaScript at all"],
	["ui/card", "/framework/ui/card/", "the `l` rung of every sample — four cards in the template verbatim"],
	["core previews()", "/framework/core/Page/doc/columns/", "the card wall at the bottom of this page, and the `xl` rung's wall of posts"],
	["the blog's manifest", "/blog/", "the `xl` rung's cards are real posts, read from `/blog/posts.js`"],
	["styles/layouts/cols", "/framework/styles/layouts/cols/", "every Example row — `cols-row cols-half` puts the result beside its configuration"],
	["ui/table", "/framework/ui/table/", "this table"],
	["the page generator", "/framework/core/Page/generator/", "Make builds its pages from spec text, using the generator's own `parse()` and `serialize()`"],
	["ext/Panel", "/framework/ext/Panel/", "not used here — a Panel is a resizable workspace, and every page in this realm is a column instead"],
];

export default new Paging({
	meta: import.meta,
	title: "Paging",
	description: "What a click does, and what the page looks like while it does it.",
	icon: "auto_stories",
	width: "large",

	takeaway: "**Every page on this site is three things: an icon, some content, and a list of children you can click.** A *page system* is the two decisions taken on top of that shape — **where a child goes when you click it**, and **what the page looks like** while it goes there. This realm takes those two decisions apart so you can try them on.",

	// Cards, not a rail: `previews()` below already draws every child once.
	index: true,

	// One level. The wall needs my children's titles and icons, nothing deeper —
	// depth 2 would pull the whole program down on every arrival.
	depth: 1,

	// No chips here — see the head note.
	axes: "",

	// ⚠ Nothing crawls: a page exists once this list names it, and a name whose dir
	//   has no page.js 404s the whole probe.
	children: "examples mechanisms styles sizes make center transitions toolbars rightnav explorer inventory critique",

	content(){
		this.lede();

		h2("What a click can do — four answers");

		md("Each one below has a small live example. Click it first; the words underneath will make more sense afterwards. None of these four examples navigates anywhere — they are miniatures, so you can see the whole gesture without leaving this page.");

		DEMOS.forEach(demo => this.teach(demo));

		h2("What the page looks like while it does it");

		md("That was the first decision. The second is the **surface** — what the page itself looks like — and **how much room** it gets. Both are single words, and both are independent of the mechanism: any surface can be opened by any mechanism.");

		md("**Five surfaces.** `plain` is the site's own floor with no frame · `card` is white and padded with a drop shadow · `tint` is one subtle step off the parent · `prim` is tinted with the accent colour · `dark` is a colour-scheme island, which flips every token below it with one declaration. See them all: [Styles](/imagine/paging/styles/).");

		md("**Two size axes.** How much content there is — " + RUNGS.map(rung => "`" + rung.word + "` " + rung.adds.replace(/^\+ /, "")).join(" · ") + " — and how much room it gets — " + Object.entries(LAYOUT_MEANS).map(([word, means]) => "`" + word + "` " + means).join(" · ") + ". See them move: [Sizes](/imagine/paging/sizes/).");

		h2("How to explore this");

		md("Three pages, in this order. Half an hour and you will have used every word in the vocabulary.");

		ol.c("paging-steps", () => STEPS.forEach(([title, url, says]) => li(() => {
			a.c("page-link", title).href(url);
			p(says);
		})));

		h2("What is remembered — and how to put it all back");

		md("Every chip you press anywhere in this realm is remembered **in your browser**, keyed on the page's own address, so a page you dressed a particular way is still dressed that way when you come back. Nothing is written to disk and nothing leaves your machine.");

		md("That is useful right up until you want the demos back the way they shipped. **Reset** forgets every one of those changes — the modes, the pages you made under [Make](/imagine/paging/make/), the right-nav variants — and nothing else on the site: they all live under one key prefix, `lew42:paging:` ([the contract](/imagine/paging/doc/persistence.md)).");

		new Paging.Reset();

		h2("Which of the site's own parts this realm uses");

		md("The owner's ask was to build this out of what already exists rather than out of placeholder prose. Every row is a link — go and check.");

		ui.table(["what", "where it shows up here"], BUILT.map(([name, url, where]) => [
			() => a.c("page-link", name).href(url),
			() => md(where).ac("paging-cell"),
		]));

		h2("Every page in this realm");

		this.previews();

		md("The long form: [readme](/imagine/paging/readme/) · [the four mechanisms, with the numbers](/imagine/paging/doc/mechanisms.md) · [what is remembered](/imagine/paging/doc/persistence.md) · [every decision, and what was rejected](/imagine/paging/doc/decisions.md).");
	},

	/* ONE TEACHING BLOCK — the word, the one sentence a reader should leave with,
	   the live miniature, and the way to the real thing. Same shape four times, so
	   the four mechanisms are obviously four answers to one question. */
	teach(demo){
		return div.c("paging-teach", () => {
			h3.c("paging-teach-head", () => {
				icon(MECHANISMS[demo.word].icon).ac("paging-sign");
				span(demo.word);
			});

			p.c("paging-teach-say", demo.takeaway);

			demo.draw();

			a.c("page-link paging-teach-more", "The real " + demo.word + ", at full size →").href(demo.real);
		});
	},
});
