import { Page, md, demo, h2, p, div, code, toc } from "/app.js";
import "./responsive.js";
import { web } from "./web.js";

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

		md("Every control that changes what you're looking at is in the stage's own strip — the widths centred, the dials on the right. The box's bar above it keeps only what is about the *box*, the `<>` pane.");

		md(`| | |
|---|---|
| **mobile · tablet · desktop · mega** | lay the render out at 390 / 810 / 1440 / 3440 and draw it at the \`zoom\` that fits. Press the pressed one to let go |
| **🔍** | **drag it** to zoom continuously; click it to see the whole thing again |
| **zoom** | the same thing in steps, on top of any simulated width |
| **⤢** | fill the window |
| **\`<>\`** | the HTML this built, as a second column |

And on the right edge of the render, a **drag handle** — pull it to test how the
example holds up narrow. **Right-click it to go back** to whatever fits.`);

		md("The width under the box is the width the example is *laid out* at, which is not the width you see once the zoom is off 100%. That gap is the whole point of the readout: zoom out to 50% and a demo lays out at twice the room it's drawn in.");

		md("**The handle only shrinks a stage — a width is how you go bigger.** `desktop` lays the render out at 1440 and computes the zoom that fits it into the room there is; `mobile` renders at 1:1, never magnified. Then zoom *on top of* that width to lean into the layout. A drag of the handle hands the width back, because the handle is the width dial too.");

		h2("The stage");

		// ⚠ `toc-skip`, or the rail reads "Ship it" — the band's `.h2` is the
		// example's own title, not a section of this page.
		demo.stage(hero).ac("toc-skip");

		code.js(`demo.stage(hero);               // the strip, the box, the handle — no code
demo.stage(hero).ac("bleed");   // a leaf page: edge to edge, no inset`);

		md("**The resizable box on its own** — no code pane, no border, and the same strip every stage has. Drag the right edge; press a width; drag the magnifier. That strip plus the readout is the whole chrome, which is what makes the stage usable as a *page* and not just as the inside of a box.");

		md("It is the same three boxes `demo()` renders into, so there is one implementation of \"how wide is this really\". `demo.stage` was built for a wall of examples with no single source worth printing — one drag re-flows all of them; the [Layouts](/framework/styles/layouts/) index is that wall.");

		md("**A `@media` query inside an example will not respond to the handle.** The stage is a `div`, so everything intrinsic reacts — `auto-fit`, `%`, `flex-wrap`, container queries — but a media query asks the *browser* viewport, and that hasn't moved. Simulating a viewport properly needs an iframe; the design record says what that would cost.");

		h2("A leaf page");

		code.js(`import { Page, demo } from "/app.js";
import hero from "./hero.js";

export default new Page({
    meta: import.meta,
    title: "Hero",
    content(){
        demo.stage(hero).ac("bleed");
        demo.source(hero);
    }
});`);

		md("**Two lines, and the render is the page.** The stage goes full-bleed above the fold; the code sits under it in a closed `details`. `standard` is every page's default shape, which is what gives `.bleed` a track to take — see [Fit](/framework/styles/layouts/fit/).");

		demo.source(hero);

		md("`demo.source()` opens **closed** and belongs **below** the render. A code block stacked above the thing is exactly what pushes the render off the screen, which is the cost `demo()` pays on every page and a leaf page should not.");

		code.js(`demo.source(hero);                          // the summary reads "Source"
demo.source(hero, "The whole band");        // your own summary
demo.source.file(import.meta, "hero.js");   // a file — the summary is its name`);

		md("Same source as the code pane (`fn.toString()`, so it can't drift) and the same soft dependency: highlighted when [Highlight](/framework/ext/highlight/) is loaded, a plain `pre` when it isn't.");

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

		h2("Two viewports at once");

		demo.responsive(wall, "The same function, twice: **3440px** on the left, **400px** on the right, each painted down to fit its pane. Drag the divider and both simulated widths follow it — the shrinking pane reflows down toward mobile as the growing one reflows up toward wide, meeting as twins in the middle and trading ends at the far side. What you're watching is layout, not scale.");

		code.js(`import "/framework/ext/demo/responsive.js";   // once, anywhere

demo.responsive(wall);
demo.responsive(wall, { wide: 1440, narrow: 375 });
demo.responsive(wall, "A caption, as usual.");`);

		md("Each pane is `zoom: pane / simulated`, the same `zoom` the toolbar uses and for the same reason — a `transform: scale()` box still occupies its *unscaled* size, so it would take height arithmetic to keep the two panes from swallowing the caption. The readout under each pane is the width it was laid out at, and the percentage it is drawn at.");

		md("**The `@media` caveat above still applies** — that reads the real window. A **container query** does respond, because the render's own box really is 3440px wide.");

		h2("A tree in a box");

		demo.stage(() => demo.app(web(), { nav: true }).style("height", "20em")).ac("toc-skip");

		code.js(`import { demo } from "/app.js";
import { web } from "/framework/ext/demo/web.js";

demo.app(web())                   // opens at the root
demo.app(laces, { nav: true })    // opens deep, with a rail`);

		md("`demo.app()` plays **App and Router for one tree**: a url strip that is also a breadcrumb, an optional rail, and the region the pages mount in. The pages inside are ordinary `Page`s doing their own `render()` and `previews()`, and the clicks never reach the real Router — the url in your address bar stays put. The [Page demos](/framework/core/Page/) are fourteen of these. ⚠ A title is address enough (`Web` → `/web/`) — and object children only; a name string probes the server for a `page.js`.");

		md("`web()` is the shared sample tree — nine children, three of them a level deeper — so a demo that needs *a tree* takes this one and overrides the root. What changes between demos is then exactly the thing each demo teaches: [Navigation](/framework/core/Page/nav/) shows the same nine children as a wall, a rail, a sidebar and a set of crumbs, one `web()` each.");

		h2("A demo as a page");

		code.js(`export default new Page(demo.tree({
    meta: import.meta,
    tree: shop,              // () => new Page({ … }) — a function, so the card
}));                         // and the stage don't share one render`);

		md("**Every detail page on the site is one assembly** — `demo.exhibit()`, which `demo.tree()` and `demo.page()` both call. Three things, in this order: the thing running on a stage you can drag, a [layout bar](/framework/ext/Layout/) wired to it, and **the definition** — `tree` or `fn` stringified, so the reader gets the lesson and not the imports around it. A `meta` adds the whole file as a link beside the summary.");

		md("**The card in a rail is the tree at half size**, and the sign over its door stays there: on a stage the specimen's own `h1` is off, because the page it is an example on already has a title. The [Page overview](/framework/core/Page/) rail is fourteen of them.");

		md("**The assembly is one band, and it lays itself out.** Render and definition are two columns of one `bleed` block — stacked at every laptop width, side by side once the band is wide enough for both, and edge-to-edge on a phone, where a 2em gutter is 16% of the screen. No option, no media query on the split: `flex-wrap` and a basis, because the width that varies is the band's.");

		md("**Hand it the page and its children become variants.** `demo.exhibit({ page: this, … })` draws a `Variants` heading and `previews()` under the exhibit when the page has children — the same cards a rail is made of, so a demo can be the category for the complex ones without a second preview mechanism. [Form field](/framework/ui/field/) is three of them.");

		h2("Why");

		md("A framework is learned by pattern, not by paragraph. If a page shows something rendered, the reader must be able to see what produced it — right there, in the same box, without scrolling or guessing.");

		md("Reading order is **code → result → caption**. The prose is a caption, not a preamble.");

		md("Next: [Highlight](/framework/ext/highlight/) — which is what makes those code blocks readable.");

		md.details(import.meta, "readme.md", "Design record — the html pane, the three-box stage, and why a div is not a viewport");
	}
});
