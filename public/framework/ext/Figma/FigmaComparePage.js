import { Page, a, h2, h3, p, div, img } from "/app.js";
import { ShotsJSONL } from "../Shots/ShotsView.js";

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
		this.figma_overlay(node.built?.path);
	}

	/* The latest figma-kind Shots round for the built page, if there is one — its diff
	   overlay and % changed, with a link into Shots itself. Reads `runs.jsonl` through
	   `ShotsView`'s own `ShotsJSONL` (never a second reader of the log — build-c). */
	figma_overlay(pagePath){
		if (!pagePath) return;
		const url = pagePath.endsWith("/") ? pagePath : pagePath + "/";

		div.c("figma-overlay flow", $v => {
			this.$overlay = $v;
			this.overlayLog = new ShotsJSONL({ url: "/framework/ext/Shots/runs.jsonl" });
			this.overlayLog.live(() => this.draw_overlay(url));
			this.draw_overlay(url);
		});
	}

	draw_overlay(url){
		this.$overlay.empty(() => {
			const runs = this.overlayLog.runs_for(url).filter(r => r.kind === "figma");
			if (!this.overlayLog.loaded || !runs.length){
				p.c("muted", `No Figma-vs-page shot yet: \`node Server/shots.mjs --figma <png path | fileKey:nodeId> ${url}\``);
				return;
			}
			const run = runs[0];
			const width = run.widths?.[0];
			const diff = this.overlayLog.diff_at(run.id, width);

			h3("Latest Figma-vs-page overlay");
			if (diff?.overlay) img.c("figma-overlay-img").attr("src", "/" + run.dir.replace(/^public\//, "") + "/" + diff.overlay).attr("alt", "diff overlay");
			if (diff) p.c("muted", `${Math.round((diff.changed ?? 0) * 100)}% changed, round ${run.id} at ${width}px`);
			a.c("figma-overlay-link", "Open this round in Shots").href(`/framework/ext/Shots/?url=${encodeURIComponent(url)}&round=${run.id}`);
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
