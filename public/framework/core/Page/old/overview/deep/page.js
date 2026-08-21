import { Page, demo, md } from "/app.js";

const handbook = () => {
	const site = new Page({
		title: "Handbook",

		children: {
			HTML: {
				icon: "code",
				content(){
					md("An index is a page whose content **is** its children.");
					this.previews();
				},
			},
			CSS: {
				icon: "palette",
				children: {
					Selectors(){
						md("Which elements a rule reaches.");
					},
					Layout(){
						md("Three deep — the crumbs above walk back up.");
					},
				},
				content(){
					md("Cards down, crumbs up, rail across — one tree.");
					this.previews();
				},
			},
			JS: {
				icon: "data_object",
				content(){
					md("The rail never moved; only this region did.");
				},
			},
		},

		content(){
			this.previews();
		},
	});

	// open two levels in — the same tree, arrived at from the middle
	return site.children.get("css");
};

export default new Page(demo.tree({
	meta: import.meta,
	group: "Arrangements",
	tree: handbook,
	rail: true,
}));
