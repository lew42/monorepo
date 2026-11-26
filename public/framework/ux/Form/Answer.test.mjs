// Answer core: value, change, empty, and the radio group road. Node: node public/framework/ux/Form/Answer.test.mjs
import { install, choose, type } from "./fake-dom.mjs";
install();
const { test } = await import("../../core/Test/Test.js");
const { default: Answer } = await import("./Answer.js");
const { default: ChooseOne } = await import("./answers/ChooseOne.js");
const { default: ChooseMany } = await import("./answers/ChooseMany.js");
const { default: ShortText } = await import("./answers/ShortText.js");

const radios = a => a.el.find(e => e.tag === "input");

test("an Answer starts empty, holds a value, and says change once per change", t => {
	const a = new Answer();
	const seen = [];
	a.on("change", v => seen.push(v));
	t.ok(a.empty(), "nothing answered yet");
	a.value = "x";
	a.value = "x";
	a.value = "y";
	t.eq(seen, ["x", "y"], "the same value twice is one change");
	t.ok(!a.empty(), "now answered");
	a.value = "";
	t.eq(a.value, null, "an empty string is not an answer: it is null");
});

test("ChooseOne: a click stores the option's value, code can set it, the radio follows", t => {
	const a = new ChooseOne({ options: [["a", "Alpha"], ["b", "Beta"]] });
	const [ra, rb] = radios(a);
	choose(rb);
	t.eq(a.value, "b", "click stores b");
	a.value = "a";
	t.ok(ra.checked && !rb.checked, "the radios follow a value set from code");
	t.eq(new ChooseOne({ options: ["x", "y"], value: "y" }).value, "y", "a value can arrive in the constructor");
});

test("ChooseMany: the value is the ticked values in option order", t => {
	const a = new ChooseMany({ options: [["m", "Music"], ["c", "Code"], ["t", "Talks"]] });
	t.eq(a.value, [], "starts as an empty list, not null");
	t.ok(a.empty(), "an empty list is empty");
	const [m, c, tk] = radios(a);
	choose(tk); choose(m);
	t.eq(a.value, ["m", "t"], "option order, not click order");
	choose(tk, false);
	t.eq(a.value, ["m"], "unticking removes it");
});

test("ShortText: typing stores the string, empty is null", t => {
	const a = new ShortText();
	const [field] = radios(a);
	type(field, "calm");
	t.eq(a.value, "calm", "typed text is the value");
	type(field, "");
	t.eq(a.value, null, "cleared text is null, so required can see it");
	a.value = "back";
	t.eq(field.value, "back", "the field follows code");
});
