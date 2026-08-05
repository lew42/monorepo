import { Page, md, pre, code } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Ext",
	description: "Opt-in addons. They may extend core; core never depends on them.",
	// col: "narrow",
	// Lazy names, not imports — an eager array pulls every child's module into
	// this page's own load, which is the exact thing laziness exists to avoid.
	// `nav` supplies the labels that the imports used to.
	children: "markdown demo highlight classdoc",

	nav: {
		markdown:  { label: "Markdown",  icon: "article" },
		demo:      { label: "Demo",      icon: "play_circle" },
		highlight: { label: "Highlight", icon: "code" },
		classdoc:  { label: "Classdoc",  icon: "menu_book" },
	},
	content(){

		code.js(`import md from "/framework/ext/markdown/md.js";`);

		md("Opting in is an import. Nothing else.");

		md("Addons are allowed to do what core won't: patch `View`, bring a vendored dependency, ship their own CSS. Two rules — **core never imports an ext**, and **vendor the dependency** (a CDN import would make every render wait on someone else's uptime).");

		md("This site opts in for every page, once, in `app.js` — which is why `md()` and `demo()` come straight from `/app.js` here.");

		/* The one page on this site that earns a tab bar, and it is worth saying
		 * why so nobody copies it onto a page that doesn't:
		 *
		 *   four children · flat · none has children of its own · you flip
		 *   between them rather than drilling down
		 *
		 * The moment a child grows children, a tab bar has nowhere to show the
		 * trail and this should go back to previews(). `tabs()` also has no
		 * overflow handling at all — right at four, unusable at twenty, and it
		 * will never warn you. */
		this.$tabs = this.tabs();
	}
});
