import { Page, p, div, button, a } from "/app.js";
import { code, section, watch } from "../../ui.js";

export default new Page({
	meta: import.meta,
	title: "Mode via the link?",

	content(){
		code(`
a.c("page-link", "Open in columns").href("/docs/").attr("data-mode", "flat")

// Router.click(e)
this.go(link.pathname, link.dataset.mode);`, "what it would take — about four lines");

		p("Technically yes: a mode is one class, so the Router could read it off the anchor and put it on the destination. **It still shouldn't.**");

		section("Because reload is the test");

		code(`
click the link    /docs/  +  data-mode=flat    →   columns
reload            /docs/                        →   replace     ← different page`);

		p("The url is the only state that survives a refresh, a bookmark, or a link someone pastes to you. A mode carried by the click exists for exactly one navigation, so the page you sent someone is not the page they open.");

		section("Two ways to make it survive");

		code(`
in the page    new Page({ classes: "flat" })     the destination decides. default answer.
in the url     /docs/?mode=flat                  the visitor decides, and it reloads.`);

		p("The first is what every page on this site does. The second is legitimate when the choice is genuinely the reader's — a density toggle, a diff view — because the url still describes what you see.").ac("note");

		section("The gap, if you want the second one");

		code(`
go(link.pathname)                  // today — the query string is dropped
go(link.pathname + link.search)    // what ?mode= would need`, "starter/Router.js");

		p("`Router.click()` passes only `pathname`, so a `?mode=flat` link currently arrives without its query. One word, but it's a real decision: once `search` reaches `load()`, something has to decide whether two urls differing only by query are the same page.").ac("note");

		section("What a transient mode looks like instead");

		p("If it truly is per-visit and shouldn't survive, it isn't navigation at all — it's a control on the page, which is what these are:");

		this.toggles();

		a.c("page-link", "← Modes").href("/modes/");

		watch(
			"Toggle flat, then reload — you're back to replace, and the url never lied.",
			"That's the same failure a data-mode link would have, made obvious."
		);
	},

	toggles(){
		return div.c("toggles", () => {
			button("home → flat").click(() => this.app.root.view.ac("flat"));
			button("home → replace").click(() => this.app.root.view.rc("flat"));
		});
	}
});
