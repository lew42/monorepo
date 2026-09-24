import { Doc, md, demo, div } from "/app.js";
import Question from "./Question.js";
import { question } from "../fixtures.js";

const live = () => new Question(question());

export default new Doc({
	meta: import.meta,
	title: "Question",
	description: "A question card: an ask, a text field, and the latest answer beneath.",
	icon: "help",

	files: "Question.js page.js readme.md",
	notes: "shape",

	content(){

		demo.exhibit({
			page: this,
			stage: steer => demo.stage(live, steer),
			def: live,
			file: new URL("page.js", import.meta.url).pathname,
			note: "**Type an answer and press the button.** One `answer` line is appended to `demo.jsonl`; the answer shows beneath and Edit puts it back in the field.",
		});

		md.details(import.meta, "readme.md", "Readme");
	},

	preview(nav){ return this.preview_card(nav, () => div.c("zoom-50 pad", live)); },
});
