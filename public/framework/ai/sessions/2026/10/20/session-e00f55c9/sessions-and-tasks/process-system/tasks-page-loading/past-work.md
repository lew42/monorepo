<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "The  tasks  page never finishes loading" (words: task, never, finish, load)

## Tasks (8, best first)
- 2026-10-13 [SessionIndex: 1,491 task rows in memory, 1–2 s load, raw-log path on …](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/session-index/) — One in-memory SessionIndex (extends ext/Query) holds 1,491 rows from 1,491 task files, loads in 1.1–2 s (+21–23 MB heap); PastWork and FollowUp read through it with identical output; ux/Dictate = 33 tasks, 32 with a raw transcript path. Commits c5a9864ba, ab0…
- 2026-10-03 [core/Task: a DOM-free unit of work, with subtasks that gate finish()](/framework/ai/sessions/2026/10/03/list-events/task-class/) — core/Task/Task.js landed — state machine (idle/running/paused/stopped/finished), duration() (running time only), progress() (computed from subtasks), finish() refuses while a subtask is open and names it. state machine + timestamps, one set() per transition: … · paths 3/3 exist
- 2026-10-01 [One widget: the demo and the sheet build the identical chat() call; a…](/framework/ai/sessions/2026/09/30/one-dictation/one-dictation/minion-onewidget/) — The Dictate page's demo and the ✦ sheet now build the exact same chat() call — only keep differs — and autosend after a pause is the only way a sentence goes out, everywhere. item 2, "one widget": ux/Dictate/page.js's demo_mount() is now chat($slot.el, {place… · paths 1/3 exist, gone: framework/ux/Dictate/doc/chat/ framework/ux/Dictate/doc/decisions/
- 2026-09-29 [Lifecycle: log every resource, reap a finished task's leftovers](/framework/ai/sessions/2026/09/29/3c88ad4d-b2e6-4899-b5c4-fbca0e2674e2/lifecycle/build/) — The creation log and the reaper are built. Committed on worktree/lifecycle (4500ebe8), not merged. creation log: a throwaway server logged its start and end lines reaper: [dry-run.txt](dry-run.txt) closes 9, keeps :3104 and :8137 keep list: Servex/keep.json s…
- 2026-09-29 [Round 2: proved the flicker fix, showed cut markers, made ai2's mic a…](/framework/ai/sessions/2026/09/29/audio/audio/b-refine/) — Every ask from the second review round is done. Flicker proof: a real before/after (parent commit vs. this task's fix) shows the caption collapsing to 0px height mid-close BEFORE, never dipping AFTER. Frame strip: shots/flicker-frame-0..3.png Cut markers ('cl… · paths 4/4 exist
- 2026-09-29 [Loose-ends audit: 6 dispatch rows never launched, 12 system tasks unl…](/framework/ai/sessions/2026/09/29/servex-mastermind/audit/loose-ends/) — Landed — read-only audit of every task.jsonl from 2026-09-22 to 09-29 (138 tasks). table of unlanded/never-launched system work, sorted by value lost: [report.md](/framework/ai/2026-09-29/servex-mastermind/audit/loose-ends/report.md) dispatch.md rows checked …
- 2026-09-29 [Lifecycle: a reaper closes what finished tasks leave running](/framework/ai/sessions/2026/09/29/3c88ad4d-b2e6-4899-b5c4-fbca0e2674e2/lifecycle/) — A reaper now closes what finished tasks leave running. Before → after: servers 20 → 7, run.js 13 → 6, node 45 → 26, idle agents 14 → 4. a creation log: lifecycle.jsonl, [doc](/Servex/doc/lifecycle.md) the study: [page](/framework/servex/lifecycle/): 29 tasks … · paths 1/1 exist
- 2026-09-24 [helper-fixes](/framework/ai/sessions/2026/09/24/helper-fixes/helper-fixes/) — Two fast-assistant fixes, committed on their own branch and not merged. Branch worktree/helper-fixes, commit c598bbbb, worktree C:\Code\lew42\worktrees\helper-fixes. Servex was not restarted, so the fixes go live only after a merge and a restart. 1. No more p…

## Modules that exist now (files outside the module that import it)
- [core/Task](/framework/core/Task/) — used by 517 files
- [core/tasks](/framework/core/tasks/) — used by 5 files, no readme
- [ext/AITask](/framework/ext/AITask/) — used by 5 files
- [ext/tasks](/framework/ext/tasks/) — used by 5 files, no readme
- [ui/tasks](/framework/ui/tasks/) — used by 5 files, no readme
- [ux/tasks](/framework/ux/tasks/) — used by 5 files, no readme

## Docs and readmes
- [Sessions and tasks: a spawned agent is a session, a task is…](/framework/ai/doc/sessions-and-tasks.md) — Decision (the owner, 2026-10-19). The naming was the bug. An agent the SDK spawns is a session: it has a session id. It is not a task. We u…
- [Tasks: what a task is, where it lives, who makes it, how to…](/framework/ai/doc/tasks.md) — Read this once instead of researching. Short index: [../tasks/readme.md](../tasks/readme.md). Plan and history: [one-state.md](one-state.md…
- [Nested tasks — subtasks, in parallel or in series](/framework/ai/AITask/doc/nested.md) — A task can have subtasks, to any depth. Some run at the same time (parallel), and some wait for others to finish first (series). The [task …
- [The template, and its override](/framework/ai/AITask/doc/template.md) — AITask is the master template, and report(m, req) is its outline — a local Asks · Requirements · Report · Session tab bar (hand-rolled from…
- [Page health — is it working? After every change, the pages …](/framework/ai/health/readme.md) — ## Use Run node Server/health-supervisor.mjs. It keeps one Server/health.mjs per tree alive, and that loads pages from HEALTH_BASE, the own…
- [Tasks — what is in flight, queued and landed, and how the b…](/framework/ai/tasks/readme.md) — A task is a folder whose task.jsonl is a log, one fact per line; its state is never stored, it is replayed from the lines. This module is t…
- [How a url becomes a page](/framework/core/Page/doc/loading.md) — Every url is resolved one folder name at a time — never all at once. A url like /framework/core/Page/doc/ asks for framework, then core, th…
- [Owner notes, 2026-10-16 (night): the task system read top-d…](/framework/core/Task/doc/owner-2026-10-16-top-down.md) — Third note of the day; read owner-2026-10-16-task-system.md and owner-2026-10-16-composition.md first. Where the owner said "I'm not sure",…

## Sessions tagged with these words
- 2026/10/17 [Voice mastermind Opus session](/framework/ai/sessions/2026/10/17/session-0368b7c5/) — kind/owner model/opus mod/ai/sessions task/voice-opus servex/voice · $20.90
- 2026/10/16 [Inbox labels](/framework/ai/sessions/2026/10/16/session-e91fc031/) — kind/owner model/sonnet mod/core/page mod/servex mod/.claude/skills/mastermind task/inbox-labels · $1.45
- 2026/10/16 [Voice session review and refinement](/framework/ai/sessions/2026/10/16/session-da50b6af/) — kind/agent model/opus work/read-only task/refine-build · $0.89
- 2026/10/16 [Refine build](/framework/ai/sessions/2026/10/16/session-88b55b09/) — kind/owner model/sonnet mod/ext/refine task/refine-build framework/refine · $6.80
- 2026/10/16 [Transcripts.mjs essence file builder](/framework/ai/sessions/2026/10/16/session-7d42f623/) — kind/owner model/sonnet mod/server task/past-work servex/transcripts · $1.26
- 2026/10/16 [Voice mastermind](/framework/ai/sessions/2026/10/16/session-6a73099d/) — kind/owner model/sonnet work/read-only task/voice-today · $2.79

## Owner asks
- 2026-10-03 finish-task: integrations only where they make sense, each its own commit; costly ones be… (vscode-mastermind, done)
- 2026-09-30 Servex: process monitor (PIDs, RAM/CPU per task, graph, orphans) (task-mastermind-dormant-idle, building)
- 2026-09-30 Agents never take over the owner's tabs (mastermind-servex-8, landed)
- 2026-09-30 Task pages: grey checkboxes, full-width bars, reports as free content (ui-system brief (after the System class), queued)
- 2026-09-30 Proposals: a Proposal class; review, decide, becomes a task; node-led loop; impact-weight… (mastermind-servex (next instance; spawn at the 10 PM reset), queued)

## Commits
- 44b838786 token-reduction: results-gated spend, revive keeps provider, landed-task reap proof
- 4aa3a71ca core/Task: a DOM-free unit of work — the base state-machine class
- 95a272385 model-weights: rung 0 (HTML->View helpers) + primer A/B, section 5 harness fixes
- 9d5d3c98e AI 2 Inbox: read/unread, archive, auto-resolve, search, Needs-you chip, Now wording
- e63c7f158 Fix mobile-nav review findings: freeze v1, sheet double-caption, breakpoint stop, sample content

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 42,093 tokens of reading, under the 100k limit).

Question: The /tasks/ page never finishes loading

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "The /tasks/ page never finishes loading"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
