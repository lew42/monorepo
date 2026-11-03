import { div, a, img, h2, p } from "/app.js";

/* The one card-grid renderer every browse level shares (files' pages, a file's pages, a
   page's frames) — a small JPEG, lazy-loaded, and (when a framework page was built from
   this node) a Built-page link plus Compare. `link_of(node)` returns `{ open, compare }`,
   either one optional: a top-level page card opens into itself, a frame card never opens
   (it only ever shows beside its page), and `compare` only exists where `node.built` does. */
export function grid(nodes, link_of = () => ({})){
	div.c("figma-grid", () => nodes.forEach(n => {
		const { open, compare } = link_of(n) ?? {};
		div.c("figma-card", () => {
			const shot = () => n.shot && img().attr("src", n.thumb_url).attr("alt", n.name).attr("loading", "lazy").attr("decoding", "async")
				.attr("onerror", `this.onerror=null;this.src='${n.shot_url}'`).style("aspect-ratio", n.ratio);
			open ? a(shot).href(open) : shot();
			h2(n.name);
			p(n.frames?.length ? `${n.frames.length} frames` : `${Math.round(n.w || 0)} × ${Math.round(n.h || 0)}`);
			n.built && compare && div.c("figma-links", () => {
				a("Built page").href(n.built.path).ac("figma-built");
				a("Compare").href(compare);
			});
		});
	}));
}
export default grid;
