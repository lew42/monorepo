import { Page, p, a, div } from "/app.js";
import { code, section } from "/ui.js";
import { measured, boot_timing } from "/perf/ui.js";   // also loads perf.css

export default new Page({
	meta: import.meta,
	title: "Performance",

	// LAZY, like every other section — a perf section that imported eight pages
	// to show you a menu would be its own counter-example.
	children: "walk lazy memo mark paint prefetch css hidden",

	content(){
		// Code first, and the code is the measurement. Every number on this page
		// was read out of this browser, on this load, by the function above it.
		measured(boot_timing, "how this very document loaded — read at render time");

		p("Every number in this section is measured in your browser as the page renders. Nothing is typed in by hand, so nothing can go stale.").ac("note");

		section("The rule this section follows");

		code(`
measured(fn)   runs on load     — microseconds, safe on every page view
gated(fn)      runs on click    — seconds, or it mutates the DOM`, "perf/ui.js — the whole API");

		p("Both render the real source of `fn` above the numbers `fn` returned, via `util/source` — the same stringifier `demo()` and `code.fn()` share. A benchmark whose method is invisible is not evidence.").ac("note");

		section("Eight investigations");

		this.previews();

		section("What is already fast enough");

		p("Several of the eight end in “no change needed”. That is the most useful result a measurement can have, because it ends an argument permanently — see `/perf/mark/` and `/perf/css/`.").ac("note");
	},
});
