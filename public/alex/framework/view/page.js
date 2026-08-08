import { Page, md, code, h2, demo, div, p, toc } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "View",
	description: "One DOM element, chainable. Every line you write.",
	icon: "code",

	content(){

		toc();

		demo(() => {
			div.c("flex gap", () => {
				p("child 1");
				p("child 2");
			});
		}, "Calling a tag function creates the element **and puts it where you are**. Pass a function as the last argument and everything called inside it lands inside that element.");

		md("Every tag function returns a `View` wrapping one element. `div.c(\"flex gap\")` is the shortcut for creating it with classes already on.");

		h2("Classes");

		md(`| | |
|---|---|
| \`.ac("a b")\` | add |
| \`.rc("a")\` | remove |
| \`.hc("a")\` | has? → true/false |
| \`.tc("a")\` | toggle |`);

		h2("Content");

		md(`| | |
|---|---|
| \`.append(…)\` | Views, strings, DOM nodes, arrays, or a build function |
| \`.prepend(…)\` | same, at the start |
| \`.empty(…)\` | clear, then optionally append |
| \`.text(v)\` / \`.html(v)\` | get or set |`);

		md("**A callback re-establishes the captor**, so what you write inside `.append(fn)` reads exactly like page code:");

		code.js(`$list.empty(() => names.forEach(name => p(name)));`);

		md("That is also the fix for the framework's nastiest trap: **capturing is synchronous, so never call a factory after an `await`.** Capture the container now, fill it in a callback.");

		h2("Attributes & events");

		md(`| | |
|---|---|
| \`.attr(name, v)\` | get or set |
| \`.href(url)\` | shortcut for \`.attr("href", …)\` |
| \`.style(prop, v)\` | inline CSS; pass an object to set several |
| \`.on(event, cb)\` / \`.click(cb)\` | \`cb\` runs with \`this\` set to the View |`);

		h2("Layout & lifecycle");

		md(`| | |
|---|---|
| \`.hide()\` / \`.show()\` / \`.toggle()\` | control \`display\` |
| \`.remove()\` / \`.replace(view)\` | take it off, or swap it |
| \`.load(meta, url)\` / \`.lazy(meta, url)\` | import a module and append its default export |`);

		h2("Make your own");

		md("A plain function that builds Views is usually enough:");

		code.js(`export function panel(title){
    return div.c("panel", () => h2(title));
}`);

		md("`extend View` when it needs state of its own — `Sidebar` is that. `class DocsSidebar extends Sidebar {}` renders `.docs-sidebar.sidebar`, because `classify()` reads the class name.");

		md("Back to [Framework](/alex/framework/), or on to [Styles](/alex/styles/).");
	},
});
