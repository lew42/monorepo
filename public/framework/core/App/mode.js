import { View, button, icon } from "../View/View.js";

View.stylesheet(import.meta, "mode.css");

const KEY = "lew42-mode";
const NEXT = { auto: "light", light: "dark", dark: "auto" };
const ICON = { auto: "brightness_auto", light: "light_mode", dark: "dark_mode" };

// mode(app) — light / dark / auto, as one button. Design record: App/readme.md.
export default function mode(app){
	let current = read();

	// ⚠ A microtask, not now: this can run INSIDE `div.c("app", …)`'s capture
	// callback, and `app.$app` is not assigned until that callback returns.
	// Applying here is a silent no-op — a stored mode is forgotten on reload.
	queueMicrotask(() => apply(app, current));

	return button.c("mode-btn", () => icon(ICON[current]))
		.attr("title", "Colour scheme")
		.click(function(){
			current = NEXT[current];
			apply(app, current);
			try { localStorage.setItem(KEY, current); } catch {}
			this.empty(() => icon(ICON[current])).attr("aria-label", current);
		});
}

// The stored mode without a button — a route with no sidebar would otherwise
// silently ignore the reader's saved choice.
mode.apply = function(app){
	queueMicrotask(() => apply(app, read()));
};

function read(){
	try { return NEXT[localStorage.getItem(KEY)] ? localStorage.getItem(KEY) : "auto"; }
	catch { return "auto"; }
}

// ⚠ `.app`, not `<html>`: the theme's tokens live there, and two themes can render
// side by side on one page — a mode forced at the root would take both.
function apply(app, m){
	app.$app?.style("color-scheme", m === "auto" ? "" : m);
}

export { mode };
