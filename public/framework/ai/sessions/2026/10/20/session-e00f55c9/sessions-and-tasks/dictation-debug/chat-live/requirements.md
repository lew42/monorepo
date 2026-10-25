# Chat: your words live on screen, with three clear states

Budget $5, Sonnet. Load the `minion` skill first. Card: [chat-show-when-your-words-reach-the-assi](/framework/ai/sessions/2026/10/25/cards/chat-show-when-your-words-reach-the-assi/). Source: voice session v-sq8y7db (2026-10-25), relayed by session-smart-v-sq8y7db. Round 2 of [../chat-sent/](../chat-sent/requirements.md) (its items 6-9). The owner approved these as safe fixes; nothing here changes the shape.

Start after round 1 (`../chat-sent/`) has merged, from current `michael/dev`.

## The asks

1. **Raw text on screen live in Chat v2** (priority). Today the owner sees nothing in v2 until the owner pauses. Draw the mic's live draft (`ext/Chat/Mic.js:206`, `draw_caption`) raw, at the end of the current paragraph, in place, and remove it when the real line arrives.
2. **No flash on send.** Today the long raw text shows, then the cleaned text replaces it (`Mic.js:510` under the "Clean transcription" setting, drawn by `ux/Dictate/Widget.js:800`). Settle into the cleaned sentences in place, without a flash; keep the raw behind "show raw".
3. **Three clear states, in both views:**
   - **Live** (light gray): heard, not sent yet.
   - **Sent to fast** (black).
   - **Refined by smart**: a different cue from the colours, such as a small mark or a left rule. Pick one and name the alternative.
   - Bug: in a long bubble, only the newest live sentence gets the gray/black treatment, and the rest stays plain black. Every sentence must show its own state.
4. **Periods.** Sentences are not getting their periods. Find where the period is lost (whisper output, the cleanup, or the joiner), with file:line, and fix it.
5. **A clearer send moment** than the "Sends when you pause" flicker.
6. **Why a long pause once did not send.** Candidates from the code: `auto_check` returns silently in some states (`Mic.js:607`); a second send is dropped while the cleanup is pending (up to 5 s); the server holds a "speaking" line until a quiet event or 8 s (`Servex/agents/Sessions.js:984`, `:1109`). Reproduce it or name the path, and fix it.

## Check and land

Work in your own worktree, committing each step by exact path. Screenshots at 400 and 1200 of each state into `shots/`, force-added (`git add -f`), and read them yourself. Log findings as `log` lines in this folder's `session.jsonl`. Report one screen to mastermind-dictation-2, which reviews and merges. Never kill or restart the dev server, never drive the owner's tabs, never `git stash`.
