import { Page, md, pre, code } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Router",
	description: "Everything between a url changing and the DOM reflecting it.",

	content(){

		code.html(`<a href="/docs/intro/">Intro</a>`);

		md("That is the whole API. The Router upgrades the click — no reload — and hands the url to the browser only if it genuinely doesn't resolve.");

		md("`activate()` diffs the old chain against the new one and touches only what changed, then writes exactly two classes: `.active-page` on the leaf, `.active-ancestor` on everything above it. Every arrangement on this site is CSS reading those two.");
	}
});
