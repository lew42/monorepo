<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Dictation  Reconnect that says what it does  refresh then dictate works  every error caught  a compact Debug tab" (words: dictation, reconnect, say, do, refresh, then, dictate, work, every, error, caught, compact, debug, tab)

## Tasks (8, best first)
- 2026-10-25 [Dictation: Debug tab, stalls fixed, no flicker](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/dictation-debug/) — Website dictation: a Debug tab, both stalls fixed, no flicker. Merged to michael/dev (146e37c73, then the flicker branch). Debug tab, routed at <page>/ai/debug/, five live rows with real errors: ![](flicker/shots/polish-debug-390.png) Stall fixed: 1 send in 2…
- 2026-10-24 [Dictation: Debug tab, and the stall found and fixed](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/dictation-debug/build/) — Ready to merge: branch worktree/dictation-debug (6 commits). [Report](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/dictation-debug/build/report.md) · [doc](/framework/ux/Dictate/doc/debug-tab.md) - ✅ The stall: one unanswered send blo… · paths 0/1 exist, gone: framework/ext/drawer/ai/debug/
- 2026-10-19 [Documentation: every main system's readme states its structure and ho…](/framework/ai/sessions/2026/10/19/cloud-voice-live-page/docs/) — Readmes now state structure and function. Every main system's readme states its structure and how it works: ai, ai/sessions, ai/tasks, AITask, Inbox, core/Page, Servex rewritten (framework/readme.md indexes them). No history in them: old text moved to doc/rea…
- 2026-10-09 [Refine and Dictate: one compact VoiceStrip, voice class map, phone an…](/framework/ai/sessions/2026/10/09/session-48083d9d/refine-dictate-ui/) — Phases 1 and 2 landed (2e237e3f8): one compact dictation panel, [VoiceStrip](/framework/ux/Dictate/VoiceStrip.js), now serves Refine and the Dictate demo. class architecture first: [voice-architecture](/framework/ux/Dictate/md/doc/voice-architecture/) one com… · paths 1/3 exist, gone: framework/ux/Dictate/md/doc/voice-architecture/ framework/ux/Dictate/md/doc/mobile-socket-2026-10-09/
- 2026-10-02 [inspect(): class cards for every object, then the Dictate playground …](/framework/ai/sessions/2026/10/02/bc9e77bd-9e53-4c08-99c7-0346f2f0f5d1/inspect/) — Both parts landed. every class gets an icon + a debug inspect() card: [Inspect.js](/framework/ux/Content/Object/Inspect.js), live on [ux/Content/Object](/framework/ux/Content/Object/) Dictate's data becomes real classes: [objects.js](/framework/ux/Dictate/pla… · paths 4/4 exist
- 2026-10-01 [The Dictate page becomes the workbench: chat() demo, keep option, int…](/framework/ai/sessions/2026/09/30/one-dictation/one-dictation/minion-workbench/) — The main Dictate demo is now a real, answered chat() mount — the same call every surface uses. item 1 — demo is a chat() mount, Widget options (level/source/debug) pass through: shot dictate-demo-1920.png item 2 — keep option added (true = global ✦ session, f… · paths 1/2 exist, gone: framework/ux/Dictate/doc/chat/
- 2026-10-01 [Dictate page: the workbench chat, answered, with modes](/framework/ai/sessions/2026/09/30/one-dictation/one-dictation/) — The Dictate page's demo is the one chat every sidebar uses, now answered. [Open it](/framework/ux/Dictate/). ![](shots/followup-modes-1920.png) live guess no longer covers text; box full width, Send below: [shot](shots/followup-join-400.png) someone listens (… · paths 1/2 exist, gone: framework/ux/Dictate/doc/chat/
- 2026-10-02 [AI system docs: the System tab now explains the whole thing](/framework/ai/sessions/2026/10/02/4245afbf-7cda-45b9-9883-e6a7942c9874/ai-system-docs/) — The [System tab](/framework/ai/system/) now answers the owner's mobile ask: a page that explains the whole AI system. the map: already live, verified how data is written, checked or not: [Data: how it's written](/framework/ai/system/data/) how a page saves: [… · paths 1/3 exist, gone: framework/ai/system/data/ framework/ai/system/saving/

## Modules that exist now (files outside the module that import it)
- [core/doc](/framework/core/doc/) — used by 0 files, no readme
- [ext/CSSDoc](/framework/ext/CSSDoc/) — used by 2 files
- [ext/Doc](/framework/ext/Doc/) — used by 21 files
- [ext/Dropdown](/framework/ext/Dropdown/) — used by 6 files
- [ext/ErrorLog](/framework/ext/ErrorLog/) — used by 5 files
- [ext/markdown](/framework/ext/markdown/) — used by 55 files

## Docs and readmes
- [The Debug tab — dictation, layer by layer, and why it used …](/framework/ux/Dictate/doc/debug-tab.md) — What it is. A tab in the drawer and the phone sheet (it replaced the old Dictation tab, 2026-10-24) that shows, live, each step a spoken se…
- [Dictation map — every piece, where it lives, and what to do…](/framework/ux/Dictate/doc/map.md) — What this is: one page that finds any piece of the dictation system in one click: the mic, Whisper, the cleaners, the chat box, the voice s…
- [Prior work — every piece of layout and paging work found, i…](/framework/core/Page/layout/doc/prior-work.md) — Three read-only surveys went through /imagine/ and /layouts/, through framework/, and through two months of task logs (2026-09-29). This is…
- [chat.js — one chat box, one conversation, every surface](/framework/ux/Dictate/doc/chat.md) — Before this file, every place that showed a chat box on the site — the mobile ✦ sheet, the desktop ☰ drawer's AI tab, a card's own sidebar,…
- [Decisions — every choice, with the alternatives it was chos…](/framework/ai/AITask/doc/decisions-tab.md) — A worker makes dozens of choices an hour and the owner sees none of them. They see the result, they say "that's not what I wanted", and nob…
- [The Whisper demo: every reply from the speech server, as it…](/framework/audio/Whisper/doc/demo.md) — The demo at the top of the [Whisper page](/framework/audio/Whisper/) shows each answer whisper-server sends back, one row per answer, newes…
- [The open-work line: every page says what is being worked on](/framework/core/Page/ai/doc/page-work-line.md) — What you see: under a page, one line, 2 open tasks on this page · 1 below. Click it for the task links. A page with no open work shows noth…
- [The Inbox tab: every page has one, unread first, archive to…](/framework/core/Page/doc/inbox-tab.md) — Ask (the owner, 2026-10-12): "Every core thing, every module should have an inbox ... a secondary tab ... read it, then archive or clear it…

## Sessions tagged with these words
- 2026/10/16 [Typing sentences](/framework/ai/sessions/2026/10/16/session-f8558e65/) — kind/owner model/haiku work/read-only dictation/clarity · $0.00
- 2026/10/16 [Typing sentences](/framework/ai/sessions/2026/10/16/session-f41b09a7/) — kind/owner model/haiku work/read-only dictation/clarity · $0.02
- 2026/10/16 [Second line typed](/framework/ai/sessions/2026/10/16/session-f38a887f/) — kind/owner model/haiku work/read-only dictation/clarity · $0.00
- 2026/10/16 [Second line typed](/framework/ai/sessions/2026/10/16/session-ecfd1667/) — kind/owner model/haiku work/read-only dictation/parse · $0.00
- 2026/10/16 [Kennedy inaugural address excerpt](/framework/ai/sessions/2026/10/16/session-e6df509c/) — kind/owner model/haiku work/read-only dictation/clarity · $0.00
- 2026/10/16 [Second line typed](/framework/ai/sessions/2026/10/16/session-e39150d7/) — kind/owner model/haiku work/read-only dictation/parse · $0.00

## Owner asks
- 2026-09-30 Memory: dormant idle agents, working cap, auto-compaction (task-mastermind-dormant-idle, building)
- 2026-09-30 Memory: dormant idle agents, working cap, auto-compaction (task-mastermind-dormant-idle, landed)
- 2026-10-13 Memory: dormant idle agents, working cap, auto-compaction (?, landed)
- 2026-09-30 Worktrees: remove merged ones; Servex drops their subdomains (task-mastermind-dormant-idle, building)
- 2026-09-30 Dictation: ONE system everywhere (rail, sidebar, drawer, card) on the fast/smart pair; ol… (task-mastermind-one-dictation, building)

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 43,806 tokens of reading, under the 100k limit).

Question: Dictation: Reconnect that says what it does, refresh-then-dictate works, every error caught, a compact Debug tab

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Dictation: Reconnect that says what it does, refresh-then-dictate works, every error caught, a compact Debug tab"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
