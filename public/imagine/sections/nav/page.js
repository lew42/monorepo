import { Page, span, p } from "/app.js";
import { SectionsBand, SectionsStack, SectionsNav, heading, tiles, link } from "../sections.js";

/* ── layout, answered before the first factory call ────────────────────────────
   1 CONTAINER  a column in /imagine/'s columns host; content lands in column prose.
   2 SIZE       `fill` — the leftover of the row.
   3 OWN LAYOUT one `.sections-stack`: a lead section that shows the two behaviours
                side by side, then four tall sections that each carry their own nav.
   4 REGIONS    one.
   5 PREVIEW    core's card on the sections hub.

   THE QUESTION, ANSWERED BY DOING IT. Can a section have a left sidebar nav? Yes.
   Can a page have several sections, each with one? Yes — and the reason is that a nav
   only ever touches the section it is in. What differs is what a click DOES, and there
   are exactly two answers (the 2026-09-05 stable/dynamic ruling):

     SWITCH  the middle changes and nothing else moves. Stable.
     LAUNCH  a new column opens and everything shifts left. Dynamic.               */

const panel = (title, body, many = 0) => ({ title, draw(){
	heading(title);
	p.c("sections-text", body);
	if (many) tiles(many, "Item");
} });

export default new Page({
	meta: import.meta,
	title: "Sections with nav",
	description: "A nav per section: switch the middle, or open a column.",
	icon: "alt_route",
	width: "fill",

	content(){
		new SectionsStack({ classes: "bleed", space: "gap", bands(){

			/* ── THE TWO BEHAVIOURS, SIDE BY SIDE ── */
			/* The pair is a TWO-column section, so each half is wide enough to be a
			   three-column section of its own at 1920 and up. Below that the halves
			   stack, and so do the sections inside them — the honest result, and the
			   one the reader on a narrow screen should see. */
			new SectionsBand({
				cols: 2, dist: "equal", frame: "flush", chrome: "tint", face: "plain", back: "plain", stick: "off",

				head: () => {
					span.c("sections-tile-name", "The two things a nav can do");
					link("/imagine/sections/", "back to the sections hub", "arrow_back");
				},

				// SWITCH, the left half.
				main: () => new SectionsBand({
					cols: 3, dist: "rail-main-aside", frame: "card", chrome: "tint", face: "card", stick: "off",
					head: () => { span.c("sections-tile-name", "Switch — stable"); },
					side(band){
						p.c("sections-text", "Clicking changes the middle and nothing else.");
						band.$nav = new SectionsNav({ band, mode: "switch", label: "Pages", items: [
							panel("Short", "One line."),
							panel("Tall", "Taller — so you can watch the box NOT shrink when you go back to the short one.", 4),
						] });
					},
					main(band){ band.$nav.panels(); },
					aside: () => { p.c("sections-note", "Nothing in this section moves."); },
				}),

				// LAUNCH, the right half.
				aside: () => new SectionsBand({
					cols: 3, dist: "rail-main-aside", frame: "card", chrome: "prim", face: "card", stick: "off",
					head: () => { span.c("sections-tile-name", "Launch — dynamic"); },
					side(band){
						p.c("sections-text", "Clicking opens a new column, and everything on screen gets narrower to pay for it.");
						band.$nav = new SectionsNav({ band, mode: "launch", label: "Open", items: [
							panel("Open A", "This column did not exist a moment ago."),
							panel("Open B", "And the rest of the section got narrower."),
						] });
					},
					main: () => { heading("The middle"); p.c("sections-text", "The same panel either way — what changes is how much room it has."); },
					aside: () => { p.c("sections-note", "This column moved."); },
				}),

				foot: () => {
					span.c("sections-note", "A nav only ever touches the section it is in — which is the whole answer to whether a page can have several. Below: four more sections on this page, each with its own.");
				},
			});

			/* ── FOUR SECTIONS, EACH WITH ITS OWN NAV ── */
			[
				{ n: 1, mode: "switch", chrome: "tint",  say: "A tall section with a left nav. Scroll: the nav stays with you, because it sticks — and it stops at the bottom of this section." },
				{ n: 2, mode: "switch", chrome: "plain", say: "The second section's nav knows nothing about the first one's. It switches this middle and no other." },
				{ n: 3, mode: "launch", chrome: "prim",  say: "The third launches a column instead. Press a name and this section grows a fourth column; the sections above and below do not change at all." },
				{ n: 4, mode: "switch", chrome: "dark",  say: "The fourth, on a dark frame. Same nav, same class, one colour word apart." },
			].forEach(entry => new SectionsBand({
				cols: 3, dist: "rail-main-aside", frame: "flush",
				chrome: entry.chrome, face: "card", stick: "on", tall: 1,
				axes: ["stick", "dist"],

				head: () => { span.c("sections-tile-name", "Section " + entry.n + " — its own nav (" + entry.mode + ")"); },

				side(band){
					p.c("sections-text", entry.say);
					band.$nav = new SectionsNav({ band, mode: entry.mode, label: "Section " + entry.n, items: [
						panel("Overview", "Section " + entry.n + ", first panel.", 3),
						panel("Detail", "Section " + entry.n + ", second panel — a taller one.", 9),
						panel("Notes", "Section " + entry.n + ", third panel."),
					] });
				},

				main(band){ if (entry.mode === "switch") return void band.$nav.panels(); heading("Section " + entry.n); p.c("sections-text", "Press a name on the left and a fourth column opens beside this one."); tiles(6, "Item"); },

				foot: () => { span.c("sections-note", "End of section " + entry.n + ". The next section's nav takes over here."); },
			}));

		} });
	},
});
