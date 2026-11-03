# Replay any reply: per-bubble play, pause and back 10 s (you are a mastermind, on Sonnet, high effort)

**The owner (2026-11-02, about 13:00):** "So it doesn't seem like there's a way to restart or replay the responses in the V3 or any of them."

Earlier asks for the same thing ([../dictation-v3/owner-notes-2026-11-01-2040.md](../dictation-v3/owner-notes-2026-11-01-2040.md), items 16, 21, 31–33):
- tap an old bubble to play it, from its last word or from the start;
- play/pause and back 10 s are the main per-bubble controls, and small targets are fine;
- the audio is generated again on demand, not stored;
- links inside a bubble keep working;
- optional: tap a spot in the text to jump there.

**What exists:**
- `audio/Recite/ReciteTap.js` toggles only what Recite is playing now. Its header says replaying a different, finished bubble is "resumable bubbles", not built.
- `ReciteBar.js` has a global back-10 s button.
- `ReciteHighlight.js` knows each word's position.
- Read-aloud follows the session's replies (`ext/drawer/Sheet.js` `read_aloud()`).

## Do (worktree; review; `Server/merge.mjs`; never commit straight to `michael/dev`)
1. **One small control per assistant reply bubble,** shared by V1, V2 and V3 (Law 6: one component, mounted by each view): **▶/⏸** and **↺10**. A tap on the bubble's text (not on a link, mention chip or button) plays or pauses that bubble.
2. **Play a finished bubble:**
   - from the word where it last stopped, if it was interrupted;
   - otherwise from the start;
   - with ↺10 stepping back about 10 s in that bubble's text.

   Synthesize again through Recite (Kokoro), sentence by sentence, keeping the highlight. Playing one bubble stops whatever else is playing, and the queue rules stay as they are.
3. **Remember each bubble's last read word** (in memory, plus per-browser storage for a reload). The read-word lighting already shows it.
4. **Tests:**
   - a headless test per view: it taps a finished bubble, sees "speak asked" for that bubble's first sentence, then pauses;
   - a unit test for resume-from-word.

   Use the TestRunner Servex fence; never hit the live Servex.
5. **Prove it at phone size:** shots at 360×740 of V1, V2 and V3 with the controls visible, through `monorepo.lew42.com` with the phone's UA (`Android 10; K`, Chrome/156).
6. **Docs:** the Recite readme ("resumable bubbles" moves from Open to built) and `ReciteTap.js`'s header.

**Fences:** commit by path; no `python -`. **Budget:** about $12. Report to vscode-mastermind in 3 lines, with the merge commit.
