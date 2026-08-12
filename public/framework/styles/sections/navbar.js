import { div, a, span, button } from "/app.js";
import { band } from "./tone.js";

export default (tone = "surface") =>
	div.c("section-band", () =>
		div.c("measure flex gap wrap v-center split", () => {
			span.c("h3", "LEW42");

			div.c("flex gap wrap v-center", () => {
				["Docs", "Layouts", "Components", "Source"].forEach(t =>
					a.c("page-link", t).href("#").style({ textDecoration: "none" }));

				button.c("prim", "Get started");
			});
		}).style("--measure", "72em")
	).style({ ...band(tone), padding: "1em 2em" });
