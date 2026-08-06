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

		h2("The toolbar");

		md("Every control that changes what you're looking at is in one strip at the top:");

		md(`| | |
|---|---|
| **zoom** | CSS \`zoom\` on the render, so the example really re-lays-out |
| **\`<>\`** | the HTML this built, as a second column |
| **⤢** | fill the window |

And on the right edge of the render, a **drag handle** — pull it to test how the
example holds up narrow. **Right-click it to go back** to whatever fits.`);

		md("The width under the box is the width the example is *laid out* at, which is not the width you see once the zoom is off 100%. That gap is why both controls exist: zoom out to 50% and a demo lays out at twice the room it's drawn in.");

		md("**A `@media` query inside an example will not respond to the handle.** The stage is a `div`, so everything intrinsic reacts — `auto-fit`, `%`, `flex-wrap`, container queries — but a media query asks the *browser* viewport, and that hasn't moved. Simulating a viewport properly needs an iframe; the design record says what that would cost.");

		h2("The html pane");

		demo(() => {
			div.c("card", () => {
				p.c("h3", "Title");
				p("Body");
			});
		}, { html: true }, "Click `<>` to put this away. It's the real DOM, read back — so you can see exactly what `div.c(\"card\", …)` produced.");

		code.js(`demo(() => { … }, { html: true })   // open from the start
demo(() => { … }).ac("stack")       // never split, however wide the box`);

		md("Hidden by default, because the answer to *\"what does this render\"* is the render — the HTML is the follow-up question. It's read on **show**, not up front: a demo whose content arrives from a promise hasn't finished building when `demo()` returns, and a click is always later than that.");

		md("It sits **beside** the code when the box is wide enough for two columns and **under** it when it isn't — `flex-wrap` and a `22em` basis, no media query and no breakpoint. Narrow this window and watch the pane above move.");

		md("It serializes the live DOM via [markup()](/framework/util/markup/), so it can't drift from the box above it. One honest consequence: a class something *else* added shows up too — an `<a>` will carry `.in-path` when the current url sits under its `href`, because [Router](/framework/core/Router/) really did put it there.");

		h2("Why");

		md("A framework is learned by pattern, not by paragraph. If a page shows something rendered, the reader must be able to see what produced it — right there, in the same box, without scrolling or guessing.");

		md("Reading order is **code → result → caption**. The prose is a caption, not a preamble.");

		md("Next: [Highlight](/framework/ext/highlight/) — which is what makes those code blocks readable.");

		md.details(import.meta, "readme.md", "Design record — the html pane, the three-box stage, and why a div is not a viewport");
	}
});
