import { Page, md } from "/app.js";

/* The one decision-log entry behind edit/, given a real url. `route()`, not `children:`
   — same reasoning as cms/doc/page.js one level up.

   ⚠ Undeclared on purpose: readme.md's own link is what makes this reachable. It used
     to point straight at `doc/decisions.md` — a `.md`-extension href, which the Router
     never intercepts (`core/Router/Router.js:35`), so the link took a reader out of the
     app to a raw, unstyled file. Same bug, same fix as blogx's `doc/page.js`. */
const notes = {
	"decisions": "Decisions — edit/ drafts",
};

export default new Page({
	meta: import.meta,
	title: "Edit notes",
	description: "Why the draft note reads \"restored\" even for text never reloaded.",

	route(name){
		if (!notes[name]) return null;

		const meta = this.meta;
		return { title: notes[name], content(){ return md.file(meta, name + ".md", { h1: false }); } };
	},

	content(){
		md("Why [edit](/imagine/cms/edit/)'s draft note always reads \"restored\": [Decisions](/imagine/cms/edit/doc/decisions/).");
	},
});
