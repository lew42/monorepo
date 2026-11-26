// Form core: build from JSON, values(), load(), required, change and submit. Node: node public/framework/ux/Form/Form.test.mjs
import { install, choose, type } from "./fake-dom.mjs";
install();
const { test } = await import("../../core/Test/Test.js");
const { default: Form } = await import("./Form.js");
const { default: Answers } = await import("./Answers.js");

const json = {
	title: "Check-in",
	questions: [
		{ id: "intro", type: "T09", label: "How was the intro?", required: true },
		{ id: "how", type: "chooseone", label: "How?", options: [["a", "A"], ["b", "B"]] },
		{ id: "word", type: "ShortText", label: "One word" },
	],
};

test("Answers.find reads a type id or a class name", t => {
	t.eq(Answers.find("T09").name, "Scale7", "by id");
	t.eq(Answers.find("scale7").name, "Scale7", "by lower-case name");
	t.eq(Answers.find("number").name, "NumberAnswer", "the Answer suffix is optional");
	t.eq(Answers.list.length, 20, "twenty types");
});

test("Form.from builds the questions; values() starts all null, in question order", t => {
	const form = Form.from(json);
	t.eq(Object.keys(form.values()), ["intro", "how", "word"], "one key per question id");
	t.eq(Object.values(form.values()), [null, null, null], "nothing answered");
});

test("load() sets answers by id and ignores unknown ids; values() reads them back", t => {
	const form = Form.from(json);
	form.load({ intro: -2, how: "b", word: "calm", nope: 1 });
	t.eq(form.values(), { intro: -2, how: "b", word: "calm" }, "round trip");
});

test("a user's click lands in values() and fires change", t => {
	const form = Form.from(json);
	const seen = [];
	form.on("change", v => seen.push(v.how));
	const radios = form.question("how").el.find(e => e.tag === "input");
	choose(radios[1]);
	t.eq(form.values().how, "b", "the click is in values()");
	t.eq(seen, ["b"], "change fired with the new values");
});

test("submit refuses while a required question is empty, then sends the values", t => {
	const form = Form.from(json);
	const sent = [];
	form.on("submit", v => sent.push(v));
	t.eq(form.missing(), ["intro"], "only the required one is missing");
	t.ok(!form.submit(), "refused");
	t.ok(form.question("intro").el.classList.contains("fm-missing"), "the question is flagged");
	form.load({ intro: 0 });
	t.eq(form.missing(), [], "0 is an answer, not empty");
	t.ok(form.submit(), "accepted");
	t.eq(sent[0].intro, 0, "submit carried the values");
});
