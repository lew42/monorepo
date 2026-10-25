// Replay of the 2026-10-25 dictation-mangle regression: v-sq8y7db/session.jsonl, two separate occurrences (23:28 and
// 23:45). Each pair below is the literal `raw` of two CONSECUTIVE owner chat lines of the same Prompt, taken
// verbatim from the file — `sent` is what the first line already carried, `final` is what the next one carried
// with the old `strip_words` unable to find a confident match (score > 0.35), so the whole already-sent text went
// out again. node public/framework/ext/Chat/strip.test.mjs   (pure; no server needed)
import { strip_sent } from "./strip.js";

const CASES = [
	["23:28:43 -> 23:28:49 (session.jsonl ~2878-2882): Whisper reworded the opening and chopped 'se' off 'session.jsonl'",
		"It's not clear exactly if it's on the pause that we're logging to directly to the session.jsonl or if it's, Yeah, so it seems like maybe the raw whisper transcriptions are...",
		"ssion.jsonl or if it's, Yeah, so it seems like maybe the raw whisper transcriptions are... No substances are not logged. So it's the 0.9 second",
		"No substances are not logged. So it's the 0.9 second"],
	["23:45:16 -> 23:45:22 (session.jsonl 3332/3335): the tail of one segment restated as the start of the next",
		"All right, so this 0.9 seconds, And since the last pause is kind of confusing me. So like,",
		"kind of confusing me. So like, Imagine there's, you know,",
		"Imagine there's, you know,"],
];

const words = s => s.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, "").split(/\s+/).filter(Boolean);
// The exact mid-word fragments the un-fixed mic actually sent, for these two cases: a passing result must not start with one.
const CHOPPED_FRAGMENTS = new Set(["ssion", "sion"]);

let bad = 0;
for (const [name, sent, final, want] of CASES){
	const got = strip_sent(final, sent);
	const ok = got === want;
	if (!ok){ bad++; console.log("FAIL", name, `\n  got:  ${JSON.stringify(got)}\n  want: ${JSON.stringify(want)}`); continue; }
	// No 4+ word run of `sent` survives at the front of what's left to send.
	const sw = words(sent), gw = words(got);
	let dup4 = false;
	for (let n = Math.min(4, sw.length); !dup4 && n <= sw.length; n++)
		if (gw.length >= n && sw.slice(-n).join(" ") === gw.slice(0, n).join(" ")) dup4 = true;
	if (dup4){ bad++; console.log("FAIL", name, "- a 4+ word run of `sent` still opens the stripped text:", got); continue; }
	// The result never starts on a word Whisper only chopped the front off (the fix must consume it, not strand it).
	if (CHOPPED_FRAGMENTS.has(gw[0])){ bad++; console.log("FAIL", name, "- starts on a mid-word fragment:", got); continue; }
	console.log("ok  ", name);
}
process.exit(bad ? 1 : 0);
