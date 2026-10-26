# Brief: the open owner bubble always stays LAST (V1 and V2)

Load the `minion` skill first. Budget: $4. Work only in worktree `C:\Code\lew42\worktrees\chat-split` (branch worktree/chat-split, server http://localhost:63375/). Never touch the main tree, restart servers, or `git stash`. Commit by exact path. Do not wait on questions; decide and log the alternative.

## Defect (owner, 2026-10-25, V1 chat)
An assistant reply line lands between two owner lines of the same still-growing Prompt, so the owner's bubble is split in two (V1 draws strictly in line-time order).

## Owner's rule (replaces the earlier "draw the reply after the bubble" idea)
Assistant messages appear where they come, in time order. If the owner keeps transcribing into the SAME open Prompt/bubble, that bubble MOVES BELOW the new assistant message: it re-anchors to the bottom, stays ONE bubble, text intact. So: never split; the open (still-growing) owner bubble is always the last item. Once the Prompt is closed (a new Prompt starts), it stays where it is.

## Build
1. Mock first: a fixture/test (extend `public/framework/ext/Chat/v2/ChatV2.test.mjs` and `ux/Dictate/test/chat-sent.mjs` style) with lines: owner line A (open Prompt p1), assistant reply R, owner line B continuing p1. Assert today it splits (one bubble before R, one after); after the fix p1 is ONE bubble holding A+B, positioned after R, and it is the last bubble.
2. Fix in `ext/Chat/Chat.js` (V1) and `ext/Chat/v2/ChatV2.js` (V2); they share the model, so fix the shared draw/ordering rule once if possible (law 6), not two copies. Re-anchor must not flash or lose scroll position (reuse the existing no-reflow approach; do not rebuild the bubble DOM if you can move the node). The ✓ and 🧠 cursors are persistent DOM elements moved to the newest chunk; they must keep working.
3. Run the ChatV2 tests against YOUR worktree URL (no URL hits the main tree): `node public/framework/ext/Chat/v2/ChatV2.test.mjs http://localhost:63375` (47 pass today) and the chat-sent test. Smoke: no console errors, no same-origin 404.
4. One screenshot of the re-anchored result, read yourself.
5. Docs: one line in `ext/Chat/readme.md` (and v2/readme.md if relevant) naming the rule: the open bubble stays last.

## Report
Three lines to task-mastermind-2: commit id, test counts, the screenshot path.
