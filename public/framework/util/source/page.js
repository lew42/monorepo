import { Page, md, code, h2, demo, div, p, toc } from "/app.js";
import { source, dedent, member, patched } from "./source.js";

export default new Page({
	meta: import.meta,
	title: "source",
	description: "A function's body as readable source text.",
	icon: "data_object",

	content(){

		toc();

		code.js(`source(fn)`);

		md("The reason every example on this site is written as a **function** rather than a string:");

		demo(() => {
			const example = () => {
				div.c("card", () => p("A string can't do this."));
			};

			code.js(source(example));
		}, "A string is dead text in the editor — no highlighting, no completion, no formatting, no syntax errors. A function body gets all four from the IDE, and the page shows exactly what the IDE checked.");

		md("`demo(fn)` stringifies **and runs**. [`code.fn(fn)`](/framework/ext/highlight/) stringifies and never runs. Both call this, which is why they can't print the same function two different ways.");

		h2("member");

		code.js(`member(View, "append")   // the function, NOT called`);

		md("`Class.prototype[name]` **executes a getter**. `App.loaded` builds a `Promise.all`; read it off a bare prototype, where the instance state doesn't exist, and it throws before `toString()` is reached. A property descriptor is the only way to hold an accessor's *function* rather than its result.");

		md("Statics are searched second, so `View.stylesheet` documents correctly.");

		md("Stringify a member with `dedent(String(fn))`, **not** `source(fn)` — `source()` strips everything before the first `{`, which for a shorthand method throws away `append(...args)`, the one line confirming you're in the right place. Correct for an anonymous example, wrong for a method.");

		h2("patched");

		code.js(`patched(fn, "append")   // has an ext replaced this?`);

		md("One line of trivia: JS infers a function's name from assignment to an **identifier**, never to a member expression. So `append(...args){}` carries `fn.name === \"append\"`, and `View.prototype.append = function(…){}` carries `\"\"`.");

		md("[classdoc](/framework/ext/classdoc/) uses it to label a patched method, because on this site the running `View.append` really *is* highlight's wrapper — showing the original would be a lie that reads as truth.");

		h2("dedent");

		md("Removes the leading blank line and the common indent, so a body nested three tabs deep in a `page.js` reads as top-level code. It normalises `\\r\\n` first: `fn.toString()` hands back whatever line endings the file was checked out with, while the same text through `innerHTML` comes back `\\n` — the DOM normalises, the string doesn't.");

		md("Next: [markup](/framework/util/markup/) — the same trick for DOM instead of functions.");
	}
});
