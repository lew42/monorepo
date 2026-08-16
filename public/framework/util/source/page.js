import { Doc, md, code, demo, div, p } from "/app.js";
import { source, member, patched, dedent } from "./source.js";

const subject = { source, member, patched, dedent };

export default new Doc({
	meta: import.meta,
	title: "source",
	description: "A function's body as readable source text.",
	icon: "data_object",

	subject,
	methods: "source member patched dedent",
	notes: "functions-not-strings",
	files: "source.js page.js readme.md",

	content(){

		code.js(`source(fn)`);

		md("The reason every example on this site is written as a **function**, never a string:");

		demo(() => {
			const example = () => {
				div.c("card", () => p("A string can't do this."));
			};

			code.js(source(example));
		}, "A string is dead text in the editor — no highlighting, no completion, no formatting, no syntax errors. A function body gets all four from the IDE, and the page shows exactly what the IDE checked.");

		md("`demo(fn)` stringifies **and runs**. `code.fn(fn)` stringifies and never runs. Both call `source()`, which is why they can't print the same function two different ways.");

		md("`member()`, `patched()` and `dedent()` — the other three functions in this file — each have their own page in the **API** tab: what they do, and what bites.");

		md("Next: [markup](/framework/util/markup/) — the same trick for DOM instead of functions.");

		md.details(import.meta, "readme.md", "Design record — why it's in util/, and the two ways to stringify");
	}
});
