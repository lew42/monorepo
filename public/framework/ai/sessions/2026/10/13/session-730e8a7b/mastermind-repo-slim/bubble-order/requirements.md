# Chat bubbles in order, and one mic for Refine

Budget: $12. Load the `sub-mastermind`, `code` and `ui-test` skills first. The owner's words: `../requirements-5.md` ask 2 ("the chat bubbles were a little wrong, the order of my statements were getting jumbled… the whole transcription experience needs to be buttoned up… unacceptable after weeks"). The brief is already written by the dictate-check task: **`public/framework/ux/Dictate/doc/next.md`, section "Next 2: live bubble order, and one mic for Refine"**: (1) in `ext/Chat/Chat.js`, insert a drawn bubble before the first existing bubble with a later `at`, and re-place a bubble when `retag_piece` changes its id/time; proof: a headless run with a scripted Whisper sends four sentences with replies in between and asserts DOM order equals the session file order (replay tool `dictate-check/replay.mjs`); (2) Refine's page takes its raw text from the `chat()` session instead of `VoiceStrip`'s own mic, so desktop, phone and Refine give one result (details in `ux/Dictate/doc/asks.md`, the 2026-10-13 "bubble order and how dictate / chat / refine nest" section). Your log is this dir's `task.jsonl`.

## Deliverable

1. (1) first: the fix in a worktree, the headless proof script committed in this task dir with its output, before/after shots of the jumbled vs ordered chat on the card. `ext/Chat` has an owner per its readme: ask once, proceed after 10 minutes of silence.
2. (2) second, only after (1) is merged: the Refine page's mic source; proof: one dictation shows the same text on the phone sheet, the desktop chat and the Refine page.
3. `merge.mjs` each; `next.md` sections marked done with hashes; landing line; card.

Fence: `ext/Chat/Chat.js` (+ test), `ext/Refine`'s page mic wiring only (not `Scorer.js`, not the queue: refine-pipeline's), `ux/Dictate/doc/next.md`, this task dir. Not `ext/drawer` (the dictate-sheet sibling). Sonnet.
