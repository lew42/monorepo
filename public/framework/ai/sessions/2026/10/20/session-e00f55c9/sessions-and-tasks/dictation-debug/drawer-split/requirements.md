# Chat drawer: the Docs split resets, and Chat v2 cards get room

Budget $3, Sonnet. Load the `minion` skill first. Card: [chat-show-when-your-words-reach-the-assi](/framework/ai/sessions/2026/10/25/cards/chat-show-when-your-words-reach-the-assi/). Source: voice session v-sq8y7db (2026-10-25), relayed by session-smart-v-sq8y7db. Approved by the owner as a safe fix.

## The asks

1. **The split goes away on the AI tab.** In the dictate drawer, opening the Docs tab shows a resize handle and a sheet rising from the bottom, with the chat still on top. Back on the AI (chat) tab, the handle stays, dragging it does nothing, and the chat is stuck at half height above a big blank area. On the AI tab the split must go away and the chat must take 100% of the height again. Reproduce it headless first (open Docs, go back to AI, measure the chat's height), fix it, measure again.
2. **Chat v2 spacing** (from `../v2-speed/requirements.md` item 7): padding below the last task at the bottom; cards get a background (white is fine); "show raw" sits tight to its own card (today it has a big gap above and little below).

## Where to start

`ext/drawer/readme.md` and `ext/drawer/doc/sheet.md`; the code is likely in `ext/drawer/Sheet.js`, `AIPage.js` or `drawer.js`. Chat v2: `ext/Chat/v2/ChatV2.css`.

**Fence:** `ext/drawer/*` (not `ChatView.js`, which another worker owns this round) and `ext/Chat/v2/ChatV2.css`. Nothing else.

## Check and land

Work in your own worktree (`take_worktree`, or `node Server/worktree-up.mjs drawer-split`). Screenshots at 400 and 1200 of: the drawer before and after the Docs round trip, and a Chat v2 session (`/framework/ext/Chat/v2/?src=/framework/ai/sessions/2026/10/25/v-sq8y7db/session.jsonl`), into this folder; read them yourself. Commit by exact path. Log findings as `log` lines in this folder's `session.jsonl`. Report one screen to mastermind-dictation-2, which reviews and merges. Never kill or restart the dev server, never drive the owner's tabs, never `git stash`.
