// Stepper, quiz and JsonPanel. Node: node public/framework/ux/Form/Layouts.test.mjs
import { install, choose, type } from "./fake-dom.mjs";
install();
const { test } = await import("../../core/Test/Test.js");
const { default: Form } = await import("./Form.js");
const { default: JsonPanel } = await import("./JsonPanel.js");

const questions = () => [
	{ id: "a", type: "T09", label: "A", required: true },
	{ id: "b", type: "chooseone", label: "B", options: [["x", "X"], ["y", "Y"]], correct: "y" },
	{ id: "c", type: "choosemany", label: "C", options: [["1", "1"], ["2", "2"], ["3", "3"]], correct: ["3", "1"] },
];
const shown = form => form.items.filter(q => !q.el.classList.contains("fm-off")).map(q => q.id);

test("a stepper shows one question and Next stops on an empty required one", t => {
	const form = new Form({ layout: "stepper", questions: questions() });
	t.eq(shown(form), ["a"], "only the first is shown");
	t.eq(form.next_btn.el.textContent, "Next", "Next, not Submit");
	t.ok(form.back_btn.el.disabled, "Back is off on the first");
	t.ok(!form.advance(), "refused while a is empty");
	t.eq(form.index, 0, "still on the first");
	form.load({ a: 0 });
	t.ok(form.advance(), "0 is an answer, so it moves on");
	t.eq(shown(form), ["b"], "the second is shown");
	t.ok(!form.back_btn.el.disabled, "Back is on");
	form.go(0);
	t.eq(form.values().a, 0, "going back keeps the answer");
});

test("the last stepper step is Submit; it sends the values and the form says thanks", t => {
	const form = new Form({ layout: "stepper", questions: questions() });
	const sent = [];
	form.on("submit", v => sent.push(v));
	form.load({ a: 1 });
	form.go(2);
	t.eq(form.next_btn.el.textContent, "Submit", "last step");
	t.ok(form.advance(), "submitted");
	t.eq(sent[0].a, 1, "values were sent");
	t.eq(form.count.el.textContent, "Question 3 of 3", "progress line");
});

test("submit from a stepper jumps to the first missing required question", t => {
	const form = new Form({ layout: "stepper", questions: questions() });
	form.go(2);
	t.ok(!form.submit(), "refused");
	t.eq(form.index, 0, "back on the empty required one");
});

test("a quiz grades only the questions with a correct value, and scores them", t => {
	const form = new Form({ layout: "quiz", questions: [...questions(), { id: "d", type: "shorttext", label: "D" }] });
	form.load({ a: 0, b: "y", c: ["1", "3"] });
	t.eq(form.score(), { right: 2, total: 2, results: { b: true, c: true } }, "d has no correct: not counted; checkbox order never matters");
	form.load({ c: ["1"] });
	t.eq(form.score().results.c, false, "a partial list is wrong");
});

test("finishing a quiz shows every question graded and a score; Try again clears it", t => {
	const form = new Form({ layout: "quiz", questions: questions() });
	form.load({ a: 0, b: "x", c: ["1", "3"] });
	form.go(2);
	t.eq(form.next_btn.el.textContent, "Finish", "the last step says Finish");
	t.ok(form.advance(), "finished");
	t.eq(shown(form), ["a", "b", "c"], "all shown again");
	t.ok(form.question("b").el.classList.contains("fm-wrong"), "b is red");
	t.ok(form.question("c").el.classList.contains("fm-right"), "c is green");
	t.ok(form.question("b").key.el.textContent.includes("Correct answer: Y"), "the right answer is named by its label");
	t.ok(form.score_box.el.textContent.includes("You got 1 of 2 right."), "the score line");
	form.reset();
	t.eq(Object.values(form.values()), [null, null, []], "answers cleared");
	t.ok(!form.question("b").el.classList.contains("fm-wrong"), "grades gone");
	t.eq(shown(form), ["a"], "back on the first question");
});

test("JsonPanel mirrors values() live and loads pasted JSON", t => {
	const form = Form.from({ questions: questions() });
	const panel = new JsonPanel({ form });
	t.eq(JSON.parse(panel.box.el.value), { a: null, b: null, c: [] }, "starts as the values");
	form.load({ a: 2 });
	t.eq(JSON.parse(panel.box.el.value).a, 2, "follows a change");
	type(panel.box.el, '{ "a": -1, "b": "x", "nope": 1 }');
	t.ok(panel.load(), "good JSON loads");
	t.eq(form.values().a, -1, "the form took it");
	t.ok(panel.status.el.textContent.includes("nope"), "an unknown id is named");
	type(panel.box.el, "{ not json");
	t.ok(!panel.load(), "bad JSON is refused");
	t.ok(panel.status.el.textContent.startsWith("Not valid JSON"), "with a message");
	t.eq(form.values().a, -1, "and nothing changed");
	type(panel.box.el, "[1]");
	t.ok(!panel.load(), "an array is refused");
});
