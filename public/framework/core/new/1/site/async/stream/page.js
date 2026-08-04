import { Page, p, div, a } from "/app.js";
import { code, section } from "../../ui.js";
import { live, wait, items } from "../lab.js";

export default new Page({
	meta: import.meta,
	title: "Batches",

	content(){
		p("One container, placed once, filled many times. Nothing here is new — it is the named-target shape repeated, and the point is that repeating it costs nothing.");

		section("Three batches into one container");

		live(() => {
			div.c("async-results", async $list => {
				const data = await items(300);

				for (let batch = 0; batch < 3; batch++){
					await wait(600);

					const rows = data.slice(batch * 8, batch * 8 + 8);

					$list.append(() => {
						div.c("async-landed ok", `batch ${batch + 1} of 3`);
						rows.forEach(row => div.c("async-item", row.name));
					});
				}
			});
		}, "the container does not care how many awaits have passed");

		p("`$list` was placed before the first `await` and is still `$list` after the third. There is no state to keep in sync and no reason to rebuild anything — appending to a named view is the same operation every time.").ac("note");

		section("Infinite scroll");

		live(() => {
			div.c("async-scroller", $scroller => {
				const $list = div.c("list async-items");
				const $sentinel = div.c("sentinel async-landed", "scroll to load");

				let loaded = 0, busy = false;

				new IntersectionObserver(async entries => {
					if (!entries[0].isIntersecting || busy || loaded >= 24) return;

					busy = true;
					$sentinel.text("loading…");

					const data = await items(400);
					const rows = data.slice(loaded, loaded + 6);

					loaded += rows.length;
					$list.append(() => rows.forEach(row => div.c("async-item", row.name)));

					$sentinel.ac(loaded >= 24 ? "ok" : "").text(loaded >= 24 ? "end of results" : "scroll to load");
					busy = false;
				}, { root: $scroller.el, rootMargin: "40px" }).observe($sentinel.el);
			});
		}, "an observer callback is not your capture turn — so name the list");

		p("`busy` is not ceremony. The sentinel can re-enter the viewport while the previous fetch is still out, and without the guard you get two overlapping loads appending the same rows. That is the ordinary infinite-scroll bug, and it has nothing to do with the captor.").ac("note");

		section("…but scroll position is navigation-shaped state");

		p("You have just built something with a position in it — six rows in, twelve rows in, twenty-four rows in. None of it is in the url, so none of it survives a reload, a link you send someone, or the Back button.");

		code(`
click(e){
    const link = this.link_clicked(e);
    …
    this.go(link.pathname);              // ← link.pathname. No search, no hash.
}

async load_segments(url){
    for (const name of url.split("/").filter(Boolean))   // never sees a query
}

window.addEventListener("popstate", () => this.load(location.pathname));`,
			"Router.js — three places, one blind spot");

		section("Measured: the query is not ignored, it is discarded");

		live(() => {
			const $now = div.c("async-landed", `location.search right now → "${location.search || "(empty)"}"`);

			a.c("page-link", "click: href=\"/async/stream/?page=2\"").href("/async/stream/?page=2")
				.click(() => setTimeout(() => $now.text(
					`clicked a ?page=2 link · location.search is now → "${location.search || "(empty)"}"`), 250));
		}, "the href has a query; what survives the click does not");

		p("`link.pathname` excludes the query, so `go()` never sees it and `pushState` writes the bare path. The query is not merely unrouted — it is removed from the url you are standing on. A `?page=2` link is a link that quietly undoes itself.").ac("note");

		section("What that costs, concretely");

		code(`
no shareable state    "here is the list, scrolled to row 18" cannot be a url
no Back through it    every batch is one screen; Back leaves the page entirely
no reload fidelity    the reload contract this site is proud of — clicking and
                      reloading produce byte-identical output — holds ONLY
                      because no page has any state outside its path
filters, sorts,       every one of these is a query string in every other
search, tabs-by-      framework, and none of them can be expressed here
query`);

		p("The tabs recipe dodges this by making each tab a path segment, which is genuinely better for tabs. It does not generalise: `?sort=name&dir=desc` is not two more directories.").ac("note");

		section("Proposed: stop discarding it");

		code(`
// Router.click — keep what the author wrote
this.go(link.pathname + link.search);

// Router.load_segments — the walk only ever wanted the path
for (const name of url.split("?")[0].split("/").filter(Boolean))`,
			"the minimal fix — two lines, no new concept");

		p("That alone makes `?page=2` survive a click, a reload and the Back button, because `pushState` gets the full url and the SPA fallback ignores the query. It does NOT re-render on a query-only change — the page is already active and `render()` is cached. That second half is a design decision (a `query` on the page, and something to call when it changes) and belongs to whoever owns Router, not to this section.").ac("note");

		a.c("page-link", "arrangements →").href("/async/arrangements/");
	}
});
