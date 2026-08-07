import { div, p, details, summary } from "/app.js";
import { section, eyebrow , muted } from "./parts.js";

const QA = [
	["Do I need a bundler?", "No. Every import path is a real URL and the browser resolves it."],
	["How does routing work?", "A folder with a page.js in it is a url. The parent declares the name."],
	["What about CSS?", "Four layers, and a rule that tells you which one you are in."],
	["Can I use it today?", "It is what this site is built from, so — demonstrably."],
];

export default tone => section(tone ?? "surface", () => {
	eyebrow("QUESTIONS");
	p.c("h2", "The short answers");

	div.c("flow", () => QA.forEach(([q, a]) =>
		details.c("pad", () => { summary(q); p(a).style(muted); })
			.style({ borderBottom: "1px solid var(--line)" })));
}).style("--section", "46em");
