import { Page, md } from "/app.js";

/* The three long notes behind stream, given a real url each. `route()`, not `children:` —
   a declared child loads EAGERLY, and stream's own index does not need three more preview
   cards for its own paperwork (blogx/doc/page.js's pattern, copied here 2026-09-04).

   ⚠ WHY THIS EXISTS: `page.js` and `readme.md` used to link straight at `./doc/wire.md` etc.
     `Router` never intercepts a link ending in an extension, so that link fell through to a
     plain static fetch — 200, `content-type: text/markdown`, and the browser showed the raw
     file with no stylesheet and no way back to the site. Every such link in this realm now
     points at the trailing-slash url this route serves instead. */
const notes = {
	"wire": "The wire — what carried it, the measurements, the one thing missing",
	"durable-objects": "Durable Objects — what this becomes in production, with prices and limits",
	"decisions": "Decisions — the delta contract, and where \"anything on a page\" stops",
};

export default new Page({
	meta: import.meta,
	title: "Stream notes",
	description: "The three working notes behind stream: the wire, Durable Objects, and the decisions record.",

	route(name){
		if (!notes[name]) return null;

		const meta = this.meta;
		return { title: notes[name], content(){ return md.file(meta, name + ".md", { h1: false }); } };
	},

	content(){
		md(`The working notes behind stream: [the wire](/imagine/stream/doc/wire/) (what carried it
and the measurements), [Durable Objects](/imagine/stream/doc/durable-objects/) (what this
becomes in production), [decisions](/imagine/stream/doc/decisions/) (the record, and where
"anything on a page" stops).`);
	},
});
