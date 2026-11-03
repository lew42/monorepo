import { Page, md } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Layout",
	description: "Space: sizing, wrapping, spacing, flow, the approved layouts, 400 to 3440.",
	icon: "view_quilt",

	content(){
		md("**Every awkward page got awkward the same way: markup written before its size was decided.** Answer these before the first line of markup.");
		md("**Choose the layout first (C1–C5):** room → content → outline → fill → which approved layout. Live: [/layouts/decide/](/layouts/decide/).");
		md("**Then five sizing questions:** container · size at 400/1280/1920/3440 · its own layout · how many containers · its preview on the parent.");
		md("**Spacing is one knob, never a constant:** `--pad` `--gap` `--flow`, with four rungs under the gap. A region takes `.pad`, a framed box `.card`, a control its own `em`.");
		md("Full rules and every measured caveat: [doc/rules.md](/framework/design/layout/doc/rules.md) · [doc/caveats.md](/framework/design/layout/doc/caveats.md).");
		md.details(import.meta, "readme.md", "Readme");
	},
});
