import { Page, demo, md, div } from "/app.js";

import hero from "/framework/styles/sections/hero.js";
import logos from "/framework/styles/sections/logos.js";
import features from "/framework/styles/sections/features.js";
import pricing from "/framework/styles/sections/pricing.js";
import faq from "/framework/styles/sections/faq.js";
import callout from "/framework/styles/sections/callout.js";
import team from "/framework/styles/sections/team.js";
import contact from "/framework/styles/sections/contact.js";
import footer from "/framework/styles/sections/footer.js";

const acme = () => new Page({
	title: "Acme",
	icon: "language",

	children: {
		Docs: {
			icon: "menu_book",
			children: {
				Install: {
					icon: "download",
					content(){
						md("**This whole site is one tree.** The home is a stack of bands, this page is prose, and both are the same class doing its own `render()`.");
					},
				},
				Pages: {
					icon: "description",
					content(){
						md("The rail across the top level never moved; only this region did. The crumbs walk back up.");
					},
				},
				Deploy: {
					icon: "cloud_upload",
					content(){
						md("Three levels — `/acme/docs/deploy/` — and nothing declared a url.");
					},
				},
			},
			content(){
				md("A section page's content **is** its children.");
				this.previews();
			},
		},
		Pricing: {
			icon: "sell",
			content(){
				div.c("bleed", () => {
					pricing("surface");
					faq("wash");
				});
			},
		},
		About: {
			icon: "groups",
			content(){
				div.c("bleed", () => {
					team("wash");
					contact("surface");
				});
			},
		},
	},

	// the home page: bands, imported from styles/sections — `tone => view` functions
	content(){
		div.c("bleed", () => {
			hero("dark");
			logos("wash");
			features("surface");
			callout("prim");
			footer("dark");
		});
	},
});

export default new Page(demo.tree({
	meta: import.meta,
	group: "Sites",
	tree: acme,
	rail: true,
	min: "30em",
}));
