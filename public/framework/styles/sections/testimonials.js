import { div, p, blockquote } from "/app.js";
import { section, eyebrow, muted, surface } from "./parts.js";
import { avatar } from "../components/avatar/component.js";

/* Cards again, with a component inside: the quote is a real `blockquote` (the
 * base theme already rules its left edge) and the attribution is the Avatar
 * component's named export — a section is components composed, not new markup. */
const quote = (words, initials, name, role) =>
	div.c("pad flex v", () => {
		blockquote(words);

		div.c("flex gap v-center", () => {
			avatar(initials);
			div.c("flex v", () => {
				p.c("h4", name);
				p(role).style({ ...muted, fontSize: "0.85em" });
			}).style("gap", "0.1em");
		});
	}).style({ ...surface, gap: "1em" });

export default tone => section(tone ?? "surface", () => {
	eyebrow("WHAT READERS SAY");

	p.c("h2", "People actually read this source");

	div.c("grid gap auto", () => {
		quote("I opened devtools to see how it worked, and the answer was just there.",
			"AK", "Ada K.", "Design engineer");
		quote("No build step meant my first contribution took eleven minutes.",
			"RB", "Rae B.", "First contributor");
		quote("The stack trace pointed at a file I could read. I had forgotten that was possible.",
			"JT", "Jun T.", "Recovering bundler admin");
	});
}).style("--section", "62em");
