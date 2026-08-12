import { div, p, details, summary } from "/app.js";
import { band } from "./tone.js";

const QA = [
	["Do I need a bundler?", "No. Every import path is a real URL and the browser resolves it."],
	["How does routing work?", "A folder with a page.js in it is a url. The parent declares the name."],
	["What about CSS?", "Four layers, and a rule that tells you which one you are in."],
	["Can I use it today?", "It is what this site is built from, so — demonstrably."],
];

export default (tone = "surface") =>
	div.c("section-band", () =>
		div.c("measure flex v gap", () => {
			p.c("h4", "QUESTIONS").style("color", "var(--eyebrow, var(--prim))");

			p.c("h2", "The short answers");

			div.c("flex v", () => QA.forEach(([q, a]) =>
				details.c("pad", () => { summary(q); p.c("muted", a); })
					.style({ borderBottom: "1px solid var(--line)" })));
		}).style("--measure", "46em")
	).style(band(tone));
