<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Dictate  a Docs tab on the dictation sheet  Part 7 7 " (words: dictate, doc, tab, dictation, sheet, part)

## Tasks (8, best first)
- 2026-10-25 [Dictation: Debug tab, stalls fixed, no flicker](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/dictation-debug/) — Website dictation: a Debug tab, both stalls fixed, no flicker. Merged to michael/dev (146e37c73, then the flicker branch). Debug tab, routed at <page>/ai/debug/, five live rows with real errors: ![](flicker/shots/polish-debug-390.png) Stall fixed: 1 send in 2…
- 2026-10-24 [Dictation: Debug tab, and the stall found and fixed](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/dictation-debug/build/) — Ready to merge: branch worktree/dictation-debug (6 commits). [Report](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/dictation-debug/build/report.md) · [doc](/framework/ux/Dictate/doc/debug-tab.md) - ✅ The stall: one unanswered send blo… · paths 0/1 exist, gone: framework/ext/drawer/ai/debug/
- 2026-10-15 [Dictation: fast is silent, smart replies in 6.8 s cold, no task from …](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/dictate-next-4/) — Merged c2a9dfea6. Fast replied to 0 of 8 unaddressed sentences (was 4); smart cold first reply 46 s to 6.8 s, context 68k to 44k (not half; 6 s target missed by 0.8 s); a statement spawned 0 task-masterminds. Inbox 404, stale Mic line and a 60% sheet fixed. R…
- 2026-10-13 [ext/drawer: the phone sheet's full state is the sidebar's tabs](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/dictate-sheet/) — The sheet's full state mounts the drawer tab row and body under the chat; mic keeps listening; mic-proof passes; merged 6441b0642 (change 4cb0adf91). 400 px shots only; 1200/1920/3440 layout-check not run.
- 2026-10-13 [Dictation: New session really starts fresh, walked on phone and deskt…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/voice-e2e-review/) — The dictation flow, walked on the phone and the desktop drawer: New session now really starts a new conversation. [Report](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/voice-e2e-review/review.md) ![](/framework/ai/sessions/2026/10/1… · paths 1/1 exist
- 2026-10-09 [core/Page: agents add tabs to any page live; docs cleaned](/framework/ai/sessions/2026/10/09/session-060cdfff/page-mastermind/) — Agents can now reshape any page live: add a tab, change its layout, all without a reload. a delta adds a tab and changes layout: [the tool page](/framework/core/Page/tool/) a session's page.jsonl renders live on its template: [demo shot](/framework/ai/2026-10… · paths 1/1 exist
- 2026-10-04 [Doc header: mobile tab row scrolls instead of wrapping](/framework/ai/sessions/2026/10/05/mobile-doc-header/mobile-doc-header/) — Under ~600px the Doc page header is ~30% shorter. The tab row now scrolls sideways on one line instead of wrapping to a 2nd/3rd row below the title. title stacks above a full-width, one-line, side-scrolling tab row — CSS only, same markup: public/framework/ex… · paths 4/4 exist
- 2026-10-02 [AI system docs: the System tab now explains the whole thing](/framework/ai/sessions/2026/10/02/4245afbf-7cda-45b9-9883-e6a7942c9874/ai-system-docs/) — The [System tab](/framework/ai/system/) now answers the owner's mobile ask: a page that explains the whole AI system. the map: already live, verified how data is written, checked or not: [Data: how it's written](/framework/ai/system/data/) how a page saves: [… · paths 1/3 exist, gone: framework/ai/system/data/ framework/ai/system/saving/

## Modules that exist now (files outside the module that import it)
- [core/doc](/framework/core/doc/) — used by 0 files, no readme
- [ext/CSSDoc](/framework/ext/CSSDoc/) — used by 2 files
- [ext/Doc](/framework/ext/Doc/) — used by 21 files
- [ext/tabs](/framework/ext/tabs/) — used by 37 files
- [ui/doc](/framework/ui/doc/) — used by 5 files, no readme
- [ui/table](/framework/ui/table/) — used by 9 files

## Docs and readmes
- [The Debug tab — dictation, stage by stage: a row of lights …](/framework/ux/Dictate/doc/debug-tab.md) — What it is. A tab in the drawer and the phone sheet that shows, live, each stage a spoken sentence passes through. At the top, one light pe…
- [Next: make the phone sheet the sidebar's collapsed form (br…](/framework/ux/Dictate/doc/next.md) — Owner's design: on mobile a small sheet holds only the transcribe button and the text area, resizable; expanded, it becomes the whole sideb…
- [Dictate architecture — two engines, one stream, live partia…](/framework/ux/Dictate/doc/architecture.md) — [Dictate.js](../Dictate.js) is the main class, extending [View](/framework/core/View/). It opens a microphone, captures audio, sends segmen…
- [Dictation first: the owner's direction, 2026-10-20 (19:00)](/framework/ux/Dictate/doc/owner-2026-10-20-dictation-first.md) — Recorded so the intent survives chat (CLAUDE.md, law 5). Words: the VS Code tab's prompt log (ai/2026/10/20/session-e00f55c9/page.jsonl, th…
- [Widget — the one dictation widget, configured](/framework/ux/Dictate/doc/widget.md) — Widget.js is the ✦ sheet's own compact widget (a framed card: bubbles on top, a composer row — typed box, mic, Send — at the bottom) pulled…
- [Owner notes, 2026-10-16 (night): the mobile sheet, the draw…](/framework/ext/drawer/doc/owner-2026-10-16-sheet.md) — A big surgery. A mastermind manages it, a worktree tests it, and the owner approves each step before it is built. Slow and methodical; mock…
- [chat.js — one chat box, one conversation, every surface](/framework/ux/Dictate/doc/chat.md) — Before this file, every place that showed a chat box on the site — the mobile ✦ sheet, the desktop ☰ drawer's AI tab, a card's own sidebar,…
- [Dictation map — every piece, where it lives, and what to do…](/framework/ux/Dictate/doc/map.md) — What this is: one page that finds any piece of the dictation system in one click: the mic, Whisper, the cleaners, the chat box, the voice s…

## Sessions tagged with these words
- 2026/10/13 [ext/tabs architecture documentation](/framework/ai/sessions/2026/10/13/session-f9024369/) — kind/agent model/haiku mod/ext/tabs task/mastermind-repo-slim docs/architecture · $0.21
- 2026/10/13 [Minion arch table](/framework/ai/sessions/2026/10/13/session-0c0416a5/) — kind/agent model/haiku mod/ui/table task/mastermind-repo-slim docs/architecture · $0.18
- 2026/10/16 [Typing sentences](/framework/ai/sessions/2026/10/16/session-f8558e65/) — kind/owner model/haiku work/read-only dictation/clarity · $0.00
- 2026/10/16 [Typing sentences](/framework/ai/sessions/2026/10/16/session-f41b09a7/) — kind/owner model/haiku work/read-only dictation/clarity · $0.02
- 2026/10/16 [Second line typed](/framework/ai/sessions/2026/10/16/session-f38a887f/) — kind/owner model/haiku work/read-only dictation/clarity · $0.00
- 2026/10/16 [Second line typed](/framework/ai/sessions/2026/10/16/session-ecfd1667/) — kind/owner model/haiku work/read-only dictation/parse · $0.00

## Owner asks
- 2026-09-30 Dictation: sheet shows the chat and mic; release the mic when hidden (minion-sheet-regression, building)
- 2026-10-02 AI system docs: the System tab now explains the whole thing (task-mastermind-ai-system-docs, landed)
- 2026-10-13 Dictation: sheet shows the chat and mic; release the mic when hidden (?, landed)
- 2026-09-30 Servex docs: the agent system as flowcharts (task-mastermind-servex-docs, routed)
- 2026-09-30 Servex docs: the agent system as flowcharts (task-mastermind-servex-docs, dropped)

## Commits
- 92ba4d3c8 dictation doc: why not dictate into a VS Code tab (path stopped 2026-10-24)
- 50c45e71b sheet step 5: the route <path>/ai/, class AIPage extends Page
- 91907fb53 Dictate.js file doc (the Files tab looked for it and 404'd)
- f489ba9c1 Dictate docs: sheet full state is the sidebar's tabs
- 129c69a08 dev/mobile: new page documenting phone access and the mic/HTTPS gap
- d0c6b6691 one-dictation: the fast assistant refines each owner utterance, live, with its cost
- 2ef2f5a3c drawer-chat round 2: the composer is one real panel, not a box in a box
- e0ca27f80 Fix round 2, Part X follow-up: refresh_nav() must reveal(), or a cold load's own rail expansion gets erased

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 43,853 tokens of reading, under the 100k limit).

Question: Dictate: a Docs tab on the dictation sheet (Part 7.7)

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Dictate: a Docs tab on the dictation sheet (Part 7.7)"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
