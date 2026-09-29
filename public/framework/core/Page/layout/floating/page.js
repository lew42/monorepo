import { Page, md } from "/app.js";

/**
 * Stub. The real thing — an inner left sidebar with no background, sitting
 * beside a page that scrolls independently of it — is not built yet; the AI 2
 * lead is building `floating()`. This page exists so the Layout tab's link has
 * somewhere honest to go, per the owner's words (2026-09-28, 1:40 PM) and
 * proposal.md's rewrite order item 4 (not this task).
 */
export default new Page({
	meta: import.meta,
	title: "Floating page",
	description: "Coming — an inner left sidebar beside a page that scrolls on its own.",
	icon: "flip_to_front",

	content(){
		md("**Coming.** A left sidebar with no background of its own, sitting in the space around a page — the page floats up with a white background and scrolls independently of the sidebar. The AI 2 lead is building `floating()`.");
		md("The owner described this shape in full on 2026-09-28 at 1:40 PM — see the `page-mastermind` task log.");
		md("Back to [Choosing a layout](/framework/core/Page/layout/).");
	},
});
