import { Page, p, a, div } from "/app.js";
import { Router } from "/framework/core/new/1/Router.js";
import { source } from "/framework/util/source/source.js";
import { code, section } from "/ui.js";
import { measured, gated, summarise } from "/perf/ui.js";

export default new Page({
	meta: import.meta,
	title: "The depth ladder",

	content(){
		code(`
                    ONE URL SEGMENT COSTS

                        RTT + 16 ms

        measured on a 5-link chain, medians of n=5, cold every time,
        re-fitted after six framework changes and unmoved`, "the canonical number");

		p("This is the most quotable result in the whole council, so it gets a permanent address. Everything else about navigation cost follows from it.").ac("note");

		section("The measurement");

		code(source(Router.prototype.load_segments), "Router.load_segments() — one await per segment");

		code(`
ms of walk (window.app assigned -> app.ready), median of n=5

depth  route                     0 ms lat   50 ms lat   150 ms lat
  1    /                             15.9        77.0        173.0
  3    /perf/walk/                   96.0       395.6        873.1
  5    /perf/walk/a/b/              126.3       548.9       1216.1
  8    /perf/walk/a/b/c/d/e/        174.7       789.4       1736.4

slope, ms per extra segment          15.7        79.4        172.7
model: RTT + 16 ms                     16          66          166
ratio measured/model                 0.98        1.20         1.04`,
			"the ladder — /perf/walk/a/…/e/ is the instrument, and it is still there");

		p("The 50 ms column is the loosest fit at 1.20, because the emulator adds latency to more than one phase of a request at that scale. At 0 and 150 ms the model is within 4%.").ac("note");

		section("Read it three ways");

		code(`
COLD DEEP LINK       someone lands on /a/b/c/d/e/ from outside.
                     5 segments x (RTT + 16 ms). At 150 ms RTT: 866 ms.

A JUMP               a sidebar link from /a/ straight to /a/b/c/d/e/.
                     Same cost. The walk does not care how you got there.

CLICK BY CLICK       /a/ -> /a/b/ -> /a/b/c/. ONE segment each time.
                     RTT + 16 ms per click, and the ancestors are already in
                     the module map. This is what most navigation actually is.

So the ladder is a worst case that ordinary reading never pays, and a first
impression that a deep-linked reader always pays.`, "the same number, three situations");

		section("Confirm the local half yourself");

		gated(async () => {
			const urls = ["a", "a/b", "a/b/c", "a/b/c/d", "a/b/c/d/e"]
				.map(seg => `/perf/walk/${seg}/page.js`);
			const get = url => fetch(`${url}?bust=${Math.random()}`).then(r => r.text());
			const time = async run => { const t0 = performance.now(); await run(); return performance.now() - t0; };

			const serial = [], parallel = [];
			for (let i = 0; i < 9; i++){
				serial.push(await time(async () => { for (const url of urls) await get(url); }));
				parallel.push(await time(() => Promise.all(urls.map(get))));
			}

			const s = summarise(serial), pl = summarise(parallel);
			return {
				head: ["5 modules, cache-busted", "n", "min ms", "median ms", "max ms"],
				rows: [
					["serial — what load_segments() does", s.n, s.min, s.med, s.max],
					["parallel — Promise.all", pl.n, pl.min, pl.med, pl.max],
					["ratio", "", "", s.med / (pl.med || 1), ""],
				],
			};
		}, "the same five modules, one after another vs all at once, on your network");

		p("The ratio is the finding, not the milliseconds: on localhost the RTT is near zero, so the serial penalty is small in absolute terms and the SHAPE is identical. Add 150 ms of real network and the same ratio becomes 866 ms.").ac("note");

		section("Why it cannot simply be parallelised");

		code(`
/a/b/  ->  root.child("a")   must RUN before "b" is known to be legal
       ->  a.child("b")

A url is a path through a tree the client has not seen. Speculating is right
whenever the url resolves and wrong whenever a parent claimed the segment with
route() — and route() is used in about twenty pages here.

Prefetch on HOVER is the version that pays: the guess is one the user already
made. It must warm every PREFIX of the url, not just the leaf, or the walk
still goes to the network for every ancestor.`, "the dependency, and the one safe exploit of it");

		section("Live, on the page you are reading");

		measured(async () => {
			await this.app.ready;
			const pages = performance.getEntriesByType("resource")
				.filter(entry => /page\.js(\?|$)/.test(entry.name));

			return [
				["url segments in this route", this.url.split("/").filter(Boolean).length],
				["page.js modules this document fetched", pages.length],
				["ms of network across all of them", pages.reduce((n, e) => n + e.duration, 0)],
				["ms from the first to the last finishing", pages.length
					? Math.max(...pages.map(e => e.responseEnd)) - Math.min(...pages.map(e => e.startTime)) : 0],
			];
		}, "this document's own walk, from resource timing");

		div.c("row", () => {
			a.c("page-link", "walk the ladder →").href("/perf/walk/a/");
			a.c("page-link", "the serial walk in full →").href("/perf/walk/");
			a.c("page-link", "← the budget").href("/budget/");
		});
	},
});
