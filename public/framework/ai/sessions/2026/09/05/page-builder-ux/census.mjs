/* The census — every page.js under public/, classified by what a UI would have to
   offer to build it. Writes census.json + census.tsv + a printed summary.

   Run: node census.mjs C:/Code/lew42/monorepo .  */

import { readdirSync, statSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.argv[2] ?? "C:/Code/lew42/monorepo";
const PUBLIC = join(ROOT, "public");
const OUT = process.argv[3] ?? ".";

function find(dir, hits = []){
	for (const entry of readdirSync(dir)){
		const path = join(dir, entry);
		let st; try { st = statSync(path); } catch { continue; }
		if (st.isDirectory()) find(path, hits);
		else if (entry === "page.js") hits.push(path);
	}
	return hits;
}

const files = find(PUBLIC).map(p => p.replace(/\\/g, "/"));

const strip = src => src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^[ \t]*\/\/.*$/gm, "");

const field = (src, name, re) => {
	const m = src.match(new RegExp("\\b" + name + "\\s*:\\s*" + re));
	return m ? m[1] : null;
};

function body_of(src, name){
	const start = src.search(new RegExp("(^|[^\\w.])" + name + "\\s*\\("));
	if (start < 0) return null;
	const open = src.indexOf("{", src.indexOf(")", start));
	if (open < 0) return null;
	let depth = 0;
	for (let i = open; i < src.length; i++){
		if (src[i] === "{") depth++;
		else if (src[i] === "}" && --depth === 0) return src.slice(open + 1, i);
	}
	return src.slice(open + 1);
}

/* THE FOUR RENDERERS doc/persistence.md names — md, cards, tabs, list — plus the
   plain element factories, which are what `md` compiles to anyway. A content() body
   built only out of these is a body the JSON can already say. */
const PROSE = /^(md|p|h[1-6]|hr|br|span|em|strong|blockquote|icon|a|div|ul|ol|li|code|pre|img|figure|figcaption|small)$/;
const RENDERER = /^(previews|walls|browse|lede|cards|list|tabs|takeaway)$/;
const KEYWORD = /^(if|for|while|return|catch|switch|function|typeof|new|await|Object|Array|JSON|String|Number|Math|console|set|get|map|filter|forEach|join|split|slice|push|then|Boolean|parseInt|entries|keys|values|find|some|every|concat|trim|replace|includes|startsWith|endsWith|toFixed|of|in|do|else|try|throw)$/;

function classify(path){
	const url = "/" + path.slice(PUBLIC.length + 1).replace(/page\.js$/, "");
	const raw = readFileSync(path, "utf8");
	const src = strip(raw);
	const realm = url.split("/").filter(Boolean).slice(0, 2).join("/") || "(root)";

	const imports = [...raw.matchAll(/^\s*import\s[^;]*?from\s*"([^"]+)"/gm)].map(m => m[1]);
	const foreign = imports.filter(i => i !== "/app.js");

	const ctor = (src.match(/export default\s+new\s+(\w+)\s*\(/) ?? src.match(/new\s+(\w+)\s*\(\s*\{\s*\n\s*meta/) ?? [])[1] ?? "(other)";
	const is_class = /class\s+\w+\s+extends\s+(Page|Paging|Doc|Program|Template|View)/.test(src);

	const width = field(src, "width", '"(\\w+)"') ?? "";
	const index = /\bindex\s*:\s*true/.test(src);
	const kids_str = field(src, "children", '"([^"]*)"');
	const kids_arr = /\bchildren\s*:\s*\[/.test(src);
	const kids_obj = /\bchildren\s*:\s*\{/.test(src);
	const has_children = !!(kids_str || kids_arr || kids_obj);
	const child_count = kids_str ? kids_str.trim().split(/\s+/).filter(Boolean).length : (kids_arr || kids_obj ? -1 : 0);

	const content = body_of(src, "content") ?? "";
	const all = content || src;

	// ── navigation — how this page presents what is under it ─────────────────
	// ⚠ crumbs is NOT in this list on purpose: core draws the trail on the columns
	//   HOST after every activation (Page.reveal_column), so no page chooses it.
	const tabs = /\bitems\s*\(\s*\)\s*\{/.test(src) || /ext\/tabs|new Tabs\b/.test(raw) || /\btabs\(|tab_?bar|"tab-bar"|paging-tabs/.test(all);
	const swap = /\bswap\(|this\.swap\b|Swap\b/.test(all);
	const rail_left = /Sidebar|\brail\(|left-rail|"rail"/.test(all);
	const rail_right = /rightnav|right-rail|\btoc\(|\baside\(/.test(all);
	const footer = /\bfooter\(|"footer"|page-footer/.test(all);

	let nav = has_children ? "columns" : "none";
	if (rail_left) nav = "left rail";
	if (rail_right) nav = "right rail";
	if (footer && nav === "none") nav = "footer";
	if (swap && !tabs) nav = "swap";
	if (tabs) nav = "top tabs";
	if (width === "full") nav = "takeover";

	// ── surface ──────────────────────────────────────────────────────────────
	const classes = field(src, "classes", '"([^"]*)"') ?? "";
	const style_word = field(src, "style", '"(\\w+)"');
	let surface = "plain";
	for (const word of ["dark", "prim", "tint", "card"])
		if (style_word === word || new RegExp("\\b" + word + "\\b").test(classes)) { surface = word; break; }

	// ── content kind ─────────────────────────────────────────────────────────
	const has_form = /\binput\(|\btextarea\(|\bselect\(|type="text"/.test(all);
	const has_live = /\bpress\(|\.on\(|addEventListener|\bdemo\(|onclick=/.test(all);
	const has_media = /\bimg\(|\bvideo\(|\bcanvas\(|\bsvg\(|\biframe\(/.test(all);
	const has_wall = /previews\(|walls\(|browse\(|\bcards\(/.test(all) || index;

	const kind = has_form ? "form" : has_live ? "demo" : has_media ? "media" : has_wall ? "wall" : "prose";

	// ── layout number, /imagine/layouts/ numbering ───────────────────────────
	const tracks = [...src.matchAll(/grid-template-columns\s*:\s*"?([^";\n]+)/g)]
		.map(m => m[1].trim().split(/\s+/).filter(Boolean).length);
	const n_tracks = tracks.length ? Math.max(...tracks) : 0;

	let layout = "1.measure";
	if (n_tracks >= 4) layout = "4.quarters";
	else if (n_tracks === 3) layout = "3.thirds";
	else if (n_tracks === 2) layout = "2.equal";
	else if (has_wall) layout = "4.wall";
	else if (width === "full") layout = "1.sections";
	else if (width === "large" || width === "fill") layout = "1.stack";

	// ── what needs CODE ──────────────────────────────────────────────────────
	const calls = [...content.matchAll(/(?:^|[^\w.$'"`])([a-z_$][\w$]*)\s*\(/g)].map(m => m[1]);
	const this_calls = [...content.matchAll(/this\.([a-z_$][\w$]*)\s*\(/g)].map(m => m[1]);
	const foreign_calls = [...new Set(calls.filter(c => !PROSE.test(c) && !RENDERER.test(c) && !KEYWORD.test(c)))];
	const this_foreign = [...new Set(this_calls.filter(c => !RENDERER.test(c)))];

	const loops = /\.map\(|\.forEach\(|\bfor\s*\(|\.filter\(|\.flatMap\(/.test(content);
	const state = /store\(\)|localStorage/.test(src);
	const asyncy = /\basync\b|\bawait\b|fetch\(/.test(content);
	const sheet = /View\.stylesheet|css`/.test(src);
	const literal_only = !/\$\{/.test(content);

	/* ONE PRIMARY REASON per page, in the order a builder would have to solve them.
	   A live control is first because no amount of JSON gets you one; a house factory
	   is last because the fix is ten lines and a word, and that is the finding. */
	// `new Page(helper({...}))` — the fields themselves come out of a function.
	const computed_fields = /export default\s+new\s+\w+\s*\(\s*[a-z_$][\w$]*\s*\(/.test(src);
	const subclass = !["Page", "Doc"].includes(ctor);

	let reason = "";
	if (is_class) reason = "a class of its own";
	else if (has_live || has_form) reason = "a live control";
	else if (state) reason = "its own state";
	else if (asyncy) reason = "async / fetch";
	else if (loops || !literal_only) reason = "content computed from data";
	else if (foreign_calls.length || this_foreign.length) reason = "a house factory JSON has no word for";
	else if (subclass) reason = "a page class the JSON must name (" + ctor + ")";
	else if (computed_fields) reason = "fields computed by a helper";
	else if (sheet) reason = "its own stylesheet";

	/* THREE TIERS.
	   config  — nothing but prose, a card wall and children: the builder can do it now.
	   +renderer — one house factory away; name the factory in the node and it is config.
	   code    — a body that computes, holds state, or answers a click.  */
	const RENDERABLE = ["a house factory JSON has no word for", "its own stylesheet", "fields computed by a helper"];
	const tier = !reason ? "config" : RENDERABLE.includes(reason) || reason.startsWith("a page class") ? "+renderer" : "code";

	return {
		url, realm, path: path.slice(ROOT.length + 1).replace(/\\/g, "/"),
		ctor, width, index, children: child_count,
		nav, surface, layout, kind, tier, reason,
		factories: [...foreign_calls, ...this_foreign.map(c => "this." + c)],
		imports: foreign.length, lines: raw.split("\n").length,
	};
}

const rows = files.map(classify);

const found = files.length;
const classified = rows.length;

const tally = key => rows.reduce((acc, r) => (acc[r[key]] = (acc[r[key]] ?? 0) + 1, acc), {});
const sorted = obj => Object.entries(obj).sort((a, b) => b[1] - a[1]);

const fac = {};
rows.forEach(r => r.factories.forEach(f => fac[f] = (fac[f] ?? 0) + 1));

const summary = {
	found, classified, agree: found === classified,
	tier: sorted(tally("tier")),
	reason: sorted(tally("reason")),
	nav: sorted(tally("nav")),
	surface: sorted(tally("surface")),
	layout: sorted(tally("layout")),
	kind: sorted(tally("kind")),
	ctor: sorted(tally("ctor")),
	top_factories: sorted(fac).slice(0, 25),
	realms: sorted(tally("realm")).slice(0, 12),
};

writeFileSync(join(OUT, "census.json"), JSON.stringify({ summary, rows }, null, "\t"));
writeFileSync(join(OUT, "census.tsv"),
	"url\trealm\tnav\tsurface\tlayout\tkind\ttier\treason\tchildren\n" +
	rows.map(r => [r.url, r.realm, r.nav, r.surface, r.layout, r.kind, r.tier, r.reason, r.children].join("\t")).join("\n"));

const line = ([k, v]) => "  " + String(v).padStart(4) + "  " + k;
console.log("found " + found + " · classified " + classified + " · agree " + (found === classified));
for (const key of ["tier", "reason", "nav", "surface", "layout", "kind", "ctor"])
	console.log("\n" + key.toUpperCase() + "\n" + summary[key].map(line).join("\n"));
console.log("\nTOP FACTORIES\n" + summary.top_factories.map(line).join("\n"));
