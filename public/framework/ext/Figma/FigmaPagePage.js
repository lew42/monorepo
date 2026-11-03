import { Page, a, h2, img } from "/app.js";
import { grid } from "./grid.js";
import { FigmaComparePage } from "./FigmaComparePage.js";

/* One Figma page, large, with its frames below —
   `/framework/ext/Figma/<file-slug>/<page-slug>/`. `this.file` and `this.node` arrive
   through the constructor's assign-based Page() (core/Page/Page.class.js:42-45) — set
   by whoever routed here (FigmaBrowse, FigmaFilePage), never fetched again. */
export class FigmaPagePage extends Page {
	content(){
		const { node, file } = this;
		a(`${file.name} pages`).href(this.url.replace(/[^/]+\/$/, ""));
		h2(node.name);
		node.built && a("Built page").href(node.built.path).ac("figma-built");
		node.shot && img.c("figma-large").attr("src", node.shot_url).attr("alt", node.name).attr("decoding", "async");
		node.frames?.length && grid(node.frames, n => ({ compare: this.url + "compare/" + n.slug + "/" }));
		a("Open in Figma").href(node.figma_url);
	}

	/* `compare` only — a fixed, undeclared name, never data-shaped, so it answers without
	   touching the files cache: `this.node`/`this.file` are already in hand. route.md:
	   "it runs for undeclared names only", so a real page.js named `compare` would still win. */
	route(name){
		if (name !== "compare") return null;
		const page = this;
		return {
			title: "Compare",
			// The frame being compared, or the page itself when it was built whole (no frames —
			// Auto layout, Page 8): both answer to the SAME slug segment, one level down.
			route(target){
				const found = [page.node, ...(page.node.frames ?? [])].find(n => n.slug === target);
				return found && new FigmaComparePage({ title: `${found.name}: compare`, file: page.file, pageNode: page.node, node: found });
			},
			content(){ a("Back to " + page.node.name).href(page.url); },
		};
	}
}
export default FigmaPagePage;
