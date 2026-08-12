import { div, p, button } from "/app.js";
import { band } from "./tone.js";

export default (tone = "prim") =>
	div.c("section-band", () =>
		div.c("measure flex gap wrap v-center split", () => {

			div.c("flex v", () => {
				p.c("h2", "Three dependencies. None of them ship.");
				p.c("muted", "Clone it, open it, read it.");
			}).style("gap", "0.35em");

			div.c("flex gap wrap", () => {
				button("Read the docs");
				button.c("bg", "Source");
			});

		}).style("--measure", "62em")
	).style(band(tone));
