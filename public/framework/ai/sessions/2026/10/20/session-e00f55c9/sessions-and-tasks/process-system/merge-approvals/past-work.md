<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Merge approvals  a  ready to merge  list with a Merge button" (words: merge, approval, ready, list, button)

## Tasks (8, best first)
- 2026-10-16 [Salvage: unmerged branch audit, dup-bubbles already on dev](/framework/ai/sessions/2026/10/16/voice-20261016/salvage/) — Audit done; nothing needed merging. [audit.md](/framework/ai/sessions/2026/10/16/voice-20261016/salvage/audit.md) Audit every branch: 422 checked, 239 fully merged, 183 ahead, 75 pure noise (listed, nothing deleted) Top 5 for a human look: page-extends-item, …
- 2026-10-20 [Sessions: record-only (cloud voice) sessions get a snapshot](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/cloud-sessions-listed/) — Cloud voice sessions now get a day-index snapshot, so the grid and dashboard can list them. snapshot for a record-only folder: AISessionIndex.record_snap() + load_records() + a watch on session.jsonl; test AISessionIndex.test.mjs passes grid kind chip cloud v… · paths 1/1 exist
- 2026-10-20 [merge-approvals](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/process-system/merge-approvals/) — public/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/process-system/merge-approvals/requirements.md
- 2026-10-19 [AI dashboard: the Inbox is one list over the one state, with filter c…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/one-dashboard/) — The Inbox in [/framework/ai/](/framework/ai/) is now one list over state.json, with url chips: Live, New, Recent, Older, Needs you, and a Kind row. No agent writes anything; the list streams. one dashboard, no new page: the Inbox rail reads the state (DashSta… · paths 3/3 exist
- 2026-10-17 [Phone sheet: one big mic that says its state, a Type button, no Send](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/sheet-controls/) — The phone sheet has the fewer-controls dictation bar. One big mic whose word is the engine's state, a Type button, no Send. [The bar](/framework/ux/Dictate/doc/refine-dictate-tasks.md) · [Dictate](/framework/ux/Dictate/) big mic says its state: DictationBar, … · paths 1/1 exist
- 2026-10-14 [Inbox: one list-and-detail view, waiting-on-you at the top](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/inbox-browse/) — The Inbox runs on one list-and-detail view, [Browse](/framework/ux/Browse/), and pins Waiting on you at the top. - ✅ The class architecture: [Architecture tab](/framework/ux/Browse/architecture/). Browse is the orchestrator, Inbox.Rail extends Browse, AIRail … · paths 2/3 exist, gone: framework/ux/Browse/architecture/
- 2026-10-14 [Refined asks: records, module lists, inboxes](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/refine-topic-index/) — Refined asks are now records. 1080 recorded, 19 crossed off, 612 sent to their module's inbox, 449 stay open (site-wide or no module folder). - One record per ask, in the session's own asks.jsonl: [how it works](/framework/ext/Refine/doc/asks.md) - Topic list…
- 2026-10-12 [Page parts: a page body as a streamed list of views](/framework/ai/sessions/2026/10/12/session-471f8c3b/page-slice/) — A page body is now a list of heading, text and card parts streamed from its own page.jsonl. Class architecture shown on the site: /framework/core/Page/parts/doc/architecture.md One page renders heading, text and card: /framework/core/Page/parts/ Add, move and… · paths 2/2 exist

## Modules that exist now (files outside the module that import it)
- [core/List](/framework/core/List/) — used by 23 files

## Docs and readmes
- [Reply in place — talk to one item, where it already is](/framework/ext/Ask/doc/reply.md) — Every item on a task page is a thing you might want to say something about: an ask card, a decision row, a task card on the day board. repl…
- [Dropdown architecture — a trigger that shows its choice, an…](/framework/ext/Dropdown/doc/architecture.md) — Dropdown is one choice out of a short list: a button that shows the current option's picture and name, and a [popover] list that opens abov…
- [icon — one frame, one button, one rail](/framework/ui/icon/readme.md) — The owner's own words: too many one-off pieces of CSS building "icon layout" across the site, and vertical and horizontal alignment kept br…
- [ai/rail: the list on the left, and the data behind it](/framework/ai/rail/readme.md) — Moved here from ai2/ on 2026-10-09 (the old paths are one-line shims). AIRail is the one rail the AI page's Inbox and Log tabs and the old …
- [ai2: the old address of AI 2 (merged into AI on 2026-10-09)](/framework/ai2/readme.md) — AI 2 is no longer a separate module. Its code moved into [ai/cards](/framework/ai/cards/) (a card and what it shows) and [ai/rail](/framewo…
- [core/Item + core/List](/framework/audit/doc/core-Item-List.md) — Two files, 175 lines of JS together, and they are the base of the whole persistence stack — ext/Saver, ext/editor, ext/Panel, ext/Draggable…
- [framework/audit — the 2026-08-15 doc audit: one report per …](/framework/audit/readme.md) — ## Use Start at [Priorities](/framework/audit/overview/priorities/). A module's report is doc/<core|ext|dev>-<Name>.md, served as the Docs …
- [mode.js — light / dark / auto, as one button](/framework/core/App/doc/mode.md) — A plain-function module beside App, not a class and not a theme. Four functions, two exported. js import mode from "/framework/core/App/mod…

## Sessions tagged with these words
- 2026/10/15 [Live presentation surface](/framework/ai/sessions/2026/10/15/session-2275eb6b/) — kind/owner model/sonnet mod/core/page mod/core/list mod/servex task/live-present · $1.22
- 2026/10/13 [Core List architecture](/framework/ai/sessions/2026/10/13/session-fa932cf9/) — kind/agent model/haiku mod/core/list docs/architecture · $0.21
- 2026/10/13 [Page templates binding merge](/framework/ai/sessions/2026/10/13/session-21449a90/) — kind/owner model/sonnet work/read-only task/page-templates-binding-merge · $0.51

## Owner asks
- 2026-09-30 Merges: approval for foundational merges, reversible from the card (mastermind-servex-9, routed)
- 2026-09-30 Merges: approval for foundational merges, reversible from the card (mastermind-servex (proposal-flow, 10 PM), queued)
- 2026-10-18 Merges: approval for foundational merges, reversible from the card (?, tracked)
- 2026-09-30 Icons: frames, buttons, rails, icon items aligned (task-mastermind-icon-system, building)
- 2026-09-30 Merge candidates: one minion per core dir (later, when tokens allow) (ai/todo.md, parked)

## Commits
- 19b525b9f process-system: tasks-list ready; merge-approvals plan and brief
- da6a2a35d process: fixes from run 1, plus the owner's homes and improvements decisions
- 447b93790 mastermind skills: never wait for a go-ahead, bring work to ready-to-merge, the owner approves merges; priori…

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 42,139 tokens of reading, under the 100k limit).

Question: Merge approvals: a "ready to merge" list with a Merge button

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Merge approvals: a \"ready to merge\" list with a Merge button"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
