import { Page, p, a } from "/app.js";
import { code, section, watch } from "../../ui.js";

export default new Page({
	meta: import.meta,
	title: "Bare",
	children: "deep",

	// The last call is NOT optional — see "The missing hook" below. Overriding
	// activate() replaces the mounting, it doesn't add to it.
	activate(){
		this.app.hide_chrome();
		return Page.prototype.activate.call(this);
	},

	deactivate(){ this.app.show_chrome(); },

	content(){
		code(`
activate(){
    this.app.hide_chrome();
    return Page.prototype.activate.call(this);   // ← without this, nothing renders
},
deactivate(){ this.app.show_chrome(); },`, "modes/bare/page.js — the whole opt-in");

		p("No sidebar. I am still in `app.$pages`, in the same place as every other page — the only thing that changed is one class on `.app`.");

		section("The missing hook");

		code(`
activate(){ this.app.hide_chrome(); }        // ✗ silently blank — never mounted
                                             //   and my child then throws on
                                             //   parent.$pages.el`, "measured, first try");

		p("`activate()` **is** the mounting, so overriding it replaces it. These are `assign` objects, so there is no `super` to call and the escape is `Page.prototype.activate.call(this)` — which fails the *\"read the file and know what happens\"* test twice over: nothing says the call is required, and nothing fails loudly when you forget.");

		p("Takeover gets away with it because it deliberately mounts somewhere else. Every other reason to run code on entry pays this. **A separate `enter()` / `leave()` hook, called by `activate()`, would cost two lines and delete the trap** — the one thing this exercise found that the base classes should probably change.").ac("note");

		section("Compare with 4 · Takeover");

		code(`
takeover   this.$app.ac("takeover").append(page.render())   moves the view, then
           page.view.remove()                               removes it on the way out

bare       this.$app.ac("no-chrome")                        one class, reversible`);

		p("Takeover **moves** the page out of the tree, so it cannot have children in the normal way and leaving means un-appending a node. Bare changes nothing structural, which is why the child below still works.").ac("note");

		section("It composes with the others");

		p("Because bare is a class on `.app` and flat is a class on a `.page`, they are independent — a bare page can be flat, and a flat subtree can go bare halfway down. Nothing arbitrates between them.");

		this.previews();

		a.c("page-link", "← Modes").href("/modes/");

		watch(
			"The sidebar is gone but the url still works — reload and you land here bare.",
			"Open Deep: still bare, and now with a chain. Takeover cannot do this.",
			"Press Back twice — deactivate() puts the chrome back, no rebuild."
		);
	}
});
