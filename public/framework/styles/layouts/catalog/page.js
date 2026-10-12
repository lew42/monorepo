import { Page, View, div, md, h2, a, img } from "/app.js";
import LayoutCatalog from "./LayoutCatalog.js";

View.stylesheet(import.meta, "catalog.css");

const census = await fetch(new URL("census.json", import.meta.url)).then(r => r.json()).catch(() => ({ counts: {} }));
const shot = name => new URL(`shots/${name}.jpg`, import.meta.url).href;

/* One card per layout: the picture, its score, how many pages use it, what it suits, when not to.
   Ranked best first. How to choose: doc/matching.md. */
export default new Page({
	meta: import.meta,
	title: "Layout catalog",
	icon: "view_quilt",
	description: "Every layout we ship, ranked, with how many pages use it and what content it suits.",

	content(){
		md("Find your content below, then use the layout beside it. Each picture is the live page (click it); the count is how many of our pages build with it, counted by `census.mjs`. Short version: [content → layout](/framework/styles/layouts/catalog/doc/matching.md).");

		div.c("wall wide catalog-wall", () => {
			[...LayoutCatalog.entries].sort((x, y) => y.score - x.score).forEach(e => {
				div.c("card flow catalog-card", () => {
					a.c("catalog-shot", () => img().attr("src", shot(e.name)).attr("alt", e.title).attr("loading", "lazy")).href(e.demo);
					h2.c("h4", e.title);
					md(`${e.score}/5 · used by ${census.counts?.[e.census] ?? 0} pages · \`${e.words}\``);
					md(e.why);
					md(`**Suits:** ${e.suits}`);
					md(`**Not for:** ${e.avoid}`);
				});
			});
		}).style({ "--column": "22em" });
	},
});
