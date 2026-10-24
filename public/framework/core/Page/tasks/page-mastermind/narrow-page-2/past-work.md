<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "core Page  the loading statics move out of Page class js  a narrower Page  step 2 of 3 " (words: core, load, static, move, out, clas, narrower, step)

## Tasks (8, best first)
- 2026-10-12 [Page: Columns and Links move to their own classes](/framework/ai/sessions/2026/10/12/session-e55f5a4b/page-split-2/) — Page.class.js is 1315 to 1086 lines. Columns and Links now live in their own class files; Page keeps the same facades. Reviewed: 1 fixed, 4 noted ([review.md](/framework/ai/2026-10-12/page-split-2/review.md)). Step 5, Columns out of Page: Columns.js (PageColu…
- 2026-10-12 [Page.class.js: steps 1-4 of the split (2270 to 1315 lines)](/framework/ai/sessions/2026/10/12/session-75fc1375/page-split-1/) — Page.class.js is 42% shorter and nothing broke. Four commits, merged to michael/dev; [STATE](/framework/ai/2026-10-12/page-split-1/STATE.md) has the before/after numbers. comments as one-line pointers: 772 lines moved to core/Page/doc/ by a script that checks…
- 2026-10-05 [Dev server: ETag/304 on compressed static files (reload speed, step 1)](/framework/ai/sessions/2026/10/05/mobile-reload-speed/mobile-reload-speed/) — Landed: reloads no longer re-download unchanged modules. compress.js used to always send the full file; it now sends an ETag and a bodyless 304 when nothing changed. ETag/304 — [measurement.md](measurement.md): reload bytes on 6 real files, 60,118B → 0B, 5/6 …
- 2026-10-02 [core/Page/ext/Inbox: one class Inbox, two statics Rail + Compact](/framework/ai/sessions/2026/10/02/panel2-sessions/panel2-sessions/part1b-inbox-restructure/) — One class Inbox, two lazy views — inbox.rail and inbox.compact. Inbox.Rail = today's InboxRail (moved, unedited, into Rail.js's renamed Rail class, assigned as a static) — [Inbox.js](/framework/core/Page/ext/Inbox/Inbox.js) Inbox.Compact = new class merging D… · paths 6/6 exist
- 2026-10-16 [AI sheet checkup: route decided, steps 2 to 4 merged, 5 to 10 queued](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/checkup-sheet/) — The AI sheet is routed at <path>/ai/ (decision d-sheet-route), recorded with its two alternatives in ext/drawer's owner doc; the layout pick (A's short head, E's live feed, A's strip) stands. Steps 2 to 4 are merged on dev, one commit each: Sheet.Panel is one…
- 2026-10-14 [Scripts: the last four function bags are classes; two Servex cores ha…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/scripts-rename-5/) — AskEach, Browser, Collab, Decide are classes (merged fe2728518, case fix after); callers relinked, outputs identical to the old files, undo proven on a copy; Agents.js and directory.js have a plan in Servex/agents/doc/class-plan.md, decision d-agents-director…
- 2026-10-12 [core/Page: Page.class.js split plan](/framework/ai/sessions/2026/10/12/session-38388428/page-split-plan/) — Split plan written, no code moved. The file is 2,270 lines but only 1,027 are code: 926 (40%) are comments, and about 260 lines are four helper classes already living in it. measured by script: core/Page/doc/split-measure.mjs one-screen plan with class tree, … · paths 1/1 exist
- 2026-10-03 [core/Task: a DOM-free unit of work, with subtasks that gate finish()](/framework/ai/sessions/2026/10/03/list-events/task-class/) — core/Task/Task.js landed — state machine (idle/running/paused/stopped/finished), duration() (running time only), progress() (computed from subtasks), finish() refuses while a subtask is open and names it. state machine + timestamps, one set() per transition: … · paths 3/3 exist

## Modules that exist now (files outside the module that import it)
- [core/Layout](/framework/core/Layout/) — used by 33 files
- [core/Router](/framework/core/Router/) — used by 50 files
- [ext/Classify](/framework/ext/Classify/) — used by 1 files
- [ext/layout](/framework/ext/layout/) — used by 19 files

## Docs and readmes
- [Decide: can the collapse be done without touching the activ…](/framework/core/Page/layout/switcher/doc/decide.md) — Yes. The narrow-width dropdown is a CSS-only, container-query addition in [switcher.css](../switcher.css) that reacts to classes core/Route…
- [Page.class.js comment blocks: what to do with each (DONE 20…](/framework/core/Page/doc/comment-plan.md) — Rule (owner, 2026-10-12): a comment is a pointer, not an essay: one line where the code would surprise, ideally pointing at a doc; history …
- [Where styles_loaded() is awaited, and why not one line later](/framework/core/Router/doc/styles-loaded.md) — A page imported on *this* navigation has just called View.stylesheet() at module scope, and its <link> is not in document.styleSheets yet —…
- [Page.class.js — removed comments](/framework/core/Page/doc/Page-notes.md) — ## Top-level constants The two page words that mean the same thing under an older name. card used to be surface (the theme's own tone list …
- [Full sections moved out of readme.md (2026-10-12)](/framework/core/Page/doc/readme-full-2026-10-12.md) — Trimmed to an index per CLAUDE.md; wording kept as it was. ## Architecture js Page extends Item // ✅ page instanceof Item is true — no midd…
- [Decisions](/framework/core/Page/layout/switcher/doc/decisions.md) — ## Open - CSS namespace reservation, not yet written to css-scopes.txt. That file is outside this task's fence (core/Page/layout/switcher/ …
- [Old — the first Page docs, moved out of the Overview tab an…](/framework/core/Page/old/readme.md) — ## Index [intro](./intro/), [nav](./nav/), [children](./children/), [previews](./previews/), [shell](./shell/), [flow](./flow/) — the six o…
- [Router architecture — walk the declared children, nothing e…](/framework/core/Router/doc/architecture.md) — The Router turns a url into a Page by walking each page's declared children:, one segment at a time, then swaps only the part of the page c…

## Sessions tagged with these words
- 2026/10/13 [Layout architecture documentation](/framework/ai/sessions/2026/10/13/session-abc4b9cc/) — kind/agent model/haiku mod/core/layout task/mastermind-repo-slim docs/architecture · $0.19
- 2026/10/13 [Core Router architecture documentation](/framework/ai/sessions/2026/10/13/session-8406d195/) — kind/agent model/haiku mod/core/router task/mastermind-repo-slim docs/architecture · $0.17
- 2026/10/16 [Inbox labels](/framework/ai/sessions/2026/10/16/session-e91fc031/) — kind/owner model/sonnet mod/core/page mod/servex mod/.claude/skills/mastermind task/inbox-labels · $1.45
- 2026/10/16 [Past-work task mastermind](/framework/ai/sessions/2026/10/16/session-1fe7009b/) — kind/owner model/sonnet mod/ai/sessions mod/core/page mod/ai/aisession task/past-work · $11.04
- 2026/10/15 [Class map page system](/framework/ai/sessions/2026/10/15/session-c6902aa6/) — kind/agent model/sonnet work/read-only task/page-system docs/classes · $0.14
- 2026/10/15 [Voice-20261015 page-instance requirements](/framework/ai/sessions/2026/10/15/session-74c14268/) — kind/owner model/sonnet mod/core/page task/page-instance framework/sessions · $1.25

## Owner asks
- 2026-10-02 framework: new home page, dark class cards, sprawl layout (task-mastermind-framework-home, building)
- 2026-10-03 Framework home: grids without voids, explicit layout classes, layout labels, DevTools inl… (task-mastermind-framework-home-grids, building)
- 2026-10-13 Framework home: grids without voids, explicit layout classes, layout labels, DevTools inl… (?, queued)
- 2026-09-30 AI 2: Inbox default, Log tab, heartbeats out, tabs left (minion-ai2-rescue-merge, building)
- 2026-09-30 AI 2: importance score 1–100 on Needs you, ranked (mastermind-servex-9, routed)

## Commits
- e7f5a7149 core/Page: fold PageLog away, Page extends Item directly
- cc38d1093 core/Page/ext: a page extension system, Inbox first
- 07206a834 Object views: answer the fresh-eyes review (6 fixed, 1 declined, 2 noted)

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 42,753 tokens of reading, under the 100k limit).

Question: core/Page: the loading statics move out of Page.class.js (a narrower Page, step 2 of 3)

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "core/Page: the loading statics move out of Page.class.js (a narrower Page, step 2 of 3)"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
