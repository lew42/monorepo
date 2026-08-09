import { View } from "../../../../core/View/View.js";

View.stylesheet(import.meta, "lew42.css");

/**
 * lew42 — the theme's behaviour: one function, and deliberately not a class.
 *
 *   new App({ config(){ lew42(this); } });
 *
 * ⚠ Nothing here may be triggered by `.theme-lew42` appearing. A theme is designed to
 * render more than once on a page, and behaviour does not survive duplication.
 * readme.md, and framework/doc/theme-behaviour.md.
 */
export function lew42(app){
	app.font("Montserrat");
	app.font("Material Icons");
}

export default lew42;
