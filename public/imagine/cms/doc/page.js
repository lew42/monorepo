import { Page, md } from "/app.js";

/* The one open proposal behind cms, given a real url. `route()`, not `children:` — a
   declared child loads EAGERLY, and cms's own index (five cards + Guide) doesn't need
   a sixth card for one pending write-up.

   ⚠ Undeclared on purpose: readme.md's own link is what makes this reachable. It used
     to point straight at `doc/undo-proposal.md` — a `.md`-extension href, which the
     Router never intercepts (`core/Router/Router.js:35`), so the link took a reader
     out of the app to a raw, unstyled file. Same bug, same fix as blogx's `doc/page.js`. */
const notes = {
	"undo-proposal": "Undo for the delta stream — a proposal",
};

export default new Page({
	meta: import.meta,
	title: "CMS notes",
	description: "The one open proposal behind cms's JSON pages: undo for an append-only log.",

	route(name){
		if (!notes[name]) return null;

		const meta = this.meta;
		return { title: notes[name], content(){ return md.file(meta, name + ".md", { h1: false }); } };
	},

	content(){
		md("The one open proposal behind [JSON pages](/imagine/cms/json/): [Undo for the delta stream](/imagine/cms/doc/undo-proposal/) — three shapes measured, replay wins, no contract change. Awaiting a verdict.");
	},
});
