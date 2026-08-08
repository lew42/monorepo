import { Page, h2, demo } from "/app.js";
import { toggle_demo, toggle_labeled_demo } from "../../parts.js";

export default new Page({
	meta: import.meta,
	title: "Toggle / Switch",
	description: "No framework equivalent yet, a track and a thumb, both inline styles, state flipped by a click handler.",

	content(){
		demo(toggle_demo, "No stylesheet: the track and thumb are inline style objects, and the state is a class the click handler flips, the same move tooltip.js uses for \"shown\".").ac("mb");

		h2("With a label").ac("mb");
		demo(toggle_labeled_demo, "The same track builder, factored out so this and the bare version share one definition instead of two copies that could drift.");
	}
});