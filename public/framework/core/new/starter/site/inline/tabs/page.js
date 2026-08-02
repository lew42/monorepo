import { Page, p, div, a, input } from "/app.js";
import { code, section, watch } from "../../ui.js";

export default new Page({
	meta: import.meta,
	title: "Inline tabs",

	classes: "tabs",

	initialize(){
		this.names = ["red", "green", "blue"];

		this.names.forEach(name => this.add(name, () => {
			p(`Panel ${name}. Built from a function, mounted into my parent's tab-panel.`);
			input.c("probe").attr("placeholder", "type here, switch tabs, come back");
		}));
	},

	content(){
		code(`
classes: "tabs",

initialize(){
    this.names = ["red", "green", "blue"];
    this.names.forEach(name => this.add(name, () => {
        p(\`Panel \${name}.\`);
        input.c("probe");
    }));
},

content(){
    div.c("tab-bar", () => this.names.forEach(n => a.c("tab", n).href(this.url + n + "/")));
    this.$pages = div.c("tab-panel");
}`, "inline/tabs/page.js — the whole file, minus prose");

		p("Three tabs, three urls, no files, and not one path written by hand. `add()` supplies the pages and `$pages` supplies the place — persistence is free, because nothing is ever detached.");

		div.c("tab-bar", () => this.names.forEach(name =>
			a.c("tab", name).href(this.url + name + "/")));

		this.$pages = div.c("tab-panel");

		section("The closure is the page");

		p("Each tab's content function closes over `name`, so the loop writes three different pages without three different files. That only works because the function *is* the content — `add()` wraps it in a `Page` and derives everything else from the name.");

		section("Everything still holds");

		p("Each tab is a real url you can reload or bookmark. `.active` comes from `mark_links()`, the same pass that lights the sidebar. The panel you typed in is hidden by CSS rather than detached, so its text survives a round trip — exactly as it does for the file-backed tabs.");

		p("Which is the point: **inline and file-backed pages are the same object.** Nothing in `Page`, `Router`, or `App` branches on where a page came from.").ac("note");

		watch(
			"Type in red, switch to blue, come back.",
			"Reload on /inline/tabs/blue/ — the tab bar rebuilds and blue is selected.",
			"Console: three memory hits, zero imports."
		);
	}
});
