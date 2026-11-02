// node paragraph-pauses.test.mjs — pure, no browser, no model: feeds one long rambling dictation
// (no question marks, no cue words -- the owner's actual 2026-11-01 20:40 case) through Placement,
// as sentence-by-sentence sends with real gaps between them (views-fix item 0's own send shape),
// and counts the paragraphs it lands in. V1 already draws one bubble per Placement.decision("new")
// (Widget.place() -> split_paragraph(), proven live by ux/Dictate/test/in-place.mjs); this is the
// decision layer underneath that draw, item 3's own fix (Placement.js's gap_ms rule).
import assert from "node:assert/strict";
import Placement from "../Placement.js";

const placement = new Placement(), state = Placement.state();

// A long dictation, sentence by sentence, the way item 0 now sends it: no "?", no cue words --
// just a run of plain sentences, some said right after the last (short gap), two said after a
// real pause (the owner stopping to think, then starting a new thought).
const SENTENCES = [
	{ text: "so the first thing is the kitchen needs new light bulbs", gap_ms: null },        // first: always paragraph 0
	{ text: "the hallway one is flickering too", gap_ms: 300 },                                  // right after: same paragraph
	{ text: "I should pick some up today", gap_ms: 500 },                                        // same paragraph
	{ text: "the car also needs an oil change soon", gap_ms: 2800 },                              // a real pause: new paragraph
	{ text: "maybe this weekend if the weather holds", gap_ms: 350 },                             // same paragraph as the oil-change thought
	{ text: "we still owe the dentist a callback", gap_ms: 3100 },                                // another real pause: new paragraph
];

for (const s of SENTENCES) s.placed = await placement.add(s.text, state, s.gap_ms);

let pass = 0, fail = 0;
const check = (name, ok, got) => { ok ? pass++ : fail++; console.log(`${ok ? "PASS" : "FAIL"} ${name}${ok ? "" : "  got: " + JSON.stringify(got)}`); };

check("3 paragraphs drawn, not 1 (the owner's whole dictation was landing in one)", state.paragraphs.length === 3, state.paragraphs);
check("every word is still there, none lost", state.paragraphs.flat().join(" ") === SENTENCES.map(s => s.text).join(" "));
check("paragraph 0 holds the first three (short-gap) sentences", JSON.stringify(state.paragraphs[0]) === JSON.stringify(SENTENCES.slice(0, 3).map(s => s.text)));
check("the 2.8s pause starts paragraph 1", SENTENCES[3].placed.action === "new" && SENTENCES[3].placed.reason.includes("pause"), SENTENCES[3].placed);
check("the 3.1s pause starts paragraph 2", SENTENCES[5].placed.action === "new" && SENTENCES[5].placed.reason.includes("pause"), SENTENCES[5].placed);
check("a 0.35s gap right after still appends (not every gap is a paragraph)", SENTENCES[4].placed.action === "append", SENTENCES[4].placed);

console.log(`\n${pass} passed, ${fail} failed`);
process.exitCode = fail ? 1 : 0;
