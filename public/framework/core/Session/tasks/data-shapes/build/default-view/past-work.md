<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Build B  one default view for every Item  and a live demo  plan step 2  in a worktree  NOT merged" (words: build, one, default, view, every, item, live, demo, plan, step, worktree, not, merged)

## Tasks (8, best first)
- 2026-10-20 [Whisper page: one live demo of every Whisper answer](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/whisper-demo/) — [The Whisper page](/framework/audio/Whisper/) is one demo: each Whisper answer arrives as a row, guesses amend themselves, the final replaces them. Merged 4ccb14de3. ![](shots/4-max-1200.png) live object log, real dictation: fake-mic run, 6 guesses → 1 final … · paths 2/2 exist
- 2026-10-01 [One widget: the demo and the sheet build the identical chat() call; a…](/framework/ai/sessions/2026/09/30/one-dictation/one-dictation/minion-onewidget/) — The Dictate page's demo and the ✦ sheet now build the exact same chat() call — only keep differs — and autosend after a pause is the only way a sentence goes out, everywhere. item 2, "one widget": ux/Dictate/page.js's demo_mount() is now chat($slot.el, {place… · paths 1/3 exist, gone: framework/ux/Dictate/doc/chat/ framework/ux/Dictate/doc/decisions/
- 2026-10-25 [Build the session switcher in the dictate widget (also the mobile she…](/framework/ai/sessions/2026/10/25/session-5644835c/mastermind-session-switcher/) — Round 2 landed: owner live-testing found the dropdown reflowed the header (huge in-flow list pushed the title/chips/v2-chip down, "vertically centered" on desktop). Rebuilt session_switcher() on ux/Popover.menu() (top-layer popover, built-in height cap + scro…
- 2026-10-20 [Sessions views: plan and a three-variant prototype (nothing built)](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/sessions-views/) — Plan and prototype ready for your pick; the real pages are unchanged. see the session view with its tasks, three ways, real data: [prototype](/framework/ai/sessions/doc/variants/) (shot at 400, 1920, 3440) segmented, nested progress bar: one shared SegBar, al…
- 2026-10-16 [Task system build: steps 1–17, 3c and 3d](/framework/ai/sessions/2026/10/16/voice-20261016/task-system/) — The task system is built: every step from 1 to 17, plus 3c and 3d, is merged on michael/dev. The [task home](/framework/core/Task/tasks/task-system-build/) is the record, and every step is ticked there. - Last two steps: 3d (each task records its sessions, wh… · paths 3/3 exist
- 2026-10-14 [Inbox: one list-and-detail view, waiting-on-you at the top](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/inbox-browse/) — The Inbox runs on one list-and-detail view, [Browse](/framework/ux/Browse/), and pins Waiting on you at the top. - ✅ The class architecture: [Architecture tab](/framework/ux/Browse/architecture/). Browse is the orchestrator, Inbox.Rail extends Browse, AIRail … · paths 2/3 exist, gone: framework/ux/Browse/architecture/
- 2026-10-12 [Refine: Haiku by default, one chat input, live refine while you talk](/framework/ai/sessions/2026/10/12/session-cca8d997/refine-haiku-live/) — Refine runs on Haiku, the outline grows while you talk, and every chat area uses one input. Clean + refine on Haiku, OpenRouter only by the switch: RefineCall.model(); write openrouter in session-backend.txt to flip ([models.md](/framework/ai/doc/models.md)) … · paths 1/1 exist
- 2026-10-02 [merge.mjs --quick + review.mjs widthsFor — one screenshot at the widt…](/framework/ai/sessions/2026/10/01/quick-fix-path/quick-merge/) — Applied to michael/dev's working tree (not yet committed — the owner commits): widthsFor in review.mjs, and merge.mjs --quick. widthsFor(files, numstat, pages), exported from review.mjs: 1200 alone for words, all four for anything that can reshape layout, 400…

## Modules that exist now (files outside the module that import it)
- [core/Item](/framework/core/Item/) — used by 44 files
- [core/View](/framework/core/View/) — used by 323 files
- [ext/demo](/framework/ext/demo/) — used by 62 files
- [ui/item](/framework/ui/item/) — used by 14 files

## Docs and readmes
- [Catalog — every page with a demo as a live preview, plus ev…](/framework/catalog/readme.md) — Open [/framework/catalog/](/framework/catalog/): a card per page (a scaled live iframe, loaded only when it scrolls into view), new ones ma…
- [One replay: every line in a session's log is applied throug…](/framework/core/Session/doc/one-replay-plan.md) — The owner's rule (2026-10-26): every line of session.jsonl is applied through the replay system, by the item's set(), with no special proce…
- [Page overview demos — fifteen live Page trees, one director…](/framework/core/Page/old/overview/readme.md) — ## Use js /framework/core/Page/old/overview/<name>/page.js import { Page, demo, md } from "/app.js"; const hello = () => new Page({ title: …
- [One store, one dated index, one query: the plan (2026-10-20…](/framework/core/Item/doc/store-index-query-plan.md) — What this is: the class plan for the owner's ask of 2026-10-20 18:50: everything dated (sessions, tasks, projects) is made, moved, indexed …
- [One stream for the UI, node and the agents: a design (not b…](/framework/core/Item/doc/one-stream.md) — Status: design, 2026-10-22, by the system architect. Building waits: the owner put the full nested-items work behind sessions, tasks and pr…
- [Review questions — every question a fresh reviewer asks, pe…](/framework/ai/review/readme.md) — The review skill asks nine systems of questions, in order: requirements, page structure, navigation, layout, sizing, wrapping, spacing and …
- [Inbox — one class, two views: a page's rail, and its small …](/framework/core/Page/ext/Inbox/doc/readme-before-2026-10-19.md) — The rail is a [Browse](/framework/ux/Browse/) (2026-10-14): Inbox.Rail extends Browse, the one list-and-detail view the Inbox and Sessions …
- [Inbox — one ranked list of what wants the owner's attention…](/framework/core/Page/ext/Inbox/readme.md) — An inbox is a list of rows (notes, questions, landed tasks, cards that wait on the owner) sorted by one number, Inbox.rank. There are two v…

## Sessions tagged with these words
- 2026/10/16 [Voice session review and refinement](/framework/ai/sessions/2026/10/16/session-da50b6af/) — kind/agent model/opus work/read-only task/refine-build · $0.89
- 2026/10/16 [Refine build](/framework/ai/sessions/2026/10/16/session-88b55b09/) — kind/owner model/sonnet mod/ext/refine task/refine-build framework/refine · $6.80
- 2026/10/15 [Clarity live post](/framework/ai/sessions/2026/10/15/session-e9ea50e3/) — kind/agent model/sonnet work/read-only task/live-post page/live-cards · $0.14
- 2026/10/15 [Live cards](/framework/ai/sessions/2026/10/15/session-b14b29a8/) — kind/owner model/sonnet mod/ext/markdown task/live-cards page/live-cards · $3.09
- 2026/10/15 [Live today voice feed](/framework/ai/sessions/2026/10/15/session-8f02ad12/) — kind/owner model/sonnet task/live-today page/live-cards · $1.20
- 2026/10/15 [Live-post helper agent](/framework/ai/sessions/2026/10/15/session-8853d8d6/) — kind/owner model/sonnet task/live-post page/live-cards · $0.98

## Owner asks
- 2026-09-30 Audio: six tools become three, one live demo (task-mastermind-audio-consolidate, building)
- 2026-09-30 Worktrees: remove merged ones; Servex drops their subdomains (task-mastermind-dormant-idle, building)
- 2026-09-30 Audio: six tools become three, one live demo (task-mastermind-audio-consolidate, landed)
- 2026-10-18 Worktrees: remove merged ones; Servex drops their subdomains (?, tracked)
- 2026-09-30 Review: one review skill, system questions, screenshots at 4 widths (task-mastermind-review, building)

## Commits
- 633c4fbbf core/Session: data-shapes build briefs (A backbone, B default view, plan review)
- 527b66c83 core/Page: plan.md v2 - navigation, items and pages, tests, build order
- 7b2f023d6 sessions: the fallback now actually fires on a real refusal (last_error, not just error: wakes)
- 9f66f0dbb core/Item, List, Page: drop the at key, List extends Item, id rules, data lives in data
- 2ef2f5a3c drawer-chat round 2: the composer is one real panel, not a box in a box
- 6c4d92f6a Dictate page becomes the workbench: chat() demo, keep option, shared New session button, composer redesign
- 8a303b28b Dev bar's AI tab: mount the one global chat(), keep the old thread picker as v1
- a5646898a ai2/card.js: the card's own sidebar mount is chat.js now, desktop only; Widget.css: the orange assistant-bubb…

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 44,327 tokens of reading, under the 100k limit).

Question: Build B: one default view for every Item, and a live demo (plan step 2), in a worktree, NOT merged

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Build B: one default view for every Item, and a live demo (plan step 2), in a worktree, NOT merged"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
