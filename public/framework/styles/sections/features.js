import { div, p } from "/app.js";
import { section, feature, eyebrow } from "./parts.js";

/* Cards, filled. `grid gap auto` inside a measured band — the wall re-counts
 * itself at every width and the section around it never has to know. */
export default tone => {
	section(tone ?? "surface", () => {
		eyebrow("WHY");

		p.c("h2", "Three things, and no fourth");

		div.c("grid gap auto", () => {
			feature("bolt",     "No build",     "Everything in public/ is served as-is and runs as native modules.");
			feature("link",     "Real urls",    "Import paths are URLs. A page is a folder with a page.js in it.");
			feature("palette",  "Four layers",  "base, theme, site, util — and a rule that says which one you are in.");
		});
	}).style("--section", "62em");
};
