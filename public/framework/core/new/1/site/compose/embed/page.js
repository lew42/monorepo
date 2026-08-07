import { Page, p, div, a, is } from "/app.js";
import { code, section } from "../../ui.js";
import { this_file, when, cost } from "../../compound/recipe.js";

/* Run a page's content() here, without taking its view. Repeatable, because a
 * function is a value — you can call it twice. The page keeps its own view and
 * its own url, and nothing it owns has moved. */
function embed(page){
	return div.c("embed-box", () => {
		div.c("code-label", `${page.url} — content(), re-run here`);
		return is.fn(page.content) ? page.content.call(page) : page.content;
	});
}

export default new Page({
	meta: import.meta,
	title: "A page inside a page",

	initialize(){
		this.add("detail", {
			title: "Detail",
			content(){
				p("I am a real page at a real url, and my content is on the parent screen twice over. Two of those are copies of my content; one of them is me.");
				a.c("page-link", "← back").href("/compose/embed/");
			}
		});
	},

	content(){
		when("a summary, a preview or a card should show what another page actually says, rather than a hand-written description of it that goes stale.");

		section("Two ways, and they are not the same way");

		p("`embed()` above calls `page.content()` — twice, here, side by side. A function is a value, so this costs nothing and can be done anywhere, any number of times.");

		embed(this.detail);
		embed(this.detail);

		section("…and the one that is not a copy");

		p("This box holds `detail.render()` — its actual view, the one and only. Measured: `render()` is memoized, a View wraps one element, and an element has one parent. So placing it here does not copy it, it MOVES it.");

		div.c("embed-box", () => {
			div.c("code-label", "/compose/embed/detail/ — its VIEW, moved here");
			this.detail.render();
		});

		p("Click through and come back. The box above will be empty, and it will stay empty until a full reload rebuilds this page — because `activate()` moved the view into `app.$pages` and nothing moves it back.").ac("note");

		div.c("row", () => a.c("page-link", "visit detail, then come back →").href("/compose/embed/detail/"));

		section("Measured, in the live framework");

		code(`
render() is memoized               true    two calls, one object
append to A, then to B             B wins  A is left EMPTY
content() called twice             both    two independent renders
content() that sets this.$pages    broken  the 2nd call orphans the 1st region`);

		p("The last line is the only real rule this hands you: `content()` is re-runnable exactly when it does not stash anything on `this`. A `content()` that claims a region — `this.$pages = …` — is not a fragment, it is a page's one-and-only body, and running it twice quietly orphans the first region.").ac("note");

		section("The sentence");

		p("A View is a place, not a value. Everything on this page follows from it: content composes because it is a function, views do not because they are locations, and the framework never had to choose — the DOM chose.");

		section("The file");

		this_file(import.meta);

		cost("an embedded copy is a copy: it does not update when the real page changes, and it is not the thing the Router marks. If it must stay in sync, it is not an embed — it is a region, and `/compound/` has five recipes for those.");
	}
});
