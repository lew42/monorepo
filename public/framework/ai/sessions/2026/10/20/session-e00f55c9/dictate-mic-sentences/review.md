verdict: fix
1. [fix] `drop_early()` (diff `ext/Chat/Mic.js`, `const all = …; last = all[mine.length - 1]; return last ? … : ""`) throws away new words when the final punctuates differently. Example: "The cat sat down." went out early, then the final is "The cat sat down and then it slept." That final holds one sentence, so the slice returns "" and "and then it slept" is never sent. The same happens to the whole final whenever it has fewer finished sentences than were sent early. Fix: when the final's sentences don't line up, cut by matching the early words (or send the unmatched remainder), and add this case to `test/sentences.mjs` (scenario C only covers the `!` variant).
2. [fix] Ask 2, third bullet ("corrected in place … never a second copy") is still unmet. The first review raised this (review.jsonl finding 2), and this round answers it with a claim in `ux/Dictate/doc/upload.md` ("Correction in place: not built … the `fix` line … renames a chat title") that the code contradicts. A `chat.fix` line with the same `at` already patches the drawn piece in place: `ext/Chat/Chat.js:788-794` (`fix_index.get(c.at)` → `Object.assign(hit.piece, {text})`) and `ux/Dictate/Widget.js:159-161`. The real gap may be only the Servex writer for an owner-line fix. Use that path, or name exactly what is missing, and correct the upload.md bullet either way.
3. [note] `test/sentences.mjs` drives `early_from_guess()` and `commit()` by hand and sets `final_epoch` itself (line 392). The real wiring (`Dictate.js` interim handler → `early_from_guess(text, epoch)`, `close_segment()` → `final_epoch = epoch - 1`) reads correctly (`Dictate.js:526-562`), but no test runs it end to end through a stubbed Whisper the way `test/mic-release.mjs` does.
4. [note] Several-line sends skip `refine_final()` (`if (items.length === 1)`). That trade-off is now written down in upload.md, which is fine. Early sends also carry `raw: null`, which is fine because the guess text is the raw Whisper text.
5. [note] Not merged yet: the worktree `worktree/dictate-mic-sentences` is at d970a9e1d, and session.jsonl says the `run-all.mjs --browser` suite was still running at 15:55. Neither the task folder nor the session log records any test output, so the `"status":"pass"` rows added to `core/Test/browser-scripts.mjs` are unproven from this folder.

## Requirements
- 1 "release the mic when paused or off" — yes — `Dictate.stop()` now calls `mic.stop()` before awaiting the final; `capture.js` releases a stream that arrives after stop; `test/mic-release.mjs` checks the composer mic (tap → paused with 0 live tracks → tap → live again → off).
- 1 test first (headless fake mic, every track `"ended"`, resume works) — yes — `test/mic-release.mjs` cases 1–5.
- 2a "a final segment with several sentences: one line each, in order, said_at kept" — yes — `send_screen()` splits; scenario B. said_at is not asserted (note-level).
- 2b "send from the live guess when a finished sentence is followed by more words" — yes — `early_from_guess()`; scenario A marks 0,1,1,2,2,3.
- 2c "if the final differs, correct in place, never a second copy" — no — no copy is sent, but there is no correction, and words can be lost (findings 1, 2).
- 2 test (3 sentences, no pause, 3 sends in order, no duplicates) — yes — scenario A.
- 3 keep floor, barge-in, ✓ marks, V1 raw text, order — partly — the early path is guarded (nothing held, nothing sending, `base` empty). The raw-text rule fails for the case in finding 1, and the run-all result is unrecorded (finding 5).
- 4 document in upload.md/pipeline.md and wake-policy.md — yes — all three have the line; mic-notes.md has a settings entry; readme lists both proofs.
- live instances of a changed class — n/a — no new class; ComposerMic gains methods only.
- fresh agent can continue from this folder — yes — requirements, review.jsonl and the session log name the branch and the open items.

## Words
- doc sentences plain and short — yes — upload.md section is a short bullet list.
- claims accurate — no — the upload.md "Correction in place: not built" bullet misdescribes the `fix` line (finding 2).
