import { Page, md, ui, div, h2, a } from "/app.js";

/* Numbers come from findings.json, never typed here — regenerate it and every
 * count on this page moves. Design record: readme.md. */

function group(rows, kind, seg){
	const by = new Map();
	for (const r of rows) if (r.kind === kind){
		const mod = r.url.replace(new RegExp(`${seg}/[^/]+/$`), "");
		by.set(mod, (by.get(mod) ?? 0) + 1);
	}
	return [...by].sort((a, b) => b[1] - a[1]);
}

export default new Page({
	meta: import.meta,
	title: "Browsable",
	description: "Is the site organized, visual, and browsable — measured from source, not eyeballed.",
	icon: "hub",

	content(){
		div.c("flow").append(() => {
			this.$body = div.c("flow", () => md("Loading the browsability baseline…").ac("muted"));
		});
		this.load();
	},

	async load(){
		const data = await fetch("/framework/audit/browsable/findings.json").then(r => r.json());
		this.$body.empty(() => this.report(data));
	},

	report({ totals, by_kind, depth_table, rows }){
		const flat = (by_kind["api-member"]?.count ?? 0) + (by_kind["doc-note"]?.count ?? 0);
		const pct = (n, d = totals.reachable_urls) => Math.round(100 * n / d);
		const apiMods = group(rows, "api-member", "api");
		const noteMods = group(rows, "doc-note", "docs?").filter(([mod]) => mod !== "/framework/audit/");
		const widest = rows.filter(r => ["content-page", "root"].includes(r.kind))
			.sort((a, b) => b.fanout - a.fanout).slice(0, 6);
		const orphans = rows.filter(r => r.clicks === null);
		const contentPages = rows.filter(r => r.kind === "content-page");
		const contentVisual = contentPages.filter(r => r.visualClicks !== null).length;
		const maxAny = Math.max(...rows.filter(r => r.clicks !== null).map(r => r.clicks));
		const maxVis = Math.max(...rows.filter(r => r.visualClicks !== null).map(r => r.visualClicks));

		md(`**Visual browsing stops at the Doc tab strip.** ${flat} of the site's ${totals.reachable_urls} addressable urls — ${pct(flat)}% — sit behind one click into a flat, unlabeled rail with no picture and no grouping: ${by_kind["api-member"].count} API members and ${by_kind["doc-note"].count} doc notes, all rendered by the same \`ext/tabs\` vertical list. ${totals.never_visual} urls in total are never reachable by a card, out of ${totals.reachable_urls}.`);

		h2("Worst offenders");

		md("The API rail, by module — every one a flat list, zero pictures:");
		ui.table(["Module", "API members"], apiMods.slice(0, 6).map(([mod, n]) =>
			[() => a(mod.replace("/framework", "") || "/").attr("href", mod), String(n)]));

		md("The Docs rail, by module — same shape, prose instead of source:");
		ui.table(["Module", "Doc notes"], noteMods.slice(0, 6).map(([mod, n]) =>
			[() => a(mod.replace("/framework", "") || "/").attr("href", mod), String(n)]));

		md(`And ${orphans.length} urls have no path in at all: ${orphans.map(r => `[${r.url}](${r.url})`).join(", ")} — declared nowhere, reachable only by typing the address.`);

		h2("Already fixed today");

		md("The ~30 orphan `demo()` blocks under `styles/elements/{text,lists,code,media,misc,table}/` now have real urls via `demo.page()` — **closed**, not outstanding (`ai/2026-08-16/element-pages/`). `styles/layers/util/` (~33 utility classes) is the other half of the same finding and is still open — deliberately out of that task's scope.");

		h2("Three ranked changes");

		md(`1. **Decide where the layout vocabulary lives, once.** Words like \`flex\`, \`gap\`, \`wrap\` have real urls under \`styles/layouts/\` *and* rows in \`styles/layers/util/\`'s tables — two addresses, two shapes, neither complete. Zero measurable gain by itself, but it blocks giving \`styles/layers/util/\` real pages the same way \`styles/elements/\` just got them — the owner's call, a paragraph not a commit.
2. **Give the API/Docs rail a description line and its property/method grouping.** The data is already computed (\`Doc.members()\` knows properties from methods, \`nav_for()\` carries \`description\`) — this converts all ${flat} flat-list urls into a labelled, grouped rail for a two-line change in \`ext/Doc/Doc.js\`. Zero clicks bought, but it's the largest non-conforming population on the site. RULE#1 surgery — needs the owner, and \`ext/Doc\` is outside this task's fence.
3. **Finish the utility vocabulary once #1 is answered.** Same treatment as the closed elements gap: ~33 \`demo()\` blocks → \`demo.page()\` children, one file, mechanical — but doing it before #1 creates a *third* address for the twelve words that overlap.`);

		h2("What's already good");

		md(`**Depth is not the problem.** ${totals.reached_any} of ${totals.reachable_urls} urls are reachable at all, ${maxAny} clicks maximum from \`/framework/\`, and the visual-only path tops out at ${maxVis}. Only ${orphans.length} urls have no path in whatsoever.`);

		ui.table(["Clicks from /framework/", "Any link", "Visual only"],
			Object.entries(depth_table).map(([clicks, { any, visual }]) => [clicks, String(any), String(visual)]));

		md(`**${contentVisual} of ${contentPages.length} real content pages (${pct(contentVisual, contentPages.length)}%) are reached by a card, not a link.** The card system is one system end to end — \`previews()\`, \`walls()\`, \`wall()\`, \`catalog()\`, \`demo.exhibit()\`'s Variants wall all draw the same \`.page-preview\`, which is why this page can tell "visual" from "chrome" by grepping source at all.`);

		md("The widest fan-outs on the site are exactly where they should be — grouped, live cards, not lists:");
		ui.table(["Page", "Children"], widest.map(r =>
			[() => a(r.url.replace("/framework", "") || "/").attr("href", r.url), String(r.fanout)]));

		md("[`/framework/`](/framework/) itself is the model answer: every section is one visual click away in a grouped wall, and the Sidebar is a second, independent path to the same depth.");

		md.details(import.meta, "readme.md", "Readme");
	},
});
