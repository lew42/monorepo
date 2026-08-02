import { Page, p, div, a } from "/app.js";
import { code, section, watch } from "../../ui.js";

export default new Page({
	meta: import.meta,
	title: "3 · Tabs",
	children: "one two three",

	classes: "tabs",   // keep my content visible; children mount into $pages below

	content(){
		code(`
classes: "tabs",

content(){
    div.c("tab-bar", () => this.tabs());   // real <a href> — the Router upgrades them
    this.$pages = div.c("tab-panel");      // claim the slot
}`, "layouts/tabs/page.js");

		p("A tab bar is a nav, and a nav is a tab bar. Same activation, pointed somewhere else — `$pages` is just a property, so `content()` can put the slot wherever it likes.");

		div.c("tab-bar", () => this.tabs());
		this.$pages = div.c("tab-panel");   // claim the slot — children mount HERE
		p("↑ pick a tab — the panel is empty until a child activates into it.").ac("note");

		section("The slot is a property, not a method");

		code(`
render(){
    …
    this.$pages ??= div.c("pages");   // only if content() didn't claim it
}`, "Page.class.js");

		p("`??=` is the entire mechanism. A page that says nothing gets the default slot after its content; a page that assigns `$pages` in `content()` gets it wherever it put it. No override, no hook.").ac("note");

		section("The tabs are links");

		p("Each is a plain `<a href=\"/layouts/tabs/two/\">`. So every tab is a real url — deep-linkable, bookmarkable, Back-able — and `.active` comes from the same `mark_links()` pass that lights up the sidebar. Nothing here knows what a tab is.");

		section("Nothing is detached, ever");

		code(`
.page:not(.active-page):not(.active-ancestor) { display: none; }`, "styles.css — the only thing that hides a page");

		p("Type into a tab's box, switch tabs, come back. It's still there — and not because tabs asked for anything. Every page stays mounted once shown, so this is just what pages do now.").ac("note");

		watch(
			"Type into the box on tab one, switch to two, come back — text preserved.",
			"Inspect .tab-panel: every tab you've opened is still mounted, display:none.",
			"Press Back — the tab follows, because the tab IS the url."
		);
	},

	tabs(){
		["one", "two", "three"].forEach(name =>
			a.c("tab", name).href(this.url + name + "/"));
	}
});
