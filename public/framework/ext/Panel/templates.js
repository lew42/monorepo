/* The T vocabulary: name → { icon, tone?, draw($body, panel) }. `draw` runs with the
   captor already on $body; a lazy import appends a promise resolving to a FUNCTION,
   which is what re-establishes the captor. `tone: true` means the entry reads
   `panel.get("tone")`, so the bar can offer the tone chips.

   css: .panel-t, .panel-t-layer, .panel-t-word, .panel-t-accent, .panel-t-wall,
        .panel-t-stat, .panel-t-n, .panel-t-l, .panel-t-clock, .panel-t-time,
        .panel-t-date, .panel-t-haze, .panel-t-aurora, .panel-t-drift,
        .panel-t-depth */
import { View, div, span } from "/app.js";

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

	depth: { icon: "deployed_code", draw(){ scene("depth", 2); } },

	...Object.fromEntries(Object.keys(SECTIONS).map(name => [name, section(name)])),
};

export default templates;
