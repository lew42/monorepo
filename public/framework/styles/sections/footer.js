import { div, a, p, span } from "/app.js";
import { section } from "./parts.js";

/* Holy grail's bottom band, on its own: `flex wrap split` puts the mark at one
 * end and the links at the other, and wraps them into a column when the row
 * runs out — the same rule doing both jobs. */
export default tone => {
	section(tone ?? "dark", () => {
		div.c("flex gap wrap split v-center", () => {
			span.c("h3", "LEW42");

			div.c("flex gap wrap", () => {
				["Framework", "Layouts", "Components", "Source"].forEach(t =>
					a.c("page-link", t).href("#"));
			});
		});

		p.c("muted", "Built with the thing it documents.");
	}).style("--section", "62em");
};
