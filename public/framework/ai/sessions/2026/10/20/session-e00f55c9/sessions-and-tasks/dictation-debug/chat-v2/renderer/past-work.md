<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Chat v2  step 1  the read only renderer" (words: chat, step, read, only, renderer)

## Tasks (8, best first)
- 2026-10-20 [Find the owner's dictated chat-well / mobile sheet instructions (read…](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/mobile-sheet/well-asks/) — (no outcome logged)
- 2026-10-25 [A child session is a task in its parent's record; recompute only what…](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/deputy/child-tasks/) — public/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/deputy/child-tasks/requirements.md
- 2026-10-01 [Mobile rail fullscreen chat: fixed the thread's leftover 22em cap](/framework/ai/sessions/2026/10/01/d32d9965-08f0-4c35-9c32-13763889a3b0/rail-fullscreen-textarea/) — Fixed the mobile rail's fullscreen chat void. The chat thread was capped at 22em (Widget.css), sized for a normal page; rail.css lifted that cap for the card in fullscreen, but not the thread one level deeper, so it stopped growing early. That left empty spac… · paths 2/2 exist
- 2026-10-01 [One widget: the demo and the sheet build the identical chat() call; a…](/framework/ai/sessions/2026/09/30/one-dictation/one-dictation/minion-onewidget/) — The Dictate page's demo and the ✦ sheet now build the exact same chat() call — only keep differs — and autosend after a pause is the only way a sentence goes out, everywhere. item 2, "one widget": ux/Dictate/page.js's demo_mount() is now chat($slot.el, {place… · paths 1/3 exist, gone: framework/ux/Dictate/doc/chat/ framework/ux/Dictate/doc/decisions/
- 2026-10-20 [Phone sheet: reconnects after a Servex restart, one layout that only …](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/mobile-sheet/) — The phone ✦ sheet reconnects after a Servex restart, and is one three-row layout at every height. Merged 3415f5018. | Before | After | |---|---| | ![](/framework/ux/Dictate/surfaces/sheet-steps/before/sheet-003.png) | ![](/framework/ux/Dictate/surfaces/sheet-… · paths 2/2 exist
- 2026-10-17 [Socket: a phone may run read-only queries, so Last landed and Waiting…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/mobile-socket/) — A LAN peer can now ask the socket for the task tree; commands are still refused. one list in [Socket.js](/framework/dev/Socket/): LAN_OK gains query, and LAN_QUERY names the only two sources a phone may ask (sessions, tasks); rule in [lan.md](/framework/dev/S… · paths 1/1 exist
- 2026-10-16 [Salvage: unmerged branch audit, dup-bubbles already on dev](/framework/ai/sessions/2026/10/16/voice-20261016/salvage/) — Audit done; nothing needed merging. [audit.md](/framework/ai/sessions/2026/10/16/voice-20261016/salvage/audit.md) Audit every branch: 422 checked, 239 fully merged, 183 ahead, 75 pure noise (listed, nothing deleted) Top 5 for a human look: page-extends-item, …
- 2026-10-14 [Voice chat can ask the mastermind: one tool, one token, a free tunnel](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/voice-connector/) — The Claude app can now call one tool, ask_mastermind, that reaches the mastermind (Servex/ext/remote/RemoteMCP.js, Server/Tunnel.mjs). Curl-tested: no token is refused, the tool list has one tool, a question round-trips, and through the tunnel every other pat… · paths 0/1 exist, gone: framework/ux/Dictate/doc/voice-bridge

## Modules that exist now (files outside the module that import it)
- [ext/Chat](/framework/ext/Chat/) — used by 10 files

## Docs and readmes
- [The ai section — a chat is a task](/framework/dev/DevBar/doc/threads.md) — <page>ai/<slug>/task.jsonl A thread is a directory next to the page it's about, holding the same task.jsonl [ext/JSONL](/framework/ext/JSON…
- [Chat — a scrolling chat log, composer, and conversation wid…](/framework/ext/Chat/readme.md) — Follows new messages while scrolled to bottom, formats Markdown bubbles with avatar icons, and supports threading and reactions. ## Use js …
- [Push-to-talk stream — Discord-style, local only](/framework/audio/v1/push-to-talk/readme.md) — PushToTalk opens a MicStream while its button (or Space) is held, and hands the raw MediaStream to whoever is listening through on_start(st…
- [Dev — the local-only tier: live reload, the DevBar rail, ta…](/framework/dev/readme.md) — ## Index [Claim](./Claim/) — a ring and label around a browser tab an agent has claimed, so you can see which tab is theirs [DevBar](./DevB…
- [JSONL — append-only .jsonl logs the AI blindly appends to, …](/framework/ext/JSONL/readme.md) — > Converge: how a .jsonl is written, read and indexed is one system: [core/Page/doc/jsonl.md](/framework/core/Page/doc/jsonl.md) ("The stor…
- [Start — three files, no build step, a working site.](/framework/start/readme.md) — ## Index [example](./example/) — the smallest working site: index.html, app.js and a page.js, plus an About child (no readme yet) Code: sta…
- [Chat](/framework/styles/layouts/chat/readme.md) — Conversation list, transcript, composer. Code: styles/layouts/chat/page.js _Stub — more to come._
- [Crumbs — a trail of links above a page, CSS only](/framework/ui/crumbs/readme.md) — One rule (.ui-crumbs a { text-decoration: none }) dresses the trail template drawn in page.js. There is no ui.crumbs() function — a hand-ty…

## Sessions tagged with these words
- 2026/10/16 [Typing sentences](/framework/ai/sessions/2026/10/16/session-f8558e65/) — kind/owner model/haiku work/read-only dictation/clarity · $0.00
- 2026/10/16 [Typing sentences](/framework/ai/sessions/2026/10/16/session-f41b09a7/) — kind/owner model/haiku work/read-only dictation/clarity · $0.02
- 2026/10/16 [Second line typed](/framework/ai/sessions/2026/10/16/session-f38a887f/) — kind/owner model/haiku work/read-only dictation/clarity · $0.00
- 2026/10/16 [Second line typed](/framework/ai/sessions/2026/10/16/session-ecfd1667/) — kind/owner model/haiku work/read-only dictation/parse · $0.00
- 2026/10/16 [Dictate framework component](/framework/ai/sessions/2026/10/16/session-e99e8190/) — kind/owner model/sonnet work/read-only · $0.13
- 2026/10/16 [Kennedy inaugural address excerpt](/framework/ai/sessions/2026/10/16/session-e6df509c/) — kind/owner model/haiku work/read-only dictation/clarity · $0.00

## Owner asks
- 2026-09-30 Chat: reactions, threaded replies, assistant icons, M logo (minion-chat-reactions, building)
- 2026-09-30 Chat: reactions, threaded replies, assistant icons, M logo (minion-chat-reactions, landed)
- 2026-09-30 Inbox: priority 50+ only; Log everything; a priority filter; stalled asks readable (task-mastermind-inbox-ext, building)
- 2026-09-30 AI 2: Inbox read/unread, archive, auto-resolve, search; Needs you hidden (task-mastermind-ai2-inbox-read, building)
- 2026-09-30 AI 2: Inbox read/unread, archive, auto-resolve, search; Needs you hidden (task-mastermind-ai2-inbox-read, landed)

## Commits
- 88765fcf9 sheet step 10: the dictation redesign, mocks first
- 9e947fcd7 sheet step 8: page hand-off from the global chat
- d19f42815 sheet step 7: the live space, class AIFeed extends View
- 50c45e71b sheet step 5: the route <path>/ai/, class AIPage extends Page

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 43,853 tokens of reading, under the 100k limit).

Question: Chat v2, step 1: the read-only renderer

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Chat v2, step 1: the read-only renderer"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
