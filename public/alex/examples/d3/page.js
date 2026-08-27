import { Page, md, code, h2, demo, toc } from "/app.js";
import { Chart, series } from "./Chart.js";
import { preload } from "./d3.js";

// module scope: the bytes are in flight a navigation before anything needs them
preload();

export default new Page({
	meta: import.meta,
	title: "D3",
	description: "A third-party library that owns its own DOM: loaded late, sized by an observer, stopped when nobody is looking.",
	icon: "insights",

	children: "live",
	nav: { live: { label: "Live", icon: "timeline" } },

	content(){

		toc();

		demo(() => {
			new Chart({ data: series() });
		}, "Real d3 — `d3-scale` and `d3-shape`, fetched from a CDN the first time this box has a width.");

		md("A no-build framework and an imperative charting library want the same thing: **one element each, and a clear line about who owns what below it.** Everything on this page is about *when*, not about d3.");

		h2("Load late, and only what you need");

		code.js(`const modules = {
    scale: "https://esm.sh/d3-scale@4.0.2/es2022/d3-scale.bundle.mjs",
    shape: "https://esm.sh/d3-shape@3.2.0/es2022/d3-shape.bundle.mjs",
};

export async function d3(){
    const [scale, shape] = await Promise.all([import(modules.scale), import(modules.shape)]);
    return { ...scale, ...shape };
}`);

		md(`| | gzipped |
|---|---|
| \`d3\` | 95 KB |
| \`d3-scale\` + \`d3-shape\` | **25 KB** |
| \`d3-selection\` (not used here) | 4 KB |

Three details in that url are load-bearing. It names **submodules**, because a line chart needs a scale and a shape and nothing else. It pins an **exact version** — a range hands the CDN the right to change your app under you. And it is the **already-resolved path**: \`esm.sh/d3-shape@3.2.0\` answers with a 90-byte module that re-exports the real one, so the short url costs a full extra round trip before a byte of d3 arrives.`);

		md("There is no cache in that function and there must not be one. **`import()` is keyed by url and the module registry already holds the result** — that registry is what a native-ESM site has instead of a bundler's shared runtime, and it dedupes across pages, modules and teams that have never heard of each other.");

		code.js(`preload();   // at module scope in page.js`);

		md("`preload()` writes a `<link rel=\"modulepreload\">`. The Router imports this `page.js` while it is still walking the url, so the download starts a navigation early and the chart usually draws with no wait at all.");

		h2("Never build after the await");

		code.js(`// WRONG — the svg is built after the await, so it lands wherever
// the captor has drifted to. Nothing throws.
async draw(){
    const lib = await d3();
    svg("svg", () => svg("path"));
}

// RIGHT — the box is placed now, filled inside a callback
async draw(){
    const lib = await d3();
    this.$plot.empty(() => this.plot(lib));
}`);

		md("The framework's oldest trap meets the one thing every third-party library needs: an `import()`. **`empty(fn)` and `append(fn)` re-establish the captor**, so the code inside reads exactly like ordinary page code.");

		h2("The width is delivered, not measured");

		code.js(`watch(){
    this.observer = new ResizeObserver(([{ contentRect }]) => this.resized(contentRect.width));
    this.observer.observe(this.$plot.el);
}`);

		md("**A page can never measure itself.** An inactive page is `display: none`, and `Router.mark()` writes `.active-page` *after* `activate()` has already run — so `getBoundingClientRect()` is 0×0 inside `content()` and inside `activated()` alike. A chart sized that way is a chart of width zero, or a scale full of `NaN`, and no error is ever logged.");

		md("A `ResizeObserver` sidesteps the whole question: it fires once with the initial box, and again whenever that box changes. You never ask.");

		h2("The observer is the lifecycle");

		md("Measured in Chrome — hiding an element, or any ancestor of it, reports a real resize:");

		code.js(`observe(box)                 →  RO w=400 h=200
box.style.display = "none"   →  RO w=0   h=0
box.style.display = ""       →  RO w=400 h=200
wrapper hidden               →  RO w=0   h=0
wrapper shown                →  RO w=400 h=200`);

		md("So **\"nobody is looking\" and \"the box got wider\" arrive on the same channel**, and a chart needs no page hooks at all — it works the same inside a tab panel, a `<details>`, or a page three navigations away.");

		code.js(`resized(width){
    if (!width || width === this.width) return;   // 0 means nobody is looking
    this.width = width;
    this.draw();
}`);

		md("[Live](/alex/examples/d3/live/) is the same chart with a timer in it, and the proof that the timer stops.");

		h2("Let the library own the box");

		code.js(`render(){
    this.$plot = div.c("chart-plot");   // View owns this element
    this.$note = p.c("chart-note", "loading d3…");
    this.watch();
}`);

		md("`$plot` is the boundary. Above it the framework is in charge; below it d3 is, and neither one has to know the other exists. `d3.select($plot.el)` would work here exactly as it does in any tutorial — this chart uses d3 as a **calculator** instead (`scale` maps numbers, `shape` returns a path string) and renders the result itself, which is why it can skip `d3-selection` entirely.");

		code.js(`export function svg(tag, ...args){
    return new View({ el: document.createElementNS("http://www.w3.org/2000/svg", tag) }).append(...args);
}`);

		md("One catch if you render SVG yourself: **View builds elements with `document.createElement`, which is HTML-only** — an `<svg>` made that way is an unknown element that never paints. Handing View an element it did not create is the whole fix, and `.ac()`, `.attr()`, capturing and the callback form all keep working, because none of them care who made the element.");

		h2("When the CDN is down");

		code.js(`try { lib = await (this.loading ??= d3()); }
catch (error){ return this.failed(error); }`);

		md("A CDN is a thing that can be down, and a chart that cannot load must not take the page with it. This is the same bargain `View.stylesheet()` strikes: warn, degrade, keep rendering. `failed()` also clears `loading` — **a rejected promise kept around is a chart that can never come back**, and the next resize is a free retry.");

		h2("Two traps in View, on the way past");

		code.js(`export class Chart extends View {
    data = [];    // ✗ initialized AFTER render() has already run
}

Chart.prototype.data = [];   // ✓ a default, the way the rest of the framework does it`);

		md("View's constructor calls `render()`, and a subclass's **class fields initialize after `super()` returns** — so a field blanks whatever `render()` stored, silently. Same family as `classify()` running before class fields, and just as quiet.");

		code.js(`view.on("click", handler);
view.off("click", handler);   // ✗ removes nothing

el.addEventListener("click", handler, { signal });   // ✓ abort() removes it`);

		md("`.on()` registers a **wrapper** so your callback gets the View as `this` — and `.off()` never sees that wrapper. For anything a third-party library sets up and tears down, use an `AbortController` and the native listener, and abort it where you would have called `.off()`.");

		md("Back to [Examples](/alex/examples/), or on to [Live](/alex/examples/d3/live/).");
	},
});
