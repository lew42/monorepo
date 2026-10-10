// proto/browser-target.mjs — a real View subclass standing in for a leaf of
// window.app's tree, so proto/browser.html can prove `describe` reads JSDoc
// straight from a module the BROWSER fetches as plain source text — no build
// step, no toString() (which cannot see a comment above a function).
import { View } from "/framework/core/View/View.js";

export default class Widget extends View {
	/**
	 * The text currently shown.
	 * @public
	 * @returns {string}
	 */
	label(){ return this.el.textContent; }

	/**
	 * Replace the text shown.
	 * @public
	 * @param {string} text
	 */
	set_label(text){ this.el.textContent = text; return this; }

	// No @public tag — View's own plumbing, never a call target.
	initialize(){ this.el.textContent = "widget"; }
}
