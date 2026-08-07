import { Page, p, a } from "/app.js";
import { snippet, whole } from "../../probe.js";

export default new Page({
	meta: import.meta,
	title: "Full, and sealed",

	classes: "full",

	/* The readme says `inert` is the fix and that it belongs to the site, not
	 * the framework. This is that claim, implemented — and it works. Tab from
	 * here and focus never leaves this page.
	 *
	 * Note what it cost: this page had to name `$sidebar`, a property of THIS
	 * site's App subclass. A page that covers the window cannot say so; it can
	 * only reach into the chrome it happens to know about. */
	activate(){
		this.app.$sidebar?.attr("inert", "");
		return Page.prototype.activate.call(this);
	},

	deactivate(){
		this.app.$sidebar?.el.removeAttribute("inert");
		return this;
	},

	content(){
		p("Press Tab. Focus never reaches the sidebar — measured, and that half works. It does reach my parent, which is also `full` and also still on screen underneath me: `.page.full.active-ancestor` never asks whether it contains the leaf. Two defects, and `inert` only fixes the one it was named for.");

		snippet("the whole of it, and every line is a liability", () => {
			class Sealed extends Page {

				activate(){
					this.app.$sidebar?.attr("inert", "");           // names the SITE's chrome
					return Page.prototype.activate.call(this);      // forget this and I never mount
				}

				deactivate(){
					this.app.$sidebar?.el.removeAttribute("inert"); // forget this and the site is dead
					return this;
				}
			}
		});

		a.c("page-link", "← back to Chrome").href("/deep/chrome/");

		whole(import.meta);
	}
});
