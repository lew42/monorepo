import { Page, View, div, a, p, md } from "/app.js";
import { Figma } from "./Figma.js";
import { grid } from "./grid.js";
import { FigmaFilePage } from "./FigmaFilePage.js";

View.stylesheet(import.meta, "Figma.css");

/* The browse page: tracked files, then (ROUTED pages from here down, never a ?query —
   the owner, 2026-10-12) a file's pages as a preview grid, then one page large with its
   frames, then its compare view:
     /framework/ext/Figma/<file-slug>/
     /framework/ext/Figma/<file-slug>/<page-slug>/
     /framework/ext/Figma/<file-slug>/<page-slug>/compare/<frame-slug>/
   Every slug is the node's name, lowercased and dashed (slug.js), deduped against its
   own siblings — never a Figma node id, except as a last-resort fallback on a collision.
   An old `?file=<key>&page=<id>&compare=<id>` link still opens: legacy_target() below
   works out the same real url and the router loads it in place (history.replaceState),
   so a bookmark or a chat link from before this change still lands somewhere real. */

// Fired at module eval, same trade ai/sessions/2026/09/19/page.js's warm() makes, so a cold
// deep link into a file/page/compare url has a head start before route() has to ask.
Figma.files();

export class FigmaBrowse extends Page {
	content(){
		const box = div.c("figma-browse", () => p.c("muted", "Loading…"));
		Figma.files().then(files => {
			const target = this.legacy_target(files);
			if (target) return void this.app.router.load(target).then(ok => { if (ok) history.replaceState({}, "", target); });
			box.empty(() => this.show_files(files));
		});
	}

	/* `?file=<key>&page=<id>&compare=<id>` → the real path it means now, or null when
	   this load carries no legacy query at all (the ordinary case). */
	legacy_target(files){
		const query = new URLSearchParams(location.search);
		const key = query.get("file");
		if (!key) return null;
		const file = files.find(f => f.key === key);
		if (!file) return this.url;   // an old key nobody tracks any more — the plain list, not a 404

		let url = this.url + file.slug + "/";
		const pageId = query.get("page") || query.get("compare");
		const pageNode = pageId && (file.page(pageId) ?? file.pages.find(p => p.frames.some(fr => fr.id === pageId)));
		if (!pageNode) return url;

		url += pageNode.slug + "/";
		const compareId = query.get("compare");
		const compareNode = compareId && (pageNode.id === compareId ? pageNode : pageNode.frames.find(fr => fr.id === compareId));
		if (compareNode) url += "compare/" + compareNode.slug + "/";
		return url;
	}

	show_files(files){
		md("Figma files the owner tracks, as previews of every page; click one to open it. Designs rebuilt as framework pages: [Color Schemes](/framework/ext/Figma/colors/) and [The Approved Schemes](/framework/ext/Figma/palette/).");
		files.forEach(f => {
			const base = this.url + f.slug + "/";
			a(f.name).href(base);
			grid(f.pages, n => ({ open: base + n.slug + "/", compare: base + n.slug + "/compare/" + n.slug + "/" }));
		});
	}

	/* An undeclared name only (route.md: "it runs for undeclared names only") — this
	   page's own declared children ("colors palette autolayout", page.js) never reach
	   here, so those built framework pages keep working exactly as they did. */
	route(name){
		const files = Figma.resolved() ?? Figma.files_sync();
		const file = files.find(f => f.slug === name);
		return file && new FigmaFilePage({ title: file.name, file });
	}
}
export default FigmaBrowse;
