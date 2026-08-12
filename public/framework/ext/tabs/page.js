import { Page, md, code, h2 } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Tabs",
	description: "A bar of links and the panel they fill — one ext, patched onto every Page.",
	icon: "tab",

	// Four real pages, so both bars below are the live component. `title: ""` drops the
	// panel's own h1 — a demo of a bar must not read as a second document.
	children: {
		what:  { label: "what",  title: "", content(){ md("This panel is `/framework/ext/tabs/what/` — a real page, mounted in its parent's region. Reload it."); } },
		why:   { label: "why",   title: "", content(){ md("The selected tab is read off the url, so clicking produces byte-identical output to reloading."); } },
		state: { label: "state", title: "", content(){ md("The same set, wearing `block` — same urls, same marking, same panel. Only the bar's skin changed."); } },
		notes: { label: "notes", title: "", content(){ md("The selected tab has no fill: its interior **is** the page, so it merges on any background, in light and dark."); } },
	},

	content(){

		code.js(`import "/framework/ext/tabs/tabs.js";   // once, anywhere

content(){ this.tabs("what why"); }`);

		this.tabs("what why");

		md("`this.tabs()` reads like a `Page` method because it is one — this module patches it onto `Page.prototype` the moment it's imported, the same move [Highlight](/framework/ext/highlight/) makes on `code`. A site that never imports it ships neither the JS nor the CSS.");

		md("**Every tab is a url.** `/framework/ext/tabs/what/` is a real page with nothing on disk behind it, and the selected tab is read off the url — clicking produces byte-identical output to reloading.");

		h2("Which children are tabs is decided at placement");

		code.js(`this.tabs("what why");                 // the set above
this.tabs("state notes").ac("block");  // …and the one below`);

		md("**Not marked on the child.** So a page can have several sets, and a child in none of them is an ordinary child that renders wherever it would have anyway — nothing on a `Page` ever says *\"I am a tab.\"*");

		h2("Nesting is nesting pages, not nesting sets");

		code.js(`this.tabs("overview api docs")     // the class page
this.tabs().ac("vertical")         // …inside the API group's own render()`);

		md("A tab whose panel wants its own tabs is just a `Page` with children that calls `tabs()` too. Both levels get real urls, real marking and a real back button, because the only mechanism involved is `Page.container()` reading `parent.regions` — **there is nothing in this file about depth.** [Classdoc](/framework/ext/classdoc/) is two levels of it, and is the site's only caller.");

		h2("A quiet bar is the default, not a variant");

		code.css(`.tab.active, .tab.in-path { color: var(--ink); border-bottom-color: var(--prim); }`);

		md("A flat text label, a hairline under the set, a 2px mark under the selected one — and **no literal colour anywhere**, every value a token. There is no `.minimal` class, because the quiet version *is* the component: a tab bar that shipped a box, a fill and a radius would have decided something that wasn't its call.");

		md("`.active` and `.in-path` come from [`mark_links()`](/framework/core/Router/api/mark_links/), so the selected tab needs no JS. Two more rules pull their weight: a set whose url isn't selected lights its **first** tab, mirroring the panel's own `.default`; and **a rail of one is not a rail**, so a bar with a single entry hides itself.");

		h2("Block: the same set as a folder tab");

		code.js(`this.tabs("state notes").ac("block")   // folder tabs`);

		this.tabs("state notes").ac("block");

		md("A **style option**, opted into at the call site — the underline stays the default. The hairline moves off the bar and onto the tabs, so under the selected one it is *absent* rather than covered: nothing is filled, so nothing has to guess the host's page background, and the tab's interior is simply the page. [Classdoc](/framework/ext/classdoc/)'s top bar wears it; its member rails stay `vertical`.");

		md("It is also the one shape that carries **type** — the labels take the scale's `h4`, the annotation level, which is what a strip of section names is. A host that tints the strip hands the selected tab `--tab-fill` so its notch cuts back to whatever the content sits on; unset, it stays transparent and the tab is still just a hole onto the page.");

		h2("Vertical: the same component, turned on its side");

		code.js(`this.tabs("guide api").ac("vertical")   // a left rail`);

		md("Identical JS — same urls, same default, same marking. Only the axis changes, and under `64em` the rail flips back to a strip.");

		h2("Overflow, which used to be the headline trap");

		md("*\"Right for ~5 children, unusable at twenty\"* stopped being theoretical when [View](/framework/core/View/api/) documented fifty members: flipped to a bar, fifty wrapping links were 500px of nav above the content they navigate.");

		md("So a bar is **one strip that scrolls** — `flex-wrap: nowrap`, `overflow: auto`, and a `max-height` on the rail so `position: sticky` means something. A rail taller than the viewport sticks its top and puts its own last entries out of reach forever.");

		md("The scrollbar is hidden, so `reveal()` scrolls the selected tab into the strip on the way in — the same bargain [ToC](/framework/ext/toc/) makes. Hiding a scrollbar is only honest if something keeps the current item in view.");

		h2("Where it lived, and why it left");

		md("`tabs()` was 47 lines of `Page.class.js` and its CSS was 30% of `Page.css` — for a component with **one live caller on the whole site**, and that caller (`classdoc`) is itself an ext. A newcomer reading `Page` top to bottom had to pass a tab bar's url-ownership rules to reach `render()`.");

		md("Moving the JS was the easy half. The CSS took its `@layer util` panel rule with it, because leaving it behind in `Page.css` would have made core name a class only an ext emits — the exact undeclarable dependency this framework's CSS doctrine forbids.");

		md("Next: [Utilities](/framework/util/) — the JS helpers underneath all of this.");

		md.details(import.meta, "readme.md", "Design record — why it left Page, and the physics of the move");
	}
});
