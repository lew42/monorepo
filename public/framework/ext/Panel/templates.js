/* The T vocabulary: name → { icon, tone?, focus?, draw($body, panel) }. `draw` runs with
   the captor already on $body; a lazy import appends a promise resolving to a FUNCTION,
   which is what re-establishes the captor. `tone: true` means the entry reads
   `panel.get("tone")`, so the bar can offer the tone chips; `focus: true` means it reads
   the workspace's focused panel, and so never takes focus itself.

   css: .panel-t, .panel-t-layer, .panel-t-word, .panel-t-accent, .panel-t-wall,
        .panel-t-stat, .panel-t-n, .panel-t-l, .panel-t-clock, .panel-t-time,
        .panel-t-date, .panel-t-haze, .panel-t-aurora, .panel-t-drift,
        .panel-t-depth, .panel-t-rail, .panel-t-link, .panel-t-toc, .panel-t-head,
        .panel-t-line, .panel-t-brand, .panel-t-cell — plus .panel-t-space, .panel-t-screen,
        .panel-t-scene, .panel-t-dial and .panel-t-seed - the last two of which
        generate.js emits into this sheet - and
        .panel-props* , which properties.js emits into it. */
import { View, div, span, icon } from "/app.js";

View.stylesheet(import.meta, "templates.css");

const SECTIONS = {
	navbar: "menu",               hero: "campaign",        logos: "domain",
	features: "grid_view",        split: "vertical_split", stats: "insights",
	testimonials: "format_quote", pricing: "sell",         faq: "help",
	team: "groups",               changelog: "history",    contact: "forum",
	signup: "mail",               callout: "bolt",         footer: "call_to_action",
};

const BASE = { dark: "--ink", prim: "--prim", wash: "--wash", surface: "--surface" };

const STATS = [["3", "npm deps"], ["0", "build steps"], ["100", "percent static"], ["3440", "pixels wide"]];

// The furniture's words, and `styles/layouts/web.js`'s — the same fictional site a
// generated layout draws, so a translated panel says what the picture said.
const TOPICS = "Overview Layout Type Colour Motion Tokens".split(" ");

const tone_of = panel => panel?.get?.("tone") ?? "surface";

/* A SCENE is a drawing with nothing to measure - empty layers, or a handful of words - so
   a hugging panel would size it to nothing. `.panel-t-scene` is the class that declares
   its own floor instead (templates.css); every OTHER template measures what it holds,
   which is what `hug` means since 2026-08-19. doc/templates.md. */
const SCENE = "panel-t panel-t-scene";

const section = name => ({
	icon: SECTIONS[name],
	tone: true,
	draw($body, panel){
		const tone = tone_of(panel);
		$body.append(import("/framework/styles/sections/" + name + ".js").then(m => () => m.default(tone)));
	},
});

const scene = (name, layers) => div.c(SCENE + " panel-t-" + name, () => {
	for (let i = 0; i < layers; i++) div.c("panel-t-layer");
});

export const templates = {
	blank: { icon: "check_box_outline_blank", draw(){ div.c(SCENE + " panel-t-blank checkered"); } },

	/* The one entry whose pieces are DIRECT children of the body. Every other template here
	   draws into a single `.panel-t` wrapper — a body with one child, which a leaf's `flex`
	   or `grid` words have nothing to arrange (measured: ai/2026-08-18/panel-grid/). Twelve
	   numbered boxes is the smallest content those words can be SEEN on, and the smallest
	   change that gives them one: no shipped template loses its wrapper. */
	cells: { icon: "apps", draw(){
		// `data-cell` is the item words' own key (persist.js's `items_apply`) — stable
		// across a repaint even though nothing else here addresses a cell by name.
		for (let i = 1; i <= 12; i++) div.c("panel-t-cell", String(i)).attr("data-cell", i);
	} },

	// The inspector. `focus: true` means this entry READS the focused panel — and so is
	// never handed focus itself, which would leave it inspecting its own controls.
	properties: { icon: "tune", focus: true, draw($body, panel){
		$body.append(import("./properties.js").then(m => () => m.properties(panel)));
	} },

	word: { icon: "title", draw(){
		div.c(SCENE + " panel-t-word", () => { span("LEW"); span.c("panel-t-accent", "42"); });
	} },

	wall: { icon: "insights", draw(){
		div.c(SCENE + " panel-t-wall", () => STATS.forEach(([value, label]) =>
			div.c("panel-t-stat", () => { div.c("panel-t-n", value); div.c("panel-t-l", label); })));
	} },

	clock: { icon: "schedule", draw(){
		let live = false, $time, $date;
		const $clock = div.c(SCENE + " panel-t-clock", () => {
			$time = div.c("panel-t-time");
			$date = div.c("panel-t-date");
		});
		const paint = () => {
			if ($clock.el.isConnected) live = true; else if (live) return;
			const now = new Date();
			/* ⚠ A hidden page keeps its DOM, so this clock stays connected for the life
			   of the tab — and every unseen write made Chrome DevTools redraw its Styles
			   pane, on every page of the site, once a second (2026-08-28). Tick without
			   writing; the first visible tick is at most a second away. */
			if ($clock.el.offsetParent){
				$time.text(now.toLocaleTimeString([], { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" }));
				$date.text(now.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" }));
			}
			setTimeout(paint, 1000 - now.getMilliseconds());
		};
		paint();
	} },

	haze: { icon: "water", tone: true, draw($body, panel){
		div.c(SCENE + " panel-t-haze").style("--haze", "var(" + (BASE[tone_of(panel)] ?? "--surface") + ")");
	} },

	aurora: { icon: "gradient", draw(){ scene("aurora", 3); } },

	drift: { icon: "auto_awesome", draw(){ scene("drift", 3); } },

	depth: { icon: "layers", draw(){ scene("depth", 2); } },

	// A whole generated page, from `gen(seed)` — the panel picks its own point in
	// styles/layouts/space and keeps the seed. generate.js owns the rest.
	space: { icon: "space_dashboard", draw($body, panel){
		$body.append(import("./generate.js").then(m => () => m.generate(panel)));
	} },

	/* Three pieces of page FURNITURE, and the only three templates that exist because
	   something asked for them: `structure(seed)` translates the spec's `menu`, `toc`
	   and `brand` parts, and the fifteen bands had nothing that fits. generate.js. */

	rail: { icon: "list", draw(){
		div.c("panel-t panel-t-rail", () => TOPICS.forEach((word, i) =>
			div.c("panel-t-link", () => { icon("chevron_right"); span(word); }).ac(i === 0 && "on")));
	} },

	toc: { icon: "toc", draw(){
		div.c("panel-t panel-t-toc", () => {
			span.c("panel-t-head", "ON THIS PAGE");
			TOPICS.forEach((word, i) => span.c("panel-t-line", word).ac(i === 0 && "on"));
		});
	} },

	brand: { icon: "label", draw(){
		div.c("panel-t panel-t-brand", () => { icon("auto_awesome"); span("AURORA"); });
	} },

	...Object.fromEntries(Object.keys(SECTIONS).map(name => [name, section(name)])),
};

export default templates;
