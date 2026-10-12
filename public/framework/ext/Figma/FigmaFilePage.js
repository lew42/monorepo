import { Page, a, h2 } from "/app.js";
import { grid } from "./grid.js";
import { FigmaPagePage } from "./FigmaPagePage.js";

/* One tracked file's pages, as the preview grid — `/framework/ext/Figma/<file-slug>/`. */
export class FigmaFilePage extends Page {
	content(){
		const { file } = this;
		a("All files").href(this.url.replace(/[^/]+\/$/, ""));
		h2(file.name);
		grid(file.pages, n => ({ open: this.url + n.slug + "/", compare: this.url + n.slug + "/compare/" + n.slug + "/" }));
	}

	/* An undeclared name only — none of this file's pages has a page.js of its own. */
	route(name){
		const node = this.file.page_by_slug(name);
		return node && new FigmaPagePage({ title: node.name, file: this.file, node });
	}
}
export default FigmaFilePage;
