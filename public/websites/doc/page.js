import { Page, md, div, a, span } from "/app.js";

/* The four notes behind /websites/. Titles live here once — the list you see and the
 * pages you open come off the same object.
 *
 * ⚠ This little page.js is what makes `/websites/doc/schema/` a real url. Without it the
 *   only way to link a note is the literal `.md` path, which leaves the SPA entirely
 *   (and the pretty form 404s in console while the static fallback masks it with a 200). */
const notes = {
	schema:    "The record, field by field",
	tags:      "The whole tag vocabulary, and the rule for writing one",
	tools:     "What the three tools measure",
	decisions: "Why a manifest, why jpeg, why the viewer scales",
};

export default new Page({
	meta: import.meta,
	title: "Docs",
	icon: "menu_book",
	description: "How the corpus is built — the record's contract, the tools, the decisions.",

	/* `route()` rather than `children:`: a declared child is loaded eagerly, and a name whose
	 * dir has no page.js only resolves after that probe 404s — three 404s in the console of
	 * every page under /websites/. route() is asked only for a name somebody navigated to. */
	route(name){
		if (!notes[name]) return null;
		const meta = this.meta;
		return { title: notes[name], content(){ return md.file(meta, name + ".md", { h1: false }); } };
	},

	content(){
		md("How the corpus is built. The [readme](/websites/readme.md) is the short version; these are the contract, the measurements and the decisions.");

		div.c("page-previews bleed", () => Object.entries(notes).forEach(([name, title]) => {
			a.c("page-preview").href(this.url + name + "/").append(() => span.c("page-preview-title", title));
		})).style("--column", "20em");
	},
});
