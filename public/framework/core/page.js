import { Page, md, code, h2, demo, div, p, a, span, toc } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Core",
	description: "Four classes. Each one is an element you can point at in the inspector.",
	icon: "dashboard",

	children: "View Page Router App Sidebar",

	// Labels and icons come from the five class pages themselves.
	initialize(){ this.load_all_children(); },

	content(){

		toc();

		code.js(`new View()   →  <div>
new Page()   →  <div class="page">
new App()    →  <div class="app">`);

		md("**That is the whole mental model.** Three of the four classes are an element you can point at in the inspector, and everything else is a method on it. The fourth, `Router`, has no element — it owns the url.");

		this.previews();

		h2("What each one is for");

		md(`| | | |
|---|---|---|
| [View](/framework/core/View/) | a DOM element, chainable | **every line you write** |
| [Page](/framework/core/Page/) | a url, some content, children | one per \`page.js\` |
| [Router](/framework/core/Router/) | url → which pages are showing | never, directly |
| [App](/framework/core/App/) | boot, and the one container | once, in \`app.js\` |
| [Sidebar](/framework/core/Sidebar/) | a brand over links | when you want one |

**Only the first is unavoidable.** A single-page thing is \`View\` and nothing else.`);

		h2("All four, in nine lines");

		code.js(`// app.js
import App from "/framework/core/App/App.js";
window.app = new App();                    // boots, builds .app > .pages
export * from "/framework/core/App/App.js";

// page.js
import { Page, p } from "/app.js";
export default new Page({                  // a url and some content
    meta: import.meta,
    title: "Hello",
    children: "about",                     // a name — Router imports it on demand
    content(){ p("Hi."); },                // View factories, capturing
});`);

		md("You wrote two of the four classes and used all four. `Router` was constructed by `App`, walked to your url, and wrote two CSS classes; you never mentioned it.");

		h2("How they fit together");

		code.js(`App        boots, owns $pages, waits for fonts and stylesheets
 └ Router  a click or a reload → walk the tree → activate the chain
    └ Page  a node: url, title, children, content
       └ View  the elements content() builds`);

		md("Reading down that list is also the reading order. **Imports flow down; `.parent` links point up** — a page imports its children, and a child is told who its parent is when it's adopted. Never both ways: a mutual import breaks only on deep reloads, which is the nastiest failure this framework has.");

		h2("There is no layout tier");

		demo(() => {
			div.c("flex gap v-center pad", () => {
				code(".active-page");
				span("→ the leaf");
				code(".active-ancestor");
				span("→ everything above it");
			});
		}, "`Router` writes exactly these two classes and nothing else. Every arrangement on this site — replace, tabs, columns, a section with its own sidebar — is CSS reading them, plus one class a page opted into.");

		md("There used to be a `Pager` tier for this. It's gone, and nothing replaced it: an arrangement is a stylesheet now, so there is no fifth class to learn. (The old records are in `core/legacy/`, if you're curious why.)");

		h2("Where to start");

		md("[View](/framework/core/View/) — the one class you use on every line. Then [Page](/framework/core/Page/), then [Router](/framework/core/Router/) when you want more than one url, then [App](/framework/core/App/) when you want your own chrome around it all.");
	}
});
