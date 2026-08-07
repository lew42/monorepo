import { Page } from "/app.js";
import { section } from "../../ui.js";
import { md, claim, visit } from "../ui.js";
import { aliases as p3 } from "../proposals.js";

export default new Page({
	meta: import.meta,
	title: "Aliases & redirects",
	children: "start",

	// Names that used to be mine. Resolved once, before the children Map.
	aliases: { intro: "start", "getting-started": "start", v1: "start" },

	content(){

		claim(() => new Page({
			meta: import.meta,
			children: "start",
			aliases: { intro: "start", "getting-started": "start", v1: "start" },
		}), ["/urls/alias/start/", "/urls/alias/intro/", "/urls/alias/getting-started/", "/urls/alias/v1/"],
			"Click any of the last three. The page renders and the address bar immediately reads `/urls/alias/start/` — one url survives.");

		md(`That is a **redirect**, not an alias, and the difference is the whole argument on this page.`);

		section("The readme's removal was right");

		md(`> Both existed only to make \`/tabs/\` forward to a default tab, and both put a routing concept into \`Router\` to pay for one layout's convenience.

**Agreed, and \`redirect()\` should not come back in that form.** The case it was built for no longer exists: \`/tabs/\` renders its first tab in its own panel and the first tab's href *is* \`/tabs/\`, so there is nothing to forward. A mechanism whose only customer has been solved a better way is not a mechanism.

What survives the removal is a different need, and it is the one real sites actually have: **a page was renamed and its old url is in someone's bookmarks.**`);

		section("Alias or redirect — they are not the same product");

		md(`
| | alias | redirect |
|---|---|---|
| old url | serves the content | resolves, then rewrites the bar |
| live urls per page | **two** | one |
| \`page.url\` | ambiguous — which one? | unchanged |
| the conviction | broken: two encodings of one state | intact |
`);

		md(`\`route()\` already gives you an **alias** — a page can claim its own old name and hand back content. That is exactly why \`route()\` is *not* sufficient: an alias leaves two live urls, and "the url IS the state, entirely and exclusively" is a claim about a function that is injective. Two urls, one screen, is the same failure as \`/tabs\` and \`/tabs/\` and deserves the same answer.`).ac("note");

		section("The version that survives this codebase — one line");

		claim(p3, null, "One lookup at the top of `child()`, before the children Map. It reuses the whole three-slot resolution, so an alias may point at a declared child, an inline one, or a `route()`-claimed name.");

		md(`**Deliberately not recursive.** \`this.child(moved)\` would re-enter \`child()\` and re-check \`aliases\`, so \`{ a: "b", b: "a" }\` would spin forever. A single substitution makes the cycle *unrepresentable* rather than guarded — \`a\` resolves to \`b\` and stops. No depth counter, no visited set, nothing to remember.`).ac("note");

		section("Why this is not a restoration");

		md(`
| the removed \`redirect()\` | \`aliases\` |
|---|---|
| \`load()\` returned a page instead of a boolean | no signature changes |
| \`Router.enter()\` — a second entry point | no new method |
| lived in \`Router\` | lives in \`Page\`, next to \`children\` |
| existed for one layout's default tab | exists for a renamed page |
| the redirect was the mechanism | the redirect **falls out of** canonical push |
`);

		md(`That last row is the load-bearing one. \`aliases\` on its own is an alias. It only becomes a redirect because \`go()\` pushes \`this.active.url\` — the fix for trailing slashes, proposed independently in **/urls/slash/**. Two one-line changes that were designed for different problems compose into a third feature neither of them asked for, and *that* is the sign the shape is right.`).ac("note");

		section("What it deliberately does not do");

		md(`
| case | answer |
|---|---|
| a renamed sibling | \`aliases: { old: "new" }\` |
| a renamed **subtree** | the alias resolves the segment; children follow automatically |
| a cross-tree short link, \`/x/\` → \`/a/deep/path/\` | **not covered** |
| \`/tabs/\` → a default tab | **already solved** — do not reintroduce it |
`);

		md(`A cross-tree short link needs a url, not a name, and a name→url map inside \`child()\` would mean \`child()\` can return a page from somewhere else in the tree — which breaks \`parent\`, breaks \`chain()\`, and breaks the sentence "the url is mine plus the name I'm giving it". **Recommended verdict: leave it out.** A short link is a one-line page that calls \`this.app.router.go(target)\`, and if that costs a history entry, that is a real argument for \`go(url, "replace")\` — which is a separate proposal nobody has needed yet.`).ac("note");

		visit(["/urls/alias/start/", "/urls/query/", "/urls/slash/"]);
	},
});
