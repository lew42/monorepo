import { Page, p, a, div } from "/app.js";
import { source, dedent } from "/framework/util/source/source.js";
import { code, section } from "/ui.js";
import { measured, gated, tree_census, summarise } from "/perf/ui.js";

// A cycle of real routes, so the navigations being counted are the ones a
// reader would actually make.
const CYCLE = ["/", "/replace/", "/columns/", "/tabs/", "/dynamic/", "/full/", "/perf/memo/"];

export default new Page({
	meta: import.meta,
	title: "The memoized view",

	/* The proposal, working today with no framework change. `deactivate()` is
	 * already the seam for releasing what a page holds — "a socket, a timer, a
	 * <video>", says the readme. Releasing YOURSELF is the same category, and it
	 * is three lines. `forget()` would be a name for these three lines, not a new
	 * mechanism.
	 */
	route(name){
		return {
			title: `Forgetful ${name}`,
			content(){ p(`Built by route("${name}"), and dropped again the moment you leave.`); },
			deactivate(){
				this.view?.remove();
				this.view = null;
				this.parent.children.delete(this.name);
				return this;
			},
		};
	},

	content(){
		code(source(Page.prototype.render), "Page.render() — read off the live prototype");

		p("One line decides it: `if (this.view) return this.view`. A page is built once and kept forever, so a second visit costs no DOM work at all — and nothing is ever released.").ac("note");

		section("What is being kept, right now");

		measured(async () => {
			await this.app.ready;
			const { pages, views, nodes } = tree_census(this.app.root);
			return [
				["Page objects", pages],
				["views built", views],
				["DOM nodes held by those views", nodes],
				["DOM nodes in the whole document", document.getElementsByTagName("*").length],
				["JS heap MB (Chrome only)", (performance.memory?.usedJSHeapSize ?? NaN) / 1048576],
			];
		}, "the live tree, plus the document it is holding open");

		section("100 navigations over 7 real routes");

		gated(async () => {
			const before = { nodes: document.getElementsByTagName("*").length,
			                 heap: performance.memory?.usedJSHeapSize ?? NaN,
			                 views: tree_census(this.app.root).views };
			const times = [];

			for (let i = 0; i < 100; i++){
				const t0 = performance.now();
				await this.app.router.load(CYCLE[i % CYCLE.length]);
				times.push(performance.now() - t0);
			}
			await this.app.router.load(this.url);   // come home

			const t = summarise(times);
			const after = { nodes: document.getElementsByTagName("*").length,
			                heap: performance.memory?.usedJSHeapSize ?? NaN,
			                views: tree_census(this.app.root).views };

			return {
				head: ["", "before", "after 100", "delta"],
				rows: [
					["views built", before.views, after.views, after.views - before.views],
					["DOM nodes", before.nodes, after.nodes, after.nodes - before.nodes],
					["heap MB", before.heap / 1048576, after.heap / 1048576, (after.heap - before.heap) / 1048576],
					["ms per navigation (median)", "", t.med, ""],
					["ms per navigation (max)", "", t.max, ""],
				],
			};
		}, "100 navigations, then measure what the document grew by");

		p("A bounded site cannot grow without bound: there are only so many urls with a file behind them, so after one lap the view count stops moving and every later navigation is a class swap. This is the case for keeping the memo.").ac("note");

		section("…and the case against it");

		gated(async () => {
			const before = { nodes: document.getElementsByTagName("*").length,
			                 heap: performance.memory?.usedJSHeapSize ?? NaN,
			                 pages: tree_census(this.app.root).pages };

			// /dynamic/ declares NO children and claims every segment with route().
			// Each one becomes a Page, gets a view, and is kept — and the set of
			// urls is the set of strings, which is not bounded by anything.
			for (let i = 0; i < 300; i++) await this.app.router.load(`/dynamic/${i}/`);
			await this.app.router.load(this.url);

			const after = { nodes: document.getElementsByTagName("*").length,
			                heap: performance.memory?.usedJSHeapSize ?? NaN,
			                pages: tree_census(this.app.root).pages };

			return {
				head: ["", "before", "after 300 dynamic urls", "delta"],
				rows: [
					["Page objects", before.pages, after.pages, after.pages - before.pages],
					["DOM nodes", before.nodes, after.nodes, after.nodes - before.nodes],
					["heap MB", before.heap / 1048576, after.heap / 1048576, (after.heap - before.heap) / 1048576],
					["modules fetched by all 300", "", 0, ""],
				],
			};
		}, "300 route()-claimed urls — no files, no imports, and nothing releases them");

		p("`route(name)` claims urls that were never declared, so its children map is keyed by user input. Every visited url is a Page and a view, kept for the life of the document. This is the one place the memo is unbounded — and it is the only argument for an eviction API.").ac("note");

		section("The smallest fix, measured rather than predicted");

		// dedent(String(fn)), not source(fn) — source() strips the wrapper to show
		// a body, and here the signature is half the point.
		code(dedent(String(this.route)), "the route() on THIS page — its children forget themselves");

		gated(async () => {
			const count = () => ({ pages: document.querySelectorAll(".page").length,
			                       nodes: document.getElementsByTagName("*").length });
			const start = count();

			// same loop, same count, against a route() whose pages release
			// themselves in deactivate()
			for (let i = 0; i < 300; i++) await this.app.router.load(`${this.url}${i}/`);
			await this.app.router.load(this.url);
			const after = count();

			return {
				head: ["300 route() urls", ".page elements", "elements in document"],
				rows: [
					["before", start.pages, start.nodes],
					["after, self-forgetting", after.pages, after.nodes],
					["growth per url", (after.pages - start.pages) / 300, (after.nodes - start.nodes) / 300],
				],
			};
		}, "the identical loop, against a route() that forgets");

		p("Run the two buttons in either order and compare the growth-per-url rows. The framework default grows one `.page` per url forever; three lines in `deactivate()` make it flat. Nothing else about the page changes — it still renders, still activates, still remembers nothing it should not.").ac("note");

		div.c("row", () => {
			a.c("page-link", "mark()'s two sweeps →").href("/perf/mark/");
			a.c("page-link", "costs nobody looked at →").href("/perf/hidden/");
		});
	},
});
