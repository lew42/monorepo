import { Page, span, p } from "/app.js";
import { SectionsBand, SectionsStack, SectionsNav, heading, tiles, link } from "../sections.js";

/* ── layout, answered before the first factory call ────────────────────────────
   1 CONTAINER  a column in /imagine/'s columns host — and a `full` one, so it takes
                the whole row and the columns behind it collapse into the crumb strip.
   2 SIZE       the whole screen at every width. The band is exactly as tall as the
                box that scrolls (`--sections-screen`, measured by the band), so the
                page itself never scrolls.
   3 OWN LAYOUT ONE section, and it is the page: head / side · main · aside / foot.
   4 REGIONS    one.
   5 PREVIEW    core's card on the sections hub.

   THE OWNER'S DISTINCTION, SHOWN. The hub stacks sections and the PAGE scrolls: the
   sides stay while their own section is on screen. Here the same class is one screen,
   and the MIDDLE scrolls: the sides never move at all, because there is nothing for
   them to move with. One class, two behaviours, and the only difference is whether
   the section is as tall as the screen or taller than it. */

export default new Page({
	meta: import.meta,
	title: "As one full screen",
	description: "The same section, sized to the screen: the middle scrolls.",
	icon: "fullscreen",
	width: "full",

	content(){
		const items = [
			{ title: "Overview", draw(){
				heading("Overview");
				p.c("sections-text", "This panel is inside the middle column, and the middle column is the only box on this page with a scrollbar. Scroll it: the head, both sides and the foot do not move, because they are not in the scrolling box.");
				p.c("sections-text", "On the hub, the same three columns are taller than the screen and the PAGE scrolls, so the sides stick and then hand over to the next section's. Here there is no next section — the screen is the section.");
				tiles(12, "Card");
			} },
			{ title: "A long one", draw(){
				heading("A long one");
				p.c("sections-text", "Long enough to need the scrollbar. Everything around it stays put while you read.");
				for (let i = 1; i <= 20; i++) p.c("sections-text", "Paragraph " + i + ". The middle is the only thing moving.");
			} },
			{ title: "A short one", draw(){
				heading("A short one");
				p.c("sections-text", "Nothing to scroll. The layout is identical — a full-screen section does not change shape for its content.");
			} },
		];

		new SectionsStack({ classes: "bleed", space: "0", bands(){

			new SectionsBand({
				classes: "sections-screen",
				cols: 3, dist: "rail-main-aside", frame: "flush", chrome: "tint", face: "card", stick: "off",
				axes: ["dist", "chrome", "face"],

				head: () => {
					span.c("sections-tile-name", "One section, sized to the screen");
					link("/imagine/sections/", "back to the stack, where the page scrolls instead", "arrow_back");
				},

				side(band){
					p.c("sections-text", "A left nav that switches the middle. Head, sides and foot are fixed to the screen; only the middle moves.");
					band.$nav = new SectionsNav({ band, mode: "switch", label: "Pages", items });
				},

				main(band){ band.$nav.panels(); },

				aside(band){
					p.c("sections-text", "This column is fixed to the screen too. On a page that scrolls it would be sticky instead — the same three columns, one word apart.");
					band.controls();
				},

				foot: () => { span.c("sections-note", "The foot of a full-screen section is the bottom of the window, always."); },
			});

		} });
	},
});
