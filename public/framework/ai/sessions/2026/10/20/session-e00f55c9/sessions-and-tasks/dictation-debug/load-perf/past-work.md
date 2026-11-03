<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Dictation  why the sheet s chat loads slowly and why the page freezes  measured" (words: dictation, sheet, chat, load, slowly, freez, measured)

## Tasks (8, best first)
- 2026-10-01 [Dictate page: the workbench chat, answered, with modes](/framework/ai/sessions/2026/09/30/one-dictation/one-dictation/) — The Dictate page's demo is the one chat every sidebar uses, now answered. [Open it](/framework/ux/Dictate/). ![](shots/followup-modes-1920.png) live guess no longer covers text; box full width, Send below: [shot](shots/followup-join-400.png) someone listens (… · paths 1/2 exist, gone: framework/ux/Dictate/doc/chat/
- 2026-10-01 [One widget: the demo and the sheet build the identical chat() call; a…](/framework/ai/sessions/2026/09/30/one-dictation/one-dictation/minion-onewidget/) — The Dictate page's demo and the ✦ sheet now build the exact same chat() call — only keep differs — and autosend after a pause is the only way a sentence goes out, everywhere. item 2, "one widget": ux/Dictate/page.js's demo_mount() is now chat($slot.el, {place… · paths 1/3 exist, gone: framework/ux/Dictate/doc/chat/ framework/ux/Dictate/doc/decisions/
- 2026-10-25 [Dictation: Debug tab, stalls fixed, no flicker](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/dictation-debug/) — Website dictation: a Debug tab, both stalls fixed, no flicker. Merged to michael/dev (146e37c73, then the flicker branch). Debug tab, routed at <page>/ai/debug/, five live rows with real errors: ![](flicker/shots/polish-debug-390.png) Stall fixed: 1 send in 2…
- 2026-10-24 [Dictation: Debug tab, and the stall found and fixed](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/dictation-debug/build/) — Ready to merge: branch worktree/dictation-debug (6 commits). [Report](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/dictation-debug/build/report.md) · [doc](/framework/ux/Dictate/doc/debug-tab.md) - ✅ The stall: one unanswered send blo… · paths 0/1 exist, gone: framework/ext/drawer/ai/debug/
- 2026-10-20 [Find the owner's dictated chat-well / mobile sheet instructions (read…](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/mobile-sheet/well-asks/) — (no outcome logged)
- 2026-10-13 [Chat bubbles in time order, and the Refine page hears the chat](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/bubble-order/) — Chat bubbles now land in time order, and the Refine page shows what the ✦ chat heard. order fix: [ext/Chat](/framework/ext/Chat/) place(), merged e7533ddfc. Scripted four sentences with replies in between: before [FAIL](/framework/ai/sessions/2026/10/13/sessi… · paths 2/2 exist
- 2026-10-13 [sheet-dictation-mocks](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/checkup-sheet/sheet-dictation-mocks/) — public/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/checkup-sheet/sheet-dictation-mocks/requirements.md
- 2026-10-13 [Voice and chat surfaces: one permanent page showing every surface](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/voice-surfaces/) — Page /framework/ux/Dictate/surfaces/ shows 9 surfaces (screenshot, where, renderer file, who answers, log), one flow diagram and the session model. 5 duplicates found (3 conversation stores, 3 Refine-stage writers, New session button built 3 times, ext/Ask/ch… · paths 1/1 exist

## Modules that exist now (files outside the module that import it)
- [ext/Chat](/framework/ext/Chat/) — used by 10 files

## Docs and readmes
- [Next: make the phone sheet the sidebar's collapsed form (br…](/framework/ux/Dictate/doc/next.md) — Owner's design: on mobile a small sheet holds only the transcribe button and the text area, resizable; expanded, it becomes the whole sideb…
- [ChatPanel: design notes and removed commentary](/framework/ext/Chat/doc/ChatPanel-notes.md) — ## Panel naming and URL routing A stable name per panel on a page, in build order — the same on a reload, so a drilled-in url (#chat=panel-…
- [chat.js — one chat box, one conversation, every surface](/framework/ux/Dictate/doc/chat.md) — Before this file, every place that showed a chat box on the site — the mobile ✦ sheet, the desktop ☰ drawer's AI tab, a card's own sidebar,…
- [Catalog — next: previews that load in under 2 s](/framework/catalog/doc/next.md) — The ask: "a preview on the catalog page is enough to see what it looks like" — the review's test was 40 previews in under 2 s. Today they a…
- [Where styles_loaded() is awaited, and why not one line later](/framework/core/Router/doc/styles-loaded.md) — A page imported on *this* navigation has just called View.stylesheet() at module scope, and its <link> is not in document.styleSheets yet —…
- [Chat architecture — one panel, one log, one composer, every…](/framework/ext/Chat/doc/architecture.md) — Chat is the widget for a conversation: a log of messages, a box to type or dictate into, and a drill-in sheet for a card's own conversation…
- [Decisions](/framework/ext/Chat/doc/decisions.md) — ## Drill in (2026-09-30, ai/sessions/2026/09/29/audio/audio/next-drill-in/) - Decided: the shell lives in ext/Chat (Drill.js), opened from …
- [Chat panel vs Dictate — the owner's composition idea (2026-…](/framework/ext/Chat/doc/panel-composition-2026-10-08.md) — Recorded from dictation; an open design question, not a decision. Check the built state of ext/Chat and the Dictate class before acting. - …

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
- 2026-09-30 Chat: reactions, threaded replies, assistant icons, M logo (minion-chat-reactions, building)
- 2026-09-30 Chat: reactions, threaded replies, assistant icons, M logo (minion-chat-reactions, landed)
- 2026-09-30 Dictation: ONE system everywhere (rail, sidebar, drawer, card) on the fast/smart pair; ol… (task-mastermind-one-dictation, building)

## Commits
- 49d13df45 ai: one chat component everywhere (sheet = session chat tab, dictation wired in), voice agent builds its sess…
- b50bf0e9d dictation-flicker polish 1: a picked tab gets the room in the full phone sheet (the chat keeps 10em, its last…
- 6627d121e dictation-debug: a mic whose chat moves (page, dock, sheet) hands over to the new box; Debug view two columns…
- 2b1bfc6d6 dictation-debug: Debug tab (DictateHealth layers), the stall fixed, bubbles idempotent, errors per module
- 88765fcf9 sheet step 10: the dictation redesign, mocks first
- 50c45e71b sheet step 5: the route <path>/ai/, class AIPage extends Page
- 8b4aff881 one-dictation: re-review round 2 (findings 3,4,6,7 of e7d08a93's review)
- d0c6b6691 one-dictation: the fast assistant refines each owner utterance, live, with its cost

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 43,806 tokens of reading, under the 100k limit).

Question: Dictation: why the sheet's chat loads slowly and why the page freezes, measured

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Dictation: why the sheet's chat loads slowly and why the page freezes, measured"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
