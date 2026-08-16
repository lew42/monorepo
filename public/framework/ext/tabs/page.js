import { Page, Doc, md, code, demo, h2 } from "/app.js";
import sample from "/framework/ext/demo/sample.js";

export default new Doc({
	meta: import.meta,
	title: "Tabs",
	description: "A bar of links and the panel they fill — one ext, patched onto every Page.",
	icon: "tab",

	subject: Page,
	methods: "tabs",
	notes: "usage overflow extraction",
	files: "tabs.js tabs.css page.js readme.md",

	content(){

		code.js(`import "/framework/ext/tabs/tabs.js";   // once, anywhere

content(){ this.tabs("what why"); }`);

		demo(() => {
			demo.app(sample({
				title: "",
				children: {
					what: { label: "what", title: "", content(){ md("This panel is a real page, mounted in its parent's region. Reload it."); } },
					why:  { label: "why",  title: "", content(){ md("The selected tab is read off the url, so clicking produces byte-identical output to reloading."); } },
				},
				content(){ this.tabs("what why"); },
			})).style("height", "10em");
		}, "`this.tabs()` reads like a `Page` method because it is one — this module patches it onto `Page.prototype` the moment it's imported, the same move [Highlight](/framework/ext/highlight/) makes on `code`. The [API](/framework/ext/tabs/api/tabs/) tab above shows the live patch, banner and all — a site that never imports `tabs.js` ships neither the JS nor the CSS.");

		md("**Every tab is a url**, with nothing on disk behind it — the two panels above are inline child configs, not directories.");

		h2("Which children are tabs is decided at placement");

		code.js(`this.tabs("what why");                 // the set above
this.tabs("state notes").ac("block");  // …and the one below`);

		md("**Not marked on the child.** So a page can have several sets, and a child in none of them is an ordinary child that renders wherever it would have anyway — nothing on a `Page` ever says *\"I am a tab.\"*");

		h2("Nesting is nesting pages, not nesting sets");

		code.js(`this.tabs("overview api docs")     // a Doc's own top bar
this.tabs().ac("vertical")         // …inside one section's own render()`);

		md("A tab whose panel wants its own tabs is just a `Page` with children that calls `tabs()` too. Both levels get real urls, real marking and a real back button, because the only mechanism involved is `Page.container()` reading `parent.regions` — **there is nothing in this file about depth.** [Doc](/framework/ext/doc/) does exactly this, twice over, for every module page on this site — the [usage](/framework/ext/tabs/docs/usage/) note has the rest of the caller picture.");

		h2("A quiet bar is the default, not a variant");

		code.css(`.tab.active, .tab.in-path { color: var(--ink); border-bottom-color: var(--prim); }`);

		md("A flat text label, a hairline under the set, a 2px mark under the selected one — and **no literal colour anywhere**, every value a token. There is no `.minimal` class, because the quiet version *is* the component: a tab bar that shipped a box, a fill and a radius would have decided something that wasn't its call.");

		md("`.active` and `.in-path` come from [`mark_links()`](/framework/core/Router/api/mark_links/), so the selected tab needs no JS. Two more rules pull their weight: a set whose url isn't selected lights its **first** tab, mirroring the panel's own `.default`; and **a rail of one is not a rail**, so a bar with a single entry hides itself.");

		h2("Block: the same set as a folder tab");

		demo(() => {
			demo.app(sample({
				title: "",
				children: {
					state: { label: "state", title: "", content(){ md("The same set, wearing `block` — same urls, same marking, same panel. Only the bar's skin changed."); } },
					notes: { label: "notes", title: "", content(){ md("The selected tab has no fill: its interior **is** the page, so it merges on any background, in light and dark."); } },
				},
				content(){ this.tabs("state notes").ac("block"); },
			})).style("height", "10em");
		}, "A **style option**, opted into at the call site — the underline stays the default. The hairline moves off the bar and onto the tabs, so under the selected one it is *absent* rather than covered: nothing is filled, so nothing has to guess the host's page background. [Doc](/framework/ext/doc/)'s top bar wears it; its member rails stay `vertical`.");

		md("It is also the one shape that carries **type** — the labels take the scale's `h4`, the annotation level, which is what a strip of section names is. A host that tints the strip hands the selected tab `--tab-fill` so its notch cuts back to whatever the content sits on; unset, it stays transparent and the tab is still just a hole onto the page.");

		h2("Vertical: the same component, turned on its side");

		code.js(`this.tabs("guide api").ac("vertical")   // a left rail`);

		md("Identical JS — same urls, same default, same marking. Only the axis changes, and under `64em` the rail flips back to a strip.");

		h2("Overflow");

		md("*\"Right for ~5 children, unusable at twenty\"* stopped being theoretical when [View](/framework/core/View/api/) documented fifty members. A bar is **one strip that scrolls**, never a wrapping block — the [overflow](/framework/ext/tabs/docs/overflow/) note has the physics and the hidden-scrollbar bargain.");

		h2("Where it lived, and why it left");

		md("`tabs()` was 47 lines of `Page.class.js` and its CSS was 30% of `Page.css`, moved out whole to `ext/tabs/` so core never has to name a class only an ext emits. The [extraction](/framework/ext/tabs/docs/extraction/) note has the measurements and the options weighed.");

		md("Next: [Utilities](/framework/util/) — the JS helpers underneath all of this.");

		md.details(import.meta, "readme.md", "Design record — why it left Page, and the physics of the move");
	}
});
