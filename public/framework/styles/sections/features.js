import { div, p, icon } from "/app.js";
import { band } from "./tone.js";

/* Cards, filled. `grid gap auto` inside a measured band — the wall re-counts
 * itself at every width and the section around it never has to know.
 *
 * ⚠ `pad flex v` + a small gap, never `pad flow`: flow's `* + h3` gap resolves
 * against the h3's own font-size, which sat a card title 72px under its icon. */
const feature = (glyph, heading, body) =>
	div.c("pad flex v surface", () => {
		icon(glyph);
		p.c("h3", heading);
		p.c("muted", body);
	}).style("gap", "0.5em");

export default (tone = "surface") =>
	div.c("section-band", () =>
		div.c("measure flex v gap", () => {
			p.c("h4", "WHY").style("color", "var(--eyebrow, var(--prim))");

			p.c("h2", "Three things, and no fourth");

			div.c("grid gap auto", () => {
				feature("bolt",    "No build",   "Everything in public/ is served as-is and runs as native modules.");
				feature("link",    "Real urls",  "Import paths are URLs. A page is a folder with a page.js in it.");
				feature("palette", "Four layers", "base, theme, site, util — and a rule that says which one you are in.");
			});
		}).style("--measure", "62em")
	).style(band(tone));
