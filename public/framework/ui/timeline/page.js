import { Page, md, demo, div, code } from "/app.js";
import { timeline } from "./timeline.js";

const RELEASES = [
	["Aug 2026", "The sheet is the default", "A region hands every page the reading measure. `papers` retired."],
	["Jul 2026", "One flow token", "`--flow: 2em`, one em token in place of four, so an area's rhythm scales."],
	["Jun 2026", "The Pager tier died", "An arrangement is a class a page opts into. Four core classes left."],
];

const releases = () => timeline(
	["Aug 2026", "The sheet is the default", "A region hands every page the reading measure."],
	["Jul 2026", "One flow token", "`--flow: 2em`, one em token in place of four."],
	["Jun 2026", "The Pager tier died", "An arrangement is a class a page opts into."]);

const single = () => timeline(RELEASES[0]);

export default new Page({
	meta: import.meta,
	title: "Timeline",
	description: "Releases down a rail — one of three components that kept its function.",
	icon: "timeline",
	card: "tall",

	children: [
		demo.page("single", single, {
			note: "**The run has to stop** — a line trailing off below the final entry reads as a loading state, and with one entry the whole rail is that case. It used to be an index compared against `items.length`, a `last` flag and a class; it is now two `:last-child` rules, because *which row is last* is a question the DOM can answer." }),
	],

	content(){

		demo.exhibit({
			page: this,
			stage: steer => demo.stage(releases, steer).ac("bleed"),
			def: releases,
			file: new URL("timeline.js", import.meta.url).pathname,
			note: "`[when, what, note]` triples. Three flex columns per row — the date, the rail, the entry — and the connecting line is the inline-start border of an empty `flex-1` div sitting under each dot.",
		});

		md("## The line, without a pseudo-element");

		code.js(`div.c("flex v v-center", () => {
    span.c("ui-timeline-dot");
    div.c("ui-timeline-line flex-1");
});`);

		md("The reflex is `::before` with `position: absolute`, and that needs a selector twice over — a pseudo-element cannot be reached from an inline style, and positioning is a *relationship* between two elements ([the line this library draws](/framework/ui/tooltip/)). A zero-width box with one border is the same hairline, in the flow, owned by the row that draws it.");

		md("`flex-1` is what makes it reach: the dot is `flex: 0 0 auto`, so the empty box takes every pixel of row height left over.");

		md("```css\n.ui-timeline-row:last-child .ui-timeline-line { border: none; }\n.ui-timeline-row:last-child .ui-timeline-entry { padding-bottom: 0; }\n```");

		md("On a column, `v-center` centres *horizontally* — `align-items` is the cross axis, and `flex v` swaps which axis that is. It is what puts the dots and the line on one axis, and it is the trap that reads as broken twice a year.");

		md("## The colours are derived, not named");

		md("```css\n.ui-timeline-dot { background: var(--eyebrow, var(--prim)); }\n.ui-timeline-line { border-inline-start: 1px solid color-mix(in srgb, currentColor 25%, transparent); }\n```");

		md("This component lands on more than one surface — a changelog band can be any of four tones — and a fixed `--subtle` measured **1.06:1** on the accent one. `--eyebrow` is a band's own safe accent, handed down by whatever drew the band; off a band it falls back to `--prim`. The line and the muted text derive from `currentColor`, which has already been chosen to contrast with what is behind it.");

		md("Next: [Keys](/framework/ui/kbd/) — the one element the base theme half-styles.");
	},

	preview(nav){ return this.preview_card(nav, () => div.c("zoom-50 pad", () => timeline(...RELEASES))); },
});
