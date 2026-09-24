import { Page, div, span, p, h2, h3, h4, a, button, ul, li, code } from "/app.js";
import View from "../../../core/View/View.js";

View.stylesheet(import.meta, "catalog.css");

/* The data is fetched once, at import, so content() can stay synchronous — a factory call
 * after an await would append wherever the captor has since drifted. */
const kinds = await (await fetch(new URL("catalog.json", import.meta.url))).json();

/* Every module a render snippet imports, loaded up front for the same reason. */
const IMPORT = /import\s+(\{[^}]*\}|[\w$]+)\s+from\s+["']([^"']+)["'];?/g;
const modules = new Map();
const wanted = new Set(["/app.js"]);
for (const k of kinds) for (const m of (k.render || "").matchAll(IMPORT)) wanted.add(m[2]);
await Promise.all([...wanted].map(url => import(url).then(ns => modules.set(url, ns), () => modules.set(url, null))));

/* The stylesheets some fixtures need (a lab's own css), each linked once and awaited. */
const sheets = new Set(kinds.flatMap(k => k.sheets || []));
await Promise.all([...sheets].map(href => new Promise(done => {
	const link = document.createElement("link");
	link.rel = "stylesheet"; link.href = href;
	link.onload = link.onerror = done;
	document.head.append(link);
})));

/* Run one snippet inside the box that is current. Returns an error string, or "". */
const run = k => {
	const names = [], vals = [];
	let missing = "";
	const body = k.render.replace(IMPORT, (_, what, url) => {
		const ns = modules.get(url);
		if (!ns){ missing = url; return ""; }
		if (what.startsWith("{")) for (const n of what.slice(1, -1).split(",").map(s => s.trim()).filter(Boolean)){ names.push(n); vals.push(ns[n]); }
		else { names.push(what); vals.push(ns.default); }
		return "";
	});
	if (missing) return `its module ${missing} did not load.`;
	try { new Function(...names, body)(...vals); return ""; }
	catch (e){ return e.message; }
};

/* Why a kind has no picture — worked out from where it lives, so the sentence is true. */
const why = k => {
	if (k.undrawable) return k.undrawable;
	const src = k.sources[0].source || "";
	const file = src.split("/").pop().split(":")[0];
	if (/\.css/.test(src)) return `Only a stylesheet (${file}) styles it, and that sheet loads on its own page, not here.`;
	return `${file} builds it from live data or a host page, so it is not drawn standalone.`;
};

const norm = s => { const out = []; for (const part of s.split("/")) part === ".." ? out.pop() : out.push(part); return out.join("/"); };
const site = src => "/" + norm(src.split(":")[0]).replace(/^public\//, "");
const slug = s => "k-" + s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const has_dup = k => k.duplicates.folded.length || k.duplicates.twins.length;
const short = s => s.length > 30 ? s.slice(0, 29) + "…" : s;
const dup_text = k => k.duplicates.twins.length ? `duplicate of ${short(k.duplicates.twins[0])}` : `duplicate: also called ${k.duplicates.folded[0]}`;

const FAMILIES = ["surface words", "cards", "callouts & alerts", "chips & badges", "rows & lists", "panels & dialogs", "navigation", "controls & widgets", "AI log blocks", "doc blocks"];

/* The worst offenders: one job under several names or several paddings. Each cluster is a
 * hand-picked list of tiles; the padding count is counted, never typed. */
const CLUSTERS = [
	["A card is drawn many ways", "The finished card, surface plus pad, and one-off card classes in decks, blog and the AI pages do one job.", ["card", "surface", "preview card", "decks card", "blog card", "inbox tile", "three-column card"]],
	["Chips have no one shape", "A badge, a tag, a link chip and a strip chip are all small rounded labels, each padded its own way.", ["badge / pill", "tag chip", "link chip", "agents strip chip"]],
	["An ask is drawn three times", "The AI board, the inbox and the ui/ template each draw a question with answers.", ["ask card", "decision card", "inbox tile"]],
	["Compact rows keep being reinvented", "The inbox rail, the live list and the panel rows are one small row with different paddings.", ["inbox row (rail preview)", "live item", "panel properties row", "fold (expando bar)"]],
	["Two washes and a pad", "wash and tint fill a background; pad is a separate word, and card bakes in a different pad.", ["wash", "pad", "surface", "card"]],
	["Panels and dialogs", "A dialog-look box, the Panel item and the tab panel each pad their own regions.", ["panel (dialog-look box)", "dialog", "panel (Panel item)", "tab panel"]],
	["Chat and prompts", "A chat line, the owner bubble and the composer are one conversation in three paddings.", ["chat line", "owner prompt bubble (ai-you)", "composer"]],
];

export default new Page({
	meta: import.meta,
	title: "Card catalog",
	description: "Every kind of box on the site, drawn live, so you can see where two of them are really the same card.",
	icon: "dashboard",

	content(){
		const by_name = new Map(kinds.map(k => [k.name, k]));
		const rules = new Set(kinds.map(k => k.padding_rule).filter(r => r !== "unknown"));
		const tiles = new Map();

		const jump = name => {
			const t = tiles.get(name);
			if (!t) return;
			t.el.scrollIntoView({ block: "center", behavior: "smooth" });
			t.el.classList.add("flash");
			setTimeout(() => t.el.classList.remove("flash"), 1600);
		};

		const tile = k => {
			const $t = div.c("ux-content-catalog-tile", () => {
				div.c("ux-content-catalog-stage", () => {
					const err = k.render ? run(k) : why(k);
					if (err) p.c("ux-content-catalog-undrawn", k.render ? `Not drawable standalone: ${err}` : `Not drawable standalone. ${err}`);
				});
				p.c("ux-content-catalog-name", k.name);
				p.c("ux-content-catalog-what", k.what);
				div.c("ux-content-catalog-labels", () => {
					span.c("ux-content-catalog-label", `padding: ${k.padding_rule}`);
					span.c("ux-content-catalog-label", k.bleed_label);
					span.c("ux-content-catalog-label", `used in ${k.used_in.length} ${k.used_in.length === 1 ? "place" : "places"}`);
					if (has_dup(k)) span.c("ux-content-catalog-dup", dup_text(k));
				});
				const $more = button.c("ux-content-catalog-more", "Details").attr("type", "button");
				const $d = div.c("ux-content-catalog-detail", () => {
					h4("Sources");
					ul(() => k.sources.forEach(s => li(() => { a(s.source).href(site(s.source)); span(`  (${s.name}, census ${s.census.toUpperCase()})`); })));
					if (k.classes.length){ h4("Classes"); p(() => code(k.classes.join("  "))); }
					h4("Padding");
					ul(() => k.paddings.forEach(x => li(String(x))));
					if (k.duplicates.folded.length){ h4("Same job, folded in"); p(k.duplicates.folded.join(" · ")); }
					if (k.duplicates.twins.length){ h4("Still-separate twins"); p(k.duplicates.twins.join(" · ")); }
					h4("Used in");
					ul(() => k.used_in.forEach(u => li(() => a(u).href(u))));
					if (k.notes){ h4("Notes"); p(k.notes); }
				});
				$d.el.hidden = true;
				$more.click(() => {
					$d.el.hidden = !$d.el.hidden;
					$more.el.textContent = $d.el.hidden ? "Details" : "Hide details";
					$t.el.classList.toggle("open", !$d.el.hidden);
				});
			});
			$t.attr("id", slug(k.name));
			tiles.set(k.name, $t);
			return $t;
		};

		div.c("ux-content-catalog-top bleed", () => {
			div.c("ux-content-catalog-head", () => {
				p("Almost every box on this site is a card, whether or not it has a background. Here is every kind we found, drawn live, so you can see which ones are the same card wearing different padding.");
				div.c("ux-content-catalog-nums", () => {
					[[kinds.length, "kinds of box"], [kinds.filter(has_dup).length, "with a duplicate"], [rules.size, "distinct padding rules"]]
						.forEach(([n, label]) => div.c("ux-content-catalog-num", () => { span.c("ux-content-catalog-big", String(n)); span(label); }));
				});
				a("The plan to shrink this →").href("/framework/ux/Content/plan/");
			});

			div.c("ux-content-catalog-breaks", () => CLUSTERS.forEach(([title, line, names]) => div.c("ux-content-catalog-break", () => {
				const real = names.filter(n => by_name.has(n));
				const pads = new Set(real.map(n => by_name.get(n).padding_rule)).size;
				span.c("ux-content-catalog-break-title", title);
				span.c("ux-content-catalog-break-line", `${line} ${real.length} kinds, ${pads} padding rules.`);
				div.c("ux-content-catalog-break-chips", () => real.forEach(n => button.c("ux-content-catalog-jump", n).attr("type", "button").click(() => jump(n))));
			})));
		});

		// The tiles are built after the strip's buttons, but the buttons only look a tile up on click.
		for (const fam of FAMILIES){
			const list = kinds.filter(k => k.family === fam);
			if (!list.length) continue;
			div.c("ux-content-catalog-family bleed", () => {
				h2(fam);
				div.c("ux-content-catalog-wall", () => list.forEach(tile));
			});
		}
	},
});
