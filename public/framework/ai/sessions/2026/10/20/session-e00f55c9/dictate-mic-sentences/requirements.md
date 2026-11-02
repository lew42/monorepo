# Voice Chat: release the mic on pause, and send every sentence the moment it ends (you are a mastermind, on Sonnet, medium effort)

**The owner (2026-11-02, about 15:20):**
1. **The mic.** "The web page hijacked the microphone and didn't release it… I clicked the button a couple of times… it said it was paused, but the green light on Android in the top right corner was still on." So Claude's own app, in another tab, got no audio.
2. **Sentences.** "Why aren't we sending every sentence to the assistant? On every period or question mark, automatically chunk off the next sentence and send it away."

**Evidence for item 2, from session `v-qfzrnhh`'s `sentences` lines:** most lines are one sentence, but some carry 2 or 6. A Whisper segment closes only on a pause, and the whole segment goes out as one line. So during continuous speech, a sentence waits for the next pause.

## Do (test first; worktree; `node Server/review.mjs <this dir> <worktree>`; `node Server/merge.mjs`; never commit straight to `michael/dev`)
1. **Release the mic when paused or off.**
   - Stop every `MediaStreamTrack` and close or suspend the audio graph, so the browser's mic indicator turns off. Get the mic again on resume.
   - **Test first:** headless with a fake mic, every track's `readyState` is `"ended"` after pause, and resume works.
   - Look in `ux/Dictate/capture.js`, `Dictate.js` and `ext/Chat/Mic.js`.
2. **Send each sentence as soon as it ends.**
   - **When a final segment holds several sentences,** send each one as its own line, in order, and keep the `said_at` times.
   - **Better still:** when the live guess holds a finished sentence (it ends in `.` `?` or `!`, and more words follow it), send that sentence right away instead of waiting for the pause.
   - **If the final text later differs,** the sentence that was already sent is corrected in place: the existing fix path, or `{"messages":{"<id>":…}}`, never a second copy.
   - **Test first:** feed a scripted guess/final sequence with 3 sentences and no pause. Expect 3 sends, in order, each about as soon as its sentence ends, and no duplicates after the final arrives.
3. **Keep:**
   - the floor (`speaking`/`done`);
   - barge-in;
   - the ✓ marks (V1.2's single green check);
   - V1's raw text;
   - the order rules.

   Run `node core/Test/run-all.mjs --browser` with the TestRunner Servex fence; never the live Servex.
4. **Document** it in `ux/Dictate/doc/upload.md` or `pipeline.md`, and `wake-policy.md`: "a sentence goes out when it ends, not when you pause".

**Fences:** commit by path; no `python -`. **Budget:** about $8. If you're stuck after two honest tries, say so. Report to vscode-mastermind in 3 lines, then complete your own task and stop.
