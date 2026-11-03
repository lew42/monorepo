<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "ai queue  the task queue page shows the real count  reads at a glance  and is linked where the owner looks" (words: queue, task, show, real, count, read, glance, linked, where, owner, look)

## Tasks (8, best first)
- 2026-10-24 [Task queue: a live page of what is queued and why](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/deputy/queue/) — The [task queue](/framework/ai/queue/) is live: 143 accepted tasks, ranked, each with what it is, why, its estimated cost and its score (17181c28a). Reached from the Queue tab and the AI page. one page I can open: /framework/ai/queue/, linked from /framework/… · paths 2/2 exist
- 2026-10-24 [Task queue: an estimate per task, so rows stop tying](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/deputy/queue-estimate/) — Each queued task gets its own cost estimate, from similar landed tasks the ranking separates rows: 4 → 10 distinct scores in the top 20 ([before](check-before.txt), [after](check-after-review.txt)) review (pass): 2 fixed (a stable tie-break, so estimates stop… · paths 1/1 exist
- 2026-10-20 [AI system: task resolution model, where tasks get lost, session-flow …](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/process-system/) — Task resolution is defined; session-flow is ready to merge. - ✅ [resolution.md](/framework/core/Task/doc/resolution.md): what is a task (only an ask), 1–3 per prompt, requirement = subtask / suggestion = text, linked to the raw prompt, completion with evidenc…
- 2026-10-19 [task-system: docs for what a task is, where it lives, who makes it, a…](/framework/ai/sessions/2026/10/19/cloud-voice-agent/task-system/) — Task docs are current (ai/doc/tasks.md, ai/tasks/readme.md known problems, readme links, skills). The prompt-to-landed flow and the reachability/duplication audit are written. The lifecycle proposal ai/doc/task-lifecycle.md awaits the owner; nothing built.
- 2026-10-15 [live: Today card shows done vs waiting on X](/framework/ai/sessions/2026/10/16/voice-20261016/task-closeout/) — Today has 4 tasks done and 3 waiting; two finished tasks are now closed. - Waiting: handover-query (snoozed until 2026-10-18 by mastermind-voice-20261016), task-closeout (in flight), voice-20261016 (parent, agent active). - Closed with a landing line: live-fe…
- 2026-10-14 [Tasks: in flight, queued and landed today, one live page](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/tasks-dashboard/) — [/framework/ai/tasks/](/framework/ai/tasks/) lists what is in flight, queued and landed today, live, from the real state. - ✅ One list, three groups, in order; a row opens the task card beside it. Proof: sheet-list-400-1200-1920-3440.png, shot-1920-detail.png… · paths 1/2 exist, gone: framework/ai/tasks/lanes/
- 2026-10-13 [AITask: moved from ext/ into ai/, with the rule for what goes in ai/](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/ai-modules-home/) — AITask now lives in ai/, and the rule for what goes there is written down. ext/AITask is an AI thing: moved to [ai/AITask](/framework/ai/AITask/) by script (223 files relinked); the [old address](/framework/ext/AITask/) points to it; check_page is clean on bo… · paths 2/2 exist
- 2026-10-13 [How a page renders: one plain doc under core/Page, linked from the re…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/page-rendering/) — core/Page/doc/how-a-page-renders.md answers the owner's question (classes + helpers write the DOM; page.jsonl deltas replay into blocks on top), linked from the Page and framework readmes (7e3c10b23). Landed by the mastermind from the agent's own answer and t…

## Modules that exist now (files outside the module that import it)
- [core/Task](/framework/core/Task/) — used by 770 files
- [core/tasks](/framework/core/tasks/) — used by 5 files, no readme
- [ext/AITask](/framework/ext/AITask/) — used by 5 files
- [ext/tasks](/framework/ext/tasks/) — used by 5 files, no readme
- [ui/tasks](/framework/ui/tasks/) — used by 5 files, no readme
- [ux/tasks](/framework/ux/tasks/) — used by 5 files, no readme

## Docs and readmes
- [Owner notes, 2026-10-16 (night): the task system read top-d…](/framework/core/Task/doc/owner-2026-10-16-top-down.md) — Third note of the day; read owner-2026-10-16-task-system.md and owner-2026-10-16-composition.md first. Where the owner said "I'm not sure",…
- [Mention — #Page and @owner become a small icon + the word, …](/framework/ext/Mention/readme.md) — #Page is a reference to a real thing on the site — a page, a module, a doc. @owner is a person or an agent role. Write either one in any ma…
- [Task queue ai/queue/](/framework/ai/queue/readme.md) — The queue of accepted tasks, ranked, at /framework/ai/queue/: for each, what it is, why, its estimated cost, its big thing and its state. R…
- [Refine queue — the owner's past prompts, refined one at a t…](/framework/ext/Refine/doc/refine-queue.md) — The owner dictates long prompts; an agent condensing one can drop a specific suggestion. The refine queue turns every past owner prompt int…
- [AI — the folder where the AI system's records live and the …](/framework/ai/readme.md) — Priorities now: [priority.md](priority.md) — the ranked list every mastermind reads before it spawns. Who does what: [doc/readme-system.md]…
- [Tasks — what is in flight, queued and landed, and how the b…](/framework/ai/tasks/readme.md) — A task is a folder whose task.jsonl is a log, one fact per line; its state is never stored, it is replayed from the lines. This module is t…
- [Where a task falls through the cracks](/framework/core/Task/doc/cracks.md) — Read-only look at today's code (Servex/TaskLoop.js, Servex/Heartbeat.js, Server/StaleClose.mjs, Servex/agents/PromptTasks.js) plus the real…
- [Owner notes, 2026-10-16 (late): the node side of tasks (dic…](/framework/core/Task/doc/owner-2026-10-16-node-side.md) — Fifth note of the day. Facts verified 2026-10-16 ~20:30: Servex/TaskLoop.js and Server/TaskState.mjs import core/Task/Task.js and replay ta…

## Sessions tagged with these words
- 2026/10/16 [Voice mastermind](/framework/ai/sessions/2026/10/16/session-6a73099d/) — kind/owner model/sonnet work/read-only task/voice-today · $2.79
- 2026/10/16 [Past-work pilot classifier](/framework/ai/sessions/2026/10/16/session-289010e0/) — kind/owner model/haiku work/read-only task/past-work · $1.86
- 2026/10/15 [Voice mastermind 2026-10-15](/framework/ai/sessions/2026/10/15/session-ec7470e9/) — kind/owner model/opus work/read-only task/voice-20261015 servex/voice · $4.27
- 2026/10/15 [Usage pace line](/framework/ai/sessions/2026/10/15/session-8f866486/) — kind/owner model/sonnet work/read-only task/usage-pace-line framework/ai · $0.34
- 2026/10/15 [Standing rules for domain masterminds](/framework/ai/sessions/2026/10/15/session-7e1f2802/) — kind/owner model/sonnet work/read-only task/standing-rules framework/sessions · $0.57
- 2026/10/15 [Page owner docs claims](/framework/ai/sessions/2026/10/15/session-57f46c1a/) — kind/owner model/sonnet task/page-system docs/readme · $0.86

## Owner asks
- 2026-10-03 finish-task: integrations only where they make sense, each its own commit; costly ones be… (vscode-mastermind, done)
- 2026-10-12 Pages as live streamed parts; each page shows its own tasks (asked 9x) (mastermind-page-ai-api, routed)
- 2026-10-12 38 voice/transcription asks tagged, plus realtime dictation tasks (mastermind-voice-to-session-page, routed)
- 2026-10-15 Voice mastermind: answer within seconds every time (best guess or 'looking into it'), han… (?, held)
- 2026-09-30 AI 2: Inbox read/unread, archive, auto-resolve, search; Needs you hidden (task-mastermind-ai2-inbox-read, building)

## Commits
- 8e20aacec Fix review findings: silence check without an agent, no reload churn
- 0399e9167 ai2: INBOX ZERO — Clear all, a >=min score display rule, archive that sticks

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 42,847 tokens of reading, under the 100k limit).

Question: ai/queue: the task queue page shows the real count, reads at a glance, and is linked where the owner looks

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "ai/queue: the task queue page shows the real count, reads at a glance, and is linked where the owner looks"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
