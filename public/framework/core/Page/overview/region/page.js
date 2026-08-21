import { Page, demo, md, div, span } from "/app.js";

const live = (el, fn) => new ResizeObserver(fn).observe(el);

/* Read, never asserted. Whatever the cascade currently does is what prints — so the day
   a region's `--measure` starts reaching its page, this card says so on its own. */
const read = el => {
	const style = getComputedStyle(el);

	return {
		measure: style.getPropertyValue("--measure").trim() || "unset",
		pad: style.getPropertyValue("--page-pad").trim() || "unset",
		main: (style.gridTemplateColumns.match(/[\d.]+px/g) ?? []).map(n => Math.round(parseFloat(n)))[1],
		width: Math.round(el.offsetWidth),
	};
};

// A lit `main` band and nothing else, so the track the readout names is also the thing
// you can see. `title: ""` is not laziness — an `h1` is a main-track block too, and it
// would be most of a box this size; the url is what a demo app's root actually needs.
const body = function(){ div.c("surface pad", () => md("main")).style("--pad", "0.4em"); };

const sample = () => new Page({ url: "/box/", title: "", content: body });

const tabbed = () => new Page({
	title: "Doc",
	children: { box: { title: "", content: body } },
	// `bleed`, or the panel would sit inside THIS page's 40em main track and the
	// inner page would be capped by its host's width instead of by its own token.
	content(){ this.tabs("box").ac("bleed"); },
});

/* `build()` returns the REGION element; the page inside is found by selector, because two
   of the three fill themselves a microtask later. */
const cell = (name, source, build) => div.c("flex v gap").style("--gap", "0.35em").append(() => {
	span.c("h4", name + " — " + source);

	const region = build();
	const $out = div.c("muted");

	const report = () => {
		const page = region.querySelector(".page"), r = read(region);

		$out.empty(() => {
			md("**region** " + r.width + "px, declares `--measure: " + r.measure + "` · `--page-pad: " + r.pad + "`");
			if (!page) return md("_waiting for the page_");

			const got = read(page);
			md("**page got** `--measure: " + got.measure + "` · `--page-pad: " + got.pad + "` · main track **" + got.main + "px**");
		});
	};

	live(region, report);
	requestAnimationFrame(report);
});

const board = thumb => div.c("flex v gap-2em").append(() => {
	cell(".pages", "Page.css:17 — the app's region",
		() => div.c(thumb ? "surface" : "pages surface", () => sample().render().ac(thumb ? "default" : "active-page")).style("height", "7em").el);

	cell(".tab-panel", "tabs.css:68 — a real tabs() inside a demo app",
		() => demo.app(tabbed()).style("height", "11em").el.querySelector(".tab-panel"));

	cell(".demo-app-pages", "app.css:55 — the mini app's region",
		() => demo.app(sample()).style("height", "8em").$pages.el);
});

export default new Page({
	meta: import.meta,
	title: "Region",
	group: "The box",
	description: "What a region actually hands the page inside it — measured, not claimed.",

	preview(nav){ return this.preview_card(nav, () => div.c("zoom-25", () => board(true))); },

	content(){
		md("A region can only talk to a page through inherited custom properties. **`--page-pad` arrives; `--measure` does not** — `.page` re-declares `--measure` for itself, and a declared value beats an inherited one, so `--measure: none` on a region is decoration.");

		md("Read the two lines under each box. Two regions ask for `--measure: none` and **every page still reports `40em`** — while `--page-pad`, written in the same rule on the same element, arrives every time. Press **mega**: the regions keep growing and all three main tracks stop at one number.");

		demo.stage(() => board()).ac("bleed");
		demo.source(board, "Source");
	},
});
