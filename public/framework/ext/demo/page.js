import { Page, md, demo, h2, p, div, pre, code, toc } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Demo",
	description: "Show the code, then run it — from one source.",
	icon: "play_circle",
	content(){

		toc();

		demo("Label", () => {
			div.c("flex gap v-center", () => {
				p("Live.");
				p("Really.");
			});
		}, "The code above **is** the code that rendered the box. There's no second copy, so an example can't drift out of date.");

		h2("Usage");

		code.js(`import { demo } from "/app.js";

demo(() => {
    h1("Hello");
});

demo("Label above", () => { … });
demo(() => { … }, "Caption below the result.");`);

		md("It reads `fn.toString()`, drops the wrapper, dedents — then runs the function with the result box as captor. Examples are written exactly like real page code, because they *are* real page code.");

		h2("Three panes: code, result, html");

		demo(() => {
			div.c("card", () => {
				p.c("h3", "Title");
				p("Body");
			});
		}, "Open **html** on any box on this site. That's the real DOM, read back — so you can see exactly what `div.c(\"card\", …)` produced.");

		md("The markup pane is closed by default, because the answer to *\"what does this render\"* is the render — the HTML is the follow-up question. It's read on **first open**, not up front: a demo whose content arrives from a promise hasn't finished building when `demo()` returns, and a click is always later than that.");

		md("It serializes the live DOM via [markup()](/framework/util/markup/), so it can't drift from the box above it. One honest consequence: a class something *else* added shows up too — an `<a>` will carry `.in-path` when the current url sits under its `href`, because [Router](/framework/core/Router/) really did put it there.");

		h2("Why");

		md("A framework is learned by pattern, not by paragraph. If a page shows something rendered, the reader must be able to see what produced it — right there, in the same box, without scrolling or guessing.");

		md("Reading order is **code → result → html → caption**. The prose is a caption, not a preamble.");

		md("Next: [Highlight](/framework/ext/highlight/) — which is what makes those code blocks readable.");

		md.details(import.meta, "readme.md", "Design record — the third pane, and the soft dependencies");
	}
});
