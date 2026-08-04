import { Page, md, demo, h2, p, pre } from "/app.js";
import simplify from "./simplify/page.js";

export default new Page({
	meta: import.meta,
	title: "Page",
	description: "A titled, linkable, dormant unit of content.",
	children: [simplify],
	content(page){ // content() receives the page, so examples can use it

		pre(`import { Page, p } from "/app.js";

export default new Page({
    meta: import.meta,
    title: "My Page",
    content(){
        p("Anything you can write in a View, you can write here.");
    }
});`);

		md("A whole `page.js`. `meta: import.meta` is how the page learns its own url — so you never type a path twice.");

		h2("Dormant");

		demo(() => {
			const hello = new Page({
				title: "Hello",
				content(){ p("Placed, so it rendered."); }
			});

			hello.render();
		}, "Creating a page renders **nothing** — it renders when something places it. That's why importing a page is always safe.");

		h2("Linking");

		demo(() => {
			p("This page, linking to itself: ", page.link(), ".");
		}, "`link()`, `crumb()` and `preview()` are three views of the same page. All plain `<a href>` — the [Router](/framework/core/Router/) upgrades the click, and the App marks the one you're on `.active`.");

		h2("A tree");

		pre(`import intro from "./intro/page.js";
import api from "./api/page.js";

export default new Page({
    meta: import.meta,
    title: "Docs",
    children: [intro, api],
    content(){
        this.previews();   // a card per child
    }
});`);

		md("The parent imports its children, so `.parent` gets wired as they construct — no registry, no cycles, no async. That tree is what sidebars, breadcrumbs and preview cards read.");

		h2("Properties");

		md(`| property | does |
|---|---|
| \`title\` | the h1, and \`document.title\` when active |
| \`description\` | the preview subtitle, and the meta description |
| \`content\` | a function (captured), or a string / view |
| \`children\` | sub-pages |
| \`classes\` | classes added to the page element |
| \`col\` | classes for the column a [Pager](/framework/core/Pager/) puts it in |
| \`Pager\` | a layout class for this page's subtree — capitalized, because it *is* a class |

Anything else you pass is just assigned to the page, inert until something reads it.`);

		h2("render() vs activate()");

		md("`render()` builds the DOM — one `div.page` with the title and your content — and runs for embedded sub-pages too. `activate()` means *you are now THE page*: document title, meta description. Only the page the url points at is activated, so composing pages can never clobber the title.");

		md("`Pager` is inert data: `Page` never instantiates it, `App.load_page` does. That's why `render()` has exactly one meaning and there's no second content-only variant to remember.");

		md("Next: [Pager](/framework/core/Pager/) — showing one page at a time.");

		md("---");

		md("Design work in progress: **[Simplifying Page](/framework/core/Page/simplify/)** — a full audit of what this class carries, and three open proposals.");

		md.details(import.meta, "readme.md");
	}
});
