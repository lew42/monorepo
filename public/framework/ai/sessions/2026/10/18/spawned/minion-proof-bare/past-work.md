<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Proof probe  Do exactly one thing  append this line to your task log with  node  claude hooks append mjs  your task json" (words: proof, probe, exactly, one, th, append, line, your, task, log, node, claude, hook, mj, json)

## Tasks (8, best first)
- 2026-10-18 [Proof probe. Do exactly one thing: append this line to your task log …](/framework/ai/sessions/2026/10/18/spawned/minion-proof-bare/) — (no outcome logged)
- 2026-10-17 [State: one structure for every task, with a self-check](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/one-state/) — Every task in both stores now has one bucket, in one file. class State (Server/State.mjs) folds 2,276 task logs through Task.js into ai/state.json: 2,065 tasks = 1,310 landed + 1 in flight + 275 idle + 37 stopped + 442 stale. Landed today 43 by the rules vs 4…
- 2026-10-13 [Record files: a plain git merge dropped appended lines](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/task-log-race/) — Cause found, fixed, guarded, recovered. - ✅ Writer: a plain git merge --no-ff run in the dirty main tree at 17:38:07 (git parks the tree, hard-resets, the put-back failed). Not an autostash, not append.mjs, not LogSweeper; committed history never lost a line.…
- 2026-10-02 [merge.mjs --quick + review.mjs widthsFor — one screenshot at the widt…](/framework/ai/sessions/2026/10/01/quick-fix-path/quick-merge/) — Applied to michael/dev's working tree (not yet committed — the owner commits): widthsFor in review.mjs, and merge.mjs --quick. widthsFor(files, numstat, pages), exported from review.mjs: 1200 alone for words, all four for anything that can reshape layout, 400…
- 2026-10-01 [Probe tasks: tiny open-ended jobs that score the system on any model](/framework/ai/sessions/2026/09/30/probe-tasks/) — Probe tasks are built. The design, [probes.md](probes.md): five tiny open-ended jobs, six checks a script decides (parses, loads clean, followed the prompt, right skills, opened-logged-landed a task, linked from its parent), and every failure labelled system …
- 2026-09-30 [probes.mjs: score a model's probe run on six fixed checks, label a/b/…](/framework/ai/sessions/2026/09/30/probe-tasks/runner/) — Built Servex/ext/openrouter/evals/probes.mjs per probes.md/probes.json's design, and ran it for real. --dry-run prints model/probe/prompt/dir and spawns nothing — shown for page-blog and log-line. One real run each of page-blog and log-line on claude-haiku-4-… · paths 1/1 exist
- 2026-09-30 [Logs: every JSONL write is checked first; shell appends blocked](/framework/ai/sessions/2026/09/30/proposal-flow/validated-writes/) — Every log write is now checked before it is written, and a shell append to a .jsonl is blocked. One schema (.claude/hooks/jsonl-schema.mjs) lists what a line may look like in task, day, board, asks and page logs. append.mjs and Servex's append_log refuse a li…
- 2026-10-17 [Sessions: one session.jsonl record per session folder, writers includ…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/session-rename/) — New session folders now start as session.jsonl, so nothing created after today needs the move script. one SessionRecord.start_file decides the file: the log that exists, else session.jsonl for a new session folder (directly under a day, own session_id on line…

## Modules that exist now (files outside the module that import it)
- [core/Task](/framework/core/Task/) — used by 514 files
- [core/tasks](/framework/core/tasks/) — used by 5 files, no readme
- [ext/AITask](/framework/ext/AITask/) — used by 5 files
- [ext/catalog](/framework/ext/catalog/) — used by 7 files
- [ext/depth](/framework/ext/depth/) — used by 4 files
- [ext/ErrorLog](/framework/ext/ErrorLog/) — used by 3 files

## Docs and readmes
- [JSONL — append-only .jsonl logs the AI blindly appends to, …](/framework/ext/JSONL/readme.md) — > ⚠ Converge (the owner, 2026-10-02): file and saving code is scattered across [ext/Saver](/framework/ext/Saver/) (whole-JSON rewrites), [e…
- [Page.class.js comment blocks: what to do with each (DONE 20…](/framework/core/Page/doc/comment-plan.md) — Rule (owner, 2026-10-12): a comment is a pointer, not an essay: one line where the code would surprise, ideally pointing at a doc; history …
- [TaskJSONL — the task manifest as a log](/framework/ext/JSONL/doc/task-jsonl.md) — session.json used to be written once and re-saved whole. TaskJSONL is the same fields — title, now, requested_at, landed_at, tokens, agents…
- [vision — screenshots × a model × a prompt, one JSONL line e…](/framework/ext/DesignTool/vision/readme.md) — ## Use bash node public/framework/ext/DesignTool/vision/run.mjs \ --pages /framework/,/framework/ui/ --widths 390,1280,3440 --regions auto …
- [JSONL architecture — one verb per line, replayed into objec…](/framework/ext/JSONL/doc/architecture.md) — JSONL is an append-only log, one JSON object per line, replayed into a plain object. TaskJSONL is its subclass for the task manifest (ai/<d…
- [AITask — the AI working log, rendered: one task's page, a d…](/framework/ai/AITask/readme.md) — ## Use - Moved verbatim to [doc/api.md](./doc/api.md): the API. - The Session tab is a chat: talk in the stream, every tool call folded to …
- [Owner notes, 2026-10-16 (late): the node side of tasks (dic…](/framework/core/Task/doc/owner-2026-10-16-node-side.md) — Fifth note of the day. Facts verified 2026-10-16 ~20:30: Servex/TaskLoop.js and Server/TaskState.mjs import core/Task/Task.js and replay ta…
- [Tasks — the class architecture](/framework/ai/tasks/doc/architecture.md) — Server/TaskState.mjs class TaskState computes the picture, appends it to state.jsonl ai/tasks/state.jsonl one line per change (machine stat…

## Owner asks
- 2026-09-30 Logs: validated writes only; shell appends to .jsonl blocked (mastermind-servex (10 PM task, item 11): make the validated route the default, then wire the guard, queued)
- 2026-09-30 Proposals: a Proposal class; review, decide, becomes a task; node-led loop; impact-weight… (mastermind-servex (next instance; spawn at the 10 PM reset), queued)
- 2026-10-02 Page extends Item: one set, persistence in Item, list verbs (add/remove/move/order) as pa… (task-mastermind-page-extends-item, building)
- 2026-10-03 Servex: Playwright Chrome logged + reaped; one warm shared browser with check_page (task-mastermind-playwright-reap, building)
- 2026-09-30 Logs: page.jsonl curated vs log.jsonl everything (recommendation) (mastermind-servex-9, routed)

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 46,762 tokens of reading, under the 100k limit).

Question: Proof probe. Do exactly one thing: append this line to your task log with `node .claude/hooks/append.mjs <your task.json

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Proof probe. Do exactly one thing: append this line to your task log with `node .claude/hooks/append.mjs <your task.json"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
