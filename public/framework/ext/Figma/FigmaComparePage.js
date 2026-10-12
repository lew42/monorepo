import { Page, a, h2, p, div, img } from "/app.js";

/* Figma original beside the page built from it, at the same width —
   `/framework/ext/Figma/<file-slug>/<page-slug>/compare/<node-slug>/`. `node` is a frame,
   or (a page built whole, no frames — Auto layout, Page 8) the page itself. */
export class FigmaComparePage extends Page {
	content(){
		const { node, pageNode } = this;
		a(`Back to ${pageNode.name}`).href(this.url.replace(/compare\/[^/]+\/$/, ""));
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
export default FigmaComparePage;
