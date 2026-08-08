import { Page, md, code, h2 } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Examples",
	description: "Nesting: how a page declares children, and how it links to one.",
	icon: "science",

	// Lazy: a name, imported the first time somebody walks to it.
	children: "subpage",

	content(){

		code.js(`children: "subpage"`);

		md("A folder with a `page.js` in it, named by its parent. **The name is the registration** — nothing crawls the filesystem, so a `page.js` no parent declares is a 404.");

		this.previews();

		h2("Two ways to point at a child");

		md("`previews()` above drew that card **without importing anything**. It only knows the name and the url that name must have, which is why the card can say \"subpage\" before the page exists.");

		code.js(`import subpage from "./subpage/page.js";

children: [subpage],
content(){ md("See " + subpage.link()); }`);

		md("Import it instead and you get its real title, and `link()`. A `Page` is dormant, so importing one renders nothing — that is what makes this safe. [subpage](/alex/examples/subpage/) does exactly this with its own child.");

		md("**Imports flow down, never up.** A child that imported its parent back would break only on a deep reload, which is the nastiest failure this framework has.");
	},
});
