<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Find the owner s dictated chat well   mobile sheet instructions  read only " (words: find, owner, dictated, chat, well, mobile, sheet, instruction, read, only)

## Tasks (8, best first)
- 2026-10-20 [Find the owner's dictated chat-well / mobile sheet instructions (read…](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/mobile-sheet/well-asks/) — (no outcome logged)
- 2026-10-01 [Mobile rail fullscreen chat: fixed the thread's leftover 22em cap](/framework/ai/sessions/2026/10/01/d32d9965-08f0-4c35-9c32-13763889a3b0/rail-fullscreen-textarea/) — Fixed the mobile rail's fullscreen chat void. The chat thread was capped at 22em (Widget.css), sized for a normal page; rail.css lifted that cap for the card in fullscreen, but not the thread one level deeper, so it stopped growing early. That left empty spac… · paths 2/2 exist
- 2026-10-01 [One widget: the demo and the sheet build the identical chat() call; a…](/framework/ai/sessions/2026/09/30/one-dictation/one-dictation/minion-onewidget/) — The Dictate page's demo and the ✦ sheet now build the exact same chat() call — only keep differs — and autosend after a pause is the only way a sentence goes out, everywhere. item 2, "one widget": ux/Dictate/page.js's demo_mount() is now chat($slot.el, {place… · paths 1/3 exist, gone: framework/ux/Dictate/doc/chat/ framework/ux/Dictate/doc/decisions/
- 2026-10-17 [Socket: a phone may run read-only queries, so Last landed and Waiting…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/mobile-socket/) — A LAN peer can now ask the socket for the task tree; commands are still refused. one list in [Socket.js](/framework/dev/Socket/): LAN_OK gains query, and LAN_QUERY names the only two sources a phone may ask (sessions, tasks); rule in [lan.md](/framework/dev/S… · paths 1/1 exist
- 2026-10-08 [Mobile setup page + mic/Whisper diagnosis: the gap is HTTPS on the LA…](/framework/ai/sessions/2026/10/08/mobile-voice-access/mobile-voice-access/) — What landed: a new page [/framework/dev/mobile/](/framework/dev/mobile/) — one screen, works/doesn't-work table first, then how to open the site on a phone and fix the mic. [findings.md](/framework/ai/2026-10-08/mobile-voice-access/findings.md) answers all 4 … · paths 2/2 exist
- 2026-10-16 [Salvage: unmerged branch audit, dup-bubbles already on dev](/framework/ai/sessions/2026/10/16/voice-20261016/salvage/) — Audit done; nothing needed merging. [audit.md](/framework/ai/sessions/2026/10/16/voice-20261016/salvage/audit.md) Audit every branch: 422 checked, 239 fully merged, 183 ahead, 75 pure noise (listed, nothing deleted) Top 5 for a human look: page-extends-item, …
- 2026-10-09 [Chat: duplicate bubbles fixed at three sources](/framework/ai/sessions/2026/10/09/session-54aa047d/dup-chat-bubbles/) — Duplicate chat bubbles fixed (b87834ba2), one shared chat component, three causes. one bubble per message, typed and voice: 2x before, 1x after, at 400 and 1920 ([doc](/framework/ext/Chat/doc/duplicate-bubbles.md), proofs in doc/proof/) text twice inside one …
- 2026-10-01 [Chat: fixed assistant replies drawing twice](/framework/ai/sessions/2026/10/01/chat-duplicate-messages/chat-duplicate-messages/) — Fixed: every assistant reply drew twice in the chat. [ux/Dictate/chat.js](http://monorepo.localhost/framework/ux/Dictate/) listens for new lines two ways at once (an SSE push and a file poll) and only the owner's own echoed message was ever deduped against th… · paths 2/3 exist, gone: framework/ux/Dictate/doc/chat/

## Modules that exist now (files outside the module that import it)
- [ext/Chat](/framework/ext/Chat/) — used by 10 files

## Docs and readmes
- [Owner notes, 2026-10-16 (night): the mobile sheet, the draw…](/framework/ext/drawer/doc/owner-2026-10-16-sheet.md) — A big surgery. A mastermind manages it, a worktree tests it, and the owner approves each step before it is built. Slow and methodical; mock…
- [Next: make the phone sheet the sidebar's collapsed form (br…](/framework/ux/Dictate/doc/next.md) — Owner's design: on mobile a small sheet holds only the transcribe button and the text area, resizable; expanded, it becomes the whole sideb…
- [Owner notes, 2026-10-16: indexing and finding past work (di…](/framework/ai/doc/owner-2026-10-16-indexing.md) — Not a plan, not approved. The owner's words condensed. Related: past-work-index.md (by task), readmes.md, module-homes.md. ## Every directo…
- [Owner notes, 2026-10-16 (night): the task system read top-d…](/framework/core/Task/doc/owner-2026-10-16-top-down.md) — Third note of the day; read owner-2026-10-16-task-system.md and owner-2026-10-16-composition.md first. Where the owner said "I'm not sure",…
- [The owner on sessions, tasks and losing work (2026-10-20, d…](/framework/ai/doc/owner-2026-10-20-who-makes-tasks.md) — The essence of a long dictation, recorded here so it survives the chat. Each point is the owner's position; the answer or decision follows …
- [Card types and the task lifecycle — the owner's vocabulary,…](/framework/ext/Refine/doc/card-types.md) — Recorded so the intent survives chat (CLAUDE.md, law 5). The owner dictated this in the Claude mobile app on 2026-10-16 while flipping thro…
- [Framework — everything it offers is organized, visual, brow…](/framework/readme.md) — ## Index - [live](/live/) — the owner's live voice-work feed (lives at public/live/, not in this folder) - [core](./core/) — the seven clas…
- [Finding past work before building (owner asks 1 to 3, 2026-…](/framework/ai/doc/owner-2026-10-17-finding-past-work.md) — What the owner asked, in plain words: work already done must be findable; the old prompts hold many asks that were never done; and before a…

## Sessions tagged with these words
- 2026/10/16 [Typing sentences](/framework/ai/sessions/2026/10/16/session-f8558e65/) — kind/owner model/haiku work/read-only dictation/clarity · $0.00
- 2026/10/16 [Typing sentences](/framework/ai/sessions/2026/10/16/session-f41b09a7/) — kind/owner model/haiku work/read-only dictation/clarity · $0.02
- 2026/10/16 [Second line typed](/framework/ai/sessions/2026/10/16/session-f38a887f/) — kind/owner model/haiku work/read-only dictation/clarity · $0.00
- 2026/10/16 [Second line typed](/framework/ai/sessions/2026/10/16/session-ecfd1667/) — kind/owner model/haiku work/read-only dictation/parse · $0.00
- 2026/10/16 [Dictate framework component](/framework/ai/sessions/2026/10/16/session-e99e8190/) — kind/owner model/sonnet work/read-only · $0.13
- 2026/10/16 [Kennedy inaugural address excerpt](/framework/ai/sessions/2026/10/16/session-e6df509c/) — kind/owner model/haiku work/read-only dictation/clarity · $0.00

## Owner asks
- 2026-09-30 Dictation: sheet shows the chat and mic; release the mic when hidden (minion-sheet-regression, building)
- 2026-09-30 Chat: reactions, threaded replies, assistant icons, M logo (minion-chat-reactions, building)
- 2026-09-30 Chat: reactions, threaded replies, assistant icons, M logo (minion-chat-reactions, landed)
- 2026-09-30 Inbox: priority 50+ only; Log everything; a priority filter; stalled asks readable (task-mastermind-inbox-ext, building)
- 2026-10-13 Dictation: sheet shows the chat and mic; release the mic when hidden (?, landed)

## Commits
- e6fb3fd1d session-gate: route session-spawned minions through a worktree + the merge gate; owner-check at landing

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 47,376 tokens of reading, under the 100k limit).

Question: Find the owner's dictated chat-well / mobile sheet instructions (read-only)

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Find the owner's dictated chat-well / mobile sheet instructions (read-only)"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
