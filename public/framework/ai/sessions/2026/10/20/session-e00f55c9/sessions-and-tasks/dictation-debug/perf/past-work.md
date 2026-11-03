<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Dictation  open the sheet in under half a second and stop the freezes" (words: dictation, open, sheet, under, half, second, stop, freez)

## Tasks (8, best first)
- 2026-10-01 [✦ sheet: closing it no longer stops the mic](/framework/ai/sessions/2026/10/01/sheet-close-keep-mic/sheet-close-keep-mic/) — What landed: closing the ✦ sheet now leaves the mic running, as asked. auto-start mic on open — unchanged closing the sheet (✕, drag down, phone back) no longer stops the mic — its own hide() was calling stop_mic() on every close; that was the whole bug, not … · paths 2/3 exist, gone: framework/ext/drawer/doc/sheet/
- 2026-10-25 [Dictation: Debug tab, stalls fixed, no flicker](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/dictation-debug/) — Website dictation: a Debug tab, both stalls fixed, no flicker. Merged to michael/dev (146e37c73, then the flicker branch). Debug tab, routed at <page>/ai/debug/, five live rows with real errors: ![](flicker/shots/polish-debug-390.png) Stall fixed: 1 send in 2…
- 2026-10-24 [Dictation: Debug tab, and the stall found and fixed](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/dictation-debug/build/) — Ready to merge: branch worktree/dictation-debug (6 commits). [Report](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/dictation-debug/build/report.md) · [doc](/framework/ux/Dictate/doc/debug-tab.md) - ✅ The stall: one unanswered send blo… · paths 0/1 exist, gone: framework/ext/drawer/ai/debug/
- 2026-10-20 [Phone sheet: reconnects after a Servex restart, one layout that only …](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/mobile-sheet/) — The phone ✦ sheet reconnects after a Servex restart, and is one three-row layout at every height. Merged 3415f5018. | Before | After | |---|---| | ![](/framework/ux/Dictate/surfaces/sheet-steps/before/sheet-003.png) | ![](/framework/ux/Dictate/surfaces/sheet-… · paths 2/2 exist
- 2026-10-17 [Phone sheet: one big mic that says its state, a Type button, no Send](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/sheet-controls/) — The phone sheet has the fewer-controls dictation bar. One big mic whose word is the engine's state, a Type button, no Send. [The bar](/framework/ux/Dictate/doc/refine-dictate-tasks.md) · [Dictate](/framework/ux/Dictate/) big mic says its state: DictationBar, … · paths 1/1 exist
- 2026-10-16 [AI sheet checkup: route decided, steps 2 to 4 merged, 5 to 10 queued](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/checkup-sheet/) — The AI sheet is routed at <path>/ai/ (decision d-sheet-route), recorded with its two alternatives in ext/drawer's owner doc; the layout pick (A's short head, E's live feed, A's strip) stands. Steps 2 to 4 are merged on dev, one commit each: Sheet.Panel is one…
- 2026-10-16 [Sheet: rail.js renamed to class Sheet; audit and proposal posted](/framework/ai/sessions/2026/10/16/voice-20261016/sheet/) — The phone sheet is now one class, Sheet ([ext/drawer/Sheet.js](/framework/ext/drawer/)), merged as 41c9607e7 and checked on the live site (✦ opens, ✕ closes, the desktop ☰ opens the AI tab). The audit found that one ☰ icon means navigation on a phone and AI o… · paths 1/1 exist
- 2026-10-15 [Dictation: fast is silent, smart replies in 6.8 s cold, no task from …](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/dictate-next-4/) — Merged c2a9dfea6. Fast replied to 0 of 8 unaddressed sentences (was 4); smart cold first reply 46 s to 6.8 s, context 68k to 44k (not half; 6 s target missed by 0.8 s); a statement spawned 0 task-masterminds. Inbox 404, stale Mic line and a 60% sheet fixed. R…

## Modules that exist now (files outside the module that import it)
- [ux/Understand](/framework/ux/Understand/) — used by 2 files

## Docs and readmes
- [The Debug tab — dictation, stage by stage: a row of lights …](/framework/ux/Dictate/doc/debug-tab.md) — What it is. A tab in the drawer and the phone sheet that shows, live, each stage a spoken sentence passes through. At the top, one light pe…
- [Dictation, per page](/framework/core/Page/ai/doc/dictation.md) — The microphone lives in the drawer — [ext/drawer](/framework/ext/drawer/) — the same component on every page, opened with the same ☰ button…
- [The open-work line: every page says what is being worked on](/framework/core/Page/ai/doc/page-work-line.md) — What you see: under a page, one line, 2 open tasks on this page · 1 below. Click it for the task links. A page with no open work shows noth…
- [The ✦ sheet is a page](/framework/ext/drawer/doc/sheet.md) — On a phone, the ✦ sheet can be dragged from part of the screen up to all of it. At the top it stops being a panel over the page and becomes…
- [Accordion — one panel open at a time, with no JS: native <d…](/framework/ui/accordion/readme.md) — ## Use js details.c("ui-accordion-item pad", () => { summary(question); p.c("muted", answer); }).attr("name", "faq") // the shared name is …
- [Dictation playground — decisions](/framework/ux/Dictate/playground/doc/decisions.md) — Landed 2026-09-28. Task log: [ai/sessions/2026/09/28/ccdca679-303e-4584-9809-8c4f79e29f42/dictation-playground/playground/](/framework/ai/s…
- [AITask — the AI working log, rendered: one task's page, a d…](/framework/ai/AITask/doc/readme-before-2026-10-19.md) — ## Use - Moved verbatim to [doc/api.md](./doc/api.md): the API. - The Session tab is a chat: talk in the stream, every tool call folded to …
- [Asks about cards: 2 open, 0 done](/framework/ai/cards/doc/refined-asks.md) — Generated by node Server/AskIndex.mjs from the refined asks in each session's asks.jsonl; never hand-edited. Newest first. Open ones are al…

## Sessions tagged with these words
- 2026/10/16 [Typing sentences](/framework/ai/sessions/2026/10/16/session-f8558e65/) — kind/owner model/haiku work/read-only dictation/clarity · $0.00
- 2026/10/16 [Typing sentences](/framework/ai/sessions/2026/10/16/session-f41b09a7/) — kind/owner model/haiku work/read-only dictation/clarity · $0.02
- 2026/10/16 [Second line typed](/framework/ai/sessions/2026/10/16/session-f38a887f/) — kind/owner model/haiku work/read-only dictation/clarity · $0.00
- 2026/10/16 [Second line typed](/framework/ai/sessions/2026/10/16/session-ecfd1667/) — kind/owner model/haiku work/read-only dictation/parse · $0.00
- 2026/10/16 [Kennedy inaugural address excerpt](/framework/ai/sessions/2026/10/16/session-e6df509c/) — kind/owner model/haiku work/read-only dictation/clarity · $0.00
- 2026/10/16 [Second line typed](/framework/ai/sessions/2026/10/16/session-e39150d7/) — kind/owner model/haiku work/read-only dictation/parse · $0.00

## Owner asks
- 2026-09-30 Dictation: sheet shows the chat and mic; release the mic when hidden (minion-sheet-regression, building)
- 2026-10-13 Dictation: sheet shows the chat and mic; release the mic when hidden (?, landed)
- 2026-09-30 Dictation: ONE system everywhere (rail, sidebar, drawer, card) on the fast/smart pair; ol… (task-mastermind-one-dictation, building)
- 2026-09-30 Dictation: one configurable widget everywhere; widget first on the page (task-mastermind-audio-consolidate, building)
- 2026-09-30 Dictation: ONE system everywhere (rail, sidebar, drawer, card) on the fast/smart pair; ol… (task-mastermind-audio-consolidate, building)

## Commits
- 980704586 dictation-flicker polish 2: the old 'dictation' name is mapped once, in AIPage.old_link (ALIASES), before the…
- 50c45e71b sheet step 5: the route <path>/ai/, class AIPage extends Page
- 8b4aff881 one-dictation: re-review round 2 (findings 3,4,6,7 of e7d08a93's review)
- d0c6b6691 one-dictation: the fast assistant refines each owner utterance, live, with its cost
- b56663d8d one-dictation/minion-core: fix the nav-before-push ordering bug behind the duplicated-lines/wrong-page bug, r…
- e755e229d Phone sheet: collapse to one line instead of closing on a low drag
- 855b21a42 Live card fold: mount the one global chat() instead of its own old assistant
- 8d499717b Mobile bottom rail: ✦ AI listening sheet, ☰ reaches the drawer's tabs

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 43,853 tokens of reading, under the 100k limit).

Question: Dictation: open the sheet in under half a second and stop the freezes

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Dictation: open the sheet in under half a second and stop the freezes"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
