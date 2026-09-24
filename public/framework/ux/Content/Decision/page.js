import { Doc, md, demo, div } from "/app.js";
import Decision from "./Decision.js";
import { decision_fresh, decision_legacy, decision_legacy_title } from "../fixtures.js";

const live = () => new Decision(decision_fresh());

export default new Doc({
	meta: import.meta,
	title: "Decision",
	description: "A decision card: every option with its caveat, one chosen, changeable.",
	icon: "rule",

	files: "Decision.js page.js readme.md",
	notes: "shape",

	content(){

		demo.exhibit({
			page: this,
			stage: steer => demo.stage(live, steer),
			def: live,
			file: new URL("page.js", import.meta.url).pathname,
			note: "**Click an option.** A `chose` line lands in `demo.jsonl`, the card marks it chosen, and the others stay clickable.",
		});

		md("## Old decisions render the same way");
		md("The two decision shapes already in `task.jsonl` files become this same card — the options are `chose` plus `over` (or `alternative`), and `chose` is pre-selected.");
		div.c("flex v gap", () => {
			new Decision(decision_legacy());
			new Decision(decision_legacy_title());
		});

		md.details(import.meta, "readme.md", "Readme");
	},

	preview(nav){ return this.preview_card(nav, () => div.c("zoom-50 pad", live)); },
});
