import { Page, div, button, span } from "/app.js";
import { section } from "../../ui.js";
import { md, claim, visit } from "../ui.js";
import { carry_the_rest } from "../proposals.js";

const stock = [
	["Anvil", "red"], ["Bellows", "blue"], ["Crucible", "red"],
	["Dowel", "green"], ["Ewer", "blue"], ["File", "green"],
];

export default new Page({
	meta: import.meta,
	title: "The query string",

	// The page owns its own lens. Nothing in Router knows this exists.
	filter(colour){
		this.colour = colour;
		history.replaceState({}, "", location.pathname + (colour === "all" ? "" : `?colour=${colour}`));

		this.$stock.empty(() => stock
			.filter(([, c]) => colour === "all" || c === colour)
			.forEach(([name, c]) => span.c("claim-url", `${name} · ${c}`)));

		this.$bar.el.querySelectorAll("button").forEach(b => b.classList.toggle("on", b.textContent === colour));
	},

	content(){

		claim(() => {
			// Router.click, before P1 — everything but the path is thrown away
			this.go(link.pathname);
		}, null, "`?colour=red` survives a typed url and dies on the first click. Then `go()` pushes a bare pathname, wiping any query that was already there.");

		section("Measured");

		md(`
| | before | after P1 |
|---|---|---|
| type \`/dynamic/42/?filter=red\` | \`location.search\` = \`?filter=red\` | unchanged |
| click \`<a href="/dynamic/9/?filter=red">\` | \`location.search\` = **\`\`** | \`?filter=red\` |
| navigate away and back | query gone | carried by whoever wrote the href |
| change **only** the query | nothing re-renders | **still nothing** — deliberately |
`);

		md(`That last row is not a bug to fix. \`Router.activate()\` diffs two chains; a query-only change produces identical chains, \`shared_depth\` covers both entirely, and nothing is entered or left. **Correct.** A Router that re-activated on a query change would be interpreting a string it has no business reading.`).ac("note");

		section("The position");

		md(`**The path owns identity. The query owns the lens. The Router carries the query and never reads it.**

The test is one question, and it is not "is this state?" — everything is state. It is:

> **Is this a different document, or the same document viewed differently?**`);

		md(`
| | | belongs in |
|---|---|---|
| \`/products/\` sorted by price | same document, reordered | **query** |
| \`/products/\` filtered to red | same document, fewer rows | **query** |
| \`/guide/\` in French | a different document | **path** |
| \`/api/\` at v2 | a different document | **path** |
| page 2 of a blog archive | different posts — a different document | **path** |
| a table's open row | same document | **query**, or nothing at all |
`);

		md(`Pagination is the boundary and it splits cleanly on the same test: page 2 of an *archive* is a distinct set of content someone links to, so \`/blog/page/2/\` via \`route()\`. Page 2 of a *filtered table* is a scroll position with delusions of grandeur, so \`?page=2\`.`).ac("note");

		section("Why a lens must not be a segment");

		md(`
| making \`?colour=red\` into \`/colour/red/\` costs | |
|---|---|
| a Page | \`child()\` resolves segments into Pages. A filter is not a page. |
| a chain entry | breadcrumbs would read *Products › colour › red*. |
| a marking lie | \`.in-path\` marks \`/products/\` as an **ancestor** of its own filter. |
| a combinatorial \`children\` map | two lenses and \`route()\` is parsing pairs out of a path. |
| \`previews()\` | links to \`/products/\`, and now that is a *third* url for one screen. |
`);

		section("So who re-renders? The page that owns it");

		claim(this.filter, null, "`filter(colour)`, this page's own method, rendered from the live function object. Router is not involved at any point. `replaceState`, not `pushState`: a filter is not a destination, so it should not cost a Back press.");

		this.$bar = div.c("row", () => ["all", "red", "blue", "green"]
			.forEach(colour => button(colour).click(() => this.filter(colour))));

		this.$stock = div.c("claim-urls");
		this.filter(new URLSearchParams(this.app.router.search ?? location.search).get("colour") ?? "all");

		md(`Click a colour, then reload. The list comes back the same, because the only place the state lives is the url — the page just reads it at render instead of asking the Router to. **That is the whole contract: the Router must not destroy the query, and must not interpret it.**`).ac("note");

		visit(["/urls/query/?colour=red", "/urls/query/?colour=blue", "/urls/query/"]);

		md(`Click one: the address bar takes the query, **and the list above does not change.** That is row 4 of the table, live. The chain did not change, so nothing was entered or left, so nothing re-rendered — and the page only reads the query when it builds. **Reload** and the list is filtered. The buttons re-render because the page owns them; a link does not, because a link is a navigation and this was not one.`).ac("note");

		section("A page must not read `location` either");

		md(`Those three links arrive from *this* page, so they exercise the trap: \`go()\` loads before it pushes, which means at render time \`location.search\` still holds the query of the url you are **leaving**. It is the same trap \`mark_links()\` documents when it takes \`here\` from \`this.active.url\` rather than from the browser.

So the Router has to hand the query over — one assignment, no interpretation:`);

		claim(() => {
			// Router.load, alongside the parse it already does for P1
			this.search = first ? location.search : to.search;   // carried, never read
		}, null, "Installed. The demo above reads `this.app.router.search` and falls back to `location.search`, so it is correct on a cold load, a reload, and an inbound link carrying a query.");

		section("The fix — one line");

		claim(carry_the_rest, null, "Installed on this page. `link.pathname + link.search + link.hash` instead of `link.pathname`. `go()` then parses once with `new URL()` and hands only the path to `load_segments`, which has never wanted anything else.");

		visit(["/urls/hash/", "/urls/dimension/"]);
	},
});
