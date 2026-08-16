import { div, span, h1, h2, p, button, icon } from "/app.js";

/**
 * web(config) — one fictional site's content, as parts. Every layout in this
 * directory renders the SAME object, so the only thing that differs between two
 * of these pages is where the boxes go.
 *
 *     import { site } from "../web.js";
 *     layout(){ site.topbar(); site.hero(); site.sections(4); site.footer(); }
 *
 * `site` is the one shared instance, imported by every layout page here. A variant
 * parameterises instead of copying: `web({ topics: "…" })`.
 */
export function web(config){
	const site = {
		title: "Aurora",
		tagline: "one structure, many layouts",

		/* ⚠ Short on purpose. A page's height at 390 is what sets the two-up's, and
		   the same words stack four times taller there than at 3440 — every extra
		   sentence costs the stage roughly four of its own lines. */
		blurb: "Every card in the rail draws this same content object. What changes between two of these pages is where the boxes go.",
		nav: "Product Docs Pricing Changelog",
		topics: "Overview Layout Type Colour Motion Tokens Icons Forms",
		...config,
	};

	const words = key => site[key].split(" ");

	return Object.assign(site, {

		brand: () => div.c("flex gap v-center", () => {
			icon("auto_awesome");
			span.c("h4", site.title.toUpperCase());
		}).style("--gap", "0.4em"),

		topbar: () => div.c("flex gap wrap v-center split pad wash", () => {
			site.brand();
			div.c("flex gap wrap v-center", () => words("nav").forEach(word => span.c("muted", word)))
				.style("--gap", "1.1em");
			button.c("prim", "Get " + site.title);
		}),

		menu: () => div.c("flex v gap", () => words("topics").forEach((word, i) =>
			div.c("flex gap v-center pad", () => { icon("chevron_right"); span(word); })
				.ac(i === 0 && "wash")
				.style({ "--pad": "0.35em 0.7em", "--gap": "0.4em", borderRadius: "var(--radius)" })))
			.style("--gap", "0.1em"),

		hero: () => div.c("flex v gap pad", () => {
			span.c("h4 muted", site.title.toUpperCase() + " 3.0");
			h1(site.title + " — " + site.tagline);
			p(site.blurb).style("max-width", "34em");
			div.c("flex gap wrap", () => { button.c("prim", "Start"); button("Read the docs"); });
		}).style({ "--gap": "0.9em", "--pad": "3em 2em" }),

		sections: (count = 4, sticky) => words("topics").slice(0, count).forEach(word =>
			div.c("flex v gap", () => {
				h2(word).style(sticky ? { position: "sticky", top: "0", background: "var(--surface)" } : {});
				p(site.blurb);
			}).style("--gap", "0.6em")),

		toc: () => div.c("flex v gap", () => {
			span.c("h4 muted", "ON THIS PAGE");
			words("topics").forEach((word, i) => span(word).ac(i > 0 && "muted"));
		}).style("--gap", "0.3em"),

		cards: (count = 6, column = "12em") => div.c("grid gap auto", () => times(count, i =>
			div.c("surface pad flex v gap", () => {
				span.c("h4 muted", words("topics")[i % 8]);
				span.c("h2", String(137 * (i + 1)));
				div.c("wash").style({ height: "0.5em", borderRadius: "var(--radius)" });
			}).style("--gap", "0.35em"))).style({ "--column": column, "--gap": "0.8em" }),

		rows: (count = 8) => div.c("flex v", () => times(count, i =>
			div.c("flex gap v-center pad", () => {
				div.c("wash").style({ flex: "0 0 auto", width: "1.9em", height: "1.9em", borderRadius: "50%" });
				div.c("flex v flex-1", () => {
					span.c("h4", words("topics")[i % 8]);
					span.c("muted", site.blurb.slice(0, 52) + "…");
				});
			}).ac(i === 0 && "wash").style({ "--pad": "0.6em 0.9em", borderBottom: "1px solid var(--line)" }))),

		tiles: (count = 12, column = "8em") => div.c("grid gap auto", () => times(count, i =>
			div.c("wash").style({ aspectRatio: i % 5 === 0 ? "1" : "4 / 3", borderRadius: "var(--radius)" })))
			.style({ "--column": column, "--gap": "0.5em" }),

		/* The one RAGGED part, and the only reason it exists: every other part here is
		   uniform by design, and a masonry wall of uniform children is a grid with extra
		   steps. Bare, like `sections()` — the WALL is the caller's class string.
		   ⚠ A fixed cycle, never random: two panes of a twin card render this twice, and
		     a wall that reshuffles per render cannot be compared between two widths. */
		notes: (count = 14) => times(count, i =>
			div.c("surface pad flex v gap", () => {
				span.c("h4 muted", words("topics")[i % 8]);
				p(site.blurb.slice(0, LENGTHS[i % LENGTHS.length]) + "…");
			}).style({ "--gap": "0.35em", "--pad": "0.9em" })),

		toolbar: () => div.c("flex gap wrap v-center pad wash", () => {
			"search filter_list sort swap_vert tune".split(" ").forEach(name => button(() => icon(name)));
			span.c("muted", words("topics")[1]);
		}).style({ "--gap": "0.4em", "--pad": "0.5em 0.9em" }),

		footer: () => div.c("flex gap wrap split pad wash", () => {
			site.brand();
			div.c("flex gap wrap", () => ["Product", "Company", "Legal"].forEach(head =>
				div.c("flex v gap", () => {
					span.c("h4", head);
					words("nav").slice(0, 3).forEach(word => span.c("muted", word));
				}).style("--gap", "0.2em"))).style("--gap", "2.5em");
		}).style("--pad", "2em"),
	});
}

const times = (count, fn) => { for (let i = 0; i < count; i++) fn(i); };

// How far into `blurb` each note reads. Eight values, coprime with the 8 topics only
// by accident — what matters is that the tallest is ~5× the shortest, which is the
// ratio where a masonry wall stops looking like a grid that failed.
const LENGTHS = [38, 124, 71, 205, 52, 96, 158, 29];

export const site = web();
export default web;
