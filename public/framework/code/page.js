import { Page, md, div } from "/app.js";
import Concepts from "/framework/ux/Content/Concepts/Concepts.js";

const items = [
	{ name: "Patterns", slug: "patterns", icon: "extension" },
	{ name: "Dos and don'ts", slug: "dos-and-donts", icon: "rule" },
	{ name: "CSS", slug: "css", icon: "style" },
	{ name: "Objects", slug: "objects", icon: "hub" },
	{ name: "Performance", slug: "performance", icon: "speed" },
];

export default new Page({
	meta: import.meta,
	title: "Code",
	description: "The code in this framework — HTML, CSS, JS: how it's written, what to never do, and how a class shows its own state.",
	icon: "code",
	children: "patterns dos-and-donts css objects performance",

	content(){
		div.c("pad", () => new Concepts({ items }));

		md(`**No build, real ESM.** \`public/\` runs in the browser exactly as written. Pick a topic above.`);

		md.details(import.meta, "readme.md", "Readme");
	},
});
