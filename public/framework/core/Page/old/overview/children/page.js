import { Page, demo, md } from "/app.js";

const web = () => new Page({
	title: "Web",

	children: {
		HTML(){
			md("**The key is the title**, and `Page.slug(key)` is the segment — so the leanest child there is, is one function at `/web/html/`.");
		},

		CSS: {
			icon: "palette",
			content(){
				md("An object value is the same child with options on it. The icon on this card was declared right there.");
			},
		},

		JS: new Page({
			content(){
				md("And a real `new Page(…)` is adopted as it stands. **Three shapes, one result — the crumbs above go back up.**");
			},
		}),
	},

	content(){
		md("Three children, three shapes, leanest first — and the cards below are them. **Click one.**");
		this.previews();
	},
});

export default new Page(demo.tree({
	meta: import.meta,
	group: "Basics",
	tree: web,
}));
