import { Page, p, a, div } from "/app.js";
import { Router } from "/framework/core/new/1/Router.js";
import { source } from "/framework/util/source/source.js";
import { code, section } from "/ui.js";
import { measured, gated, module_waterfall, summarise } from "/perf/ui.js";

export default new Page({
	meta: import.meta,
	title: "The serial walk",
	children: "a",

	content(){
		// The REAL method, off the live prototype. Not a copy typed into a page,
		// and not a second fetch of a file the browser already has.
		code(source(Router.prototype.load_segments), "Router.load_segments() — read off the live prototype");

		p("One `await` per segment. `/a/b/c/d/e/` is five sequential round trips, and the loop has no choice: a segment's children are only known once its module has run.").ac("note");

		section("This document's own walk");

		measured(module_waterfall, "performance.getEntriesByType('resource'), filtered to page.js");

		p("Arrive by reload and every row waits for the one above it. Arrive by click and the table is nearly empty — the modules are already in the registry.").ac("note");

		section("Serial vs parallel, on your network");

		gated(async () => {
			const urls = ["a", "a/b", "a/b/c", "a/b/c/d", "a/b/c/d/e"]
				.map(seg => `/perf/walk/${seg}/page.js`);

			// cache-busted, so every run pays a real round trip rather than
			// measuring the memory cache
			const get = url => fetch(`${url}?bust=${Math.random()}`).then(r => r.text());

			const time = async run => {
				const t0 = performance.now();
				await run();
				return performance.now() - t0;
			};

			const serial = [], parallel = [];
			for (let i = 0; i < 9; i++){
				serial.push(await time(async () => { for (const url of urls) await get(url); }));
				parallel.push(await time(() => Promise.all(urls.map(get))));
			}

			const s = summarise(serial), pl = summarise(parallel);
			return {
				head: ["5 modules", "n", "min ms", "median ms", "max ms"],
				rows: [
					["serial — what load_segments() does", s.n, s.min, s.med, s.max],
					["parallel — Promise.all", pl.n, pl.min, pl.med, pl.max],
					["cost of being serial", "", "", s.med - pl.med, ""],
				],
			};
		}, "the same five modules, one after another vs all at once");

		p("Gated behind a button: it fires ten uncached requests and would otherwise tax every reader of this page. On localhost the gap is small because the round trip is small — the ratio is the finding, not the milliseconds.").ac("note");

		section("Why it cannot simply be parallelised");

		code(`
/perf/walk/a/b/  →  root.child("a")   ← must RUN before we know "b" is legal
                 →  a.child("b")

The url is a path through a tree the client has not seen. Fetching
/perf/walk/a/b/page.js speculatively is a GUESS: right when the segment is a
real directory, a 404 when the parent claimed it with route().`, "the dependency that forces the serial walk");

		p("A speculative parallel fetch is neither free nor always right — the full weighing is in the report. Prefetching on hover is the version that pays, because the guess is one link the user already pointed at.").ac("note");

		div.c("row", () => {
			a.c("page-link", "walk to the bottom →").href("/perf/walk/a/");
			a.c("page-link", "prefetch on hover →").href("/perf/prefetch/");
		});
	},
});
