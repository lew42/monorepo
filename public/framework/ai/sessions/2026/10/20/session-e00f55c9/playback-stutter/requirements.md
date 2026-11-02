# Read-aloud stutters at the start: find why and fix it (you are a mastermind, on Sonnet, high effort)

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
