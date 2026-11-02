# Read-aloud stutters at the start: find why and fix it

Agent: a mastermind on Sonnet, high effort.

**Asks (tick each with proof when landed):**
- [x] Cause found from the phone log, written to [findings.md](findings.md): the phone ran an older Recite whose `final()` called `read()` (stop + restart) when the settled text differed from the stream; the current code read the start twice. Log lines in the findings.
- [x] Cause fixed: `Recite.unread_tail` — `final()` queues only what the stream did not read. Proof: `playback-stutter.test.mjs` cases 1-4 fail on the old code (chunk list repeats sentences 0-2) and pass now.
- [x] Optional `words` interrupt, in `BargeIn.js` only (`mode`: volume|words, plugin shape id/label/defaults/start/stop; a button in the bar). Proof: test case 5-6, words mode keeps playing through noise, a phantom and an echo, and pauses on real words.
- [x] Headless test passes: `FENCE_SERVEX=1 node public/framework/audio/Recite/playback-stutter.test.mjs <site url>` 15/15; `ReciteBubble.test.mjs` 37/37; `Recite.test.mjs` 33 tests 0 failed.

**The owner (2026-11-02, about 14:20):** "There's a slight problem with the playback where it starts and then stutters and then restarts. I'm not sure if the interruption gets triggered, like it hears itself… or if there's some kind of buggy asynchronous restart."

## Do (worktree; `node Server/review.mjs <this dir> <worktree>`; `node Server/merge.mjs`; never commit straight to `michael/dev`)
1. **Prove the cause from the owner's real phone log, not a guess.**
   - The phone is the runs with UA `Android 10; K` and no PROBE in `ai/whisper/bucket.jsonl`. A filter is at `C:/Users/mike/AppData/Local/Temp/claude/c--Code-lew42-monorepo/e00f55c9-bad4-4ee2-899e-d629ea1eede6/scratchpad/owner-phone-watch.mjs`; copy it, don't edit it.
   - Line up each `playing` trace with any barge-in, stop or pause, and the next `playing`, in the first 2 s of a reply.
   - Suspects:
     - (a) BargeIn hearing Kokoro's own audio (echo), despite the higher threshold while speaking;
     - (b) two plays of the same sentence racing (a queue or `read_aloud()` restart);
     - (c) the thinking cue, or a second reply, cutting in.
   - Write what you found to `findings.md`, with the log lines.
2. **Fix the cause.**
   - If (a): don't simply mute barge-in for the first seconds (the owner called that "much less responsive"). Prefer the word-based interrupt in item 3 for the start of a reply.
   - If (b) or (c): make the restart impossible, and add a test for it.
3. **A word-based interrupt, as an option.** The owner: "use Whisper's transcription as the threshold for the interrupt, so a cough or a loud noise doesn't stop the playback."
   - A setting picks `volume` (today) or `words`. With `words`, playback pauses only when Whisper returns real text while Recite is speaking.
   - Keep it small and toggleable. `mastermind-dictate-plugins` will later turn it into a plugin, so put it in one class, not spread across files.
4. **Test it headless** with the TestRunner Servex fence (fake mic).

**Fences:** commit by path; no `python -`. Don't restart Servex during a live voice call. **Budget:** about $10. Report to vscode-mastermind in 3 lines.
