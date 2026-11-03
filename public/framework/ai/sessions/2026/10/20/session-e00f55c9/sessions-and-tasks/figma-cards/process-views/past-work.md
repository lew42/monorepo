<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Figma  process views and the sessions list nested by parent" (words: figma, proces, view, session, list, nested, parent)

## Tasks (8, best first)
- 2026-10-23 [Figma: mobile cards for sessions, projects, tasks and processes](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/figma-cards/) — New Figma page, mobile first, real data: seven bands and a What to pick card. [Open the page](https://www.figma.com/design/QYN0G2URSBHYH5I06MOjxU/?node-id=324-54823) · [notes and picks](/framework/ai/sessions/doc/mobile-cards.md) session card variants: band C…
- 2026-10-21 [Figma: sessions, tasks and projects designed on the file's system](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/figma-sessions/) — The Sessions and tasks page in Figma is rebuilt on the file's styles and tokens, with real data. [Open the page](https://www.figma.com/design/QYN0G2URSBHYH5I06MOjxU/?node-id=307-54823) cards first, three densities: 314:57410 task and project cards (project = …
- 2026-10-20 [Sessions: record-only (cloud voice) sessions get a snapshot](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/cloud-sessions-listed/) — Cloud voice sessions now get a day-index snapshot, so the grid and dashboard can list them. snapshot for a record-only folder: AISessionIndex.record_snap() + load_records() + a watch on session.jsonl; test AISessionIndex.test.mjs passes grid kind chip cloud v… · paths 1/1 exist
- 2026-10-20 [Sessions views: plan and a three-variant prototype (nothing built)](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/sessions-views/) — Plan and prototype ready for your pick; the real pages are unchanged. see the session view with its tasks, three ways, real data: [prototype](/framework/ai/sessions/doc/variants/) (shot at 400, 1920, 3440) segmented, nested progress bar: one shared SegBar, al…
- 2026-10-14 [Inbox: one list-and-detail view, waiting-on-you at the top](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/inbox-browse/) — The Inbox runs on one list-and-detail view, [Browse](/framework/ux/Browse/), and pins Waiting on you at the top. - ✅ The class architecture: [Architecture tab](/framework/ux/Browse/architecture/). Browse is the orchestrator, Inbox.Rail extends Browse, AIRail … · paths 2/3 exist, gone: framework/ux/Browse/architecture/
- 2026-10-20 [process-views](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/figma-cards/process-views/) — public/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/figma-cards/process-views/requirements.md
- 2026-10-19 [AI dashboard: the Inbox is one list over the one state, with filter c…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/one-dashboard/) — The Inbox in [/framework/ai/](/framework/ai/) is now one list over state.json, with url chips: Live, New, Recent, Older, Needs you, and a Kind row. No agent writes anything; the list streams. one dashboard, no new page: the Inbox rail reads the state (DashSta… · paths 3/3 exist
- 2026-10-14 [Refined asks: records, module lists, inboxes](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/refine-topic-index/) — Refined asks are now records. 1080 recorded, 19 crossed off, 612 sent to their module's inbox, 449 stay open (site-wide or no module folder). - One record per ask, in the session's own asks.jsonl: [how it works](/framework/ext/Refine/doc/asks.md) - Topic list…

## Modules that exist now (files outside the module that import it)
- [core/List](/framework/core/List/) — used by 23 files
- [core/Session](/framework/core/Session/) — used by 13 files
- [core/View](/framework/core/View/) — used by 301 files
- [ext/Figma](/framework/ext/Figma/) — used by 3 files
- [ext/Session](/framework/ext/Session/) — used by 11 files

## Docs and readmes
- [AITask — the page template for one session task, and the da…](/framework/ai/AITask/readme.md) — class AITask extends Page (AITask.js) renders one task folder as a page: its task.jsonl through TaskJSONL (ext/JSONL), a Session tab (the t…
- [Adoption: how parent stays one hop](/framework/core/List/doc/adoption.md) — Every Item owns exactly one List, built as new List({ owner: this }). The owner reference is the entire mechanism behind a rule that spans …
- [Claim — a tab claimed by an agent: a ring around the viewpo…](/framework/dev/Claim/readme.md) — ## Use mcp__site__claim tab: "3e83f2c0", note: "<task-slug>" — ring the tab you drive mcp__site__release tab: "3e83f2c0" — when the task la…
- [Draggable — grab-and-move for any View; Sortable reorders, …](/framework/ext/Draggable/readme.md) — ## Use js import Sortable from "/framework/ext/Draggable/Sortable.js"; class Card extends Sortable { drop_check(target){ return target !== …
- [Invisible markers — nav, pause, select, para, refined — and…](/framework/ext/Session/doc/markers.md) — A voice session's file holds more than what the owner said and the assistants answered. A few kinds of line are written automatically, in t…
- [Browse — one list-and-detail view: a resizable list on the …](/framework/ux/Browse/readme.md) — See it: [the demo](/framework/ux/Browse/) (a Browse with sample rows) and its [Architecture](/framework/ux/Browse/architecture/) tab. The I…
- [AITask views: what each one shows, and who uses it (checked…](/framework/ai/AITask/doc/views.md) — One screen. The owner asked ([ask 3](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/requirements-10.md)) whether t…
- [Skills review, 2026-10-13: what was cut, and what still nee…](/framework/ai/doc/skills-proposals-2026-10-13.md) — The skills every agent loads had grown to 34,140 words. This review measured them by script, found the rules that disagree or describe reti…

## Sessions tagged with these words
- 2026/10/14 [Figma MCP skill design systems](/framework/ai/sessions/2026/10/14/session-f155ecbd/) — kind/owner model/opus mod/ai/sessions mod/ext/figma mod/ux/dictate framework/figma · $107.72
- 2026/10/14 [Figma Claude designs kit demo](/framework/ai/sessions/2026/10/14/session-c3c905da/) — kind/owner model/sonnet mod/ai/sessions task/figma-claude-designs page/demo · $2.29
- 2026/10/14 [Figma type kit brief](/framework/ai/sessions/2026/10/14/session-9446b75f/) — kind/owner model/sonnet mod/ai/sessions task/figma-claude-designs framework/tasks · $1.69
- 2026/10/14 [Figma fluid audit](/framework/ai/sessions/2026/10/14/session-81277d72/) — kind/owner model/sonnet mod/ai/sessions task/figma-claude-designs · $1.37
- 2026/10/14 [Figma captions kit](/framework/ai/sessions/2026/10/14/session-5bae46a9/) — kind/owner model/sonnet mod/ai/sessions task/figma-claude-designs · $2.12
- 2026/10/14 [Figma design kit color schemes](/framework/ai/sessions/2026/10/14/session-4bff10f1/) — kind/owner model/sonnet mod/ai/sessions task/figma-claude-designs framework/ai · $1.06

## Owner asks
- 2026-10-02 ext/panel2 (header toolbar, main with sides, footer) + AI dashboard: Sessions view (every… (task-mastermind-panel2-sessions, building)
- 2026-10-03 Now card: topics as nested sub-cards from refined prompts (raw → clean → structured), sub… (vscode-mastermind, queued)
- 2026-10-18 Now card: topics as nested sub-cards from refined prompts (raw → clean → structured), sub… (?, tracked)
- 2026-09-30 Review: one review skill, system questions, screenshots at 4 widths (task-mastermind-review, building)
- 2026-09-30 Review: one review skill, system questions, screenshots at 4 widths (task-mastermind-review, landed)

## Commits
- a838ff256 figma process-views brief: fix the shot path
- a5db49ffa figma-cards: brief for process views and nested sessions bands

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 42,048 tokens of reading, under the 100k limit).

Question: Figma: process views and the sessions list nested by parent

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Figma: process views and the sessions list nested by parent"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
