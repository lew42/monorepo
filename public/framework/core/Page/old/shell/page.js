import { Page, md, demo, code, h2, div } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Shell",
	description: "The knobs: what a page tells every menu, what shape it takes, and how to build the frame around it.",
	icon: "tune",

	content(){

		code.js(`export default new Page({
    meta: import.meta,
    title: "Start",         // the h1 on this page
    label: "Start here",    // what every menu calls it
    icon: "flag",           // the glyph beside it
    card: "two",           // and, on a wall of cards, its share of the grid
});`);

		md("All four live on **the page they describe**, and `nav_for(name)` is the one method that reads them — so a sidebar, a tab bar and a preview card structurally cannot disagree. The fallback is `label → title → the url segment`, weakest last; `icon` and `card` come straight off the child with none. [See it running.](/framework/core/Page/old/overview/labels/)");

		md("A parent that wants a different word in **its own** list spreads over the entry, at the call site where you can see it happen:");

		code.js(`{ ...this.nav_for(name), label: "Overview" }`);

		h2("A card the page draws itself");

		demo(() => {
			demo.app(new Page({
				title: "Web",

				children: {
					CSS: { icon: "palette", card: "two",
						preview(nav){ return this.preview_card(nav, () => div.c("flex v gap wash pad", () =>
							[1, 2, 3].forEach(() => div.c("surface").style("height", "0.8em")))); },
						content(){ md("This card is a render, not a label — one method, on the page it shows."); } },

					JS: { icon: "data_object",
						content(){ md("No override: the default card is an icon and a label, and it is enough."); } },
				},

				content(){ this.previews(); },
			})).style("height", "21em");
		}, "`previews()` arranges; **`preview(nav)` draws, and the child draws its own.** So a page that says nothing still gets a card, and a page that wants to show itself overrides one method. ⚠ The thumb is inert — the label is the card's only link, because an `<a>` inside an `<a>` is invalid and the browser silently un-nests it.");

		h2("The shape of the page itself");

		code.js(`classes: "full pad"     // no measure, an even inset: a board
classes: "full fill"    // edge to edge, and BE the region's height`);

		md("**Every page is a `standard` page unless it says otherwise** — a left-anchored measure, with `.wide` and `.bleed` growing rightward off the same edge. Declaring `classes:` opts out **whole**, which is why it is one word and not a list of flags. [Walk the three shapes.](/framework/core/Page/old/overview/shapes/)");

		h2("Your own shell");

		code.js(`import App, { View, div, a } from "/framework/core/App/App.js";

const nav = [["/", "Home"], ["/docs/", "Docs"]];

export default window.app = new App({
    render(){
        this.$app = div.c("app theme-lew42", () => {
            this.$nav = div.c("nav", () => nav.forEach(([url, text]) => a.c("nav-link", text).href(url)));
            this.$pages = div.c("pages");
        });

        View.set_captor(this.$pages);
    },
});`);

		md("That is this site's `/app.js`, minus the exts it opts into. **The chrome is built once, outside `$pages`**, so navigation can never touch it — and `$pages` is the only thing the framework asks for, because it is `container()`'s last fallback.\n\n⚠ The captor is set to `$pages`, not `$app`: a page's view is built by an element factory, which appends to whatever is capturing.");

		md("The nav strip is hand-typed on purpose. A menu built from the root's children would have to **import** every section just to read its title — which is exactly the cost the eager imports pay one level down, where the titles are actually needed.");

		h2("Composing a Sidebar");

		code.js(`new Sidebar({
    pages: [...this.children.keys()].map(name => this.nav_for(name)),
    header: () => this.app.brand(this.title, this.url),   // REPLACES the method
    footer: null,                                          // and this removes it
});`);

		md("`header` and `footer` are passed as **functions**, and the assign-based constructor makes a passed one shadow the method — replaced, not configured, with no options to learn.\n\n⚠ Pass an arrow, never a built `View`. A View constructed to be handed in is built *before* the Sidebar captures, so it lands wherever the captor happened to be and then gets moved — the async-capture failure in synchronous clothing.");

		md("Next: [Page flow](/framework/core/Page/old/flow/) — the rhythm inside the page all of this frames.");

		md.details(import.meta, "../../doc/labels.md", "Design record — titles, labels, icons, and the map that was deleted");
	}
});
