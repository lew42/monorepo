import { Page, p, a, div } from "/app.js";
import { source } from "/framework/util/source/source.js";
import { code, section } from "/ui.js";
import { measured, gated, summarise } from "/perf/ui.js";
import { prefetch_on_hover, preload, prefetched } from "/perf/prefetch.js";

export default new Page({
	meta: import.meta,
	title: "Prefetch on hover",

	content(){
		// Opting in is one call, in the file that wants the behavior. It goes here
		// rather than in initialize(), because `app` is assigned on the walk — a
		// page has no `.app` while its own constructor is still running.
		prefetch_on_hover(this.app);

		code(source(prefetch_on_hover), "prefetch_on_hover(app) — the whole opt-in");
		code(source(preload), "preload(url) — modulepreload, not import()");

		p("One delegated listener. Pointing at an in-app link starts fetching its page module, so the click finds it in the module map. It is live on this page right now — hover the links at the bottom and re-run the table below.").ac("note");

		section("What a cold import costs, on your network");

		gated(async () => {
			// Each ?cold= is a DISTINCT module url, so every one of these is
			// genuinely cold — the module map can never serve a specifier it has
			// not seen. That is the only honest way to measure a cold import twice.
			const cold = [];
			for (let i = 0; i < 9; i++){
				const t0 = performance.now();
				await import(`/perf/walk/a/page.js?cold=${Math.random()}`);
				cold.push(performance.now() - t0);
			}

			const warm = [];
			for (let i = 0; i < 9; i++){
				const t0 = performance.now();
				await import("/perf/walk/a/page.js");
				warm.push(performance.now() - t0);
			}

			const c = summarise(cold), w = summarise(warm);

			return {
				head: ["import()", "n", "min ms", "median ms", "max ms"],
				rows: [
					["cold — never seen this specifier", c.n, c.min, c.med, c.max],
					["warm — already in the module map", w.n, w.min, w.med, w.max],
					["what a hover can save, ms", "", "", c.med - w.med, ""],
				],
			};
		}, "a genuinely cold import vs a registry hit, nine times each");

		p("The saving is the whole cold number: a hover that lands more than that many milliseconds before the click makes the navigation instant. On a real network that is one round trip; on localhost it is small, and the ratio is still the finding.").ac("note");

		section("What has been prefetched on this page");

		measured(() => {
			const urls = prefetched();
			return urls.length
				? { head: ["prefetched by your pointer"], rows: urls.map(url => [url]) }
				: [["nothing yet — hover a link below, then reload this table by revisiting the page", ""]];
		}, "the set prefetch.js has asked for");

		section("The price on a link-dense page");

		gated(() => {
			const links = [...this.app.$app.el.querySelectorAll("a[href]")]
				.filter(link => link.origin === location.origin && !/\.\w+$/.test(link.pathname));
			const unique = new Set(links.map(link => link.pathname));

			return {
				head: ["hovering everything in $app", "count"],
				rows: [
					["in-app links on screen", links.length],
					["distinct urls behind them", unique.size],
					["module requests if every one is grazed", unique.size],
					["…of which this document already has", [...unique]
						.filter(path => performance.getEntriesByType("resource")
							.some(entry => entry.name.endsWith(path + "page.js"))).length],
				],
			};
		}, "count what a pointer crossing the sidebar would actually request");

		p("This is the real cost, and it is not hypothetical: a sidebar of twelve links grazed on the way to the thirteenth is twelve speculative requests. `modulepreload` keeps them cheap — fetched and parsed, never run — but they are still bytes, and on a metered connection they are bytes nobody asked for.").ac("note");

		section("Hover these");

		div.c("row", () => {
			a.c("page-link", "walk / a").href("/perf/walk/a/");
			a.c("page-link", "walk / a / b").href("/perf/walk/a/b/");
			a.c("page-link", "walk / a / b / c").href("/perf/walk/a/b/c/");
			a.c("page-link", "columns / child").href("/columns/child/");
		});

		p("Hover, wait a beat, then click. The exact signature a first-class `Page.prefetch()` would want — and why it should be a Router concern rather than a Page one — is in the report.").ac("note");
	},
});
