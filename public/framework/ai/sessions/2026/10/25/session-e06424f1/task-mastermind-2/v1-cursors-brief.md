# Brief: V1 cursors (two moving cursors in the V1 chat)

Load the `minion` skill first. Budget: $4. Worktree: `C:\Code\lew42\worktrees\chat-split` (branch `worktree/chat-split`, your open-bubble-last commit `6e640ddc7` is already there). Commit by exact path when done. Never stash, never restart the dev server, never drive the owner's tabs.

## What the owner asked (2026-10-25)

V1 (the Dictate widget sheet and drawer: `ux/Dictate/Widget.js`, `ext/Chat/chat.js`, `ext/Chat/Chat.js`) gets the same two moving cursors V2 already has. Reuse V2's logic and CSS (`ext/Chat/v2/ChatV2.js` lines ~156-190: `place_cursors`, `cursor_el`, `smart_cursor_el`); do not write a second version.

1. **Fast cursor (✓).** Fast chunks are cut at comma / period / question mark. The ✓ sits after the newest fast chunk. Gray when the chunk was sent to the fast seat, green when the fast seat placed it.
2. **Smart cursor (🧠).** Smart chunks are sentences only (`.` `?` `!`). The 🧠 sits after the newest finished sentence. Gray when sent to the smart seat, pink when smart finalized or answered.
3. **Cursors move, never reflow the text.** Same inline markers, no layout jump.
4. **Remove (not hide) the green Understand (HITL) checks** at `Widget.js` ~L203-209. KEEP the yellow `?`. Leave a one-line note in `Widget.js` and in `ux/Understand/readme.md`: "HITL green checks temporarily removed from V1 (owner, 2026-10-25); may come back later."
5. **Mock test first**: input "so, it works, mostly. And then" must show the ✓ after the last chunk and the 🧠 after "mostly.". Put it beside the existing Chat tests, run it before the UI work, keep it.

## Done means

Mock test passes; `ChatV2.test.mjs` and the existing V1 tests still pass; a screenshot at 400 px and 1200 px that you read yourself; readme lines (`ext/Chat/readme.md`, `ux/Dictate`) updated so they are true now; committed. Report one screen: what changed, the test numbers, anything left.
