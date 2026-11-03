import { Page, md, div } from "/app.js";
import { view } from "../DefaultView.js";

/**
 * "The App object" — the ONE running app, `this.app`, drawn as the very same item
 * tree as everything else here. Open `.router` for the page you're on right now
 * (`.active`); open `.root` for the whole site's page tree, lazily — nothing
 * under it is read or drawn until you click into it, so this costs nothing extra
 * to show even though `.root` is, transitively, every page on the site.
 */
export default new Page({
	meta: import.meta,
	title: "The App object",
	description: "The one running App — its router, its page tree, its own settings — drawn live from window.app, not described.",
	icon: "apps",

	content(){
		md("**There is one `App` instance for the whole site, and it is just an object like any other now.** Open `.router` below for the current route (`.active` is the page you're on); open `.root` for the site's whole page tree — lazily, so nothing under it is read until you actually click into it. The rest (`.socket`, `.logo`, `.brand`, …) is whatever [`/app.js`](/framework/core/App/) configured this app with.");

		md(`**Right now, at a glance:** on \`${this.app.router?.active?.url ?? location.pathname}\` — **${this.app.loaders.length}** loader(s) this app is tracking (fonts, stylesheets — see \`.loaders\` below).`);

		div.c("flex v gap", () => view(this.app));

		md.details(import.meta, "../doc/default-view.md", "How this works");
	},
});
