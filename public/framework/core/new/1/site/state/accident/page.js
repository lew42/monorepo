import { Page, p, div, a, input, details, summary, textarea } from "/app.js";
import { code, section } from "../../ui.js";
import { live } from "../../async/lab.js";

export default new Page({
	meta: import.meta,
	title: "The accidental store",

	content(){
		code(`
render(){
    if (this.view) return this.view;    // ← the whole mechanism
    …
}`, "Page.class.js");

		p("Four words, and they create a store. A page's DOM is built once and kept, so everything the browser holds IN that DOM is kept too — and nobody asked for it, declared it, or can see it in their own file.");

		section("Try it");

		live(() => {
			input.c("state-input").attr("placeholder", "type something…");

			details(() => {
				summary("…and open me");
				p("Still open when you come back.");
			});
		}, "leave the page, come back, and nothing has been lost");

		p("Navigate to another section and return. The typed value is there, the `<details>` is still open, and your scroll offset in this page is where you left it. No code above does any of that.").ac("note");

		section("What is actually being kept");

		code(`
kept   input.value        textarea content     <details open>
       scroll offsets     :checked             focus-independent selection
       canvas contents    <video> position     anything the DOM owns

by     the element still existing. Router hides pages with CSS; it never
       removes them. Measured: 9 .page nodes in the DOM after a tour, none
       ever destroyed.`);

		p("This is not a cache and there is no invalidation. The DOM simply was never thrown away.").ac("note");

		section("It is a feature first");

		code(`
a half-filled form survives a misclick into the nav and back
a long list keeps its scroll position
an expanded tree stays expanded
a chart keeps its rendered canvas — no recompute, no reflow`);

		p("Every one of those is behaviour a hand-written SPA has to implement. Here it is the default, it costs nothing, and it is why `render()` memoizing is worth its surprise.").ac("note");

		section("…and a hazard second");

		code(`
a validation error from a submit you have since abandoned
a "saved!" toast from four navigations ago
a spent one-time token still sitting in a hidden field
a list showing data fetched before the thing was deleted`);

		p("The same four words. Nothing distinguishes state you are glad survived from state that is now a lie — `/state/stale/` is about the second kind, and `deactivate()` is the only hook that can do anything about it.").ac("note");

		section("The one thing it does NOT survive");

		live(() => {
			div.c("async-landed", `this page was rendered once, at ${new Date().toLocaleTimeString()}`);
		}, "reload, and this timestamp changes; navigate away and back, and it does not");

		p("A reload re-imports every module, so the Page instance, its view and module scope all go together. The url is the only thing that comes back — which is the whole reason the url is the framework's central claim.").ac("note");

		a.c("page-link", "shared →").href("/state/shared/");
	}
});
