import { Page, md } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Layout",
	description: "Seven principles of arranging a page — each one live, and most of them yours to push around.",
	icon: "dashboard",

	// Rail order: what a page is made of, smallest first. Each declares its own `group`.
	children: "flow measure flex grid tracks respond screens",

	// The rail IS the pattern — previews-as-nav, the same call /web/nav/ makes.
	// ⚠ From initialize(), never content(): a child added at render time has no url.
	initialize(){ this.catalog(); },

	content(){
		md("**Every card on the left is a live layout, not a picture.** Most carry a toolbar: click a word on and the box re-arranges under you, and the class string the panel shows is the one you paste. The rest sit on a stage you drag by its right edge — the only honest way to look at a layout, because a layout is a thing that answers a width.");

		md("[flow](/web/layout/flow/) and [measure](/web/layout/measure/) are what prose needs and nothing else. [flex](/web/layout/flex/) and [grid](/web/layout/grid/) are the two arrangers, and there is no third. [tracks](/web/layout/tracks/) is how one page holds a reading column *and* a wide exhibit; [respond](/web/layout/respond/) is why none of this needs a media query; [screens](/web/layout/screens/) is the case where there is no prose to protect.");

		md("The words themselves live in the reference — [Layouts](/framework/styles/layouts/) is the catalog of eight, [Flex](/framework/styles/layouts/flex/) and [Grid](/framework/styles/layouts/grid/) are the vocabulary, [Layout](/framework/ext/Layout/) is the toolbar. This tier is about which one a page wants.");
	},
});
