import { Page, h2, md, code } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Extensions",
	description: "Opt-in addons. They may extend core, core never depends on them.",

	content(){
		code.js(`import md from "/framework/ext/markdown/md.js";`).ac("mb");
		md("Opting in is an import, nothing else. Addons are allowed to do what core won't: patch `View`, bring a vendored dependency, ship their own CSS. This site opts every page into all six, once, in `app.js`, which is why every page here can just write `md(\"**docs**\")`.").ac("mb");

		h2("markdown").ac("mb");
		md("`md()`, `view.md()`, `md.file()`. Full markdown, bold, links, tables, unlike `p()`, which only handles backtick inline code.").ac("mb");

		h2("demo").ac("mb");
		md("`demo(fn, caption)` runs `fn` (captured) and shows the live render and its own source side by side. Used all over this page and the Custom Components page.").ac("mb");

		h2("highlight").ac("mb");
		md("Turns on syntax highlighting everywhere: `code.js()`, `code.css()`, `code.lang(name, src)`, and every markdown code fence on the site.").ac("mb");

		h2("files").ac("mb");
		md("Shows a tree of real files, fetched, so a \"here is a whole project\" section can't drift from the project it's describing.").ac("mb");

		h2("toc").ac("mb");
		md("`toc()` reads a page's own headings and builds an on-page nav from them, one microtask after they're written.").ac("mb");

		h2("classdoc").ac("mb");
		md("Turns \"a method has a `.md` file next to the `page.js`\" into a child page showing that method's real source. Not used on this site, but it's how the framework's own docs at `/framework/` document each class.").ac("mb");

		md("Next: [Utilities](/edric/getStarted/framework/utilities/), small dependency-free helpers.");
	}
});