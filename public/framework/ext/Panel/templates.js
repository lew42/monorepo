/* The T vocabulary: name → { icon, tone?, focus?, draw($body, panel) }. `draw` runs with
   the captor already on $body; a lazy import appends a promise resolving to a FUNCTION,
   which is what re-establishes the captor. `tone: true` means the entry reads
   `panel.get("tone")`, so the bar can offer the tone chips; `focus: true` means it reads
   the workspace's focused panel, and so never takes focus itself.

   css: .panel-t, .panel-t-layer, .panel-t-word, .panel-t-accent, .panel-t-wall,
        .panel-t-stat, .panel-t-n, .panel-t-l, .panel-t-clock, .panel-t-time,
        .panel-t-date, .panel-t-haze, .panel-t-aurora, .panel-t-drift,
        .panel-t-depth, .panel-t-rail, .panel-t-link, .panel-t-toc, .panel-t-head,
        .panel-t-line, .panel-t-brand — plus .panel-t-space, .panel-t-screen,
        .panel-t-dial and .panel-t-seed, which generate.js emits into this sheet, and
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

const section = name => ({
	icon: SECTIONS[name],
	tone: true,
	draw($body, panel){
		const tone = tone_of(panel);
		$body.append(import("/framework/styles/sections/" + name + ".js").then(m => () => m.default(tone)));
	},
});

const scene = (name, layers) => div.c("panel-t panel-t-" + name, () => {
	for (let i = 0; i < layers; i++) div.c("panel-t-layer");
});

export const templates = {
	blank: { icon: "check_box_outline_blank", draw(){ div.c("panel-t panel-t-blank checkered"); } },

	// The inspector. `focus: true` means this entry READS the focused panel — and so is
	// never handed focus itself, which would leave it inspecting its own controls.
	properties: { icon: "tune", focus: true, draw($body, panel){
		$body.append(import("./properties.js").then(m => () => m.properties(panel)));
	} },

	word: { icon: "title", draw(){
		div.c("panel-t panel-t-word", () => { span("lew"); span.c("panel-t-accent", "42"); });
	} },

	wall: { icon: "insights", draw(){
		div.c("panel-t panel-t-wall", () => STATS.forEach(([value, label]) =>
			div.c("panel-t-stat", () => { div.c("panel-t-n", value); div.c("panel-t-l", label); })));
	} },

	clock: { icon: "schedule", draw(){
		let live = false, $time, $date;
		const $clock = div.c("panel-t panel-t-clock", () => {
			$time = div.c("panel-t-time");
			$date = div.c("panel-t-date");
		});
		const paint = () => {
			if ($clock.el.isConnected) live = true; else if (live) return;
			const now = new Date();
			$time.text(now.toLocaleTimeString([], { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" }));
			$date.text(now.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" }));
			setTimeout(paint, 1000 - now.getMilliseconds());
		};
		paint();
	} },

	haze: { icon: "water", tone: true, draw($body, panel){
		div.c("panel-t panel-t-haze").style("--haze", "var(" + (BASE[tone_of(panel)] ?? "--surface") + ")");
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
