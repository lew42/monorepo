# Ask 5/6: a move must reach the chat screen as one line, and never split the owner's bubble

Load the minion skill first. Budget: $6. Worktree: `C:/Code/lew42/worktrees/voice-move` (branch worktree/voice-move, from compliance/dev). Build there, tests first. Do not merge; report back and I review.

## Why
When the voice agent re-places a sentence (a new topic moves it, an `improve` edit rewrites it), the chat on screen makes the owner's text vanish and reappear, or splits the owner's bubble. Findings (read-only, file:line): `…/session-f5eadae9/minion-ask5-ask6/session.jsonl` (the `complete` line). Summary: every `{chat}` write is mirrored into the `messages` list that ChatV3 draws; a **move is never mirrored**, and ChatV3's dirty tracking only recognises an `add` delta, so even a mirrored move would be missed.

## Do
1. `Servex/agents/ChatWriter.js` `place` (about :122-127): when a sentence is placed/moved, also write ONE `List.move` line on the `messages` list (the move the List class already understands, `public/framework/core/List/List.js` ~:268-271, :357-382). No delete+add, no second copy of the message.
2. `public/framework/ext/Chat/v3/ChatV3.js` `added_member` (about :68-75) and the dirty tracking (~:48, :134-144): resolve a delta carrying `move` to the existing drawn node and MOVE that node's DOM (no re-render of its text, no new bubble). The owner's bubble keeps its text node, so a selection or scroll position inside it survives.
3. A sentence of the owner's is never split across two bubbles: a later agent line may sit between owner sentences only after the owner has paused (check how `heard` at `Servex/agents/Sessions.js` ~:1605-1660 orders them; fix only if the test shows a split).
4. Tests first, small: a replayed `session.jsonl` fixture (use lines from `public/framework/ai/sessions/2026/11/03/v-z0jonhy/session.jsonl` 14/15, 35/36, 56/57) showing (a) one move line is written, (b) ChatV3 given that line moves the node and does not redraw it (the node is the same object before and after), (c) an improve edit patches in place. Keep the existing ChatV3/ChatWriter tests green.
5. Update the readmes of the two modules in the same change (ext/Chat/v3/readme.md, and where ChatWriter is documented). No dated logs.

## Not now
Other views (V1Bubbles, ChatV2): the investigation could not rule out that one of them redraws a whole list on a move. Check ONLY whether either still does, and say so in your report in one line; do not fix them.

## Rules
Never kill or restart the dev server, never drive the owner's tabs, never `git stash`. Commit by exact path. Run `node Server/smoke.mjs C:/Code/lew42/worktrees/voice-move` at the end. Log in your own task.jsonl; final reply under 12 lines: what changed, test numbers, the V1/V2 line.
