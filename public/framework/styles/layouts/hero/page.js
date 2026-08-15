import { Page, demo, div, span, h2, p, icon } from "/app.js";
import { site } from "../web.js";

/* The Figma names the same band three times — "Hero — Full Bleed" at 1920,
   "Stacked Hero" at 800, "Mobile Hero Sizing" at 400. Here it is one row. */
const FEATURES = [
	["Density", "Scales across screen densities on one max-width constraint and no query."],
	["Alignment", "Nested safety grids keep every band on the one left edge the page declares."],
	["Fallback", "A track that runs out re-counts its own columns instead of stacking blind."],
];

export default new Page(demo.layout({
	meta: import.meta,
	title: "Hero",
	description: "Copy beside a picture that becomes a picture over copy — one row, and the breakpoint is a consequence.",
	icon: "wallpaper",
	group: "Pages",

	twin: true,
	parts: "header media features footer",

	note: "**`flex reverse wrap` is the whole responsive hero.** `row-reverse` puts the media on the *right* of a single line; when the line wraps it is the *first* line, so the picture lands above the copy. Those are the two drawings a design file files separately at 1920 and at 800, and here they are one class string with nothing between them.",

	layout(){

		return div.c("page full fill flex v", () => {

			if (this.shows("header")) site.topbar();

			div.c("flex-1", () => {

				/* ⚠ The media is FIRST in source: `reverse` is what puts it on the
				   right of one line and on top of two. */
				div.c("flex reverse wrap gap v-center pad", () => {

					if (this.shows("media"))
						div.c("wash flex v-center h-center", () => icon("image"))
							.style({ flex: "1 1 20em", alignSelf: "stretch", minHeight: "13em", borderRadius: "var(--radius)" });

					site.hero().style({ flex: "1 1 24em", "--pad": "1.5em 0" });

				}).style({ "--gap": "1.5em", "--pad": "1.5em clamp(1em, 3%, 3.5em)" });

				if (this.shows("features"))
					div.c("flex v gap pad wash", () => {
						/* Capped but NOT centred, so the intro shares the grid's left edge.
						   `.measure` is the class for a capped column and it hardcodes
						   `margin-inline: auto`, which is the wrong half of it here. */
						div.c("flex v gap", () => {
							h2("Engineered for system designers");
							p("Maintain one source of truth that maps from a design configuration to clean web code.");
						}).style({ "--gap": "0.4em", maxWidth: "34em" });

						div.c("grid gap auto", () => FEATURES.forEach(([name, blurb], i) =>
							div.c("flex v gap", () => {
								span.c("h4 muted", "0" + (i + 1));
								span.c("h3", name);
								span.c("muted", blurb);
							}).style("--gap", "0.3em"))).style("--column", "22em");

					}).style({ "--gap": "1.6em", "--pad": "2.5em clamp(1em, 3%, 3.5em)" });

			}).style({ minHeight: "0", overflowY: "auto" });

			if (this.shows("footer")) site.footer();
		});
	},
}));
