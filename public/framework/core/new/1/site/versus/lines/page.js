import { Page } from "/app.js";
import { code, section } from "../../ui.js";
import { file, pair, verdict, ledger, measured, note } from "../ui.js";

export default new Page({
	meta: import.meta,
	title: "265 lines, taken seriously",

	content(){
		verdict("The number is honest and it is the wrong headline. 290 measured, 267 without its own logging — that is the size of the DECISIONS. The system is ~830 lines of JS, ~85 of CSS, a filesystem convention and four browser features from the last three years. Still small. But every framework's line count is a claim about where the complexity went, and here it went to View, to CSS, to the filesystem, and to the author.");

		section("The number, measured");

		measured("node count.mjs   # block+line comments and blanks stripped", `
                          code   without logging   raw
App.js                      62         57          104
Page.class.js              133        121          304
Router.js                   95         89          170
                          ────       ────
new/1                      290        267          578

readme says 265. It is counting "code minus console.*", and it is right
to within two lines — a couple of log statements wrap onto a second line.`);

		note("No complaint about the claim. The complaint is about what a reader does with it, which is compare it to a number from a framework that counts a different thing.");

		section("The denominator nobody quotes");

		pair(() => {
			measured("the three classes", `
App.js          62
Page.class.js  133
Router.js       95
              ────
               290`);

			measured("what they are built ON", `
View/View.js   492   ← 1.7× the tier
util/is/is.js   49
              ────
               541`);
		});

		note("`div.c(\"pages cols\", () => …)` is one expression in `Page.render()` and about forty lines of `View`: the captor stack, the push/pop in `append_fn`, the type dispatch in `append()`, the factory generation. **new/1 is 290 lines on top of 541 lines that do the actual work of putting things on screen.**");

		note("That is not a criticism — `View` is shared by every tier in this repo, and the comparison against `ColumnPager` on `/versus/pager/` is fair precisely because both sides sit on the same `View`. It is a criticism of quoting 265 next to a number from a framework that includes its renderer.");

		section("Where the rest of it went — specifically");

		ledger(["pushed to", "what it holds", "measured"], [
			["**View**", "the captor stack, `append()` dispatch, every element factory, `stylesheet()`", "492 code lines"],
			["**CSS**", "every arrangement: replace, columns, full, tabs, contains-the-leaf, default-tab fallback", "~35 of `site/styles.css`'s 83 lines"],
			["**the filesystem**", "the route table. There is no manifest because directories are the manifest", "0 lines — and 0 ways to see the route tree"],
			["**the site**", "chrome, and the hand-typed nav that eager loading would have derived", "`site/app.js` 49 lines, ~20 of them the nav arrays"],
			["**the browser**", "module registry as chunk cache *and* dedupe, `history.pushState`, `:has()`, `:nth-child(of S)`", "0 lines, and a floor of Firefox 121 / Dec 2023"],
			["**the author**", "deterministic labels, declared children, and the sync-capture-then-async-fill dance for anything late", "unmeasurable, and the one that actually hurts"],
		]);

		section("The three that are real costs, not clever savings");

		code(`
1  THE ROUTE TREE IS NOT READABLE ANYWHERE.
   No manifest, no generated types, no command that prints it. To know what
   urls exist you read every children: string in the tree, by hand.

2  A TYPO IS A RUNTIME 404.
   children: "intro guide" — misspell one and nothing fails until a click,
   possibly in production. No build step means no build-time check; that is
   the same coin, not two coins.

3  THE AUTHOR ABSORBED THE LAZINESS.
   Deterministic tab labels, name-drawn preview cards, a hand-typed nav —
   every one of those is a rule an author must know, and each exists because
   the tree is knowable rather than present. See /versus/lineage/.`, "what 265 does not include");

		section("What it costs to USE, which is the number that matters");

		measured("a working new/1 site, from nothing", `
index.html        12 lines   one <script type=module>
site/app.js       49         chrome — and you can skip it entirely; App.render() has a default
site/styles.css   83         of which ~35 is the arrangement system, reusable as-is
page.js            5         title + content

a minimum site is index.html + page.js = 17 lines of yours.`);

		note("**This is the honest headline, and it is better than 265.** Seventeen lines of your own to a working, routed, lazily-loaded site with history and back-button support, and no build step between you and it. That is the claim worth making, because it is a claim about the reader rather than about the author.");

		section("For scale, the other direction");

		measured("find site -name '*.js' | wc -l", `
210 js files, ~15,000 lines — the DOCUMENTATION site, written by fourteen
council seats, demonstrating a 290-line framework.

The ratio is not an indictment. It is the point: the framework is small
enough that explaining it is fifty times more work than building it.`);

		section("Verdict on the number");

		note("Quote **17** or quote **830**. 265 is the one number that is technically true and rhetorically misleading — it is the count of a middle layer, presented as the count of a system, and it invites exactly the comparison it cannot survive.");

		section("Next");

		note("`/versus/council/` — thirteen seats, what they agreed on without talking, and where they contradict each other.");
	}
});
