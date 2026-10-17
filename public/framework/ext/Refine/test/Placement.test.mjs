// Unit test for Placement.js: five sentences, one per case. No browser, no model.
//   node public/framework/ext/Refine/test/Placement.test.mjs
import assert from "node:assert/strict";
import Placement from "../Placement.js";

const placement = new Placement();
const state = Placement.state();
const cases = [
	// [sentence, expected action, expected paragraph index]
	["The refine page should show a flag when unclear.", "new", 0],        // first sentence starts paragraph 0
	["And it should keep the raw words beside it.", "append", 0],          // continuation cue: "And"
	["Next, the Dictate button should sit on the right.", "new", 1],       // new-topic cue: "Next"
	["The cleaner keeps every word.", "append", 1],                        // nothing decides: unsure, so append
	["", "append", 1],                                                     // empty: no change
	["Should the flag be red?", "new", 2],                                 // a question stands alone
];

let failed = 0;
for (const [text, action, paragraph] of cases){
	const d = await placement.add(text, state);
	try {
		assert.equal(d.action, action, `action for "${text}"`);
		assert.equal(d.paragraph, paragraph, `paragraph for "${text}"`);
		assert.equal(d.to, action === "new" ? "paragraph" : "same", `to for "${text}"`);
		console.log("ok  ", action.padEnd(6), `p${d.paragraph}`, `${d.confidence}`.padEnd(4), d.reason, "|", text || "(empty)");
	} catch (e){
		failed++;
		console.log("FAIL", e.message);
	}
}

// The unsure rule must say so, so the view and log can show it.
const unsure = new Placement().place("The cleaner keeps every word.", { paragraphs: [["x"]] });
assert.equal(unsure.confidence, 0.5);
assert.match(unsure.reason, /^unsure/);

console.log(failed ? `FAIL ${failed} of ${cases.length}` : `PASS ${cases.length} of ${cases.length}`);
process.exitCode = failed ? 1 : 0;
