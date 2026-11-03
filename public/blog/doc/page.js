import { Page, md, div, a, span } from "/app.js";

// The three notes behind /blog/. Their titles live here once — the list you see and
// the pages you open come off the same object.
const notes = {
	"front":        "The front, and the shell it sits in",
	"structure":    "File structure",
	"meta-tags":    "Meta tags that actually work",
	"reading-page": "The un-centered reading page",
	"feed":         "The feed, and how long a post is",
};

export default new Page({
	meta: import.meta,
	title: "Notes",
	description: "How this section is built - the meta-tag hybrid, the file structure, the reading layout.",

	/* `route()` rather than `children:`, and the difference is three requests. A
	 * declared child is loaded EAGERLY (`load_all_children()`), and a child with no
	 * page.js of its own only resolves after that probe 404s — so declaring these three
	 * markdown notes put three 404s in the console of every page under /blog/, index
	 * included. `route()` is asked only for a name somebody actually navigated to. */
	route(name){
		if (!notes[name]) return null;

		const meta = this.meta;

		return { title: notes[name], content(){ return md.file(meta, name + ".md", { h1: false }); } };
	},

	content(){
		md("Working notes for `/blog/` itself. The [readme](/blog/readme.md) is the short version; these are the decisions, the measurements, and what is still open.");

		div.c("page-previews bleed", () => Object.entries(notes).forEach(([name, title]) => {
			a.c("page-preview").href(this.url + name + "/").append(() => span.c("page-preview-title", title));
		})).style("--column", "20em");
	},
});
