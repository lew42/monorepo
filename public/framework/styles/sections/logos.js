import { span } from "/app.js";
import { section, eyebrow, muted } from "./parts.js";

/* A logo wall with no logo files: wordmarks in the type scale, dimmed with the
 * band's own ink. A real site drops <img class="icon"> into the same row — the
 * `flex gap wrap v-center h-center` is the whole layout either way. */
const MARKS = ["ACME", "north&co", "HEXAGON", "plainly", "OKTOPUS", "vellum"];

export default tone => section(tone ?? "wash", () => {
	eyebrow("RUNNING ON IT").style("text-align", "center");

	span.c("flex gap wrap v-center h-center", () => MARKS.forEach(mark =>
		span.c("h3", mark).style(muted)))
		.style("--gap", "1em 2.5em");
}).style("--section", "62em");
