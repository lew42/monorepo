import { Page, md, div } from "/app.js";
import { section } from "../../../ux/Content/structure/Structure.js";

/**
 * The layout hub — every layout question and every layout page on the site, in
 * one place. Show it with the widget (the icon sections below), then the words
 * (readme.md, rendered underneath — see core/Page/make/ "5. readme.md" for the
 * pattern this uses). v1 is the first version of this page, kept as reference.
 */
export default new Page({
	meta: import.meta,
	title: "Layout",
	description: "The layout hub: the five shapes, how to choose one, and every layout page on the site.",
	icon: "dashboard_customize",

	children: "floating v1",

	content(){
		section({
			title: "The five shapes", bg: true, items: [
				{ name: "Standard", icon: "view_agenda", weight: 3, href: "/framework/core/Page/doc/words/" },
				{ name: "Split", icon: "vertical_split", weight: 3, href: "/framework/core/Layout/main-aside/" },
				{ name: "Columns", icon: "view_column", weight: 3, href: "/framework/core/Page/doc/columns/" },
				{ name: "Floating page", icon: "flip_to_front", weight: 2, href: "./floating/" },
				{ name: "Top-down shape", icon: "layers", weight: 2, href: "/framework/core/Page/doc/words/" },
			],
		});

		section({
			title: "The whole layout system", bg: true, items: [
				{ name: "Layouts encyclopedia", icon: "auto_stories", weight: 3, href: "/layouts/" },
				{ name: "Browse every layout", icon: "grid_view", weight: 2, href: "/layouts/browse/" },
				{ name: "Decide (the 5 questions)", icon: "checklist", weight: 3, href: "/layouts/decide/" },
				{ name: "Practice pages", icon: "school", weight: 1, href: "/layouts/practice/" },
				{ name: "Labs", icon: "science", weight: 1, href: "/layouts/labs/" },
				{ name: "Shell", icon: "web", weight: 1, href: "/layouts/shell/" },
				{ name: "core/Layout catalogue", icon: "view_quilt", weight: 3, href: "/framework/core/Layout/" },
				{ name: "Sidebar variant", icon: "vertical_split", weight: 1, href: "/framework/styles/layouts/sidebar/" },
				{ name: "Layout explorer", icon: "account_tree", weight: 2, href: "/layouts/explorer/" },
			],
		});

		// A Page isn't a View — it draws through `this.view`, so a promise (capture:false,
		// like every md.file()/code.file()) gets appended onto a real box, never `this`.
		// See core/Page/make/'s "5. readme.md" for the same pattern.
		div().append(md.file(import.meta, "readme.md"));
	},
});
