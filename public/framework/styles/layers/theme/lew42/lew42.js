import { View } from "../../../../core/View/View.js";

View.stylesheet(import.meta, "lew42.css");

/**
 * lew42 — the theme's behaviour, which is one function and no class.
 *
 *   import { lew42 } from "…/theme/lew42/lew42.js";
 *   new App({ config(){ lew42(this); } });
 *
 * ── Why a function and not a class ────────────────────────────────────────
 * This theme used to be a class extending `App`. That shape forces every theme
 * to also be a complete App variant, so N themes × M App configurations, and
 * "I want lew42's fonts with a different Router option" has no answer inside
 * inheritance except a deeper chain. Inheritance imposes an ORDER and a single
 * lineage on things that have neither.
 *
 * The decisive argument is smaller and harder: **a theme is designed to appear
 * more than once on a page.** `theme/guide/page.js` renders `.theme-paper` and
 * `.theme-terminal` side by side to prove exactly that, and this theme's own
 * page renders light and dark together. Behaviour does not survive being
 * duplicated — two boxes would run it twice. `app.font()` happens to be safe
 * only because `Font.load` memoizes by name, for an unrelated reason; a theme
 * that attached a listener or started a timer would fire twice and break its
 * own demo page.
 *
 * So: the CSS class is a value the cascade resolves, any number of times, at any
 * depth. The behaviour is a function the SITE calls once, explicitly, in the one
 * file that already decides what this site is. Nothing is triggered by the class
 * appearing — that would be the invisible coordination the house rules forbid.
 *
 * Composing two themes' behaviour is calling two functions. When that stops
 * being enough there will be a real ordering problem to design against; there
 * isn't one today, and an unused hook is permanent API surface.
 */
export function lew42(app){
	app.font("Montserrat");
	app.font("Material Icons");
}

export default lew42;
