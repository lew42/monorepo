import { Page } from "/app.js";
import { design, derive } from "../../../Design.js";
import { wallOfThree } from "../page.js";

/* The wall of three, with a rail ADDED beside it inside the same band. */
export const withRail = derive(wallOfThree, {
	aside: {
		title: "Also here",
		links: [
			["The layout encyclopedia", "/layouts/"],
			["Three layouts built big", "/layouts/practice/"],
			["Forty-seven real sites", "/websites/"],
			["The seven principles", "/web/"],
			["The AI board", "/framework/ai/"],
		],
	},
});

export default new Page(design(withRail, {
	meta: import.meta,
	title: "With a rail",
	description: "A rail of links added beside the wall, inside the same band, so adding a rail does not also add a band.",
	changed: "ADDED a rail beside the wall. It goes INSIDE the wall's band rather than beside it as a fifth band — adding a rail should add a rail, not a band. The rail is links rather than cards, because a card in a narrow track is a card that clips, and it drops under the wall when the viewport can no longer hold both.",
}));
