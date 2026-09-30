import { Page, md, h2, div, a } from "/app.js";
import { table } from "/framework/ui/table/table.js";
import data from "../data.js";

/* The page priority list (page-audit, 2026-09-30). The owner: "we need a page priority, like
   what are the main pages on the site, and what kind of layouts do they use." Measured by links
   in: how many distinct crawled pages link to each one. A link on almost every page is the site
   menu; one on about half is the framework sidebar. Page weight (core/Page/weight) would be the
   better measure, but only 8 pages carry weight lines yet. */

const TIERS = [
	["Site menu", "On every page: the site's own top menu."],
	["Framework sidebar", "On every framework page: the left sidebar."],
	["Linked from content", "Linked from other pages' content."],
];

export default new Page({
	meta: import.meta,
	title: "The main pages, and their layouts",
	label: "Priority",
	icon: "leaderboard",
	description: "The site's most-linked pages, heaviest first, each with the layout it uses.",

	content(){
		md(`**The main pages are the ones most pages link to.** Each row says which layout it uses; the [audit](../) says where each layout lives.`);

		for (const [tier, say] of TIERS){
			const rows = data.priority.filter(r => r.tier === tier);
			if (!rows.length) continue;
			h2(`${tier} · ${rows.length}`);
			md(say);
			div.c("wide", () => table(["Page", "Layout", "Linked from"],
				rows.map(r => [() => a(r.title || r.url).href(r.url), data.layouts.find(l => l.id === r.layout)?.name ?? r.layout, `${r.links_in} pages`])));
		}
	},
});
