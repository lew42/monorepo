import { div, p, span, button } from "/app.js";
import { band } from "./tone.js";

/* Split, filled. `flex gap auto` gives both panes an equal basis, so they are
 * equal — and when two no longer fit they stack, with no breakpoint written.
 *
 * ⚠ `alignSelf` on the plan pill: a flex column stretches its items, and a
 * stretched pill is a bar. */
const price = (plan, cost, ...lines) =>
	div.c("pad flex v surface", () => {
		span.c("h4", plan).style({
			background: "var(--wash)", borderRadius: "999px",
			padding: "0.15em 0.7em", alignSelf: "flex-start",
		});

		p.c("h1", cost);
		lines.forEach(line => p.c("muted", line));
		button.c("prim", "Choose " + plan);
	}).style("gap", "0.5em");

export default (tone = "wash") =>
	div.c("section-band", () =>
		div.c("measure flex v gap", () => {
			p.c("h4", "PRICING").style("color", "var(--eyebrow, var(--prim))");

			p.c("h2", "Two panes that stack themselves");

			div.c("flex gap auto", () => {
				price("Free", "$0", "Every layout", "Every component", "The whole source");
				price("Pro",  "$0", "All of the above", "Read it twice", "Still no build step");
			});
		}).style("--measure", "52em")
	).style(band(tone));
