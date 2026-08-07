import { Page, p } from "/app.js";
import { code, section } from "../ui.js";

// async.css is loaded by lab.js, the module that emits those classes — this page
// uses none of them, and /state/ imports lab.js without ever loading this file.

export default new Page({
	meta: import.meta,
	title: "Async",

	children: "trap shapes states inflight marking stream arrangements rule",

	content(){
		code(`
// Place the container NOW. Fill it LATER, through a NAME.
div.c("results", async $results => {
    const data = await fetch(url).then(r => r.json());
    $results.append(data.map(d => div.c("item", d.name)));
});`, "the whole discipline, in five lines");

		p("Every element factory appends to `View.captor` — one global. `append_fn` restores it the instant your function returns, and an `async` function returns at its first `await`. Everything you build after that lands wherever the captor has since gone. Nothing throws.");

		section("Measured, not believed");

		code(`
View.captor at rest — every route, every arrangement:

    body > div.app > div.pages          ← app.$pages, stack depth 1

so an element built after an await lands there:

    /              a flex sibling of the page — visible, and it steals width
    /tabs/api/     the same place — beside the tabs page, never in the panel
    /full/left/    the same place — and INVISIBLE, covered by position:fixed

One bug. Three faces. Zero console errors in all three.`, "playwright, 1400×800");

		p("The arrangement never changes where the orphan goes. It changes whether you can see it — which is why the same mistake gets reported as three different bugs.").ac("note");

		section("The eight investigations");

		this.previews();

		section("Ground rules for this section");

		code(`
no server        a "slow API" is a static items.json plus a timer in the browser
no retyping     every box shows source(fn) — the function that actually ran
evidence        where(node) walks parentElement and prints what really happened`);

		p("Start with `trap` — it is the bug every author writes exactly once. End with `rule`.").ac("note");
	}
});
