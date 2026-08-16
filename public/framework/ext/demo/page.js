import { Doc, md, demo, h2, p, div, code, toc } from "/app.js";
import { sample } from "./sample.js";

const wall = () => {
	div.c("grid gap auto", () => {
		["Alpha", "Beta", "Gamma", "Delta", "Epsilon", "Zeta"].forEach(name =>
			div.c("pad", () => {
				p.c("h3", name);
				p("A card that goes wherever it fits.");
			}).style({ background: "var(--wash)", borderRadius: "var(--radius)" }));
	}).style("--column", "20em");
};

const hero = () => {
	div.c("wash pad flex v gap v-center", () => {
		p.c("h2", "Ship it");
		p("A band, and the whole of a leaf page.");
	}).style("--pad", "3em");
};

export default new Doc({
	meta: import.meta,
	title: "Demo",
	description: "Show the code, then run it — from one source. Four doors.",
	icon: "play_circle",

	subject: demo,
	methods: "stage exhibit page tree layout app source",
	notes:   "record",
	files:   "app.css app.js demo.css demo.js exhibit.css exhibit.js layout.js page.js readme.md sample.js stage.css stage.js twin.js two.css two.js",

	content(){

		toc();

		demo("Label", () => {
			div.c("flex gap v-center", () => {
				p("Live.");
				p("Really.");
			});
		}, "The code above **is** the code that rendered the box. There's no second copy, so an example can't drift out of date.");

		md("It reads `fn.toString()`, drops the wrapper, dedents — then runs the function with the result box as captor. Examples are written exactly like real page code, because they *are* real page code.");

		h2("Four doors");

		md(`| | |
|---|---|
| \`demo(fn)\` | a quoted example inside a page about something else |
| \`demo.stage(fn)\` | the render on its own — the site's one resizable viewport |
| \`demo.exhibit(…)\` | a whole detail PAGE: stage, layout bar, definition |
| \`demo.app(tree)\` | a Page tree playing App and Router in a box |

Everything else is one of those four with its config filled in: \`demo.page()\`,
\`demo.tree()\` and \`demo.layout()\` are exhibit sugar, and \`demo.source()\` is the
block the exhibit closes under its render. The [API](/framework/ext/demo/api/) tab
has all seven, each with its real source.`);

		h2("demo() — a quoted box");

		code.js(`import { demo } from "/app.js";

demo(() => {
    h1("Hello");
});

demo("Label above", () => { … });
demo(() => { … }, "Caption below the result.");
demo(() => { … }, { html: true });   // the HTML pane open from the start
demo(() => { … }).ac("stack");       // never split, however wide the box
demo(() => { … }).ac("quoted");      // an aside — stay on the reading measure`);

		md("A box carries `wide`, because a demo is something you **look at** and the measure is for reading. `quoted` is the opt-out.");

		demo(() => {
			div.c("card", () => {
				p.c("h3", "Title");
				p("Body");
			});
		}, { html: true }, "Click `<>` to put this away. It's the real DOM, read back — so you can see exactly what `div.c(\"card\", …)` produced.");

		md("The **HTML pane** is hidden by default, because the answer to *\"what does this render\"* is the render. It's read on **show**, not up front: a demo whose content arrives from a promise hasn't finished building when `demo()` returns, and a click is always later than that.");

		md("It sits **beside** the code when the box is wide enough for two columns and **under** it when it isn't — `flex-wrap` and a `22em` basis, no media query. It serializes the live DOM via [markup()](/framework/util/markup/), so it can't drift from the box above it. One honest consequence: a class something *else* added shows up too — an `<a>` carries `.in-path` when the current url sits under its `href`, because [Router](/framework/core/Router/) really did put it there.");

		h2("demo.stage() — the render, bare");

		// ⚠ `toc-skip`, or the rail reads "Ship it" — the band's `.h2` is the
		// example's own title, not a section of this page.
		demo.stage(hero).ac("toc-skip");

		code.js(`demo.stage(hero);               // the strip, the box, the handle — no code
demo.stage(hero).ac("bleed");   // a leaf page: edge to edge, no inset
demo.stage.two(hero);           // the same builder at two widths at once`);

		md("**The resizable box on its own** — no code pane, no border, and the same strip every stage has. Drag the right edge; press a width; drag the magnifier. That strip plus the readout is the whole chrome, which is what makes the stage usable as a *page* and not just as the inside of a box.");

		md(`| | |
|---|---|
| **mobile · tablet · desktop · mega** | lay the render out at 390 / 810 / 1440 / 3440 and draw it at the \`zoom\` that fits. Press the pressed one to let go |
| **🔍** | **drag it** to zoom continuously; click it to see the whole thing again |
| **zoom** | the same thing in steps, on top of any simulated width |
| **⤢** | fill the window — the one fullscreen on the site |
| **the handle** | drag the right edge; **right-click to go back** to whatever fits |`);

		md("The width under the box is the width the example is *laid out* at, which is not the width you see once the zoom is off 100%. **The handle only shrinks a stage — a width is how you go bigger**, and then you zoom *on top of* that width to lean into the layout.");

		md("**A `@media` query inside an example will not respond to any of it.** The stage is a `div`, so everything intrinsic reacts — `auto-fit`, `%`, `flex-wrap`, container queries — but a media query asks the *browser* viewport, and that hasn't moved. Simulating a viewport properly needs an iframe; the design record says what that would cost.");

		h2("Two widths at once");

		demo.stage.two(wall).ac("toc-skip");

		code.js(`demo.stage.two(wall);
demo.stage.two(wall, steer, { wide: 1440, narrow: 375 });`);

		md("**The stage's two-up mode**: the same function, twice, each pane painted down to fit. Drag the divider and both simulated widths follow it — the shrinking pane reflows down toward mobile as the growing one reflows up toward wide, meeting as twins in the middle and trading ends at the far side. What you're watching is layout, not scale.");

		md("It is a stage, so the `⤢` in its strip is that one fullscreen; the divider is this stage's width dial, which is why the widths and the zoom stay off it.");

		h2("demo.exhibit() — the detail page");

		code.js(`demo.exhibit({
    page: this,                                    // its children become Variants
    stage: steer => demo.stage(hero, steer).ac("bleed"),
    def: hero,                                     // the definition, stringified
    file: "/framework/styles/sections/hero.js",    // the whole file, one click away
    note: "A caption, under the source.",
});`);

		md("**Every detail page on the site is this one assembly.** Three things, in this order: the thing running on a stage you can drag, a [layout bar](/framework/ext/layout/) wired to it, and **the definition** — stringified, so the reader gets the lesson and not the imports around it.");

		md("**The assembly is one band, and it lays itself out.** Render and definition are two columns of one `bleed` block — stacked at every laptop width, side by side once the band is wide enough for both, and edge-to-edge on a phone, where a 2em gutter is 16% of the screen. No option and no media query on the split: `flex-wrap` and a basis, because the width that varies is the band's.");

		md("**Hand it the page and its children become variants** — a `Variants` heading and `previews()`, the same cards a rail is made of, so a demo can be the category for the complex ones without a second preview mechanism. [Form field](/framework/ui/field/) is three of them.");

		h2("Three sugars over it");

		code.js(`demo.page("range", ranges, { note: "…" })   // a FUNCTION as a demo page
demo.tree({ meta: import.meta, tree: shop })  // a site TREE as one
demo.layout({ meta: import.meta, twin: true, parts: "header rail footer",
              layout(){ return div.c("page full fill flex v", …); } })`);

		md("Each is a config factory returning a page — `preview()` plus a `content()` that calls the exhibit — so a demo is a real child page with a real url and a card in its parent's rail. What differs is only what the specimen **is**: a function, a tree, or a whole page.");

		md("**The card is the render at half size, drawn fresh per call** (a cached one would be stolen from the page). `demo.layout({ twin: true })` draws its card as a 390 phone beside a 3440 monitor and puts the two-up on the stage; `parts:` turns the layout's regions into checkboxes in the panel's right drawer, so an app shell with everything unchecked becomes the document layout, live.");

		md("[Layouts](/framework/styles/layouts/), [Sections](/framework/styles/sections/), [Components](/framework/ui/) and the [Page overview](/framework/core/Page/) are all this — one rail of cards, one exhibit behind each.");

		h2("demo.source() — the code, closed, below");

		demo.source(hero);

		code.js(`demo.source(hero);                          // the summary reads "Source"
demo.source(hero, "The whole band");        // your own summary
demo.source(template, "Source");            // a STRING, already built
demo.source.file(import.meta, "hero.js");   // a file — the summary is its name`);

		md("It opens **closed** and belongs **below** the render. A code block stacked above the thing is exactly what pushes the render off the screen. Same source as the code pane (`fn.toString()`, so it can't drift), the same soft dependency on [Highlight](/framework/ext/highlight/), and a copy button on the summary.");

		h2("demo.app() — a tree in a box");

		demo.stage(() => demo.app(sample(), { nav: true }).style("height", "20em")).ac("toc-skip");

		code.js(`import { demo } from "/app.js";
import { sample } from "/framework/ext/demo/sample.js";

demo.app(sample())                // opens at the root
demo.app(laces, { nav: true })    // opens deep, with a rail`);

		md("`demo.app()` plays **App and Router for one tree**: a url strip that is also a breadcrumb, an optional rail, and the region the pages mount in. The pages inside are ordinary `Page`s doing their own `render()` and `previews()`, and the clicks never reach the real Router — the url in your address bar stays put. The [Page demos](/framework/core/Page/) are fourteen of these. ⚠ A title is address enough (`Web` → `/web/`) — and object children only; a name string probes the server for a `page.js`.");

		md("`sample()` is the shared sample tree — nine children, three of them a level deeper — so a demo that needs *a tree* takes this one and overrides the root. What changes between demos is then exactly the thing each demo teaches: [Navigation](/framework/core/Page/nav/) shows the same nine children as a wall, a rail, a sidebar and a set of crumbs, one `sample()` each.");

		h2("Why");

		md("A framework is learned by pattern, not by paragraph. If a page shows something rendered, the reader must be able to see what produced it — right there, in the same box, without scrolling or guessing.");

		md("Reading order is **code → result → caption**. The prose is a caption, not a preamble.");

		md("Next: [Highlight](/framework/ext/highlight/) — which is what makes those code blocks readable.");

		md.details(import.meta, "readme.md", "Design record — the four doors, the three-box stage, and why a div is not a viewport");
	}
});
