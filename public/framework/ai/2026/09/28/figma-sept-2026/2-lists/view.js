import { View, div, h4, ul, ol, li } from "/app.js";
import { compare } from "../compare.js";

View.stylesheet(import.meta, "view.css");

// The "Lists" section: an unordered "Features" list and an ordered "Steps"
// list, side by side inside the one rounded darken panel every section
// sits in — a fixed `1fr 1fr` grid, so the two columns stay two-up down to
// a narrow card (see the note in view.css for why not `auto-fit`).
export default class Default extends View {

	render(){
		div.c("figma-lists", () => {
			div.c("figma-lists-panel darken-1", () => {
				div.c("figma-lists-list-cols", () => {
					div(() => {
						h4.c("muted", "Features");
						ul.c("figma-lists-list", () => {
							["Adaptive color schemes", "Nested lighten / darken", "Variable-bound tokens", "One-click theme switching"]
								.forEach(text => li(text));
						});
					});
					div(() => {
						h4.c("muted", "Steps");
						ol.c("figma-lists-list", () => {
							["Pick a base color", "Set up scheme modes", "Bind variables to layers", "Switch and verify"]
								.forEach(text => li(text));
						});
					});
				});
			});
		});

		compare(new URL("figma.png", import.meta.url).href, "Figma: Lists section");
	}
}
