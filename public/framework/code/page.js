import { Page, md, div } from "/app.js";
import Concepts from "/framework/ux/Content/Concepts/Concepts.js";

const items = [
	{ name: "Patterns", slug: "patterns", icon: "extension" },
	{ name: "Dos and don'ts", slug: "dos-and-donts", icon: "rule" },
	{ name: "CSS", slug: "css", icon: "style" },
	{ name: "Objects", slug: "objects", icon: "hub" },
];

export default new Page({
	meta: import.meta,
	title: "Code",
	description: "The code in this framework — HTML, CSS, JS: how it's written, what to never do, and how a class shows its own state.",
	icon: "code",
	children: "patterns dos-and-donts css objects",

	content(){
		div.c("pad", () => new Concepts({ items }));

		md(`**No build, real ESM.** \`public/\` runs in the browser exactly as written — no bundler, no transpile. The four topics here are how this framework's own code stays readable as it grows:`);

		div.c("flow", () => {
			md(`- **[Patterns](./patterns/)** — a module is a class; parts are classes too, hung on the constructor as statics so a subclass inherits the whole machine.`);
			md(`- **[Dos and don'ts](./dos-and-donts/)** — the traps that never throw (nothing here raises an error, so only the list catches it), plus the house opinions on formatting and file size.`);
			md(`- **[CSS](./css/)** — layers, where a declaration belongs, class naming. The vocabulary itself — utilities, tokens, the layout words — lives at [/framework/styles/](/framework/styles/); this page never repeats it.`);
			md(`- **[Objects](./objects/)** — every class ships a view of its own state: a chip, a row, a panel, so you can see what an instance knows without reading its source.`);
		});

		md.details(import.meta, "readme.md", "Readme");
	},
});
