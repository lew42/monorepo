import { div, p, h1 } from "/app.js";
import { section, eyebrow, cta } from "./parts.js";

/* Masthead, filled. A band that bleeds, a measure inside it, and the two
 * utilities that do all the work: `flow` for the rhythm, `flex gap` for the
 * button row. No stylesheet. */
export default tone => {
	section(tone ?? "dark", () => {
		eyebrow("NO BUILD STEP");

		p.c("h1", "A framework you can read");

		p("Native ES modules, served as-is. Open the source of any page on this site and it is the source that shipped.");

		div.c("flex gap wrap", () => {
			cta("Get started", "prim");
			cta("Read the docs");
		});
	});
};
