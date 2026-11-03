import { Page, md, code, div, span } from "/app.js";
import { Settings } from "./Settings.js";

// The demo keeps its saved overrides in this browser, so a reload shows what you left.
const local = { get: key => JSON.parse(localStorage.getItem(key) ?? "null") ?? undefined, set: (key, value) => localStorage.setItem(key, JSON.stringify(value)) };

const settings = new Settings({
	level: "this session (demo)",
	fields: [
		{ key: "notify", label: "Notify me", type: "toggle" },
		{ key: "volume", label: "Volume", type: "slider", min: 0, max: 10, step: 1, low: "quiet", high: "loud" },
		{ key: "retries", label: "Retries", type: "number", min: 0, max: 10, step: 1 },
		{ key: "theme", label: "Theme", type: "select", options: [
			{ value: "auto", label: "Auto", help: "follows the system" },
			{ value: "light", label: "Light", help: "always light" },
			{ value: "dark", label: "Dark", help: "always dark" },
		] },
	],
	defaults: { notify: true, volume: 5, retries: 3, theme: "auto" },
	values: local.get("demo-settings") ?? {},
	save: { debounce_ms: 400 },
	persist: own => local.set("demo-settings", own),
	groups: {
		dictate: { fields: [{ key: "lang", label: "Language", type: "select", options: ["en", "fr", "es"] }], defaults: { lang: "en" } },
		recite: { fields: [{ key: "speed", label: "Speed", type: "slider", min: 0.5, max: 2, step: 0.1, low: "slow", high: "fast" }], defaults: { speed: 1 } },
	},
});

export default new Page({
	meta: import.meta,
	title: "Settings",
	description: "A plain settings store between data and UI: defaults, one instance's own overrides, a change event, a save policy, and a row-per-field view.",
	icon: "tune",

	content(){
		md("**Settings** holds a level's `defaults` and one instance's own overrides (`own`). `get(key)` falls back to the default; `set(key, value)` stores or clears an override and schedules `persist`. `render()` draws one row per field.");

		code.js(`const s = new Settings({
  fields: [{ key: "volume", label: "Volume", type: "slider",
    min: 0, max: 10, low: "quiet", high: "loud" }],
  defaults: { volume: 5 },
  persist: own => fetch("/save",
    { method: "POST", body: JSON.stringify(own) }),
});
s.set("volume", 8);   // own override, "change" fires, persist is scheduled`);

		md("## Try it");
		md("Change a field below. What you change is saved in this browser. The JSON beside it is `settings.own` — what a session would actually save.");

		let json;
		const refresh = () => { json.el.textContent = JSON.stringify(settings.own, null, 2); };

		div.c("flex wrap gap", () => {
			div.c("surface pad", () => settings.render()).style("flex", "1 1 20em");
			div.c("flex v gap", () => {
				span.c("muted", "settings.own, live");
				json = div.c("surface pad").style("whiteSpace", "pre").style("fontFamily", "monospace");
			}).style("flex", "1 1 16em");
		});
		settings.on("change", refresh);
		refresh();

		md("## Two groups");
		md("`s.dictate` and `s.recite` are each their own `Settings`; a group only shows in `own` while it has an override of its own.");
		div.c("flex wrap gap", () => {
			div.c("surface pad", () => { span.c("muted", "dictate"); settings.dictate.render(); }).style("flex", "1 1 16em");
			div.c("surface pad", () => { span.c("muted", "recite"); settings.recite.render(); }).style("flex", "1 1 16em");
		});
		settings.dictate.on("change", refresh);
		settings.recite.on("change", refresh);

		md.details(import.meta, "readme.md", "Readme");
	},

	preview(nav){ return this.preview_card(nav, () => div.c("zoom-50 pad", () => span.c("h4", "Settings"))); },
});
