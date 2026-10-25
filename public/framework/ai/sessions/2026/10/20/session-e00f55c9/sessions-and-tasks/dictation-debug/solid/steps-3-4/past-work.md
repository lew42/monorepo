<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Dictation steps 3 and 4  every error caught  and a compact Debug tab" (words: dictation, step, every, error, caught, compact, debug, tab)

## Tasks (8, best first)
- 2026-10-25 [Dictation: Debug tab, stalls fixed, no flicker](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/dictation-debug/) — Website dictation: a Debug tab, both stalls fixed, no flicker. Merged to michael/dev (146e37c73, then the flicker branch). Debug tab, routed at <page>/ai/debug/, five live rows with real errors: ![](flicker/shots/polish-debug-390.png) Stall fixed: 1 send in 2…
- 2026-10-24 [Dictation: Debug tab, and the stall found and fixed](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/dictation-debug/build/) — Ready to merge: branch worktree/dictation-debug (6 commits). [Report](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/dictation-debug/build/report.md) · [doc](/framework/ux/Dictate/doc/debug-tab.md) - ✅ The stall: one unanswered send blo… · paths 0/1 exist, gone: framework/ext/drawer/ai/debug/
- 2026-10-25 [tab](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/dictation-debug/chat-v2/tab/) — Chat v2 chip on the session page — c125eb18e on michael/dev. - ✅ Chat tab has Chat / Chat v2 chips; ?chat_view=v2 keeps the choice ([try it](/framework/ai/sessions/2026/10/20/session-e00f55c9/?tab=chat&chat_view=v2)) - ✅ v1 stays the default until the owner h…
- 2026-10-19 [AI page layout: compact toolbar, no scroll-in-scroll, Tasks tab](/framework/ai/sessions/2026/10/19/cloud-voice-live-page/tasks-layout/) — Merged to michael/dev. Chips are one sideways-scrolling line; Waiting on you is a plain section (45vh box off, AI page only); phone is one page scroll with one-line tabs; Tasks tab added. 7 past asks recorded in ai/doc/dashboard-layout-asks.md and linked from…
- 2026-10-13 [Landing nag, next-step wake, role compaction](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/landing-nag/) — Agents.js sends one landing nag per merged-unlanded task mastermind; wake_parent adds Next: sibling brief; roles.js compact_after. 14/14 stub proof; committed bb0c1bc10 (main tree). Live Servex needs the mastermind restart.
- 2026-10-12 [Page inbox: an Inbox tab on every page](/framework/ai/sessions/2026/10/12/session-87bec773/page-inbox/) — Every page has an inbox, unread first, archive to zero. [Doc](/framework/core/Page/doc/inbox-tab.md) opt-out on Page: Inbox tab on Doc pages (DataGrid), inbox/ route + unread chip on Page and Sessions appended deltas in page.jsonl, streamed live; Archive/read…
- 2026-09-30 [Layout map: every page-layout API, its DOM marker, and the AI 2 right…](/framework/ai/sessions/2026/09/30/page-audit/page-audit/layout-map/) — Mapped every page layout to its code in [layouts.md](./layouts.md) ([layouts.json](./layouts.json) has the raw data). Doc top-tabs: ext/Doc/Doc.js, 74 pages, tabs sit beside the title Columns: page.columns(), 42 pages Switcher (left nav): ext/tabs/switcher.js… · paths 1/1 exist
- 2026-09-29 [Dictation to brief: refine.mjs, coverage audit, and an honest check o…](/framework/ai/sessions/2026/09/29/a918d03d-6afe-4958-b425-20e9eba998ef/prompt-refine/) — Server/refine.mjs turns a dictation into clean, structured and brief rungs, traces every sentence you said, and repairs what it drops. It is on the card beside an audit of the VS Code tab. Over budget: $47 against $10. ![run C, ask 1 clicked: its source light… · paths 1/2 exist, gone: framework/ai2/2026/09/29/from-dictation-to-a-brief-with-nothing-l/

## Modules that exist now (files outside the module that import it)
- [ext/ErrorLog](/framework/ext/ErrorLog/) — used by 5 files
- [ext/tabs](/framework/ext/tabs/) — used by 37 files
- [ui/table](/framework/ui/table/) — used by 9 files

## Docs and readmes
- [The Debug tab — dictation, layer by layer, and why it used …](/framework/ux/Dictate/doc/debug-tab.md) — What it is. A tab in the drawer and the phone sheet (it replaced the old Dictation tab, 2026-10-24) that shows, live, each step a spoken se…
- [The Inbox tab: every page has one, unread first, archive to…](/framework/core/Page/doc/inbox-tab.md) — Ask (the owner, 2026-10-12): "Every core thing, every module should have an inbox ... a secondary tab ... read it, then archive or clear it…
- [DataGrid — one grid for every list of records: a table or a…](/framework/ext/DataGrid/readme.md) — Resize, sort, filter, windowing, and two drawers. The markup that used to be ui/datagrid and ui/table lives here now (those two files re-ex…
- [Config words — ui-contrast and ui-compact, two classes that…](/framework/ui/words/readme.md) — A config word is a class you put on a section, never on a component: it sets custom properties, and every template inside is already readin…
- [Prior work — every piece of layout and paging work found, i…](/framework/core/Page/layout/doc/prior-work.md) — Three read-only surveys went through /imagine/ and /layouts/, through framework/, and through two months of task logs (2026-09-29). This is…
- [Tabs — a bar of links and the panel its children mount into…](/framework/ext/tabs/readme.md) — ## Use js import "/framework/ext/tabs/tabs.js"; // once, anywhere — app.js already does content(){ this.tabs("guide api"); } // children by…
- [Dictation map — every piece, where it lives, and what to do…](/framework/ux/Dictate/doc/map.md) — What this is: one page that finds any piece of the dictation system in one click: the mic, Whisper, the cleaners, the chat box, the voice s…
- [Decisions — every choice, with the alternatives it was chos…](/framework/ai/AITask/doc/decisions-tab.md) — A worker makes dozens of choices an hour and the owner sees none of them. They see the result, they say "that's not what I wanted", and nob…

## Sessions tagged with these words
- 2026/10/16 [Typing sentences](/framework/ai/sessions/2026/10/16/session-f8558e65/) — kind/owner model/haiku work/read-only dictation/clarity · $0.00
- 2026/10/16 [Typing sentences](/framework/ai/sessions/2026/10/16/session-f41b09a7/) — kind/owner model/haiku work/read-only dictation/clarity · $0.02
- 2026/10/16 [Second line typed](/framework/ai/sessions/2026/10/16/session-f38a887f/) — kind/owner model/haiku work/read-only dictation/clarity · $0.00
- 2026/10/16 [Second line typed](/framework/ai/sessions/2026/10/16/session-ecfd1667/) — kind/owner model/haiku work/read-only dictation/parse · $0.00
- 2026/10/16 [Kennedy inaugural address excerpt](/framework/ai/sessions/2026/10/16/session-e6df509c/) — kind/owner model/haiku work/read-only dictation/clarity · $0.00
- 2026/10/16 [Second line typed](/framework/ai/sessions/2026/10/16/session-e39150d7/) — kind/owner model/haiku work/read-only dictation/parse · $0.00

## Owner asks
- 2026-09-30 Dictation: ONE system everywhere (rail, sidebar, drawer, card) on the fast/smart pair; ol… (task-mastermind-one-dictation, building)
- 2026-09-30 Dictation: one configurable widget everywhere; widget first on the page (task-mastermind-audio-consolidate, building)
- 2026-09-30 Dictation: ONE system everywhere (rail, sidebar, drawer, card) on the fast/smart pair; ol… (task-mastermind-audio-consolidate, building)
- 2026-09-30 Dictation: ONE system everywhere (rail, sidebar, drawer, card) on the fast/smart pair; ol… (task-mastermind-audio-consolidate (restart at 4:50 PM), queued)
- 2026-09-30 Dictation: one configurable widget everywhere; widget first on the page (task-mastermind-audio-consolidate (restart at 4:50 PM), queued)

## Commits
- 8d499717b Mobile bottom rail: ✦ AI listening sheet, ☰ reaches the drawer's tabs

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 43,853 tokens of reading, under the 100k limit).

Question: Dictation steps 3 and 4: every error caught, and a compact Debug tab

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Dictation steps 3 and 4: every error caught, and a compact Debug tab"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
