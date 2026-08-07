import { Page, View, p } from "/app.js";
import { code, section } from "../ui.js";
import { this_file } from "../compound/recipe.js";

/* css: .show-all, .cards, .embed-box, .split, .split-handle
   Loaded here because every page below is reached by walking through me. */
View.stylesheet(import.meta, "compose.css");

export default new Page({
	meta: import.meta,
	title: "Compose",

	// ALL LAZY, same as /compound/ — seven questions, zero imports until you open one.
	children: "embed component fragments state labels slots limits",

	content(){
		p("`/compound/` asked whether navigation composes. It does. This asks the question nobody had: does a `Page` compose — can one appear inside another, be used three times with different data, share content, share state, or stand beside a page it never imported?");

		section("The questions");

		this.previews();

		section("The composition ledger");

		p("Everything below was measured in the live framework, not reasoned about. The third block is the one that matters: it is not a policy anyone chose, it is what `render()` memoizing into `this.view` and a DOM node having one parent add up to.");

		code(`
ACCEPTED — composes already, and costs nothing
  a fragment as a plain function   a fresh view per call, usable anywhere
  a page factory (data -> options) one function, N instances, N real urls
  slots by assign()                a function you pass IS a method
  the page tree as a state tree    scoped, persists, already the parent chain
  showing off-chain pages by CSS   one selector; mark() never had to know

REJECTED — a mechanism for something that already works
  a Slot / Portal system           assign() does it, with no API surface
  a Fragment class                 wants a url? Page. wants a hook? Page.
  a title manifest for lazy names  a second copy of every title, forever
  reactive binding on the tree     rebuilds exactly what "built once" bought

FORBIDDEN — not policy. Identity.
  one instance in two places       a View is a place; the 2nd append MOVES it
  one instance at two urls         add() reparents, and the url does NOT follow
  two independent history stacks   one url, one back-stack — the web's limit`);

		p("`Page` composes on every axis that a plain object composes on, and on none of the axes that a DOM node does not. That sentence is the whole section, and the reason it is short is that almost nothing had to be added to find it out.").ac("note");

		section("The file");

		this_file(import.meta);
	}
});
