import { Page, p, a } from "/app.js";
import { code, section } from "../ui.js";

export default new Page({
	meta: import.meta,
	title: "Tabs",

	// Nothing declares that I stay visible while a tab is open — CSS asks
	// whether I contain the active page, which is the actual question.

	// LAZY tabs: three names, no imports, no wiring. tabs() imports only the
	// first, because it has to render it at THIS url.
	children: "overview api guide",

	// …and inline ones, for a second set and a child in no bar at all.
	initialize(){
		this.add("state", "An inline tab. A string is the whole page — no file, no directory, no import.");

		this.add("notes", "Second set, second panel. Each set claims its own children, which is why one `$pages` could not have done this.");

		this.add("standalone", () => {
			p("I'm a child of Tabs and I'm in no bar. My parent claimed its tab children specifically, so I fell through to the ordinary rules and render as a full page.");
			a.c("page-link", "← back to Tabs").href("/tabs/");
		});
	},

	content(){
		code(`
children: "overview api guide",
content(){ this.$tabs = this.tabs("overview api guide"); }`, "the whole thing");

		section("Lazy set — declared by name");

		this.$tabs = this.tabs("overview api guide");

		section("Inline set — declared by add()");

		this.$more = this.tabs("state notes");

		section("What just loaded");

		code(`
/tabs/         1 import — overview, the default tab, rendered right here
/tabs/api/     1 more, on the click
bar labels     Overview · api · guide
               ^ loaded, so its title    ^ names, deterministically`);

		p("The first tab's link is `/tabs/` itself, so there is no second url showing the same content and no redirect. Open a real tab and this page becomes an ancestor, which takes the default back off screen — one CSS rule, nothing to keep in sync.").ac("note");

		section("A child in no bar");

		this.standalone.link();
	}
});
