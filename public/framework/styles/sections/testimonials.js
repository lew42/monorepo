import { div, p, span, blockquote } from "/app.js";
import { band } from "./tone.js";

/* css: .ui-avatar — the circle ships from ui/, and this import is the loading edge. */
import "/framework/ui/avatar/avatar.js";

/* Cards again, with a component inside: the quote is a real `blockquote` (the
 * base theme already rules its left edge) and the attribution wears `.ui-avatar`,
 * whose stylesheet ships from framework/ui — a section composes, it doesn't invent. */
const quote = (words, initials, name, role) =>
	div.c("pad flex v surface", () => {
		blockquote(words);

		div.c("flex gap v-center", () => {
			span.c("ui-avatar", initials);
			div.c("flex v", () => {
				p.c("h4", name);
				p.c("muted", role).style({ fontSize: "0.85em" });
			}).style("gap", "0.1em");
		});
	}).style("gap", "1em");

export default (tone = "surface") =>
	div.c("section-band", () =>
		div.c("measure flex v gap", () => {
			p.c("h4", "WHAT READERS SAY").style("color", "var(--eyebrow, var(--prim))");

			p.c("h2", "People actually read this source");

			div.c("grid gap auto", () => {
				quote("I opened devtools to see how it worked, and the answer was just there.",
					"AK", "Ada K.", "Design engineer");
				quote("No build step meant my first contribution took eleven minutes.",
					"RB", "Rae B.", "First contributor");
				quote("The stack trace pointed at a file I could read. I had forgotten that was possible.",
					"JT", "Jun T.", "Recovering bundler admin");
			});
		}).style("--measure", "62em")
	).style(band(tone));
