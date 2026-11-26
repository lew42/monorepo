// Scale7: three distinct states, the two swappable looks, step 0.5. Node: node public/framework/ux/Form/Scale7.test.mjs
import { install, choose, type } from "./fake-dom.mjs";
install();
const { test } = await import("../../core/Test/Test.js");
const { default: Scale7 } = await import("./answers/Scale7.js");
const { default: Slider7 } = await import("./answers/Slider7.js");

const find = (a, tag) => a.el.find(e => e.tag === tag);
const skip = a => find(a, "button")[0];

test("Scale7 buttons: seven radios, 0 is an answer, null is not", t => {
	const a = new Scale7();
	const radios = find(a, "input");
	t.eq(radios.length, 7, "seven buttons");
	t.eq(a.value, null, "not answered");
	t.ok(a.empty(), "so it is empty");
	choose(radios[3]);
	t.eq(a.value, 0, "the middle button stores 0");
	t.ok(!a.empty(), "0 is an answer");
	choose(radios[6]);
	t.eq(a.value, 3, "the last stores +3");
});

test("Scale7 skip is its own state: the string skip, toggles back to null, and clears the radios", t => {
	const a = new Scale7({ value: 2 });
	skip(a).fire("click");
	t.eq(a.value, "skip", "skip stores the word");
	t.ok(find(a, "input").every(r => !r.checked), "no radio shows as chosen");
	t.ok(!a.empty(), "a skip is an answer");
	skip(a).fire("click");
	t.eq(a.value, null, "pressing skip again un-skips");
	t.eq(new Scale7({ skip: false }).el.find(e => e.tag === "button").length, 0, "skip: false removes the control");
});

test("Scale7 markers are one option: each set draws different content, same value", t => {
	const shapes = ["numbers", "faces", "icons", "bars"].map(markers => {
		const a = new Scale7({ markers });
		const seen = a.el.find(e => e.classList.contains("fm-num") || e.classList.contains("fm-face") || e.classList.contains("fm-icon") || e.classList.contains("fm-bar")).length;
		choose(find(a, "input")[0]);
		t.eq(a.value, -3, markers + ": the first button is still -3");
		return seen;
	});
	t.eq(shapes, [7, 7, 7, 7], "seven markers in every set");
});

test("Slider7: a native range that stays null until touched, step 0.5 keeps halves", t => {
	const a = new Slider7({ step: 0.5 });
	const range = find(a, "input")[0];
	t.eq(range.attrs.type, "range", "native range");
	t.eq(range.attrs.step, "0.5", "step passes through");
	t.eq(a.value, null, "untouched is null");
	type(range, 1.5);
	t.eq(a.value, 1.5, "a drag stores the number");
	a.value = 0;
	t.eq(String(range.value), "0", "code moves the thumb");
	t.ok(!a.empty(), "0 is an answer");
	t.eq(find(a, "output")[0].textContent, "0", "the readout shows it");
});
