import { Page, md } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Page layout audit",
	description: "What decides a page's box, why the region's --measure never arrives, and the one-word migration to an opt-in grid.",
	icon: "space_dashboard",

	content(){
		md("**The grid is already opt-in — in the JS.** `Page.class.js:216` ends every "
			+ "`render()` with `.ac(this.classes ?? \"standard\")`, so a page that declares no "
			+ "`classes:` already wears `standard`. The word has no CSS rule at all; the grid "
			+ "sits on a bare, unguarded `.page {}` (`Page.css:78`) instead. Move it one word "
			+ "over and the owner's sketch is shipped.");

		md("### The three numbers\n\n"
			+ "| | n |\n|---|---|\n"
			+ "| `page.js` files in scope | **144** |\n"
			+ "| …that declare `classes:` at all | **7** |\n"
			+ "| …that already wear `standard` and would not change | **137** |\n\n"
			+ "Plus: **8** real `render()` overrides (25 files *mention* `render()` — 17 only "
			+ "inside prose), **~35** hand-typed `div.c(\"page full fill flex v\")` layout "
			+ "specimens, and **0** call sites for `.page.solo` — a dead class.");

		md("### Why a region's measure never arrives\n\n"
			+ "`.page` re-declares `--measure` (`Page.css:79`) because `min(none, …)` is invalid "
			+ "at computed-value time and silently drops the whole template — and a declared "
			+ "value beats an inherited one. One headless read at 1440px on `/framework/ext/tabs/` "
			+ "shows both halves on one element:");

		md("```\n"
			+ ".tab-panel         --measure: none   --page-pad: 0   width 1208\n"
			+ ".page.doc-section  --measure: 40em   --page-pad: 0   width 1208\n"
			+ "  main track: 611.19px      padding: 0px\n"
			+ "```");

		md("The panel asked for 1208px of reading column and got **611.19px**: `tabs.css:68`'s "
			+ "`--measure: none` is dead. `--page-pad: 0` on the same line *did* arrive — which "
			+ "is also why `Doc.css:65`'s `.doc-section { --pad-y: 1.5em }` never fires. "
			+ "**The fix is the opt-out value, not the declaration site: `100%`, never `none`.**");

		md("### The migration\n\n"
			+ "1. `Page.css:78` `.page {` → `.page.standard {` (same for `:99-101`, `:279`). "
			+ "**Zero `page.js` edits.**\n"
			+ "2. Seven call sites that opted out and still want the grid gain the word — "
			+ "`ext/Doc/Doc.js` ×3, four `classes: \"dt-page\"`.\n"
			+ "3. Delete `.page.full` and `.page.solo`; keep `.fill` (height, not width).\n"
			+ "4. Every `--measure: none` → `100%`, and `.pages { --measure: 40em }` becomes a "
			+ "real default for its subtree.");

		md("### Read on\n\n"
			+ "- [inventory.md](inventory.md) — every container, every shell word, the four "
			+ "tokens declared/read/dead, the probe, and \"full\" region by region\n"
			+ "- [proposal.md](proposal.md) — the simplification costed with what breaks, and "
			+ "the `/framework/core/Page/` docs a new user should land on: a `browse()` wall in "
			+ "four bands, CSS first and JS last\n"
			+ "- [requirements.md](requirements.md) — the brief");
	},
});
