// node chunks.test.mjs — pure, no browser: the chunk splits the V1 cursors place themselves against.
import { fast_chunks, last_finished_sentence_end, ends_sentence } from "./chunks.js";
let pass = 0, fail = 0;
const check = (name, ok, got) => { ok ? pass++ : fail++; console.log(`${ok ? "PASS" : "FAIL"} ${name}${ok ? "" : "  got: " + JSON.stringify(got)}`); };

// The owner's own mock, 2026-10-25: "so, it works, mostly. And then" -> fast cursor after "And then" (the
// last chunk), smart cursor after "mostly." (the last FINISHED sentence; "And then" has no ending mark yet).
const text = "so, it works, mostly. And then";
const chunks = fast_chunks(text);
check("fast_chunks: four chunks, cut at every comma and the period", JSON.stringify(chunks) === JSON.stringify(["so,", "it works,", "mostly.", "And then"]), chunks);
check("fast_chunks: the last chunk is the unfinished tail", chunks.at(-1) === "And then", chunks);
const end = last_finished_sentence_end(text);
check("last_finished_sentence_end: ends right after \"mostly.\"", text.slice(0, end) === "so, it works, mostly.", text.slice(0, end));
check("last_finished_sentence_end: the tail is what's left over", text.slice(end).trim() === "And then", text.slice(end));

// No finished sentence yet: the smart cursor has nowhere to sit (0), the fast cursor still has chunks.
check("no finished sentence: last_finished_sentence_end is 0", last_finished_sentence_end("so, it works") === 0);
check("no finished sentence: fast_chunks still splits at the comma", JSON.stringify(fast_chunks("so, it works")) === JSON.stringify(["so,", "it works"]));

// A single, already-finished sentence: both land at the very end.
check("one finished sentence: last_finished_sentence_end is the whole text", last_finished_sentence_end("Say it clearly.") === "Say it clearly.".length);
check("ends_sentence: true for a period, false for a bare comma", ends_sentence("Done.") === true && ends_sentence("still going,") === false);

// Question and exclaim count as finished too, same as a period.
check("ends_sentence: ? and ! both finish a sentence", ends_sentence("Really?") === true && ends_sentence("Wow!") === true);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
