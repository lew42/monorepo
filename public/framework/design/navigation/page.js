import { Page, md } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Navigation",
	description: "The path: how links look, persistent or switching, transitions.",
	icon: "explore",

	content(){
		md("**Route everything.** Any view a click reaches — a tab, a selected item, an open panel — has its own URL, so a reload or the back button lands in the same place.");
		md("Check the techniques the page actually uses: **tabs** (fit on one row at 1920), **a rail or sidebar** (beside a centred main at 3440, stays still), **a sheet or modal** (its own URL, returns to the same place), **full screen** (a visible way back out).");
		md("A selected item opens in its own column, never by expanding in place: see [design/layout](/framework/design/layout/), the layout never jumps.");
		md.details(import.meta, "readme.md", "Readme");
	},
});
