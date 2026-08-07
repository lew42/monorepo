import { Page, View, div, button, p } from "/app.js";
import { section } from "../ui.js";
import { md, claim, visit } from "../urls/ui.js";
import { crawl, survey, by_seat, seat_of } from "./crawl.js";

View.stylesheet(import.meta, "sitemap.css");

// every page.js the browser has actually fetched, from the resource timeline
const modules = () => performance.getEntriesByType("resource").filter(r => r.name.endsWith("/page.js")).length;

export default new Page({
	meta: import.meta,
	title: "Sitemap",
	children: "links canonical rule-one",

	walk(){
		const before = modules();
		const started = performance.now();

		this.$out.empty(() => p(`crawling… 0 pages, ${before} modules fetched so far`));

		survey(this.app, (row, n) => this.$out.empty(() => p(`crawling… ${n} pages · ${row.url}`)))
			.then(({ pages, links }) => this.report(pages, links, before, started));
	},

	// named target, because the ambient captor is long gone by now
	report(pages, links, before, started){
		const seats = by_seat(links);
		const missing = pages.filter(row => row.missing.length);
		const claiming = pages.filter(row => row.claims);
		const broke = pages.filter(row => row.render_error);

		this.$out.empty(() => {
			md(`
| | |
|---|---|
| pages reached | **${pages.length}** |
| sections | **${new Set(pages.map(r => r.seat)).size}** |
| deepest url | **${Math.max(...pages.map(r => r.depth))}** segments |
| links checked | **${links.length}** |
| \`page.js\` modules fetched | **${before} → ${modules()}** |
| wall clock | ${Math.round(performance.now() - started)} ms |
| pages whose \`render()\` threw | ${broke.length ? "**" + broke.length + "**" : "0"} |
| names declared with no \`page.js\` | ${missing.length ? "**" + missing.length + "**" : "0"} |
| pages claiming urls with \`route()\` | ${claiming.length} — **unbounded, not counted above** |
`);

			if (broke.length) md("**`render()` threw:**\n\n" + broke.map(r => `- \`${r.url}\` — ${r.render_error}`).join("\n"));
			if (missing.length) md("**Declared but missing:**\n\n" + missing.map(r => r.missing.map(n => `- \`${r.url}${n}/\` — declared by \`${r.url}page.js\`, no file behind it`).join("\n")).join("\n"));

			md("| section | urls | links | ok | broken | non-canonical |\n|---|---|---|---|---|---|\n" + seats.map(s => {
				const urls = pages.filter(r => r.seat === s.seat).length;
				const bad = n => n ? "**" + n + "**" : "0";
				return `| \`/${s.seat === "(root)" ? "" : s.seat + "/"}\` | ${urls} | ${s.total} | ${s.ok} | ${bad(s.broken.length)} | ${bad(s.non_canonical.length)} |`;
			}).join("\n"));

			md(`Full per-seat detail, ranked, with every offending href: **/sitemap/links/**. The canonical column is explained at **/sitemap/canonical/**.`).ac("note");
		});
	},

	content(){

		claim(crawl, null, "The walk. Breadth-first over `children`, importing as it goes — which is the whole cost, and the reason this runs on a click and never on render.");

		this.$run = div.c("row", () => button("Walk the tree").click(() => this.walk()));
		this.$out = div.c("survey", () => md(`Nothing has been crawled yet. **That is the honest default**: reaching every url means importing every url, and this tier's headline feature is not doing that.`).ac("note"));

		section("What a derived map can and cannot know");

		md(`
| | |
|---|---|
| **a declared name** — \`children: "schema slash"\` | enumerable. Following it imports it. |
| **a declared name with no file** | found, and reported: the import fails and \`child()\` returns \`null\`. |
| **a \`route()\` claim** | **not enumerable, by construction.** \`route(name)\` is a function; its domain is every string. |
| **an inline child added in \`initialize()\`** | enumerable — it is already in the \`children\` map before anything walks. |
`);

		md(`**The third row is the boundary, and it is not a gap to close.** \`/dynamic/42/\` is a real url with no file, no declaration and no upper bound; so is \`/urls/ugly/anything-at-all/\`. A sitemap that claimed to be complete would be lying about the one mechanism that makes the tree finite in the first place. What this page counts is **every url that is reachable by walking declarations** — and then it says how many pages have a \`route()\`, because that number is the size of the unknown.

The tree is also only as complete as the crawl is deep: a name is a string until someone imports it, so **this map does not exist until you press the button**, and pressing it costs exactly the laziness the framework is built to preserve. The module counter above measures that in fetches.`);

		section("Four things this section does");

		this.previews();

		md(`The librarian seat proved that rendering every page at once is a free smoke test. This does the same for urls: every page is rendered detached, every anchor it emits is resolved through **the router's own \`load_segments\`** — not a copy of it — and the verdict is reported per seat so the seat that owns a broken link can fix it.`).ac("note");

		visit(["/sitemap/links/", "/sitemap/canonical/", "/sitemap/rule-one/", "/urls/"]);
	},
});
