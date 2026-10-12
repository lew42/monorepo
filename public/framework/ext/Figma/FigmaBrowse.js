import { Page, View, div, a, img, p, h2, md } from "/app.js";
import { Figma } from "./Figma.js";

View.stylesheet(import.meta, "Figma.css");

/* The browse page: tracked files, then a file's pages as a preview grid, then one page large with its frames,
   then (?compare=<node>) the Figma original beside the live framework page built from it.
   Each level is its own address: ?file=<key>&page=<node id>&compare=<node id>.
   Cards show a small JPEG (thumbs.mjs), lazy-loaded; the full PNG loads only on a page's own view. */
export class FigmaBrowse extends Page {
	content(){
		const box = div.c("figma-browse");
		Figma.files().then(files => {
			const redraw = () => box.empty(() => this.draw(files, new URLSearchParams(location.search)));
			redraw();
			/* The Router ignores a link that changes only ?query, so the URL moved but nothing redrew (the "laggy" clicks).
			   Own ?query links here: push the url, redraw from the files already in memory, scroll to the top. */
			box.el.addEventListener("click", e => {
				const link = e.target.closest?.("a[href^=\"?\"]");
				if (!link || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey) return;
				e.preventDefault(); e.stopPropagation();
				history.pushState(history.state, "", location.pathname + link.getAttribute("href"));
				redraw();
				box.el.scrollIntoView();
			});
			addEventListener("popstate", () => box.el.isConnected && redraw());
		});
	}

	draw(files, query){
		const file = files.find(f => f.key === query.get("file")), node = file?.find(query.get("compare") || query.get("page"));
		if (node && query.get("compare")) return this.show_compare(node, query.get("page"));
		if (node) return this.show_page(node);
		if (file) return this.show_file(file);
		this.show_files(files);
	}

	show_files(files){
		md("Figma files the owner tracks, as previews of every page; click one to open it. Designs rebuilt as framework pages: [Color Schemes](/framework/ext/Figma/colors/) and [The Approved Schemes](/framework/ext/Figma/palette/).");
		files.forEach(f => {
			a(f.name).href(`?file=${f.key}`);
			this.show_nodes(f, f.pages);
		});
	}

	show_file(file){
		a("All files").href("?");
		h2(file.name);
		this.show_nodes(file, file.pages);
	}

	/* One card per node: the preview, its size, and (when a framework page was built from it) the way to it. */
	show_nodes(file, nodes, parent){
		div.c("figma-grid", () => nodes.forEach(n => {
			div.c("figma-card", () => {
				const open = parent ? null : `?file=${file.key}&page=${n.id}`;
				const shot = () => n.shot && img().attr("src", n.thumb_url).attr("alt", n.name).attr("loading", "lazy").attr("decoding", "async")
					.attr("onerror", `this.onerror=null;this.src='${n.shot_url}'`).style("aspect-ratio", n.ratio);
				open ? a(shot).href(open) : shot();
				h2(n.name);
				p(n.frames?.length ? `${n.frames.length} frames` : `${Math.round(n.w || 0)} × ${Math.round(n.h || 0)}`);
				n.built && div.c("figma-links", () => {
					a("Built page").href(n.built.path).ac("figma-built");
					a("Compare").href(`?file=${file.key}&page=${parent?.id || n.id}&compare=${n.id}`);
				});
			});
		}));
	}

	show_page(node){
		a(`${node.file.name} pages`).href(`?file=${node.file.key}`);
		h2(node.name);
		node.built && a("Built page").href(node.built.path).ac("figma-built");
		node.shot && img.c("figma-large").attr("src", node.shot_url).attr("alt", node.name).attr("decoding", "async");
		node.frames?.length && this.show_nodes(node.file, node.frames, node);
		a("Open in Figma").href(node.figma_url);
	}

	/* Original beside the built page at the same width: the iframe is as wide as the Figma frame and scaled to fit the column. */
	show_compare(node, page_id){
		a(`Back to ${node.file.find(page_id)?.name || node.file.name}`).href(`?file=${node.file.key}&page=${page_id}`);
		h2(`${node.name}: Figma original, and the page built from it`);
		const w = Math.round(node.w || 1920), h = Math.round(node.h || 1080);
		div.c("figma-compare", () => {
			div.c("figma-side", () => { p("Figma"); img().attr("src", node.shot_url).attr("alt", node.name).style("aspect-ratio", `${w} / ${h}`); });
			div.c("figma-side", () => {
				a("Built page").href(node.built?.path || "#").ac("figma-built");
				const stage = div.c("figma-stage").style("aspect-ratio", `${w} / ${h}`);
				this.fit(stage.el, node.built?.path, w, h);
			});
		});
	}

	fit(stage, path, w, h){
		if (!path) return;
		const f = document.createElement("iframe");
		f.src = path; f.loading = "lazy"; f.title = "Built page";
		Object.assign(f.style, { width: w + "px", height: h + "px", border: 0, transformOrigin: "0 0" });
		stage.append(f);
		const scale = () => { f.style.transform = `scale(${stage.clientWidth / w})`; };
		new ResizeObserver(scale).observe(stage);
		scale();
	}
}
export default FigmaBrowse;
