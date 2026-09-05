import { Page, span, p } from "/app.js";
import { SectionsBand, SectionsStack, SectionsNav, heading, rows, tiles, link } from "./sections.js";

/* ── layout, answered before the first factory call ────────────────────────────
   1 CONTAINER  a column in /imagine/'s columns host, so content lands in
                `.page-column-prose`: padded by the column's own tokens, prose capped
                at the measure, `bleed` reaching the column's edges. `wide` means
                nothing here.
   2 SIZE       `fill` — the leftover of the row. ~2,950px of a 3440 screen beside the
                24em rail, ~950px at 1280, the whole 400 at 400. It falls back to
                `large` on its own when a child column opens (Page.css, 2026-09-05).
   3 OWN LAYOUT one `.sections-stack`: a flex column of sections, gap = the gap ramp.
                Each section is a grid; its own layout is the whole subject here.
   4 REGIONS    one. The three child pages open as columns to the right.
   5 PREVIEW    core's card, in the /imagine/ rail and on Start's wall.

   EVERY SECTION SAYS ITS OWN IDEA. There is no prose on this page outside a section:
   the left column is the text, the middle is the demo, the right column is the chips
   that change it. Above the fold at 3440 is the first section, framed, full width. */

// A study: the idea on the left, the thing itself in the middle, its chips on the
// right. When `demo` builds a section of its own, the chips are that one's.
const study = ({ idea, demo, ...words }) => new SectionsBand({
	cols: 3, dist: "rail-main-aside", frame: "flush", chrome: "tint", face: "plain", stick: "on",
	side: () => { p.c("sections-text", idea); },
	main(band){ if (demo) band.$inner = demo(band); },

	/* The chips belong to whatever the middle built, when that is a section of its
	   own; otherwise they are this section's. ⚠ A `demo` that builds a STACK, or
	   several sections, returns something with no chips at all — hence the check for
	   the method rather than for the value. */
	aside(band){ (typeof band.$inner?.controls === "function" ? band.$inner : band).controls(); },
	...words,
});

export default new Page({
	meta: import.meta,
	title: "Sections",
	description: "Multi-column bands that fill a wide screen.",
	icon: "view_agenda",
	width: "fill",
	index: true,

	children: "full stack nav",

	content(){
		const page = this;

		new SectionsStack({ classes: "bleed", space: "gap", bands(){

			/* ── 1 · THE FRAME ── the section that is its own demonstration ── */
			new SectionsBand({
				cols: 3, dist: "golden", frame: "flush", chrome: "tint", face: "card", back: "tint", stick: "on",
				axes: ["cols", "dist", "frame", "chrome", "face", "back", "stick"],

				head: () => {
					span.c("sections-tile-name", "Sections");
					link("/imagine/sections/full/", "as one full screen");
					link("/imagine/sections/stack/", "a stack of templates");
					link("/imagine/sections/nav/", "with nav");
				},

				side: () => {
					p.c("sections-text", "A section is one horizontal band of a page, cut into columns. This one has five parts: a head across the top, a column on each side, the middle, and a foot across the bottom.");
					p.c("sections-text", "The head, the two sides and the foot all wear one colour, and there is no gap between them. So they surround the middle — and the middle reads as framed. Every word of that is a chip you can press, in the last column.");
				},

				main: () => {
					heading("The middle");
					p.c("sections-text", "Whatever you came for goes here: an article, a demo, a dashboard, a wall of cards. It is the only part with no fixed width — it takes what the other columns leave.");
					tiles(8, "Thing");
				},

				foot: () => { span.c("sections-note", "head  ·  side  ·  main  ·  aside  ·  foot — five parts, one colour on four of them."); },
			});

			/* ── 2 · TWO COLUMNS ── */
			study({
				idea: "Two columns leave the middle enormous on a wide screen — one track of 2,000px, with a line of text sitting in the first 40em of it. The answer is to nest columns inside the middle, so the width is used rather than stretched.",
				demo: () => new SectionsBand({
					cols: 2, dist: "golden", frame: "card", chrome: "tint", face: "card", stick: "off",
					axes: ["cols", "dist", "frame"],
					head: () => { span.c("sections-tile-name", "Two columns, nested inside"); },
					main: () => {
						p.c("sections-text", "The middle is one column of the section — and a grid of its own inside that, so the width becomes six things instead of one very long line.");
						tiles(6, "Nested");
					},
					aside: () => {
						heading("Beside it");
						p.c("sections-text", "A second column that is not a nav: notes, a summary, related links.");
					},
				}),
			});

			/* ── 3 · FOUR COLUMNS ── */
			study({
				idea: "Four columns is where hierarchy breaks. Four equal tracks give the eye nowhere to land, and in a 1,100px row each one is 270px wide. Our answer is one weighted column and three supports: the middle stays fluid, the other three are fixed at the rail width. Below 70rem four columns become two, never four slivers.",
				demo: () => new SectionsBand({
					cols: 4, dist: "fixed-fluid", frame: "card", chrome: "tint", face: "card", stick: "off",
					axes: ["cols", "dist"], readout: true,
					head: () => { span.c("sections-tile-name", "Four columns, one of them weighted"); },
					side: () => { heading("Nav"); p.c("sections-note", "Fixed at the rail width."); },
					main: () => { heading("The one thing"); p.c("sections-text", "Fluid, and the only fluid track — so it is where the eye lands."); tiles(3, "Item"); },
					aside: () => { heading("Controls"); p.c("sections-note", "Fixed."); },
					notes: () => { heading("Notes"); p.c("sections-note", "Fixed. Three equal supports, one weighted middle."); },
				}),
			});

			/* ── 4 · DISTRIBUTIONS ── */
			study({
				idea: "Six ways to divide the same row, and they are the same six words /framework/styles/layouts/cols/ already uses. Press one and the measured widths, printed under the chips, change with it.",
				demo: () => new SectionsBand({
					cols: 3, dist: "equal", frame: "card", chrome: "tint", face: "card", stick: "off",
					axes: ["cols", "dist"], readout: true,
					side: () => { heading("Left"); },
					main: () => { heading("Middle"); p.c("sections-text", "The widths printed under the chips are read off these three boxes, not calculated."); },
					aside: () => { heading("Right"); },
				}),
			});

			/* ── 5 · COLOUR ── */
			study({
				idea: "Three colours, not one: the frame (head, sides and foot together), the middle, and the section's own background behind them all. Any of the five surfaces goes on any of the three, so a section can be a quiet card, a dark island, or a tinted frame around a white page.",
				demo: () => new SectionsBand({
					cols: 3, dist: "golden", frame: "card", chrome: "tint", face: "card", back: "plain", stick: "off",
					axes: ["chrome", "face", "back"],
					head: () => { span.c("sections-tile-name", "One section, three colours"); },
					side: () => { heading("Frame"); p.c("sections-note", "Head, sides and foot share this one."); },
					main: () => { heading("Middle"); p.c("sections-text", "Its own colour, always separate from the frame's — that separation is what makes it read as framed."); },
					aside: () => { heading("Frame"); p.c("sections-note", "The same colour as the left."); },
					foot: () => { span.c("sections-note", "and the foot."); },
				}),
			});

			/* ── 6 · SPACING BETWEEN SECTIONS ── */
			study({
				idea: "Stacked with no gap, sections read as one continuous page — the seam is a hairline. Stacked with the gap ramp (15px at 1280, 46px at 3440) they read as a list of separate things. Airy is the same ramp at the airy spacing level, which opens up the inside of every section too.",
				demo: () => {
					["0", "gap", "airy"].forEach(space => {
						heading(space === "0" ? "No gap" : space === "gap" ? "The gap ramp" : "Airy");
						new SectionsStack({ space, bands(){
							[1, 2].forEach(n => new SectionsBand({
								cols: 2, dist: "main-aside", frame: "flush", chrome: "tint", face: "card", stick: "off",
								main: () => { p.c("sections-note", "Section " + n); },
								aside: () => { p.c("sections-note", "aside"); },
							}));
						} });
					});
				},
			});

			/* ── 7 · ALTERNATING ── */
			study({
				idea: "Nothing says every section in a stack has to match. Alternating the column count, the colour and the frame gives a long page a rhythm instead of a drone — and it is the same class every time.",
				demo: () => new SectionsStack({ space: "0", bands(){
					new SectionsBand({ cols: 3, dist: "golden", frame: "flush", chrome: "tint", face: "card", stick: "off",
						side: () => { p.c("sections-note", "three columns"); },
						main: () => { p.c("sections-text", "Flush, tinted frame, white middle."); },
						aside: () => { p.c("sections-note", "flush"); } });
					new SectionsBand({ cols: 2, dist: "golden", frame: "card", chrome: "prim", face: "plain", stick: "off",
						main: () => { p.c("sections-text", "Two columns, a card, an accent frame."); },
						aside: () => { p.c("sections-note", "card"); } });
					new SectionsBand({ cols: 4, dist: "equal", frame: "flush", chrome: "dark", face: "dark", back: "dark", stick: "off",
						side: () => { p.c("sections-note", "four"); },
						main: () => { p.c("sections-text", "Four columns, dark all through."); },
						aside: () => { p.c("sections-note", "columns"); },
						notes: () => { p.c("sections-note", "dark"); } });
				} }),
			});

			/* ── 8 · STICKY SIDES, CONFINED ── the section IS the demonstration ── */
			new SectionsBand({
				cols: 3, dist: "rail-main-aside", frame: "flush", chrome: "tint", face: "card", stick: "on", tall: 1.4,
				axes: ["stick", "dist", "chrome"],

				head: () => { span.c("sections-tile-name", "Sticky sides, confined to their section"); },

				side: () => {
					p.c("sections-text", "This section's middle is much taller than the screen. Scroll it: these two side columns stay with you.");
					p.c("sections-text", "But only while this section is on screen. They cannot leave it — the box that sticks lives inside the column, and a column ends where its section ends. The next section's own sides take over, with nothing watching the scroll.");
					link("/imagine/sections/full/", "the other way: a full screen where the middle scrolls");
				},

				main: () => {
					heading("A middle taller than the screen");
					p.c("sections-text", "Keep scrolling. The two sides hold their place until the bottom of this section reaches them, and then they leave with it.");
					rows(30, "Row");
				},

				foot: () => { span.c("sections-note", "The bottom of the section. Below this line, the next section's sides are the ones that stay."); },
			});

			/* ── 9 · A SIDEBAR TALLER THAN THE SCREEN ── */
			new SectionsBand({
				cols: 3, dist: "rail-main-aside", frame: "flush", chrome: "tint", face: "card", stick: "on", inner: "on", tall: 1.4,
				axes: ["inner", "stick"],

				head: () => { span.c("sections-tile-name", "A sidebar taller than the screen"); },

				side: () => {
					p.c("sections-text", "A sidebar can hold more than a screen of its own. Cap it at one screen, let its body scroll, and pin a footer to the bottom — so the way out is visible however short the screen is.");
					p.c("sections-text", "Turn the sidebar-scroll chip off and this column goes back to being as tall as its content, which on a short screen puts the footer somewhere you cannot reach.");
					for (let i = 1; i <= 12; i++) p.c("sections-note", "Row " + i + " of a list long enough to need its own scrollbar.");
				},

				main: () => {
					heading("Still taller than the screen");
					p.c("sections-text", "Scroll: the pinned footer at the bottom of each side column stays exactly where it is, and the list above it scrolls inside the column.");
					rows(30, "Entry");
				},

				pin: () => { link("/imagine/sections/nav/", "the nav page"); span.c("sections-note", "pinned"); },
			});

			/* ── 10 · A NAV THAT SWITCHES ── */
			new SectionsBand({
				cols: 3, dist: "rail-main-aside", frame: "flush", chrome: "tint", face: "card", stick: "on",
				axes: ["dist", "chrome"],

				head: () => { span.c("sections-tile-name", "A left nav that switches this section's middle — stable"); },

				side(band){
					p.c("sections-text", "Click a name. Only the middle changes: the head, this column, the right column and the foot do not move by one pixel.");
					p.c("sections-text", "Every panel is already in the box, and the ones you are not reading are hidden but still measured — so the box is always as tall as its tallest panel. That is what stable navigation means.");
					band.$nav = new SectionsNav({ band, mode: "switch", label: "Pages", items: [
						{ title: "Overview", draw: () => { heading("Overview"); p.c("sections-text", "One short panel."); } },
						{ title: "Detail",   draw: () => { heading("Detail"); p.c("sections-text", "A taller panel, so you can see that the box does not shrink when you go back to the short one."); tiles(6, "Detail"); } },
						{ title: "Notes",    draw: () => { heading("Notes"); p.c("sections-text", "The shortest panel of the three. The box keeps the tallest one's height."); } },
					] });
				},

				main(band){ band.$nav.panels(); },
			});

			/* ── 11 · A NAV THAT LAUNCHES ── */
			new SectionsBand({
				cols: 3, dist: "rail-main-aside", frame: "flush", chrome: "tint", face: "card", stick: "on",
				axes: ["dist"],

				head: () => { span.c("sections-tile-name", "A left nav that opens a column — dynamic") ; },

				side(band){
					p.c("sections-text", "The same nav, set to launch. Clicking opens a fourth column, and everything already on screen shifts left to pay for it.");
					p.c("sections-text", "It is useful — a detail beside what you were reading, not instead of it. It also moves what you were looking at, which is why it has a different name from the one above.");
					band.$nav = new SectionsNav({ band, mode: "launch", label: "Open", items: [
						{ title: "Open A", draw: () => { heading("A"); p.c("sections-text", "This column did not exist a moment ago."); } },
						{ title: "Open B", draw: () => { heading("B"); p.c("sections-text", "Everything else on the row got narrower to make room."); } },
					] });
				},

				main: () => {
					heading("The middle, unchanged");
					p.c("sections-text", "This panel is the same whichever name you press — what changes is how much room it has.");
					tiles(4, "Item");
				},
			});

			/* ── 12 · TWO NAVS, ONE PAGE ── */
			study({
				idea: "Two sections on one page, each with its own nav. Neither knows the other exists: a nav switches the middle of the section it is in, and stops there. That is the whole answer to whether a page can have more than one.",
				demo: () => {
					["First", "Second"].forEach(which => new SectionsBand({
						cols: 3, dist: "rail-main-aside", frame: "card", chrome: "tint", face: "card", stick: "off",
						head: () => { span.c("sections-tile-name", which + " section"); },
						side(band){
							band.$nav = new SectionsNav({ band, mode: "switch", label: which, items: [
								{ title: which + " · one", draw: () => { p.c("sections-text", which + " section, panel one."); } },
								{ title: which + " · two", draw: () => { p.c("sections-text", which + " section, panel two. The other section did not move."); } },
							] });
						},
						main(band){ band.$nav.panels(); },
						aside: () => { p.c("sections-note", "its own aside"); },
					}));
				},
			});

			/* ── THE WAY ON ── */
			new SectionsBand({
				cols: 2, dist: "main-aside", frame: "flush", chrome: "tint", face: "plain", stick: "off",
				head: () => { span.c("sections-tile-name", "Three more pages"); },
				main: () => { page.previews(); },
				aside: () => {
					p.c("sections-note", "The same class, three ways: filling a screen, repeating down a page, and carrying navigation.");
					link("/imagine/layouts/", "the numbered layouts this came from");
					link("/imagine/paging/", "the paging realm's own words");
				},
			});

		} });
	},
});
