import { div, p, span } from "/app.js";
import { band } from "./tone.js";

/* A logo wall with no logo files: wordmarks in the type scale, dimmed with the
 * band's own ink. A real site drops <img class="icon"> into the same row — the
 * `flex gap wrap v-center h-center` is the whole layout either way. */
const MARKS = ["ACME", "north&co", "HEXAGON", "plainly", "OKTOPUS", "vellum"];

export default (tone = "wash") =>
	div.c("section-band", () =>
		div.c("measure flex v gap", () => {
			p.c("h4", "RUNNING ON IT")
				.style({ color: "var(--eyebrow, var(--prim))", textAlign: "center" });

			span.c("flex gap wrap v-center h-center", () => MARKS.forEach(mark =>
				span.c("h3 muted", mark)))
				.style("--gap", "1em 2.5em");
		}).style("--measure", "62em")
	).style(band(tone));
