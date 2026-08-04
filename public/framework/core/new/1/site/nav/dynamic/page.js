import { Page, p, a, div } from "/app.js";
import { section } from "../../ui.js";
import { source } from "../ui.js";

export default new Page({
	meta: import.meta,
	title: "route()",

	// No children declared at all, so every segment under me is mine to claim.
	route(name){
		return {
			title: `Item ${name}`,
			content(){
				p(`No file, no directory, no declaration. route("${name}") built me on the spot, and the url is real — reload and I am still here.`);
				a.c("page-link", "← route()").href("/nav/dynamic/");
			}
		};
	},

	content(){
		source(import.meta);

		p("Urls a page could not list in advance. `route(name)` returns anything `add()` accepts, so a claimed url is an ordinary child from the moment it exists.");

		section("Pick a number");

		div.c("row", () => [7, 42, 99].forEach(n =>
			a.c("page-link", `item ${n}`).href(`/nav/dynamic/${n}/`)));

		section("It runs after the declaration, not after the filesystem");

		p("`child()` reads the Map first. A `Page` is used, a `null` is imported, and only `undefined` — never declared — reaches `route()`. So a dynamic url costs no doomed 404, and `route()` structurally cannot shadow a `page.js`: a file you want is a file you declared.").ac("note");

		section("Why this url is /nav/dynamic/ and not /nav/route/");

		p("Because a child named `route` breaks `route()`. `add()` sets `this.<name>` as a shortcut when the property is free, and nothing defines `route` until you write one — so visiting `/nav/route/` would set `this.route` to a `Page`, and the next unclaimed url would call it. It throws instead of 404ing, and only after you have visited the page, which is the worst kind of bug: absent until the tour is half over.").ac("note");

		p("The guard in `alias()` covers every name `Page` already has. An optional hook is exactly the name it does not have yet.").ac("note");

		section("Next");

		a.c("page-link", "container()  →").href("/nav/container/");
	}
});
