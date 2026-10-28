<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Build G  mark the lingering legacy  from the integration branch  NOT merged" (words: build, mark, linger, legacy, integration, branch, not, merged)

## Tasks (8, best first)
- 2026-10-16 [Salvage: unmerged branch audit, dup-bubbles already on dev](/framework/ai/sessions/2026/10/16/voice-20261016/salvage/) — Audit done; nothing needed merging. [audit.md](/framework/ai/sessions/2026/10/16/voice-20261016/salvage/audit.md) Audit every branch: 422 checked, 239 fully merged, 183 ahead, 75 pure noise (listed, nothing deleted) Top 5 for a human look: page-extends-item, …
- 2026-10-26 [Agent-name links in chat go to a page that does not exist. ext/Mentio…](/framework/ai/sessions/2026/10/25/session-15fa7f56/mastermind-agent-name-links-resolve/) — Landed on michael/dev (ea637bcb4 + follow-up commit): agent-name links resolve to the agent's real dated task folder through AgentUrl (ai/index.json, no second index); /sessions/<name>/ redirects there; names with no record show 'Session not found'. Opened /s…
- 2026-10-25 [Dictation: why words arrive out of order — fixed on worktree/dictatio…](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/dictation-debug/order/) — Fixed, awaiting merge. Step 1 (retag_piece changes the id only) is on michael/dev (ce1f45f58); steps 2-3 (one clock via Session.clock.offset, said_at sent and written, bubbles ordered by said_at ?? at, also on reload) are on worktree/dictation-order-2. A Serv…
- 2026-10-16 [Task system build: steps 1–17, 3c and 3d](/framework/ai/sessions/2026/10/16/voice-20261016/task-system/) — The task system is built: every step from 1 to 17, plus 3c and 3d, is merged on michael/dev. The [task home](/framework/core/Task/tasks/task-system-build/) is the record, and every step is ticked there. - Last two steps: 3d (each task records its sessions, wh… · paths 3/3 exist
- 2026-10-14 [Old branches: 1 landed, 26 superseded, 17 set aside, nothing lost](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/branch-audit-merge/) — worktree/orphans landed as 1d2ebd6d4; table in review.md
- 2026-10-12 [Dictate: merged transcription asks, two small builds](/framework/ai/sessions/2026/10/12/session-d2954950/asks-transcription/) — Merged asks doc: [Transcription asks](/framework/ux/Dictate/doc/asks.md), 19 clusters (7 open, 4 partly, 8 done), linked from the [Dictate readme](/framework/ux/Dictate/). Two small builds: Refine keeps the latest 19,000 characters of a long prompt; the voice… · paths 1/1 exist
- 2026-10-03 [build](/framework/ai/sessions/2026/10/03/sessions-tab-polish/sessions-tab-polish/build/) — 5 of 6 items landed, 1 declined with reason. The two empty gray bands above the Sessions card are gone (measured root cause: an empty core/Page column-head + its prose's own top padding; scoped CSS fix in sessions.css touches only this page's root column). A …
- ? [keep-a-legacy-branch-so-old-work-is-not](/framework/ai/tasks/keep-a-legacy-branch-so-old-work-is-not/) — (no outcome logged)

## Modules that exist now (files outside the module that import it)
- [ext/markdown](/framework/ext/markdown/) — used by 56 files

## Docs and readmes
- [Why html_unsafe(), not html()](/framework/ext/markdown/doc/sanitization.md) — The question. View.html() was changed to route through the Sanitizer API's Element.setHTML(), falling back to textContent where unsupported…
- [Why Raw highlights, even though nothing marked it](/framework/ext/Refine/doc/raw-match.md) — clean.md numbers its own sentences (S1, S2, …), because Server/refine.mjs writes them that way on purpose — later files cite [S3, S7] again…
- [decision architecture — mark the choice with three signals,…](/framework/ui/decision/doc/architecture.md) — A UI template for showing a decision: a question, its alternatives as cards, and the one that won. Entry: [decision.js](../decision.js) (CS…
- [Toolbar architecture — markup you copy, not a component you…](/framework/ui/toolbar/doc/architecture.md) — The toolbar is a row of buttons, a search field and a segment control, made from plain card flex classes. It is a ui/ template: its page sh…
- [editor — a drag-and-drop block builder assembled from Item,…](/framework/ext/editor/readme.md) — ## Use js const store = (path, key) => dev ? new FileSaver({ path }) : new LocalStorageSaver({ key }); const saver = store("/data/editor.js…
- [Tabs architecture — the set is placed, not marked](/framework/ext/tabs/doc/architecture.md) — tabs.js adds one method, Page.prototype.tabs(), that turns named children into a bar of links plus one panel. Main class: Page ([core/Page/…
- [Crumbs architecture — the trail is markup, not a function](/framework/ui/crumbs/doc/architecture.md) — Crumbs is a breadcrumb trail of real links. It has no JavaScript API: the trail is a template written in [page.js](./page.js), and the only…
- [Salvage branches: decisions, 2026-10-17](/framework/ai/doc/salvage-2026-10-17.md) — Source audit: [salvage/audit.md](../sessions/2026/10/16/voice-20261016/salvage/audit.md) (108 real unmerged branches). Full tip list kept f…

## Sessions tagged with these words
- 2026/10/16 [Voice session review and refinement](/framework/ai/sessions/2026/10/16/session-da50b6af/) — kind/agent model/opus work/read-only task/refine-build · $0.89
- 2026/10/16 [Refine build](/framework/ai/sessions/2026/10/16/session-88b55b09/) — kind/owner model/sonnet mod/ext/refine task/refine-build framework/refine · $6.80
- 2026/10/15 [Live cards](/framework/ai/sessions/2026/10/15/session-b14b29a8/) — kind/owner model/sonnet mod/ext/markdown task/live-cards page/live-cards · $3.09
- 2026/10/13 [Markdown module architecture](/framework/ai/sessions/2026/10/13/session-42593586/) — kind/agent model/haiku mod/ext/markdown task/mastermind-repo-slim docs/architecture · $0.17

## Owner asks
- 2026-09-30 Proposals: a Proposal class; review, decide, becomes a task; node-led loop; impact-weight… (mastermind-servex (next instance; spawn at the 10 PM reset), queued)
- 2026-09-30 Worktrees: remove merged ones; Servex drops their subdomains (task-mastermind-dormant-idle, building)
- 2026-10-03 Now card: topics as nested sub-cards from refined prompts (raw → clean → structured), sub… (vscode-mastermind, queued)
- 2026-10-03 finish-task: integrations only where they make sense, each its own commit; costly ones be… (vscode-mastermind, done)
- 2026-10-13 Proposals: a Proposal class; review, decide, becomes a task; node-led loop; impact-weight… (?, queued)

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 44,327 tokens of reading, under the 100k limit).

Question: Build G: mark the lingering legacy, from the integration branch, NOT merged

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Build G: mark the lingering legacy, from the integration branch, NOT merged"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
