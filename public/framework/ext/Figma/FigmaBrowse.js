import { Page, View, div, a, img, p, h2, md } from "/app.js";
import { Figma } from "./Figma.js";

View.stylesheet(import.meta, "Figma.css");

/* The browse page: tracked files, then a file's pages as a preview grid, then one page large with its frames.
   Each level is its own address: ?file=<key>&page=<node id>. */
export class FigmaBrowse extends Page {
	content(){
		const query = new URLSearchParams(location.search);
		const box = div.c("figma-browse");
		Figma.files().then(files => box.empty(() => this.draw(files, query)));
	}

	draw(files, query){
		const file = files.find(f => f.key === query.get("file")), node = file?.page(query.get("page"));
		if (node) return this.show_page(node);
		if (file) return this.show_file(file);
		this.show_files(files);
	}

	show_files(files){
		md("Figma files the owner tracks. Pick one to see its pages.");
		div.c("figma-grid", () => files.forEach(f => {
			a.c("figma-card", () => {
				const first = f.pages.find(pg => pg.shot);
				first && img().attr("src", first.shot_url).attr("alt", f.name);
				h2(f.name); p(`${f.pages.length} pages`);
			}).href(`?file=${f.key}`);
		}));
	}

	show_file(file){
		a("All files").href("?");
		h2(file.name);
		div.c("figma-grid", () => file.pages.forEach(pg => {
			a.c("figma-card", () => {
				pg.shot && img().attr("src", pg.shot_url).attr("alt", pg.name).style("aspect-ratio", pg.ratio);
				h2(pg.name); p(pg.frames.length ? `${pg.frames.length} frames` : "page preview");
			}).href(`?file=${file.key}&page=${pg.id}`);
		}));
	}

	show_page(node){
		a(`${node.file.name} pages`).href(`?file=${node.file.key}`);
		h2(node.name);
		node.shot && img.c("figma-large").attr("src", node.shot_url).attr("alt", node.name);
		node.frames.length && div.c("figma-grid", () => node.frames.forEach(f => {
			div.c("figma-card", () => {
				f.shot && img().attr("src", f.shot_url).attr("alt", f.name);
				h2(f.name); p(`${f.w} × ${f.h}`);
			});
		}));
		a("Open in Figma").href(node.figma_url);
	}
}
export default FigmaBrowse;
