<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "In flight  the simplest dashboard  the 3 5 tasks being worked on now and what s next  you are a mastermind  on Sonnet  medium effort " (words: flight, simplest, dashboard, task, be, worked, now, next, you, mastermind, sonnet, medium, effort)

## Tasks (8, best first)
- 2026-10-28 [Heartbeat: no status check for a complete task with an unmerged branch](/framework/ai/sessions/2026/10/28/spawned/mastermind-ai/) — Heartbeat stops sending "status check" to an agent whose log says complete but whose branch is unmerged: [Heartbeat.js](/Servex/Heartbeat.js), proof [Heartbeat-landed.test.mjs](/Servex/Heartbeat-landed.test.mjs), commit 4bed6f7fa. Active after the next Servex…
- 2026-10-26 [Chat V3 rough draft: a plain view over the session's tasks list, behi…](/framework/ai/sessions/2026/10/25/session-5644835c/mastermind-v3-draft/) — Chat V3 is merged to michael/dev, behind its own v3 chip (not the default). Demo: [Chat v3](/framework/ext/Chat/v3/). Docs: [readme](/framework/ext/Chat/v3/readme.md). V3 draws the session's tasks list, Prompts at the root: ChatV3.test.mjs 19/19 Raw words gra… · paths 1/1 exist
- 2026-10-14 [Tasks: in flight, queued and landed today, one live page](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/tasks-dashboard/) — [/framework/ai/tasks/](/framework/ai/tasks/) lists what is in flight, queued and landed today, live, from the real state. - ✅ One list, three groups, in order; a row opens the task card beside it. Proof: sheet-list-400-1200-1920-3440.png, shot-1920-detail.png… · paths 1/2 exist, gone: framework/ai/tasks/lanes/
- 2026-09-28 [core/Page docs: Make a page + Layout tabs, tab order fixed](/framework/ai/sessions/2026/09/28/e269b131-e2d2-4712-a88d-b243d631bd04/organization/rewrite/) — Landed: [core/Page](/framework/core/Page/) has two new top tabs — [Make a page](/framework/core/Page/make/) (the four ways to build a page, code then live result) and [Layout](/framework/core/Page/layout/) (Choosing a layout: five shapes as icon items, each l… · paths 7/7 exist
- 2026-09-28 [Fresh-eyes review: a new agent checks every task before merge](/framework/ai/sessions/2026/09/28/b6fa1bc1-fad0-4bdd-9b20-8cd1cd20afb4/fresh-eyes-review/) — A fresh agent now reviews every task before it merges, sized by the diff — none / light (Sonnet) / full (Opus, with screenshots). Reviewed: 10 fixed, 2 declined — [review.md](/framework/ai/2026-09-28/fresh-eyes-review/review.md) Review built into the task sys…
- 2026-09-25 [AI 2: every element weighed, one timeline, cards open for you](/framework/ai/sessions/2026/09/25/ea1cc34a-7cb3-420e-b6dd-383b3006dead/ai2-lead/) — AI 2, step by step: [press Next](/framework/ai/2026-09-25/ai2-lead/). Every element weighed, the rail is one timeline, and a card made for you opens on your screen. ![](/framework/ai/2026-09-25/ai2-lead/shots/2-rail.png) full-width $ bar: a short bar with its… · paths 0/2 exist, gone: framework/ai2/2026/09/24/ai-dashboard/ framework/ai2/live/
- 2026-09-24 [task-audit](/framework/ai/sessions/2026/09/24/loose-ends/task-audit/) — 176 of 184 tasks (09-17 to 09-24) audited, one Sonnet minion each: 134 done, 34 half-done, 8 superseded. [The ranked page and top-ten briefs](/framework/ai/2026-09-24/task-audit/) · [rows.json](/framework/ai/2026-09-24/task-audit/rows.json) Not covered (stood…
- 2026-09-24 [Every dashboard ask on one page, two layout breaks fixed](/framework/ai/sessions/2026/09/24/ai2-cost-fill/ai2-dashboard/) — Every dashboard ask you made this week is on one page, and the two layout breaks it found are fixed on AI 2. - The record: [What you asked of the AI dashboards](/framework/ai2/doc/owner-asks.md). It holds 92 asks from 17–24 Sep, word for word, grouped by topi… · paths 3/4 exist, gone: framework/ai2/overview/

## Modules that exist now (files outside the module that import it)
- [core/Layout](/framework/core/Layout/) — used by 33 files
- [core/Task](/framework/core/Task/) — used by 792 files
- [core/tasks](/framework/core/tasks/) — used by 5 files, no readme
- [ext/AITask](/framework/ext/AITask/) — used by 5 files
- [ext/layout](/framework/ext/layout/) — used by 19 files
- [ext/tasks](/framework/ext/tasks/) — used by 5 files, no readme

## Docs and readmes
- [Tasks — what is in flight, queued and landed, live](/framework/ai/tasks/doc/readme-before-2026-10-19.md) — See it: [/framework/ai/tasks/](/framework/ai/tasks/). It is no list of its own: it opens the Inbox ([/framework/ai/](/framework/ai/)) with …
- [Known problem: the AI page layout — asked 7 times](/framework/ai/doc/dashboard-layout-asks.md) — The AI page ([/framework/ai/](/framework/ai/)) keeps coming back too crowded: a tall toolbar, tabs that stack, little scroll boxes inside t…
- [The task queue: a session's tasks plus a priority, worked b…](/framework/ai/doc/task-queue.md) — The decision (2026-10-23): there is no new queue system. A mastermind's queue is its tasks, each with a priority. The mastermind starts the…
- [AITask — the AI working log, rendered: one task's page, a d…](/framework/ai/AITask/doc/readme-before-2026-10-19.md) — ## Use - Moved verbatim to [doc/api.md](./doc/api.md): the API. - The Session tab is a chat: talk in the stream, every tool call folded to …
- [past-work: look before you build](/framework/ai/skills/past-work/readme.md) — The owner (2026-10-12): "We don't want to set off and build something that's already been built, especially if it's stable and used everywh…
- [The effort — group](/framework/ai/AITask/doc/effort.md) — A day is the filing system; an effort is how the work is actually thought about — a thread that outlives any one day. group names it, and t…
- [One AI dashboard: a proposal to agree on before anything is…](/framework/ai/doc/one-dashboard.md) — What you said (2026-10-17, 22:45): no new pages unless we agree on their structure; not another AI dashboard; one dashboard that just works…
- [AI v2 — one dense, full-width board, written to live; a sec…](/framework/ai/v/2/readme.md) — ## Use page.js (about 300 lines) + v2.css — the whole board, one file each, so the mastermind can edit it by hand in a minute. It reads ONE…

## Sessions tagged with these words
- 2026/10/16 [Inbox labels](/framework/ai/sessions/2026/10/16/session-e91fc031/) — kind/owner model/sonnet mod/core/page mod/servex mod/.claude/skills/mastermind task/inbox-labels · $1.45
- 2026/10/15 [Voice mastermind MCP gateway](/framework/ai/sessions/2026/10/15/session-eda55316/) — kind/owner model/sonnet mod/servex mod/ux/dictate task/mastermind-repo-slim servex/voice · $1.28
- 2026/10/15 [Clarity voice mastermind](/framework/ai/sessions/2026/10/15/session-e1a13a37/) — kind/agent model/sonnet mod/ai/sessions task/mastermind-repo-slim framework/ai · $0.25
- 2026/10/14 [Module inbox loop](/framework/ai/sessions/2026/10/14/session-ef693241/) — kind/owner model/sonnet mod/servex mod/server task/mastermind-repo-slim framework/inbox · $1.44
- 2026/10/14 [Catalog previews](/framework/ai/sessions/2026/10/14/session-e94e007a/) — kind/agent model/sonnet mod/ai/sessions task/mastermind-repo-slim framework/sessions · $0.19
- 2026/10/14 [R2 archive Cloudflare class](/framework/ai/sessions/2026/10/14/session-e88409a1/) — kind/owner model/sonnet work/read-only task/mastermind-repo-slim framework/tasks · $0.60

## Owner asks
- 2026-10-15 Voice mastermind: answer within seconds every time (best guess or 'looking into it'), han… (?, held)
- 2026-09-30 Proposals: a Proposal class; review, decide, becomes a task; node-led loop; impact-weight… (mastermind-servex (next instance; spawn at the 10 PM reset), queued)
- 2026-10-03 Framework home: grids without voids, explicit layout classes, layout labels, DevTools inl… (task-mastermind-framework-home-grids, building)
- 2026-10-03 finish-task: integrations only where they make sense, each its own commit; costly ones be… (vscode-mastermind, done)
- 2026-10-13 Proposals: a Proposal class; review, decide, becomes a task; node-led loop; impact-weight… (?, queued)

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 44,684 tokens of reading, under the 100k limit).

Question: In flight: the simplest dashboard, the 3–5 tasks being worked on now and what's next (you are a mastermind, on Sonnet, medium effort)

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "In flight: the simplest dashboard, the 3–5 tasks being worked on now and what's next (you are a mastermind, on Sonnet, medium effort)"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
