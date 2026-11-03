verdict: fix
1. [fix] The new module file `ux/Dictate/repeat.js` is not indexed where every dictation piece is listed: `ux/Dictate/doc/map.md` (the "map of every dictation piece", rows near :101 for Mic.js) has no row for it, and `ux/Dictate/files.jsonl` has no `repeat.js` row. Add a map row ("collapse_tail: drops a 5+ word repeated tail; called by ComposerMic.collapse_repeat").
2. [fix] The new doc section in `ext/Chat/doc/mic-notes.md:366` is appended directly under the dangling "## Settings: clean / KILL SWITCH (…):" line, so it reads as the kill switch's content. Place it under its own heading away from that line (or before "## Settings"), and check that the readme's anchor `#whisper-repeats-collapse_repeat` resolves.
3. [note] A one-word repeat of 10+ is still halved: `collapse_tail("Yes. Yes. … Yes.")` (10×) returns 5 "Yes." — a 5-word window of the same word matches itself. The brief says never touch a real repeat; skipping a tail whose words are all the same (period 1–2) would close it. Rare in speech, so a note.
4. [note] Brief step 4 asked to feed the cases "through `collapse_repeat`"; `test/repeat.mjs` calls `collapse_tail` only, so the whole-doubling branch in `Mic.js:636` and the `t === w.join(" ") ? text : t` join are untested. Mic.js's absolute `/framework/` imports likely stop node from loading it; say so in the test header if that is why.
5. [note] The case label "a whole doubling (6 words)" in `test/repeat.mjs:7` is two 5-word halves; rename it.
6. [note] Brief step 4 named the readme's proof list (`ux/Dictate/readme.md:9`); the change added a separate bold line at :12 instead. It is findable, so fine, but the "Proofs" line now misses `test/repeat.mjs`.
7. [note] The cause line in `session.jsonl` gives no line numbers for the stitching check ("Dictate.close_segment … commit joins whole finals") and the bucket run had rotated, so the "not the stitching" verdict rests on reading the code; a `Dictate.js:<line>` reference would let a fresh agent verify it in one step. The message to `mastermind-dictation-2` (step 6) is not recorded anywhere in the folder.
8. [note] Simpler alternative: the 15-line `collapse_tail` could live as a second static in `ComposerMic` beside `collapse_repeat` (the fence named Mic.js, not a new `ux/Dictate/repeat.js`); the separate file does buy a node-testable pure function, which is a fair trade.

## Requirements
- 1 "Worktree … work only there" — yes — branch worktree/dictation-repeat, one commit bffd745ed on top of michael/dev.
- 2 "Find the cause first … one log line with evidence" — yes, partly — session.jsonl line 3 says not the stitching; evidence is line 34 itself (bucket rotated); no Dictate.js line numbers (note 7).
- 3 "Fix at the cause if it is the stitching; keep a safety net … 5 or more words … never touch a real repeat" — yes — no stitching fix needed per the finding; `Mic.js:636` adds the tail collapse via `collapse_tail`; "no, no, no" and a 4-word repeat stay (test); a 10× one-word repeat is halved (note 3).
- 4 "Prove: test/repeat.mjs … ok/FAIL per case; re-run order.mjs and flicker.mjs; index in files.jsonl and readme" — mostly — I re-ran repeat.mjs in the worktree: 5/5 ok; the fixture matches session v-xhx7fmx line 34's raw and text exactly; order/flicker reported ok on port 52330 in the log (not re-run by me); test/files.jsonl indexed; tests go through collapse_tail, not collapse_repeat (note 4).
- 5 "Docs: one sentence … what is collapsed and what is not" — yes — `ext/Chat/doc/mic-notes.md` new section, but misplaced (fix 2).
- 6 "Commit by path; log each finding; message the parent; don't merge" — yes, partly — committed, not merged, cause logged; no record of the parent message (note 7).
- Class page for a new or changed class — n/a: no new class; `collapse_tail` is a plain function.

## Words
- Plain sentences a new coder can follow — yes — the mic-notes section and readme line say what is collapsed and what is not.
- Owner's own names used — yes — "collapse_repeat", "Whisper", "repeat".
- No minimal speak / undefined jargon — yes — "Whisper looping inside one long reply" is explained.
