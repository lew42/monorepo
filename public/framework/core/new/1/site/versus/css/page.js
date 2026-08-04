import { Page, div } from "/app.js";
import { code, section } from "../../ui.js";
import { file, pair, verdict, ledger, measured, note } from "../ui.js";

export default new Page({
	meta: import.meta,
	title: "Two classes vs a layout tier",

	content(){
		verdict("Within this scope, CSS runs out in exactly two places — producing text, and relating a url to a link — and the framework already spends JS on both. Everything else an arrangement needs, including the one thing ColumnPager could do that new/1 was assumed not to, is a selector. I went looking for a third limit and found that :nth-last-child(… of S) had already closed it.");

		section("The whole of what the framework writes");

		pair(() => {
			file("/framework/core/new/1/Router.js", "mark(){");
			file("/framework/core/new/1/Router.js", "mark_links(here");
		});

		note("Four classes total: `.active-page` and `.active-ancestor` on pages, `.active` and `.in-path` on links. No `order`, no `data-mode`, no inline styles, nothing on `.app`. Every arrangement on this site is CSS reading those four.");

		section("Where I expected CSS to run out — and did not");

		note("ColumnPager showed **the last two of the chain** as columns and breadcrumbed the rest. `chain.slice(-2)` — a count, and counting *matched* siblings is the classic thing CSS cannot do, because `:nth-child` counts among **all** siblings and `.pages` also holds stale pages from branches you visited earlier.");

		note("That is no longer true. `:nth-child(An+B of S)` counts among siblings matching `S`, and it is in every current engine.");

		measured("playwright — Chrome 151, the exact DOM new/1 produces", `
DOM (activation order, so the stale page from another branch is LAST):
  root .active-ancestor | a .active-ancestor | b .active-ancestor | c .active-page | stale

:nth-last-child(-n+2 of .active-ancestor, .active-page)   ->  b, c     correct
:nth-last-child(-n+2)                                     ->  c, stale wrong

CSS.supports selector(:nth-child(1 of .x))   true
CSS.supports selector(:has())                true
CSS.supports transition-behavior: allow-discrete  true`);

		section("Live — the same selector, on this page");

		div.c("chain-probe", () => {
			div.c("chain-ancestor", "root");
			div.c("chain-ancestor", "a");
			div.c("chain-ancestor", "b");
			div.c("chain-leaf", "c ← leaf");
			div("stale");
		});

		code(`
.chain-probe > :nth-last-child(-n+2 of .chain-ancestor, .chain-leaf) {
    opacity: 1; border-color: #0a58ca; background: #f5f9ff;
}`, "versus.css — the two highlighted boxes above");

		note("`b` and `c` light up; `stale` does not, even though it is last in the DOM. **ColumnPager's `chain.slice(-2)` is one selector**, which means new/1 can express *both* “all columns” and “only the last N” with no JS at all — and ColumnPager's own open question about a third column becomes a number in a selector.");

		note("The probe uses `.chain-*` and not the real `.active-*` names on purpose. `Router.mark()` runs `querySelectorAll(\".active-page, .active-ancestor\")` over the **whole** of `$app` and strips those classes from every element it finds — not only from pages. Any element that borrows a chain class is silently wiped on the next navigation.");

		section("Where it genuinely does run out");

		ledger(["the question", "why CSS cannot", "what pays for it"], [
			["*What does this tab say?*", "CSS cannot read one element's text into another. `content: attr()` reads a same-element attribute, in a pseudo-element only — and if JS wrote the attribute, JS wrote the label.", "`Page.tabs()` — ~40 of the 290 lines"],
			["*Does this link point at where I am?*", "CSS has no access to `location`, and no way to compare an `href` to it.", "`Router.mark_links()` — 10 lines"],
		]);

		note("That is the whole list. Two questions, both about **information CSS has no access to** rather than about arrangement — and the framework's 290 lines are, almost exactly, the code that answers them plus the walk that resolves a url.");

		section("Things I checked that turned out to be expressible");

		code(`
"only the last N of the chain"        :nth-last-child(-n+2 of .active-ancestor, .active-page)
"am I holding the leaf?"              .active-ancestor:has(.page.active-page)
"is this panel showing nothing?"      .tab-panel:not(:has(> .page.active-page)) > .default
"is the chain at least 5 deep?"       .cols:has(> :nth-child(5 of .active-ancestor))
"leaf first, ancestors under it"      flex-direction: column-reverse
"one region reacting to another"      .app:has(.region-a .active-page) .region-b
"animating out of display: none"      @starting-style + transition-behavior: allow-discrete`, "all of these work today");

		note("The last one matters for the motion seat: `display: none` was the standard argument that a CSS-only visibility model cannot animate. `transition-behavior: allow-discrete` and `@starting-style` both report supported here, so that argument has expired.");

		section("The honest caveat");

		code(`
:has()                             Chrome 105 · Safari 15.4 · Firefox 121   (Dec 2023)
:nth-child(of S)                   Chrome 111 · Safari 9    · Firefox 113   (May 2023)
transition-behavior: allow-discrete Chrome 117 · Safari 17.4 · Firefox 129  (Aug 2024)`, "this design was not possible three years ago");

		note("**The framework is small because the browser got big.** Every one of these arrangements would have been JS in 2022, and the layout tier that new/1 deleted was written when it had to be. That is not a criticism of ColumnPager — it is the reason it existed, and the reason deleting it is now correct.");

		note("It is also the risk: this tier's floor is Firefox 121, December 2023. A project that must support anything older does not get this design, and gets ColumnPager's instead.");

		section("Next");

		note("`/versus/field/` — against React Router, Next, SvelteKit and Astro, reasoned and never benchmarked.");
	}
});
