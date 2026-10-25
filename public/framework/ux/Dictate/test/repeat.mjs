// Whisper repeats the end of what was said. node public/framework/ux/Dictate/test/repeat.mjs   (pure; no server needed)
import { collapse_tail } from "../repeat.js";
import fs from "fs";
const line34 = JSON.parse(fs.readFileSync(new URL("./repeat-line34.json", import.meta.url), "utf8"));
const cases = [
	["line 34 raw loses the repeated tail", line34.raw, line34.text],
	["a whole doubling (6 words) keeps one", "we should ship it today we should ship it today", "we should ship it today"],
	["a short real repeat stays", "No, no, no, I did not say that.", "No, no, no, I did not say that."],
	["a 4-word repeat stays", "go to the store go to the store", "go to the store go to the store"],
	["a clean sentence stays", "Can you hear me? Now it is working fine today.", "Can you hear me? Now it is working fine today."],
];
let bad = 0;
for (const [name, input, want] of cases){
	const got = collapse_tail(input), ok = got === want;
	if (!ok) bad++;
	console.log(ok ? "ok  " : "FAIL", name, ok ? "" : `\n  got:  ${got}\n  want: ${want}`);
}
process.exit(bad ? 1 : 0);
