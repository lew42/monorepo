import { Page, md } from "/app.js";

/* The two long notes behind decks, given real urls. `route()`, not `children:` — a
   declared child is loaded EAGERLY (`load_all_children()`), and decks' own index does
   not need two more preview cards for its own paperwork (blogx/doc/page.js's pattern,
   copied verbatim here: same dead-link trap, same fix).

   ⚠ Undeclared on purpose: links straight to `/imagine/decks/doc/regions/` and
     `/imagine/decks/doc/decisions/` from readme.md and page.js are what make these
     pages reachable — nothing crawls, and neither is meant to compete with the nine
     cuts on the index wall.

   ⚠ The trap this file exists to close: `Router` never intercepts a link ending in
     an extension, so a bare `doc/regions.md` href did a full page load onto raw
     unstyled markdown (404 in console, masked by the static server's 200 fallback). */
const notes = {
	"regions": "The content-kind map — which kind belongs in a region of what width",
	"decisions": "Decisions — every measurement, what was rejected, and what shipped",
};

export default new Page({
	meta: import.meta,
	title: "Decks notes",
	description: "The measurements behind decks' nine cuts.",

	route(name){
		if (!notes[name]) return null;

		const meta = this.meta;
		return { title: notes[name], content(){ return md.file(meta, name + ".md", { h1: false }); } };
	},

	content(){
		md("The working notes behind decks: [Regions](/imagine/decks/doc/regions/) — the content-kind map. [Decisions](/imagine/decks/doc/decisions/) — every measurement, what was rejected, and what shipped.");
	},
});
