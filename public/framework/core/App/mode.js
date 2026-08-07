import { View, button, icon } from "../View/View.js";

View.stylesheet(import.meta, "mode.css");

const KEY = "lew42-mode";
const NEXT = { auto: "light", light: "dark", dark: "auto" };
const ICON = { auto: "brightness_auto", light: "light_mode", dark: "dark_mode" };

/**
 * mode(app) — light / dark / auto, as one button.
 *
 *   footer: () => mode(this.app)     // in a Sidebar footer (the default one does this)
 *   this.$mode = mode(this);         // or as the app's own fixed pill
 *
 * Lives beside App (like Font.js) and NOT in a theme directory: a theme is CSS,
 * and this is theme-AGNOSTIC behaviour — any theme that ships both modes wants
 * it, and core's Sidebar renders it in its footer. In styles/layers/theme/ it
 * was the one thing core imported from outside core/, across a directory that
 * had just proved it can move; the import broke the whole site for exactly as
 * long as it took to notice. lew42.js stays where it was — THAT behaviour
 * belongs to one theme.
 *
 * A theme declares `color-scheme: light dark` and every token is `light-dark(a, b)`,
 * so the browser already picks. This only overrides the pick, by setting
 * `color-scheme` inline on `.app` — which is the same property the theme set, at
 * the same element, so there is nothing new for a token to read.
 *
 * `auto` clears the override rather than storing a resolved value: the OS can
 * change while the tab is open, and a stored "light" would outlive the reason it
 * was chosen.
 */
export default function mode(app){
	let current = read();

	/* One microtask, not now: this runs INSIDE `div.c("app", …)`'s capture callback,
	 * so `app.$app` is not assigned until that callback returns. Applying here is a
	 * silent no-op — the button works, and a stored mode is forgotten on reload.
	 * The microtask lands after render() and before the browser paints. */
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

/* The stored mode without a button — for a render() that leaves the toggle to a
 * sidebar footer. Without this, a route with no sidebar would silently ignore the
 * reader's saved choice. Idempotent with the buttons: everyone writes the same
 * inline `color-scheme`. */
mode.apply = function(app){
	queueMicrotask(() => apply(app, read()));
};

function read(){
	try { return NEXT[localStorage.getItem(KEY)] ? localStorage.getItem(KEY) : "auto"; }
	catch { return "auto"; }
}

// `.app`, not `<html>`: the theme's tokens live there, and two themes can render
// side by side on one page — a mode forced at the root would take both.
function apply(app, m){
	app.$app?.style("color-scheme", m === "auto" ? "" : m);
}

export { mode };
