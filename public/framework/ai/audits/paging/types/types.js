// One factory for every page-type page: a TYPE is a Page, each VARIANT is a child Page
// built from a node in ../types.json, so a variant costs one JSON node, not a file.
import { Page, p, b, div, a, span, iframe } from "/app.js";
import { load } from "../types.js";

const path = (meta, rel) => new URL(rel, meta.url).pathname;

// a card that links to a page; `sub` is the caption line, `pill` the small badge
export const card = (href, title, sub, pill, tags = []) => a(() => {
	div(() => {
		span(title).style({ fontWeight: "700", fontSize: "1.15em" });
		if (pill) span(pill).style({ float: "right", background: "#38f", color: "#fff", borderRadius: "1em", padding: "0.1em 0.7em", fontSize: "0.75em", fontWeight: "700" });
	});
	div(sub).style({ fontSize: "0.85em", opacity: 0.8, margin: "0.3em 0" });
	div(() => tags.forEach(t => span(t).style({ fontSize: "0.72em", border: "1px solid #8886", borderRadius: "1em", padding: "0 0.6em", marginRight: "0.3em" }))).style({ lineHeight: 1.8 });
}).attr("href", href).style({ display: "block", color: "inherit", textDecoration: "none", border: "1px solid #8886", borderRadius: "0.6em", padding: "0.8em 1em" });

export const grid = () => div().ac("wide").style({ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(20em, 1fr))", gap: "1em", maxWidth: "80em" });

// the wall of TYPES: name + variant count. Used by types/page.js and the audit page.
export function typesWall(meta){
	const g = grid();
	load().then(lib => g.append(() => lib.types.slice().sort((x, y) => y.uses - x.uses).forEach(t =>
		card(path(meta, "./" + t.slug + "/"), t.name, t.navigation, (t.variants.length) + (t.variants.length === 1 ? " variant" : " variants"), t.tags))));
	return g;
}

// a variant's page: its live example, then what makes it different
function variantContent(meta, tid, vslug){
	const box = div().ac("wide");
	load().then(lib => {
		const t = lib.types.find(x => x.slug === tid), v = t?.variants.find(x => x.slug === vslug);
		box.append(() => {
			if (!v) return p("No variant called ", b(vslug), " in ", b(t?.name || tid), ".");
			p(b(t.name), " → ", b(v.name), " · ", v.tags.join(", "));
			a("open the live example: " + v.example).attr("href", v.example);
			div(() => { iframe().attr("src", v.example).attr("loading", "lazy").attr("data-layout-ignore", "").style({ width: "100%", height: "100%", border: 0 }); }).style({ height: "70vh" });
			if (v.layout) p("Layout ", a(v.layout).attr("href", "/layouts/" + v.layout + "/"), v.template ? " · template: " + v.template : "", v.source ? " · from " + v.source : "");
		});
	});
	return box;
}

export function typePage(meta, slug){
	return new Page({
		meta,
		title: slug,
		icon: "category",
		description: "One page type and its variants: each variant is its own page with its own address.",
		route(name){
			if (name.includes(".")) return;
			return { title: name, content(){ variantContent(meta, slug, name); } };
		},
		content(){
			const g = grid();
			load().then(lib => {
				const t = lib.types.find(x => x.slug === slug);
				g.append(() => {
					p(b(t.name), " — ", t.navigation, ". Example: ", a(t.example).attr("href", t.example));
					t.variants.forEach(v => card(path(meta, "./" + v.slug + "/"), v.name, v.layout ? "layout " + v.layout : v.navigation || "", v.uses ? v.uses + " uses" : "", v.tags));
				});
			});
		},
	});
}
