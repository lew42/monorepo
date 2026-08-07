import { div, p } from "/app.js";
import { section, price, eyebrow } from "./parts.js";

/* Split, filled. `flex gap auto` gives both panes an equal basis, so they are
 * equal — and when two no longer fit they stack, with no breakpoint written. */
export default tone => {
	section(tone ?? "wash", () => {
		eyebrow("PRICING");

		p.c("h2", "Two panes that stack themselves");

		div.c("flex gap auto", () => {
			price("Free",  "$0",  "Every layout", "Every component", "The whole source");
			price("Pro",   "$0",  "All of the above", "Read it twice", "Still no build step");
		});
	}).style("--section", "52em");
};
