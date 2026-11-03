import { Page, demo, md, div, a, span, icon } from "/app.js";

const guide = () => new Page({
	title: "Guide",

	children: {
		HTML: {
			label: "Structure",
			icon: "code",
			content(){
				md("The rail says **Structure**; the heading says HTML. That split is the whole of `label`.");
			},
		},
		CSS: {
			label: "Style",
			icon: "palette",
			content(){
				md("One entry per child, so a rail, a card and a crumb cannot disagree about what this page is called.");
			},
		},
		JS: {
			icon: "data_object",
			content(){
				md("No `label` here, so the entry falls back to the `title`.");
			},
		},
	},

	content(){
		md("A menu entry is `nav_for(name)` — `label ?? title ?? name`, plus the `icon`. The rail is three of them. **Click one.**");

		div.c("flex gap", () => {

			// the rail: one link per child, straight out of nav_for()
			div.c("basis flex v gap", () => this.children.forEach((page, name) => {
				const nav = this.nav_for(name);

				a.c("page-link flex gap v-center", () => {
					if (nav.icon) icon(nav.icon);
					span(nav.label);
				}).href(nav.url);
			}))
				.style({ "--basis": "8em", "--gap": "0.3em" });

			// and the region they open in — the rail never moves
			this.$pages = div.c("flex-1");
		});
	},
});

export default new Page(demo.tree({
	meta: import.meta,
	group: "Basics",
	tree: guide,
}));
