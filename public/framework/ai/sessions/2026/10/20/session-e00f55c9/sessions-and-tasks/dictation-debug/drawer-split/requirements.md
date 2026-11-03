# Chat drawer: the Docs split resets, and Chat v2 cards get room

Budget $3, Sonnet. Load the `minion` skill first. Card: [chat-show-when-your-words-reach-the-assi](/framework/ai/sessions/2026/10/25/cards/chat-show-when-your-words-reach-the-assi/). Source: voice session v-sq8y7db (2026-10-25), relayed by session-smart-v-sq8y7db. Approved by the owner as a safe fix.

## The asks

1. **On the AI tab the split goes away.** Today: open Docs in the dictate drawer and a handle and bottom sheet appear. Go back to AI and the handle stays, drags do nothing, and the chat sits at half height over a blank area. Fix: on AI the chat takes 100% height. Reproduce headless first (open Docs, back to AI, measure chat height), fix, measure again.
2. **Chat v2 spacing** (from `../v2-speed/requirements.md` item 7): padding below the last task at the bottom; cards get a background (white is fine); "show raw" sits tight to its own card (today it has a big gap above and little below).

## Where to start

`ext/drawer/readme.md` and `ext/drawer/doc/sheet.md`; the code is likely in `ext/drawer/Sheet.js`, `AIPage.js` or `drawer.js`. Chat v2: `ext/Chat/v2/ChatV2.css`.

**Fence:** `ext/drawer/*` (not `ChatView.js`, which another worker owns this round) and `ext/Chat/v2/ChatV2.css`. Nothing else.

## Check and land

Work in your own worktree (`take_worktree`, or `node Server/worktree-up.mjs drawer-split`). Screenshots at 400 and 1200 of: the drawer before and after the Docs round trip, and a Chat v2 session (`/framework/ext/Chat/v2/?src=/framework/ai/sessions/2026/10/25/v-sq8y7db/session.jsonl`), into this folder; read them yourself. Commit by exact path. Log findings as `log` lines in this folder's `session.jsonl`. Report one screen to mastermind-dictation-2, which reviews and merges. Never kill or restart the dev server, never drive the owner's tabs, never `git stash`.
