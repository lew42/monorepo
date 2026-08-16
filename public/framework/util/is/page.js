import { Doc, is, md, demo, h2, p, pre } from "/app.js";

export default new Doc({
	meta: import.meta,
	title: "is",
	description: "Type checks that return booleans.",
	icon: "rule",

	subject: is,
	methods: "arr obj str num bool fn def undef class pojo proto dom el promise mobile",
	files: "is.js page.js readme.md",

	content(){

		demo(() => {
			p(`is.str("hi")   → ${is.str("hi")}`);
			p(`is.arr([1,2])  → ${is.arr([1, 2])}`);
			p(`is.fn(() => 1) → ${is.fn(() => 1)}`);
			p(`is.pojo({})    → ${is.pojo({})}`);
		}, "A handful of one-line functions. They all return a boolean.");

		h2("Why it exists");

		pre(`if (arg.el)               // a view
else if (is.pojo(arg))    // named children
else if (is.arr(arg))     // flatten
else if (is.fn(arg))      // capture
else if (is.promise(arg)) // append when it resolves
else this.el.append(arg)  // string, number, node`);

		md("That's `View.append`. The dispatch *is* `is` — and it's why `div(\"text\", child, [more], () => …)` all works.");

		md("Every check has its own page in the **API** tab on the left: the real source, and an honest note on whether it should exist at all — `is.proto` and `is.class` both answer a narrower question than their name suggests.");

		md("Next: [source](/framework/util/source/) — how a function becomes the code example you're reading.");

		md.details(import.meta, "readme.md");
	}
});
