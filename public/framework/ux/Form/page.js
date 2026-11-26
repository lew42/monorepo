import { Doc, md, div } from "/app.js";
import Form from "./Form.js";
import Answers from "./Answers.js";
import AnswerCard from "./AnswerCard.js";
import ScaleLab from "./ScaleLab.js";
import JsonPanel from "./JsonPanel.js";

const short = () => Form.from({
	title: "Check-in",
	questions: [
		{ id: "intro", type: "T09", label: "How was the intro?", required: true },
		{ id: "again", type: "yesno", label: "Would you watch the next one?" },
		{ id: "topics", type: "chips", label: "What should we cover?", options: [["css", "CSS"], ["js", "JavaScript"], ["design", "Design"]] },
		{ id: "note", type: "longtext", label: "Anything else?" },
	],
});

const split = make => div.c("fm-demo-split wide", () => new JsonPanel({ form: make() }));

const steps = () => Form.from({
	title: "Three quick questions",
	questions: [
		{ id: "intro", type: "T09", label: "How was the intro?", required: true },
		{ id: "again", type: "yesno", label: "Would you watch the next one?" },
		{ id: "note", type: "longtext", label: "Anything else?" },
	],
}, { layout: "stepper" });

const quiz = () => Form.from({
	title: "Quick quiz",
	questions: [
		{ id: "sky", type: "chooseone", label: "What colour is a clear daytime sky?", options: [["red", "Red"], ["blue", "Blue"], ["green", "Green"]], correct: "blue" },
		{ id: "true", type: "yesno", label: "A spider has eight legs.", correct: true },
		{ id: "primes", type: "choosemany", label: "Which of these are prime?", options: [["2", "2"], ["4", "4"], ["7", "7"], ["9", "9"]], correct: ["2", "7"] },
		{ id: "ten", type: "number", label: "What is 6 + 4?", correct: 10 },
	],
}, { layout: "quiz" });

export default new Doc({
	meta: import.meta,
	title: "Form",
	description: "A form from a list: twenty answer types, each a native control that stores one plain value, collected by id.",
	icon: "fact_check",

	files: "Answer.js Answers.js Question.js Form.js JsonPanel.js Form.css answers/ page.js readme.md",

	content(){

		md("## The −3 … +3 scale, in four looks");
		md("One question, one stored value. **Change the markers or the input and the answer you gave stays.** `null` means not answered, `0` is a real answer (the middle), and `\"skip\"` is a third thing: you looked and chose not to.");
		new ScaleLab();

		md("## A short form you can fill");
		md("`Form.from(json)` builds the questions; `form.values()` is the plain object below, and `form.on(\"change\", …)` fires on every answer. Submit refuses until the starred question has an answer.");
		split(short);

		md("The box beside the form is `JsonPanel`. It shows `form.values()` live; **edit it and press Load** and the form takes the values (try `{ \"intro\": 2, \"topics\": [\"css\"] }`). Bad JSON is refused with a message and nothing changes.");

		md("## One question at a time: `layout: \"stepper\"`");
		md("Same questions, same `values()`; Back and Next move through them, the bar shows where you are, and Next refuses to leave a required question empty. Nothing you answered is lost on the way back.");
		split(steps);

		md("## A quiz: `layout: \"quiz\"` and `correct`");
		md("Give a question a `correct` value and the quiz grades it. Finish shows every question again, green or red, with the right answer under the wrong ones, and `form.score()` is `{ right, total, results }`. A question with no `correct` is never graded.");
		split(quiz);

		md("## All twenty answer types");
		md("Each card is a live question. Answer it and the value it stores appears under it, exactly as `answer.value` would give it to your code.");
		div.c("fm-cards wide", () => Answers.list.forEach(answer => new AnswerCard({ answer })));

		md.details(import.meta, "readme.md", "Readme");
	},

	preview(nav){ return this.preview_card(nav, () => div.c("zoom-50 pad", () => new Form({ questions: [{ id: "intro", type: "T09", label: "How was the intro?" }] }))); },
});
