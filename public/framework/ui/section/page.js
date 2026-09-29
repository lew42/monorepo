import { Page, md, p, div, span } from "/app.js";
import { section } from "./section.js";

export default new Page({
	meta: import.meta,
	title: "Section",
	description: "A subtle wrapper that shows its own class names on hover, so browsing the site teaches the class vocabulary.",
	icon: "crop_free",

	content(){

		p("`section(classes, build)` draws a subtle 1px border around a chunk of a page. Hover it and its own class names appear in the corner — so as you browse the site, you're learning what `.bleed`, `.flex` and `.grid` actually look like. Hover each section below.");

		// 1. A full-bleed band — label top-left (the default).
		section("bleed", () => {
			div.c("flex wrap gap", () => {
				span.c("ui-pill h4", "Full width");
				span.c("ui-pill h4", "no side margin");
			});
		});

		// 2. A flex-wrap row of cards — label bottom-right this time.
		section("flex wrap gap ui-section-br", () => {
			["First", "Second", "Third"].forEach(label =>
				div.c("surface pad", () => p(label)));
		});

		// 3. A catalog-style grid — framework.css's own `.grid.auto` (auto-fit columns).
		section("grid auto gap", () => {
			["Alpha", "Beta", "Gamma", "Delta"].forEach(label =>
				div.c("surface pad", () => p(label)));
		}).style("--column", "10em");

		// 4. Plain prose, `.flow` rhythm — two classes, so the label reads both.
		section("flow ui-section-br", () => {
			p("A plain paragraph, flowing with the next one at the page's normal rhythm.");
			p("This section carries two classes — `.flow` and `.ui-section-br` — so its label reads both, in the bottom-right corner instead of the default top-left.");
		});

		md.details(import.meta, "readme.md", "Readme, and doc/decisions.md for the full record");
	},

	preview(nav){
		return this.preview_card(nav, () => div.c("zoom-50 pad", () =>
			section("bleed flex", () => span.c("h4", "hover me"))));
	},
});
