import { Page, a, div } from "/app.js";
import { section } from "../../ui.js";
import { md, claim, visit } from "../ui.js";
import { push_the_canonical_url } from "../proposals.js";

export default new Page({
	meta: import.meta,
	title: "Trailing slashes",

	content(){

		claim(async () => {
			// Router.load_segments — every empty segment is thrown away
			for (const name of url.split("/").filter(Boolean)){
				page = await page.child(name);
			}
		}, ["/urls/slash/", "/urls/slash", "/urls/slash//", "/urls/slash/./"],
			"All four resolve to this page. `filter(Boolean)` eats the empties, so there is no such thing as an unresolvable slash count.");

		md(`Resolving is not the question. **Sticking is.** Every one of those four stayed in the address bar, which gives one page four urls — and a framework whose conviction is *the url IS the state* cannot have four encodings of one state.`);

		section("Measured, before the fix");

		md(`
| typed | resolved page | address bar kept | nav marked |
|---|---|---|---|
| \`/tabs/\` | \`/tabs/\` | \`/tabs/\` | \`.active\` |
| \`/tabs\` | \`/tabs/\` | **\`/tabs\`** | \`.active\` |
| \`/tabs//\` | \`/tabs/\` | **\`/tabs//\`** | \`.active\` |
| \`/tabs/./\` | \`/tabs/\` | \`/tabs/\` (the browser normalised \`.\`) | \`.active\` |
`);

		md(`The nav still lights up in every row, and that is worth stating because it looks like it should not. \`mark_links()\` compares against \`this.active.url\` — **the page's own url, never \`location.pathname\`** — so the marking was already immune. The address bar was not.`).ac("note");

		section("Why the slash is load-bearing — three independent reasons");

		md(`
| | if the url ends in \`/\` | if it does not |
|---|---|---|
| \`Page.load\` | \`url + "page.js"\` is the module | \`/a/binverse.js\` — the concatenation is nonsense |
| \`link_clicked\` | \`/\\.\\w+$/\` cannot match | \`/docs/v1.2\` is **rejected as a file** and never intercepted |
| the dev server | falls through to \`index.html\` | \`/docs/v1.2\` returns a hard **404** |
`);

		claim(() => {
			if (/\.\w+$/.test(link.pathname)) return null;   // Router.link_clicked
			if (/\.\w+$/.test(req.path)) return res.status(404).end();   // server.js
		}, null, "The same regex in two places, and it is end-anchored. `/a.b/c/` is fine; `/a/b.c` is not. A trailing slash is the only thing standing between a version number and an unreachable page.");

		section("The fix — one word");

		claim(push_the_canonical_url, null, "Installed on this page. `this.active.url` instead of `url`: the page that answered knows where it lives, so ask it. `?search` and `#hash` ride along untouched because the Router does not interpret them.");

		md(`The second half is \`load()\`: a cold load never passes through \`go()\`, so it corrects itself in place with \`replaceState\`. The condition is \`!this.active\` — **having nothing activated yet is exactly what "the browser did this one" means**, so no second entry point is needed. That is the piece the removed \`Router.enter()\` was invented for.`).ac("note");

		section("Try it");

		div.c("claim-urls", () => {
			a.c("claim-url", "/urls/slash").href("/urls/slash");
			a.c("claim-url", "/urls/slash//").href("/urls/slash//");
			a.c("claim-url", "/urls/slash/").href("/urls/slash/");
		});

		md(`Click any of them and read the address bar: it says \`/urls/slash/\`. Reload — same page, same url, and \`document.title\` and the marking are identical to what clicking produced.`).ac("note");

		section("The hazard that survives");

		claim(() => {
			// Router.mark_links — a plain string prefix, with no segment boundary
			link.classList.toggle("in-path",
				link.pathname !== here && link.pathname !== "/" && here.startsWith(link.pathname));
		}, null, "`here` is `/urls/slash/`, so a hand-written href of `/urls/sla` matches `startsWith` and is marked as an ancestor of a page it is not related to.");

		div.c("claim-urls", () => {
			a.c("claim-url", "/urls/sla   (non-canonical, watch it go blue)").href("/urls/sla");
			a.c("claim-url", "/urls/slash   (canonical, goes solid)").href("/urls/slash/");
		});

		md(`Every href the framework itself builds comes from \`page.url\` — \`link()\`, \`preview()\`, \`previews()\`, \`tabs()\` — so all of them are canonical and immune. Only a **hand-typed** href can trip this, and \`site/app.js\`'s nav array is hand-typed. Ranked in **/urls/ugly/**.`).ac("note");

		visit(["/urls/ugly/", "/urls/alias/"]);
	},
});
