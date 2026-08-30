import { Page, demo, div, h4, md } from "/app.js";

/* Container: examples/looks child, `wide` for two boxes side by side (Q2: 2+
   columns never live in the 40em `main` track). Size: each box is one
   `width:"large"` column holding a 6-up swatch grid. Own layout: `wall wide`.
   Regions: one. Preview: default card. */

function grid(title, flush){
	return new Page({
		title,
		width: "large",
		initialize(){ this.columns(); },
		content(){
			div.c(flush ? "bleed grid auto" : "grid auto gap pad", () => {
				for (let i = 0; i < 4; i++) div.c("looks-swatch");
			}).style("--column", "5em");
		},
	});
}

function box(label, page){
	div.c("flex v gap", () => {
		h4(label);
		demo.app(page).style("height", "19em");
	});
}

export default new Page({
	meta: import.meta,
	title: "Padding",
	description: "A padded grid vs a flush one (0 gap, 0 padding) inside a column.",
	icon: "grid_view",

	content(){
		md("The owner's rule: **grids always have padding, unless they opt into flush** (`bleed grid auto` — no `gap`/`pad` utility, and `bleed` to spend the column's own inset). Neither is a new class; both are words `framework.css` and `Page.css` already have.");

		div.c("wall wide", () => {
			box("Padded — `grid auto gap pad`", grid("Padded", false));
			box("Flush — `grid auto` (0 gap, 0 padding)", grid("Flush", true));
		}).style("--column", "26em");

		md("**Verdict:** flush reads right only when the grid IS the column's whole content — the swatches sit flush against the column's own border, so anything with prose beside it needs the padded default or the two collide.");
	},
});
