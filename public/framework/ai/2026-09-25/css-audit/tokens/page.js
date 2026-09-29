import { Page, md, p } from "/app.js";

/* ── layout ── 1 CONTAINER a child of the css-audit page. 2 SIZE prose at measure, chart + grid wide.
   3 OWN LAYOUT the sentence, the chart, the grid. 4 REGIONS none. 5 PREVIEW core default card.
   ⚠ No template literals in this file — plain strings only (one backtick kills the page). */

const BASE = "/framework/ai/2026-09-25/css-audit/tokens/";
const NAMES = ["now", "A", "B", "C"];
const ROWS = [
	["AI 2", "ai2", 1280], ["AI 2", "ai2", 1920], ["AI 2", "ai2", 3440],
	["A doc page", "doc", 1280], ["A doc page", "doc", 1920], ["A doc page", "doc", 3440],
	["/framework/", "fw", 1280], ["/framework/", "fw", 1920], ["/framework/", "fw", 3440],
];
/* Measured with Playwright (css-curves-probe): the padding of the page region in px. */
const PADS = {
	now: [15, 25.7, 62.1, 15, 25.7, 62.1, 16.7, 32.3, 69.6],
	A: [26, 41.6, 64, 26, 41.6, 64, 32, 48, 64],
	B: [28.5, 36, 53.8, 28.5, 36, 53.8, 31.4, 39, 56],
	C: [33.3, 53.2, 80, 33.3, 53.2, 80, 41, 61.4, 80],
};

export default new Page({
	meta: import.meta,
	title: "Padding curves",
	description: "Four candidate --pad curves on real pages at 1280, 1920 and 3440 — the current one and three that scale with the column.",
	icon: "space_bar",

	content(){
		p("Today's padding (now) grows with a percentage of the box around it, so it sits at its 1em floor until about 1290px and only reaches its 4em ceiling near 3140px. Each candidate below makes every column a container and grows with that container's own width instead, so padding scales as you resize. The floor is the smallest padding a narrow box gets; the ceiling stops a very wide one from wasting the screen.");

		md("![Pad in px against container width for the four curves](" + BASE + "chart.svg)").ac("wide");

		md([
			"| | curve | in one line |",
			"| --- | --- | --- |",
			"| now | clamp(1em, 2.6% - 1.1em, 4em) | Pinned at 16px below ~1290px, ramps late and steeply; a card inside a column never leaves the floor. |",
			"| A | clamp(1rem, 2.5cqi, 4rem) | Pure proportion: 2.5% of the column, floored at 16px, capped at 64px at 2560px. One number to remember. |",
			"| B | clamp(1rem, 1rem + 1.2cqi, 3.5rem) | A 16px base plus a gentle slope: never cramped, and grows slowest, so a wide screen stays calm. |",
			"| C | clamp(0.75rem, 3.2cqi, 5rem) | Bold: a 12px floor for tight rails and cards, and generous 80px on ultra-wide. |",
		].join("\n")).ac("wide");

		const head = "| page · window | now | A | B | C |\n| --- | --- | --- | --- | --- |\n";
		md(head + ROWS.map((r, i) => {
			const cells = NAMES.map(n => {
				const v = PADS[n][i];
				return "[![" + r[0] + " " + r[2] + " " + n + "](" + BASE + "shots/" + r[1] + "-" + r[2] + "-" + n + ".png)](" + BASE + "shots/" + r[1] + "-" + r[2] + "-" + n + ".png)<br>" + (v == null ? "" : "**" + v + "px**");
			});
			return "| " + r[0] + " · " + r[2] + " | " + cells.join(" | ") + " |";
		}).join("\n")).ac("wide");

		p.c("muted", "Test only: each shot injects container-type: inline-size on the page's parent, cards and surfaces plus the candidate --pad through a throwaway stylesheet. framework.css is unchanged. Real containers are a trap on the site: container-type makes a box the containing block for position: fixed children, which is why Page.css avoids it on .page (see the padding audit).");
	},
});
