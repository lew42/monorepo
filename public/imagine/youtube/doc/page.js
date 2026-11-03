import { Page, md } from "/app.js";

/* The five working notes behind this module, given real urls. `route()`, not
   `children:` — a declared child loads EAGERLY, and this index does not need five more
   preview cards competing with the six labs (blogx/doc/page.js's pattern, copied here
   because the bug it fixes is the same one: a raw `doc/whatever.md` link is a path with
   an extension, and `Router.link_clicked()` skips any link that ends in one — so it was
   a full, unstyled page load onto raw markdown source, not a route. Found live 2026-09-04:
   readme.md and all five doc/*.md files cross-linked each other with `./cues.md`-style
   paths, so reading the docs at all meant leaving the app on the first click.

   ⚠ Undeclared on purpose, same as blogx's: a link straight to a trailing-slash url is
     what makes each page reachable — nothing crawls a directory. */
const notes = {
	cues: "cues.md — the engine",
	api: "api.md — the IFrame Player API",
	yield: "yield.md — the video steps aside",
	marks: "marks.md — where a cue table comes from",
	decisions: "decisions.md — the record",
};

export default new Page({
	meta: import.meta,
	title: "YouTube notes",
	description: "The five working notes behind this module, each one a real url.",

	route(name){
		if (!notes[name]) return null;

		const meta = this.meta;
		return { title: notes[name], content(){ return md.file(meta, name + ".md", { h1: false }); } };
	},

	content(){
		md("The working notes behind this module — the same five links [the readme](/imagine/youtube/readme/) points to, each one a real page instead of a raw file:");
		md(Object.keys(notes).map(name => `- [${notes[name]}](/imagine/youtube/doc/${name}/)`).join("\n"));
	},
});
