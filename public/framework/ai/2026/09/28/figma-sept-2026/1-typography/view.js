import { View, div, span, h1, h2, h3, h4, p, a } from "/app.js";
import { compare } from "../compare.js";

View.stylesheet(import.meta, "view.css");

// The "Typography" section of the Figma "Sept 2026" frame, drawn as live site
// markup — same headings, same body copy, same three links — inside the one
// rounded darken panel every section sits in. The Figma png sits BELOW the
// panel, outside it, for comparison (drawn by the shared `compare()` helper).
export default class Default extends View {

	render(){
		div.c("figma-typo", () => {
			div.c("figma-typo-panel darken-1", () => {
				span.c("figma-typo-chip", "TYPOGRAPHY");

				h1("Heading One");
				h2("Heading Two");
				h3("Heading Three");
				h4("Heading four");

				p("Body text uses the scheme text color, adapting across Light, Dark, Prime, and PrimeInvert without any manual overrides.");

				div.c("figma-typo-links flex", () => {
					a.c("figma-typo-link", "Learn more").href("#");
					a.c("figma-typo-link", "Documentation").href("#");
					a.c("figma-typo-link", "Get started").href("#");
				});
			});
		});

		compare(new URL("figma.png", import.meta.url).href, "Figma: Typography section");
	}
}
