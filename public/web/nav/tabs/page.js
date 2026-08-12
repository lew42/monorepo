import { Page, demo, md, div, a, h4 } from "/app.js";

/* A bar of links, and the panel this page's children mount into — `ext/tabs`'
   markup, built by hand because a demo app has no Router for `tabs()` to talk to.
   `.tabs.block` is the folder variant: the hairline breaks under the selected tab,
   so its surface reads as the front of the panel below it. */
const tabs = (page, block) => div.c("tabs flex-1" + (block ? " block" : ""), () => {
	div.c("tab-bar", () => page.children.forEach((_, name) => {
		const nav = page.nav_for(name);
		a.c("tab", nav.label).href(nav.url);
	}));

	page.$pages = div.c("tab-panel flex-1");
});

// ⚠ Opened on its FIRST child: a tab set showing an empty panel is not a tab set.
const set = (title, block, pages) => () => new Page({
	title,
	children: pages.map(([name, text]) => ({ name, title: name, content(){ md(text); } })),
	render(){ return this.view ??= div.c("page full flex v", () => { tabs(this, block); }); },
}).children.values().next().value;

const ledger = set("Ledger", false, [
	["activity", "**Quiet by construction** — a label, a hairline under the set, a 2px mark under the one you are on. No box, no fill, no gap between tabs: the strip is the group."],
	["reports", "The panel swapped; the bar did not. Tabs are peers — sections of one thing, never a site map."],
	["settings", "Six is about the ceiling. Past that the bar scrolls sideways and stops being scannable."],
]);

const folio = set("Folio", true, [
	["drafts", "**The folder tab.** Three borders and *no* fourth one: the hairline breaks under the selected tab, so the tab and the panel read as one surface."],
	["shared", "Louder than the underline, and it earns that when the panel below has a fill of its own to flow into."],
	["trash", "Same markup, same links — `block` is one class on the set."],
]);

// `pad` because a bleed stage has no inset of its own, and these columns are labelled.
const screen = () => div.c("flex auto gap pad", () => {
	div.c("flex v gap", () => { h4("Quiet — the underline"); demo.app(ledger()).style("height", "21em"); });
	div.c("flex v gap", () => { h4("Loud — the folder tab"); demo.app(folio()).style("height", "21em"); });
}).style("--column", "26em");

export default new Page({
	meta: import.meta,
	group: "Patterns",

	// ⚠ 25, not the usual 50: at half size the card crops to the first box, and the
	// whole point of this one is the pair.
	preview(nav){ return this.preview_card(nav, () => div.c("zoom-25 pad", screen)); },

	content(){
		demo.stage(screen).ac("bleed");
		demo.source.file(import.meta, "page.js", "Source").attr("open", "");

		md("**Tabs are a [bar](/web/nav/bar/) that admits it only has a few destinations.** Use the underline when the panel is prose on the page's own background — it is the quieter of the two and never competes with a heading. Use `block` when the panel has a surface of its own, because then the broken hairline is doing real work: it says *this tab is the front of that box*. On the real site both are one call, [`this.tabs(\"guide api\")`](/framework/ext/tabs/).");
	},
});
