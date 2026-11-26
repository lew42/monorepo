import { Doc, md, div, h3, pre } from "/app.js";
import Form from "./Form.js";
import Answers from "./Answers.js";
import AnswerCard from "./AnswerCard.js";
import ScaleLab from "./ScaleLab.js";

const short = () => Form.from({
	title: "Check-in",
	questions: [
		{ id: "intro", type: "T09", label: "How was the intro?", required: true },
		{ id: "again", type: "yesno", label: "Would you watch the next one?" },
		{ id: "topics", type: "chips", label: "What should we cover?", options: [["css", "CSS"], ["js", "JavaScript"], ["design", "Design"]] },
		{ id: "note", type: "longtext", label: "Anything else?" },
	],
});

const filled = () => div.c("fm-demo-split wide", () => {
	const form = short();
	div.c("fm-json-box", () => {
		h3("form.values()");
		const json = pre.c("fm-json", "");
		const show = () => json.text(JSON.stringify(form.values(), null, 1));
		form.on("change", show);
		show();
	});
});

export default new Doc({
	meta: import.meta,
	title: "Form",
	description: "A form from a list: twenty answer types, each a native control that stores one plain value, collected by id.",
	icon: "fact_check",

	files: "Answer.js Answers.js Question.js Form.js Form.css answers/ page.js readme.md",

	content(){

		md("## The −3 … +3 scale, in four looks");
		md("One question, one stored value. **Change the markers or the input and the answer you gave stays.** `null` means not answered, `0` is a real answer (the middle), and `\"skip\"` is a third thing: you looked and chose not to.");
		new ScaleLab();

		md("## A short form you can fill");
		md("`Form.from(json)` builds the questions; `form.values()` is the plain object below, and `form.on(\"change\", …)` fires on every answer. Submit refuses until the starred question has an answer.");
		filled();

		md("## All twenty answer types");
		md("Each card is a live question. Answer it and the value it stores appears under it, exactly as `answer.value` would give it to your code.");
		div.c("fm-cards wide", () => Answers.list.forEach(answer => new AnswerCard({ answer })));

		md.details(import.meta, "readme.md", "Readme");
	},

	preview(nav){ return this.preview_card(nav, () => div.c("zoom-50 pad", () => new Form({ questions: [{ id: "intro", type: "T09", label: "How was the intro?" }] }))); },
});
