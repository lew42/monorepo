import { div, p } from "/app.js";
import { band } from "./tone.js";

/* Dashboard, filled. The same `grid gap auto`, retuned with one token — which is
 * the finding the Dashboard layout page is about. */
const stat = (label, value) =>
	div.c("pad flex v", () => {
		p.c("h4 muted", label);
		p.c("h1", value);
	}).style("gap", "0.1em");

export default (tone = "prim") =>
	div.c("section-band", () =>
		div.c("measure flex v gap", () => {
			p.c("h4", "BY THE NUMBERS").style("color", "var(--eyebrow, var(--prim))");

			div.c("grid gap auto", () => {
				stat("npm dependencies", "3");
				stat("of them in the browser", "0");
				stat("build steps", "0");
				stat("stylesheets a component needs", "0");
			}).style("--column", "9em");
		}).style("--measure", "52em")
	).style(band(tone));
