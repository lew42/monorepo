import { Page } from "/app.js";
import { code, section } from "../ui.js";
import { verdict, ledger, measured, note } from "./ui.js";

export default new Page({
	meta: import.meta,
	title: "Versus",

	// Eight comparisons, all lazy. Each one is the same navigation problem
	// expressed twice, with both codes on the page.
	children: "pager lineage container css field lines council verdict",

	content(){
		verdict("new/1 is the best of the four designs in this repo, and the comparison that proves it has only ever been run against the other three. Against its own ancestors it wins on every axis but one. Against the field it is not competing — it solves a smaller problem than React Router or Next, and solves it with less machinery than anything else that solves it at all.");

		measured("node scratch/count.mjs   # code lines, block+line comments and blanks stripped", `
new/1 (3 classes)         290 code   267 without its own logging
new/0 (2 classes)         149 code   135
starter (3 classes)       275 code   233
core Pager tier           106 code   (Pager 15 · ColumnPager 65 · TabPager 26)
View.js (shared by all)   492 code   ← the denominator nobody quotes`);

		note("The readme says **265**. Measured, it is 290 — or 267 once its own `console.log` lines come out, which is what 265 counts. The number is honest. What it leaves out is that all three classes sit on top of a 492-line `View`, which is 1.7× the tier itself. `/versus/lines/` takes that apart.");

		section("What it bought, and what it cost");

		ledger(["", "bought", "cost"], [
			["vs the Pager tier", "9 lines of CSS replace 287 lines of layout classes; three coordinating call sites become one; any number of columns instead of two", "the per-topic sidebar, which ColumnPager derived for free and new/1 hand-types"],
			["vs new/0", "a url imports its own chain, not the whole site", "the tree is no longer knowable synchronously — every label problem on this site descends from that"],
			["vs starter", "no doomed 404 per dynamic url; one flat container instead of nested ones", "`route()` can only claim names nobody declared — deliberate, and correct"],
			["vs the field", "no build step, no registration, no manifest; a new page is a file", "no data layer, no HTML without JS, and a deep cold url is N serial round trips"],
		]);

		section("How to read these pages");

		code(`
file("/framework/core/Pager/ColumnPager.js", "108-124")   fetched — the real bytes
code(src, "a slot system — sketch")                       typed — nothing implements it`, "the integrity rule");

		note("Code from a tier that exists is **fetched at runtime**, never retyped, because a retyped copy can drift and a comparison built on drifted copies is worth nothing. Code for a design nobody built has nothing to drift from, so it is typed — and every label says which of the two you are reading.");

		section("The eight");

		this.previews();

		code(`
pager       new/1 vs the ColumnPager tier it deleted — and the one thing genuinely lost
lineage     new/0's eager tree and starter's doomed 404, both shown failing
container   container() vs parent-placement, slots, and a layout component
css         two classes vs a layout tier — and the two places CSS genuinely runs out
field       React Router, Next, SvelteKit, Astro — reasoned, never benchmarked
lines       what 265 includes, and where the rest of the complexity actually went
council     thirteen seats, their agreements, their contradictions, and the ranked asks
verdict     good for, bad for, and what you would need to know to recommend it`, "one question each");

		note("Start at `pager` — it is the comparison the other seven refer back to.");
	}
});
