import { Page, is, md, demo, h2, p, pre } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "is",
	description: "Type checks that return booleans.",
	content(){

		demo(() => {
			p(`is.str("hi")   → ${is.str("hi")}`);
			p(`is.arr([1,2])  → ${is.arr([1, 2])}`);
			p(`is.fn(() => 1) → ${is.fn(() => 1)}`);
			p(`is.pojo({})    → ${is.pojo({})}`);
		}, "Fourteen one-line functions. They all return a boolean.");

		h2("Why it exists");

		pre(`if (arg.el)               // a view
else if (is.pojo(arg))    // named children
else if (is.arr(arg))     // flatten
else if (is.fn(arg))      // capture
else if (is.promise(arg)) // append when it resolves
else this.el.append(arg)  // string, number, node`);

		md("That's `View.append`. The dispatch *is* `is` — and it's why `div(\"text\", child, [more], () => …)` all works.");

		h2("The checks");

		md(`| check | true when |
|---|---|
| \`is.arr\` | \`Array.isArray\` |
| \`is.obj\` | typeof "object", not null, not an array |
| \`is.pojo\` | an object literal (\`constructor === Object\`) |
| \`is.str\` \`is.num\` \`is.bool\` \`is.fn\` | typeof |
| \`is.def\` \`is.undef\` | defined / undefined |
| \`is.class\` | constructable — false for arrows |
| \`is.proto\` | a constructor's \`.prototype\` |
| \`is.promise\` | thenable |
| \`is.dom\` \`is.el\` | a node / an element |
| \`is.mobile()\` | mobile user-agent |

Edge cases (\`is.num(NaN)\` is \`true\`, and friends) are in the design notes.`);

		md("Next: [Dev server](/framework/dev/) — live reload, and how to run all this locally.");

		md.details(import.meta, "readme.md");
	}
});
