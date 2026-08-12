import { Page, demo, md, div } from "/app.js";

import hero from "/framework/styles/sections/hero.js";
import features from "/framework/styles/sections/features.js";
import pricing from "/framework/styles/sections/pricing.js";
import footer from "/framework/styles/sections/footer.js";

const nimbus = () => new Page({
	title: "Nimbus",

	content(){
		md("A marketing page is a **stack of bands**. Each one is a `tone => view` function imported from [sections](/framework/styles/sections/) — this page owns only the order, the tones, and the `bleed` track they sit in.");

		div.c("bleed", () => {
			hero("dark");
			features("surface");
			pricing("wash");
			footer("dark");
		});
	},
});

export default new Page(demo.tree({
	meta: import.meta,
	group: "Sites",
	tree: nimbus,
	height: "28em",
}));
