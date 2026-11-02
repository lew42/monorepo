# Chat: lay the conversation out like Claude's chat (you are a mastermind, on Sonnet, high effort)

**The owner (2026-11-02, about 14:10, dictated; verbatim in the tab's prompt log):** "I'd like to follow Claude's chat UI here in terms of how the interaction works and a little bit of the design."

The essence:
1. **The owner's messages are bubbles, right-aligned, that hug their text.** One word, like a `/compact` message, is a small pill, not full width.
2. **A bubble grows while the owner dictates into it.** The words appear live, and the bubble widens until it hits its max width, about 80% of the screen. Then it wraps.
3. **The assistant's text has no visible bubble.** It is plain text on the page (a transparent bubble is fine), left-aligned, also about 80% wide at most.
4. **The point is visual hierarchy:** the owner's words and the assistant's words are told apart at a glance.
5. **The bubbles come from the list's ids:** every bubble is one item of `session.messages` (the Chat List: `core/Session/Chat/readme.md`), keyed by its id (`m-<ms>`), so a growing Prompt updates its own bubble in place.

## What exists
- **The views:** V1 is `ext/Chat/Chat.js` + `Chat.css`, still drawn from `{chat}` lines. `core/Session/Chat/V1Bubbles.js` is its ready adapter onto `session.messages` (0 diffs). V2 is `ext/Chat/v2/`, and V3 is `ext/Chat/v3/ChatV3.js` + `ChatV3.css`. V2 and V3 already draw from `session.messages`.
- **A sibling at work:** `mastermind-replay-bubbles` is adding ▶/⏸ and ↺10 controls to every reply bubble, in all three views ([its brief](../replay-bubbles/requirements.md)). Its controls must sit well in the new layout: under or beside the assistant's text, small, and not in a box. Message it (`send_to_agent`) before you touch the same files, and merge after it lands, or rebase onto it.

## Do (worktree; `node Server/review.mjs <this dir> <worktree>`; `node Server/merge.mjs`; never commit straight to `michael/dev`)
1. **Write one shared layout rule set** (law 6) that all three views use: owner right with a hugging bubble (`width: fit-content`, `max-width: 80%`), assistant left with no fill and no border (`max-width: 80%`). Agent updates and notes stay muted. Put it where all three views can load it (a shared `ext/Chat` css, or the role classes in `roles.js`). Don't make three copies.
2. **Grow live:** the owner's in-progress words (the guess/live Whisper text) render inside the same bubble, so it widens as they speak. No jump when the final text replaces the guess.
3. **Phone first:** at 360×740 the 80% must still read well. Keep the gutter, and no horizontal scroll. Check it at 1920 too.
4. **Keep everything that works:**
   - the ✓/🧠 marks;
   - the read-aloud highlight;
   - links;
   - tap to pause;
   - the dim guess colour;
   - the order rules.

   Run the browser tests: `node core/Test/run-all.mjs --browser`. Never hit the live Servex (the TestRunner fence).
5. **Show it:** shots of V1, V2 and V3 at 360×740 and 1920, through `monorepo.lew42.com` with the phone UA (`Android 10; K`). Include a one-word owner pill and a long wrapped message. Put them in a short walkthrough linked from the outcome.
6. **Document** the layout in `ext/Chat/readme.md` (one short section with a picture).

**Fences:** commit by path; no `python -`. **Budget:** about $10. Report to vscode-mastermind in 3 lines, with the merge commit.
