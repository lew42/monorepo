import { Page } from "/app.js";
import { code, section } from "../../ui.js";
import { file, pair, verdict, ledger, measured, note } from "../ui.js";

export default new Page({
	meta: import.meta,
	title: "vs new/0 and starter",

	content(){
		verdict("Two corrections, and neither was a bug fix — both were a data structure being wrong about what it could assume. new/0 assumed the tree was in memory. starter assumed the filesystem was the first place to look. new/1's three-state Map is the single change that answers both.");

		section("new/0 — a url imports the whole site");

		pair(() => {
			file("/framework/core/new/0/site/page.js", "1-10");
			file("/framework/core/new/0/Page.class.js", "adopt(app){");
		});

		note("`children: [about, docs, focus]` are **direct imports**, resolved at module scope. `docs` imports `intro` and `guide`. So `import(\"/page.js\")` pulls all six page modules before a single line of `App.load()` runs — and `/about/` costs exactly as much as the whole site does.");

		note("Look at `adopt()` and the reason becomes structural rather than lazy: it **recurses the tree to hand out `.app`**. A recursive walk over a tree with unloaded nodes is a contradiction, so the eager imports are not an oversight — they are what makes `adopt()` possible at all.");

		code(`
adopt() recurses the tree   →   the tree must already exist
the tree must exist         →   children are direct imports
children are direct imports →   any url imports the whole site`, "one line forced the next");

		section("The fix: children can be names");

		pair(() => {
			file("/framework/core/new/1/Page.class.js", "declare(){");
			file("/framework/core/new/1/Page.class.js", "async child(name){");
		});

		note("Three states in one Map — `undefined` never declared, `null` declared but unloaded, a `Page` here already. And `adopt()` is **gone**: `.app` is assigned in `child()`, on the walk, to the page about to need it. Nothing recurses anything, so there is nothing that needs the tree to exist.");

		measured("playwright — page.js modules fetched on a cold load, 1400×900", `
/                          1 module    /page.js
/versus/pager/             3 modules   / · /versus/ · /versus/pager/     (its own chain)
/deep/nesting/a/b/c/d/e/   8 modules   / · deep · nesting · a · b · c · d · e

new/0, same tree, same urls:  every one of them costs the entire site.`);

		note("The `/versus/pager/` run actually fetched a 4th `page.js` — `site/columns/page.js`, which that page *displays* as evidence. Counted honestly: 3 are the chain, 1 is content.");

		section("What laziness cost, and it is not nothing");

		ledger(["new/0 could", "because", "new/1"], [
			["build a nav from `root.children` and get real titles", "every child was a live Page", "hand-typed nav — readme Open #6"],
			["`previews()` synchronously, with real titles", "same", "a card says `columns` until you visit it, then `Columns`"],
			["label a tab bar from titles", "same", "labels are declared **names**, deliberately — a title-derived label would read differently per entry point"],
			["`page.activate()` on any page, from anywhere", "`adopt()` reached every page", "`unvisited.go()` throws — readme Open #2"],
		]);

		note("Every one of those is the same trade wearing a different hat: **the tree is no longer knowable synchronously.** new/1 does not hide this — it converted each case into a rule that is deterministic instead of merely available, which is the better answer, but it is an answer to a problem laziness created.");

		section("starter — the filesystem first, and a doomed 404");

		file("/framework/core/new/starter/Page.class.js", "async child(name){");

		note("Memory, then `import(url + name + \"/page.js\")`, then `route()`. So `/items/42/` fires a network request for `/items/42/page.js` that **cannot** succeed, waits for the 404, and only then lets the page claim the name. Every dynamic url pays for a file nobody ever intended to write.");

		note("The obvious inversion — check `route()` first — is worse: a greedy `route()` silently shadows a real `page.js`, and now a file you created does nothing and never says why.");

		section("The fix: a third slot the ordering can use");

		file("/framework/core/new/1/Page.class.js", "const claimed");

		code(`
children.get(name) → a Page      use it
                   → null        DECLARED: import it        ← only these hit the network
                   → undefined   never declared: route() may claim it`, "why three states beat two");

		note("`route()` runs after the **declaration**, not after the filesystem. Only declared names are ever fetched, so a dynamic url costs no doomed request; and `route()` structurally cannot shadow a `page.js`, because *a file you want is a file you declared*. The same Map that fixed new/0's eagerness is what makes this ordering available — one structure, two corrections.");

		section("starter's other failure: containers nested");

		pair(() => {
			file("/framework/core/new/starter/Page.class.js", "this.view = div.c(\"page\"");
			file("/framework/core/new/1/Page.class.js", "render(){");
		});

		note("`this.$pages ??= div.c(\"pages\")` gave **every** page its own container, so the DOM nested one box per level and each level laid out inside the remainder of the last.");

		code(`
starter   /docs/intro/    494 | 246 | 245     each level halves what is left
new/0     /docs/intro/    387 | 387 | 387     siblings in ONE container
                                              (measured at 1400px, new/0 readme)`, "column widths, three levels deep");

		note("starter needed `display: contents` to dissolve the nesting it had created. new/0 deleted the per-page container instead, and **there is nothing left to flatten** — which is what makes `.cols` a rule about siblings, and therefore nine lines instead of a class.");

		section("The lineage, in one table");

		ledger(["", "assumed", "paid", "fixed by"], [
			["starter", "the filesystem is the first place to look", "a doomed 404 per dynamic url", "declared children — a third slot"],
			["starter", "every page holds its own children", "columns shrank geometrically with depth", "new/0's one flat container"],
			["starter", "a page may override `activate()`", "overriding it silently unmounted the page", "new/0: nothing to override — mode is data"],
			["new/0", "the tree is in memory", "every url imports the whole site", "new/1: children may be names"],
			["new/0", "`adopt()` can recurse", "the tree had to be eager for it to work", "new/1: `.app` assigned on the walk"],
			["new/1", "the tree is knowable, not present", "labels, navs and previews must be deterministic rather than derived", "— open, and traded on purpose"],
		]);

		section("Next");

		note("`/versus/container/` — the one mechanism new/1 added that its own readme is not sure about.");
	}
});
