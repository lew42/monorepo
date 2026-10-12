// classify.mjs — reads crawl/pages.jsonl, gives each page one layout (the most specific
// marker wins) plus its shell, and writes audit.json for core/Page/audit/.
// node classify.mjs [--unknown]   (--unknown prints the big classes of unclassified pages)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const HERE = path.dirname(fileURLToPath(import.meta.url));
const pages = fs.readFileSync(path.join(HERE, "crawl/pages.jsonl"), "utf8").trim().split("\n").map(l => JSON.parse(l));

// most specific first: the first rule whose test matches is the page's layout
const RULES = [
	// the page's own shell wins over a part drawn inside it (same order as Server/layout-check.mjs --bands)
	["ai2", "AI 2 shell", c => /\bai2-(head|rail|shell)\b|\bai2\b/.test(c)],
	["blog", "Blog post shell", c => /\bblog-shell\b/.test(c)],
	["sources", "Sources (file tree)", c => /\bsources-files\b/.test(c)],
	["doc", "Doc page (top tabs)", c => /\bdoc-page\b/.test(c)],
	["floating", "Floating page", c => /\bfloating(-well|-nav|-page)?\b/.test(c)],
	["columns", "Column pages", c => /\bpage\b[^|]*\bcolumns?\b|\bpage-column/.test(c)],
	["catalog", "Catalog (card rail + routed page)", c => /\bpage-catalog\b/.test(c)],
	["browse", "Browse (filter rail + wall)", c => /\bbrowse(-wall)?\b/.test(c)],
	["switcher", "Inner left nav (switcher)", c => /\bswitcher\b/.test(c)],
	["wall", "Card wall (previews)", c => /\bpage-previews\b|\bstd-tree\b|\btree-preview\b/.test(c)],
	["standard", "Standard page", c => /\bstandard\b/.test(c)],
];

const out = [];
const unknown = {};
for (const p of pages){
	// a console error still renders a page (AI 2 cards threw on a bad log line): classify what drew
	if (p.status === "404") { out.push({ url: p.url, status: p.status, layout: "error" }); continue; }
	if (!p.structure?.length) { out.push({ url: p.url, status: p.status, layout: "error" }); continue; }
	const cls = [p.container_class, ...(p.structure || []).map(s => s.cls)].join(" | ");
	const hit = RULES.find(([, , t]) => t(cls));
	const sidebar = (p.structure || []).some(s => /\bsidebar\b/.test(s.cls)) || (p.nav || []).some(n => /sidebar/.test(n.cls));
	const tab = (p.tabs || [])[0];
	const rec = { url: p.url, title: p.title, layout: hit ? hit[0] : "custom", sidebar, links_out: (p.links_out || []).length, shot: p.shot };
	if (tab) rec.tabs = tab;
	if (!hit) for (const s of (p.structure || []).slice(0, 12)) for (const k of s.cls.split(/\s+/).filter(Boolean)) unknown[k] = (unknown[k] || 0) + 1;
	out.push(rec);
}

// links in: distinct pages linking to each url
const links_in = {};
for (const p of pages) for (const u of new Set(p.links_out || [])) links_in[u] = (links_in[u] || 0) + 1;
for (const r of out) r.links_in = links_in[r.url] || 0;

const counts = {};
for (const r of out) counts[r.layout] = (counts[r.layout] || 0) + 1;

// where each layout lives in code, from the layout-map minion (grep counts of page.js opt-ins)
const MAP = {
	doc: ["ext/Doc/Doc.js", "new Doc({…})", 74],
	columns: ["core/Page/Page.class.js (columns)", "this.columns({…})", 42],
	wall: ["core/Page/Page.class.js (previews) · ext/demo (demo.tree)", "this.previews() · demo.tree()", 50],
	catalog: ["ext/catalog/catalog.js", "this.catalog()", 25],
	browse: ["ext/catalog/browse.js", "this.browse(bands, …)", 6],
	switcher: ["ext/tabs/switcher.js", "this.switcher(names, {skin})", 2],
	floating: ["core/Page/layout/floating/floating.js", "floating(box, {nav, content})", 2],
	ai2: ["ai2/page.js (its own shell)", "none: one page", 1],
	standard: ["core/Page/Page.class.js · app.js", "the default", null],
	blog: ["public/blog/ (Post)", "new Post({meta})", null],
	sources: ["framework/sources/", "its own page", null],
	custom: ["the page itself", "none: hand-built", null],
};
const by_layout = {};
for (const r of out) (by_layout[r.layout] ??= []).push(r);
const layouts = Object.entries(by_layout).filter(([id]) => id !== "error").map(([id, rs]) => {
	rs.sort((a, b) => b.links_in - a.links_in);
	const [defined_in, api, page_js] = MAP[id] || ["?", "?", null];
	return { id, name: (RULES.find(r => r[0] === id) || [, "Custom (own shell)"])[1], count: rs.length, defined_in, api, page_js,
		examples: rs.slice(0, 4).map(r => ({ url: r.url, title: r.title })),
		// the picture: the fullest shot (biggest jpeg) among its five most-linked pages
		shot: rs.slice(0, 5).filter(r => r.shot && fs.existsSync(r.shot)).sort((a, b) => fs.statSync(b.shot).size - fs.statSync(a.shot).size)[0]?.shot };
}).sort((a, b) => b.count - a.count);

// priority: links in, from distinct pages. A link on over 30% of pages is the site nav.
const nav_cut = out.length * 0.3;
const priority = out.filter(r => r.layout !== "error").sort((a, b) => b.links_in - a.links_in).slice(0, 60)
	.map(r => ({ url: r.url, title: r.title, layout: r.layout, links_in: r.links_in, tier: r.links_in > out.length * 0.9 ? "Site menu" : r.links_in > nav_cut ? "Framework sidebar" : "Linked from content" }));
console.log(Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(" · "));
console.log("with site sidebar:", out.filter(r => r.sidebar).length, "of", out.length);
if (process.argv.includes("--unknown")) console.log(Object.entries(unknown).sort((a, b) => b[1] - a[1]).slice(0, 40).map(([k, v]) => `${k}:${v}`).join(" "));
fs.writeFileSync(path.join(HERE, "audit.json"), JSON.stringify({ at: new Date().toISOString(), crawled: out.length, errors: counts.error || 0, layouts, priority, pages: out }, null, "\t"));
// --emit <core/Page/audit dir>: the page's data.js (no fetch, no await) + one shot per layout
const emit = process.argv.indexOf("--emit");
if (emit > 0){
	const dir = process.argv[emit + 1];
	fs.mkdirSync(path.join(dir, "shots"), { recursive: true });
	let summary = {};
	try { summary = JSON.parse(fs.readFileSync(path.join(HERE, "crawl/summary.json"), "utf8")); } catch {}
	const skipped = Object.values(summary.skipped_similar || {}).reduce((a, b) => a + b, 0);
	for (const l of layouts) if (l.shot && fs.existsSync(l.shot)){
		fs.copyFileSync(l.shot, path.join(dir, "shots", l.id + ".jpg"));
		l.shot = "shots/" + l.id + ".jpg";
	} else delete l.shot;
	const data = { at: new Date().toISOString().slice(0, 10), crawled: out.length, errors: counts.error || 0, skipped, layouts, priority };
	fs.writeFileSync(path.join(dir, "data.js"), "// Written by ai/2026-09-30/page-audit/classify.mjs --emit. Re-run it; don't edit by hand.\nexport default " + JSON.stringify(data, null, "\t") + ";\n");
	console.log("emitted", dir);
}
if (process.argv.includes("--priority")) for (const r of priority) console.log(String(r.links_in).padStart(4), r.layout.padEnd(9), r.url);
