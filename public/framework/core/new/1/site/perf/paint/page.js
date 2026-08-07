import { Page, p, a, div } from "/app.js";
import { App } from "/framework/core/new/1/App.js";
import { source } from "/framework/util/source/source.js";
import { code, section } from "/ui.js";
import { measured, boot_timing, critical_path } from "/perf/ui.js";

export default new Page({
	meta: import.meta,
	title: "First paint",

	content(){
		code(source(App.prototype.instantiate), "App.instantiate() — read off the live prototype");
		code(source(App.prototype.inject), "App.inject()");

		p("`inject()` is the fifth step, and it is the first moment anything is in `<body>`. Everything before it is a blank white document — so first-contentful-paint is not a proxy for the blank screen, it is a direct reading of it.").ac("note");

		section("How long this document stayed blank");

		measured(boot_timing, "navigation timing + the paint entry, read at render time");

		section("What inject() was waiting for");

		measured(critical_path, "every resource that finished before first paint, latest first");

		p("The top row is the whole of the delay. On a cold load it is the last `page.js` in the walk; on a page with a stylesheet of its own it is often the stylesheet, because `App.loaded()` awaits `View.stylesheets` too.").ac("note");

		section("The trade");

		code(`
now       config → render → await load() → initialize → inject
          nothing paints until every loader resolves

other     config → render → inject → await load() → fill
          chrome paints immediately, content arrives after`, "two orders, one decision");

		p("Painting the chrome first would put pixels on screen roughly one round trip sooner, and would hand every reader a visible reflow plus an empty sidebar on a cold load. The report weighs it with the numbers; the short version is that this framework should keep what it has, and the reason is the tab bar.").ac("note");

		section("Where the loaders come from");

		code(`
View.stylesheet(meta, url)   every component sheet
app.loaders.push(filling)    tabs(), so a cold load never paints an empty bar`, "what App.loaded() awaits");

		measured(async () => {
			await this.app.ready;
			const sheets = performance.getEntriesByType("resource").filter(entry => /\.css(\?|$)/.test(entry.name));
			return {
				head: ["stylesheet", "responseEnd ms", "kB"],
				rows: sheets.map(entry => [new URL(entry.name).pathname, entry.responseEnd, entry.transferSize / 1024])
					.concat([["loaders registered on app", this.app.loaders.length, ""]]),
			};
		}, "every stylesheet inject() waited for");

		div.c("row", () => {
			a.c("page-link", "prefetch on hover →").href("/perf/prefetch/");
			a.c("page-link", "the serial walk →").href("/perf/walk/");
		});
	},
});
