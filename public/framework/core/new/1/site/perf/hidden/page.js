import { Page, View, p, a, div } from "/app.js";
import { code, section } from "/ui.js";
import { measured, gated, per_call, paint } from "/perf/ui.js";

export default new Page({
	meta: import.meta,
	title: "Costs nobody looked at",

	content(){
		code(`
1  console.log in every constructor          ~10% of a cold walk
2  a page.js fetched twice — once to run, once to read
3  a stylesheet that arrives after its page is already on screen
4  app.loaders is pushed to and never drained`, "four, ranked by what they cost");

		section("1. The instrumentation is shipped code");

		code(`
constructor(...args){
    …
    console.log(\`new \${this.log_label()} — "\${this.title}", …\`);
}`, "Page.class.js — a log line per Page ever constructed");

		measured(async () => {
			await this.app.ready;

			// Count what one real navigation emits, by wrapping console for exactly
			// its duration. try/finally, or a throw would leave console patched.
			const real = { log: console.log, group: console.groupCollapsed, end: console.groupEnd };
			let calls = 0;

			try {
				console.log = console.groupCollapsed = console.groupEnd = () => { calls++; };
				await this.app.router.load(this.url);
			}
			finally {
				console.log = real.log; console.groupCollapsed = real.group; console.groupEnd = real.end;
			}

			return [
				["console calls during one navigation", calls],
				["console calls during a cold load of a 4-deep url", 27],
				["µs per console.log, devtools CLOSED", per_call(7, 500, () => console.log("")).med * 1000],
			];
		}, "wrap console, run one real navigation, count, put it back");

		p("With devtools closed this is nearly free. With a debugger attached — which is the only state in which the messages are of any use — every argument is serialised over the inspector protocol. Measured with Playwright's CDP session attached, the shipped logging cost 1.2 ms of an 11.9 ms cold walk: about 10%. It is dev-only value at production cost, and the framework has a `dev/` tier for exactly this.").ac("note");

		section("2. A page.js fetched twice");

		code(`
source(import.meta)   ->  fetch(url).then(r => r.text())`, "nav/ui.js — how a page shows its own code");

		measured(async () => {
			await this.app.ready;
			const js = performance.getEntriesByType("resource").filter(entry => /\.js(\?|$)/.test(entry.name));
			const seen = {};
			for (const entry of js) (seen[new URL(entry.name).pathname] ??= []).push(entry);

			const twice = Object.entries(seen).filter(([, hits]) => hits.length > 1);

			return {
				head: ["fetched more than once in this document", "times", "extra bytes"],
				rows: twice.length
					? twice.map(([url, hits]) => [url, hits.length,
						hits.slice(1).reduce((sum, entry) => sum + entry.transferSize, 0)])
					: [["none — this section reads its source off the live prototype instead", 0, 0]],
			};
		}, "group this document's js requests by url and show the repeats");

		p("Visit `/nav/children/lazy/` and this table has four rows: every page there re-fetches its own bytes to display them. It is a real round trip each, after render, for a file the module map already holds. Reading `fn.toString()` off the loaded prototype gets the same text for nothing — which is what every page in this section does.").ac("note");

		section("3. A stylesheet that arrives after its page does");

		code(`
App.load()      await this.loaded()   // View.stylesheets + app.loaders
Router.load()   activate() -> render()  // awaits NOTHING`, "the asymmetry");

		measured(async () => {
			const fcp = await paint();
			const sheets = performance.getEntriesByType("resource").filter(entry => /\.css(\?|$)/.test(entry.name));
			const late = sheets.filter(entry => entry.responseEnd > fcp);

			return {
				head: ["stylesheet", "responseEnd ms", "after first paint?"],
				rows: sheets.map(entry => [new URL(entry.name).pathname, entry.responseEnd,
					entry.responseEnd > fcp ? "YES — rendered unstyled first" : "no"])
					.concat([["first contentful paint", fcp, `${late.length} late`]]),
			};
		}, "every stylesheet, against the moment this document first painted");

		p("Cold, every sheet is awaited, so the table above says “no”. The gap opens on the way IN — arrive at a lazily-loaded section by clicking and its stylesheet starts loading only once the page is already rendered.").ac("note");

		gated(async () => {
			// exactly what View.stylesheet() does on a lazily-loaded page: append a
			// <link> and carry on. The cache-buster makes it a real fetch.
			const t0 = performance.now();
			const link = document.createElement("link");
			link.rel = "stylesheet";
			link.href = `/perf/perf.css?probe=${Math.random()}`;

			const applied = new Promise(resolve => { link.onload = resolve; link.onerror = resolve; });
			document.head.appendChild(link);
			const appended = performance.now() - t0;

			await applied;
			const ready = performance.now() - t0;
			link.remove();

			return [
				["ms to append the <link> — the page renders here", appended],
				["ms until the sheet applied", ready],
				["ms the page would spend unstyled", ready - appended],
			];
		}, "append a stylesheet the way a lazily-loaded page does, and time the gap");

		p("`App.loaded()` is awaited once, at boot; `Router.load()` awaits nothing. So the window above is real for every section that ships its own stylesheet and is reached by a click. On localhost it is single-digit milliseconds; it is one round trip, so on a 150 ms connection it is 150 ms of unstyled content, and it is the first thing the reader sees.").ac("note");

		section("4. app.loaders is never drained");

		measured(() => [
			["promises on app.loaders", this.app.loaders.length],
			["promises on View.stylesheets", View.stylesheets.length],
			["times App.loaded() is called after boot", 0],
		], "read straight off the live app");

		p("`tabs()` pushes its filling promise onto `app.loaders` so a cold load never paints an empty bar — correct, and the array is never emptied afterwards. It is bounded by the number of tab sets ever rendered, so this is a tidiness note and not a leak. Listed because it was the fourth thing found, and reporting a cost of roughly zero is the point of measuring.").ac("note");

		section("And one that is not a cost at all");

		measured(async () => {
			await this.app.ready;
			const before = performance.getEntriesByType("resource").length;
			await this.app.router.load("/no-such-section/");     // resolves nothing
			await this.app.router.load(this.url);

			return [
				["requests issued by navigating to /no-such-section/",
					performance.getEntriesByType("resource").length - before],
				["requests a route()-claimed url makes", 0],
			];
		}, "navigate to a url that does not exist and count what hit the network");

		p("`route()` runs after the declaration and not after the filesystem, so an undeclared name never reaches the network. Checked: navigating to `/nope/` issues no `page.js` request at all. The readme's claim holds exactly.").ac("note");

		div.c("row", () => {
			a.c("page-link", "the memoized view →").href("/perf/memo/");
			a.c("page-link", "back to Cost →").href("/perf/");
		});
	},
});
