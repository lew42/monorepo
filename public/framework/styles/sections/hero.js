import { div, p, button } from "/app.js";
import { band } from "./tone.js";

/* Masthead, filled. A band that bleeds, a measure inside it, and the utilities that
 * do all the work: `.measure` for the column, the column's own `gap` for the
 * rhythm, `flex gap wrap` for the button row. No stylesheet, and no helper — what
 * you read here is the whole of what it builds. */
export default (tone = "dark") =>
	div.c("section-band", () =>
		div.c("measure flex v gap", () => {
			p.c("h4", "NO BUILD STEP").style("color", "var(--eyebrow, var(--prim))");

			p.c("h1", "A framework you can read");

			p("Native ES modules, served as-is. Open the source of any page on this site and it is the source that shipped.");

			div.c("flex gap wrap", () => {
				button.c("prim", "Get started");
				button("Read the docs");
			});
		})
	).style(band(tone));
