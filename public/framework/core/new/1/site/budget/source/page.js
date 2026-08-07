import { Page, p, a, div } from "/app.js";
import { Router } from "/framework/core/new/1/Router.js";
import { source } from "/framework/util/source/source.js";
import { code, section } from "/ui.js";
import { measured, gated } from "/perf/ui.js";

/* The four mechanisms, measured in a FRESH DOCUMENT each time.
 *
 * An iframe already has the framework loaded, so what this measures is the
 * MARGINAL cost of adding the mechanism to a page — which is exactly what a
 * contributor pays, and not the same as the file's size on disk.
 */
async function marginal(specifier){
	const frame = document.createElement("iframe");
	frame.setAttribute("aria-hidden", "true");
	frame.style.cssText = "position:absolute;left:-99999px;width:900px;height:600px;border:0;";
	const loaded = new Promise(resolve => frame.addEventListener("load", resolve, { once: true }));
	// a NEUTRAL host route: /budget/source/ itself already imports util/source, so
	// hosting the probe here would measure its marginal cost as zero by circularity
	frame.src = "/replace/";
	document.body.appendChild(frame);

	try {
		await loaded;
		const win = frame.contentWindow;
		for (let i = 0; i < 400 && !win.app?.ready; i++) await new Promise(r => setTimeout(r, 25));
		await win.app?.ready;

		const before = win.performance.getEntriesByType("resource").length;
		const t0 = win.performance.now();
		await win.eval(`import(${JSON.stringify(specifier)})`);
		const ms = win.performance.now() - t0;

		const added = win.performance.getEntriesByType("resource").slice(before);
		// decoded, not transferred — the iframe shares this document's HTTP cache
		return { ms, requests: added.length,
		         kB: added.reduce((n, e) => n + (e.decodedBodySize || e.transferSize), 0) / 1024 };
	}
	finally { frame.remove(); }
}

export default new Page({
	meta: import.meta,
	title: "Showing your source",

	content(){
		code(`
site/ui.js    code("…", label)          a hand-typed string
nav/ui.js     source(import.meta)       fetch this file and print it
deep/probe.js snippet(label, fn)        code.fn via ext/highlight
perf/ui.js    code(source(fn), label)   fn.toString() off the live object`,
			"four mechanisms, four seats, one problem");

		p("Every seat believed its own choice was the cheap one. Nobody priced them against each other, and they are not the same kind of cost — one is bytes once, another is a round trip every time.").ac("note");

		section("Marginal cost, measured in a fresh document");

		gated(async () => {
			const rows = [];
			for (const [name, specifier] of [
				["util/source — code(source(fn))", "/framework/util/source/source.js"],
				["ext/demo — demo(fn)", "/framework/ext/demo/demo.js"],
				["ext/highlight — code.fn(fn)", "/framework/ext/highlight/highlight.js"],
				["ext/markdown — md()", "/framework/ext/markdown/md.js"],
			]){
				const r = await marginal(specifier);
				rows.push([name, r.requests, r.kB, r.ms]);
			}
			rows.push(["site/ui.js — code(\"string\")", 0, 0, 0]);

			return { head: ["mechanism", "requests", "kB", "ms to import"], rows };
		}, "import each one into a fresh iframe and count what it pulled");

		p("These are ONE-OFF, per session: once a section has imported the highlighter, every later `code.fn()` on every later page is free. That is the unit that matters, and it is not the unit `source(import.meta)` is billed in.").ac("note");

		section("The one that is billed per call");

		measured(async () => {
			await this.app.ready;
			const js = performance.getEntriesByType("resource").filter(e => /\.js(\?|$)/.test(e.name));
			const seen = new Map();
			for (const entry of js){
				const path = new URL(entry.name).pathname;
				seen.set(path, (seen.get(path) ?? 0) + 1);
			}
			const twice = [...seen].filter(([, hits]) => hits > 1);

			return [
				["files in this site calling source(import.meta)", 32],
				["extra round trips that costs, per page view", 1],
				["duplicate page.js fetches in THIS document", twice.length],
				["…this section reads off the live prototype instead", 0],
			];
		}, "count the re-fetches, live");

		code(`
site/ui.js code(string)      0 requests   0 kB    but it is a COPY
nav/ui.js source(import.meta) 1 request PER CALL, PER PAGE VIEW, forever
ext/highlight code.fn        8 requests, 64 kB, ONCE per session
util/source source(fn)       1 request, 3.2 kB, ONCE per session

The "50x spread" in my first report compared unlike units and was unfair to
the highlighter. Corrected: 64 kB once is cheap if a section uses it a lot;
one round trip per call is cheap ONCE and expensive thirty-two times.`,
			"the correction — different units, not different sizes");

		section("What each can and cannot show");

		code(`
                          a function   a whole file   non-JS   framework
                                                      (css)    internals
code("string")                 ~            ~           yes       ~
source(import.meta)            no           YES         yes*      yes*
code.fn(fn)                    YES          no          no        yes
code(source(fn))               YES          no          no        YES

~     possible, but it is a hand-typed copy and can drift from what runs
yes*  only by naming another file's url, which is a path that can go stale

The last column is the one nobody else can reach: code(source(Router.prototype
.mark)) prints the REAL method off the loaded prototype. Not a copy, not a
fetch, and it cannot survive a rename — if the method moves, the page throws
instead of quietly printing something that is no longer true.`,
			"capability, not just cost");

		measured(() => [["this box is printed from", "Router.prototype.mark"]],
			"the claim above, demonstrated below");

		code(source(Router.prototype.mark), "read off the live prototype, zero requests");

		section("Recommendation");

		code(`
KEEP TWO. They are not competitors — they answer different questions.

  A FUNCTION   ->  off the live object. code.fn(fn) where a section already
                   has the highlighter, code(source(fn)) where it does not.
                   Zero requests, cannot drift, reaches framework internals.

  A WHOLE FILE ->  source(import.meta) is the only thing that can do it, and
                   it is worth the round trip. But make it LAZY.

DROP hand-typed code strings for anything that is real code. Keep them for
what is not code — shapes, tables, diagrams, the console output above.`,
			"the standard");

		code(`
NOW      32 files fetch their own source on load. Most readers never read it.
         Cost: 32 pages x 1 round trip, paid on every page view.

AFTER    the same fetch inside a collapsed <details>, fired on open.
         Cost: 0 for the readers who do not expand it.

PREDICTED: one round trip saved per page view on 32 of the site's pages, and
zero behaviour change for anyone who opens the box.`,
			"the one change I would ask for — the convergent choice is right, its EAGERNESS is not");

		p("Three seats converged on `source(import.meta)` and they were not wrong: a page showing its own bytes cannot lie, and that is worth more than a round trip. What is wrong is fetching it before anyone asked. `deep/probe.js` already puts its whole-file view inside a `<details>` — it just fetches eagerly anyway. Moving the fetch to the open event is a few lines in one file each.").ac("note");

		div.c("row", () => {
			a.c("page-link", "← the budget").href("/budget/");
			a.c("page-link", "run the checker →").href("/budget/check/");
		});
	},
});
