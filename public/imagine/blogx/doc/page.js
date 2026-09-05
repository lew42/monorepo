import { Page, md } from "/app.js";

/* The one long note behind blogx, given a real url. `route()`, not `children:` — a
   declared child is loaded EAGERLY (`load_all_children()`), and blogx's index does
   not need a ninth preview card for its own paperwork (blog/doc/page.js's pattern).

   ⚠ Undeclared on purpose: a link straight to `/imagine/blogx/doc/decisions/` from
     readme.md and page.js is what makes this page reachable — nothing crawls, and
     this one is not meant to compete with the eight candidates on the index wall. */
const notes = {
	"decisions": "Decisions — every measurement, what was rejected, and what is open",
};

export default new Page({
	meta: import.meta,
	title: "Blogx notes",
	description: "The measurements behind blogx's eight verdicts.",

	route(name){
		if (!notes[name]) return null;

		const meta = this.meta;
		return { title: notes[name], content(){ return md.file(meta, name + ".md", { h1: false }); } };
	},

	content(){
		md("The working notes behind blogx: [Decisions](/imagine/blogx/doc/decisions/) — every measurement, what was rejected, and what is left for the owner.");
	},
});
