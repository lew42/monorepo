import { Page, demo, md, div } from "/app.js";

const admin = () => new Page({
	title: "Admin",

	// ⚠ A preview override builds fresh DOM per call: a cached render would be
	// stolen from the card the moment the page itself was shown.
	children: {
		html: {
			card: "two",
			preview(nav){
				return this.preview_card(nav, () => div.c("wash pad h3", "1.2k elements"));
			},
			content(){
				md("`card: \"wide\"` — two columns of the wall.");
			},
		},
		css: {
			card: "tall",
			preview(nav){
				return this.preview_card(nav, () => div.c("flex v gap wash pad", () =>
					[1, 2, 3, 4, 5].forEach(() => div.c("surface").style("height", "0.9em")))
					.style({ "--gap": "0.35em", "--pad": "0.6em" }));
			},
			content(){
				md("`card: \"tall\"` — twice the thumb ceiling, for a render that only reads whole.");
			},
		},
		js(){
			md("No `card:` — one cell, at the wall's own size.");
		},
		http(){
			md("A size is a claim, not a width — the wall still counts its columns.");
		},
		svg(){
			md("Five children, three sizes, one `previews()`.");
		},
	},

	content(){
		this.previews().style({ "--column": "7.5em", "--gap": "0.5em", "--thumb-max": "4.5em" });
	},
});

export default new Page(demo.tree({
	meta: import.meta,
	group: "Arrangements",
	tree: admin,
}));
