<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Tests must not write fake agents into the real store" (words: test, must, not, write, fake, agent, into, real, store)

## Tasks (8, best first)
- 2026-10-20 [Servex agents: logs over messages, round 3 (prompts, items, skills, o…](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/system-architect/) — Round 3: all five asks landed; old AI data is in the store and the worktree pool frees itself. [mastermind skill](/.claude/skills/mastermind/SKILL.md): handle every prompt at once; Refine is the future, not used yet [core/Item](/framework/core/Item/): items s… · paths 1/1 exist
- 2026-10-17 [Sessions: one session.jsonl record per session folder, writers includ…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/session-rename/) — New session folders now start as session.jsonl, so nothing created after today needs the move script. one SessionRecord.start_file decides the file: the log that exists, else session.jsonl for a new session folder (directly under a day, own session_id on line…
- 2026-10-13 [framework/ai: date folders gone for good, one tree decided](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/one-store/) — No date folder left in framework/ai, and none can come back; old links still open. date directory cleaned up: 8 folders moved by script (831 files, verify 0 bad, undo tested first), 71 links relinked it can't come back: every writer goes through TaskDirs, whi… · paths 1/1 exist
- 2026-10-13 [framework/ai: one tree, the Inbox cards moved into the sessions store](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/one-store-apply/) — One tree: every Inbox card now lives in ai/sessions/YYYY/MM/DD/cards/, and ai/2026/ is gone. A card keeps its address, so every old link still opens it. ![a moved card, opened from the Inbox](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-… · paths 2/2 exist
- 2026-10-12 [Task folders: moved into the sessions store](/framework/ai/sessions/2026/10/12/session-e456f109/task-folders/) — Every task folder now lives in the sessions store: no more ai/<date>/ day folders. ![](moved-task-1920.png) past asks gathered, decided, alternative recorded: [task-folders.md](/framework/ai/doc/task-folders.md) new writes go to the new place through one clas…
- 2026-10-10 [Refine: prompts stored in the session log](/framework/ai/sessions/2026/10/09/session-48083d9d/refine-session-log/) — Each Refine prompt is now kept in its session's own log, in stages. [Session log doc](/framework/ext/Refine/md/doc/session-log-2026-10-10/) raw (immutable), then clean (final, numbered), then refined (cards citing indexes): proven with real model calls, 4 lin… · paths 1/2 exist, gone: framework/ext/Refine/md/doc/session-log-2026-10-10/
- 2026-10-03 [Prompt hook: only your words get refined](/framework/ai/sessions/2026/10/04/prompt-relay-skip-agents/prompt-relay-skip-agents/) — A subagent's report is no longer logged as your prompt. The hook skipped nothing before, so four hand-backs in this tab were saved as your Prompts and refined at about $0.35 each, and your real prompt waited behind them. skip hand-backs and background notices… · paths 1/1 exist
- 2026-10-03 [Store.js: a dragged move nests under its list's own name, not flat](/framework/ai/sessions/2026/10/03/list-events/move-nesting-fix/) — One line down from Draggable, not inside it — core/Item/Store.js's hops() dropped a list's own name whenever a change was the list's own add/remove/move/order. drags write top-level {"move":{...}} — fixed, now nests under the list's name: {"content":{"move":{… · paths 1/1 exist

## Modules that exist now (files outside the module that import it)
- [core/Test](/framework/core/Test/) — used by 0 files

## Docs and readmes
- [Owner notes, 2026-10-16 night: migrating old tasks into the…](/framework/core/Task/doc/owner-2026-10-16-migration.md) — ## The problem Most sessions reliably produce a requirements.md and old-style tasks (session-dir task.jsonl, TaskState index.jsonl, the ai/…
- [Site page into Figma: generate_figma_design test (2026-10-1…](/framework/ext/Figma/doc/capture.md) — Verdict (updated 2026-10-12, phase 2): it works, the picture is close, and flex layout survives as real Figma auto layout, but each capture…
- [Owner notes, 2026-10-16 (late): the node side of tasks (dic…](/framework/core/Task/doc/owner-2026-10-16-node-side.md) — Fifth note of the day. Facts verified 2026-10-16 ~20:30: Servex/TaskLoop.js and Server/TaskState.mjs import core/Task/Task.js and replay ta…
- [Figma architecture — the browser reads, an agent writes](/framework/ext/Figma/doc/architecture.md) — The Figma module shows tracked Figma files as routed pages. The browser only reads JSONL and screenshots that already sit in the repo; an a…
- [log — how objects write down what they do (ideas, not built)](/framework/log/readme.md) — The owner's direction (2026-10-05, dictated; the session page of VS Code tab 60d9def6 has the full words): any object can log anything, and…
- [Rules — the layout dos and don'ts, one page each, with live…](/framework/styles/rules/readme.md) — ## Use Each rule is a url — cite it in a review instead of quoting it: /framework/styles/rules/nesting/. Reading order: Cascade → Proportio…
- [System tab: what is here, and what is not](/framework/ai/system/readme.md) — The AI page's System tab. Today this folder holds one thing: - [models/](models/) — now.json, which agent runs on which model (computed by …
- [The item system: every class, store, tool and writer that m…](/framework/core/Item/doc/map.md) — An item is a thing kept as one JSONL log: line 1 says what it is, later lines are deltas, Item.set(delta) replays them. The same class runs…

## Sessions tagged with these words
- 2026/10/16 [Voice session review and refinement](/framework/ai/sessions/2026/10/16/session-da50b6af/) — kind/agent model/opus work/read-only task/refine-build · $0.89
- 2026/10/16 [Owner check: voice session 2026-10-16 items](/framework/ai/sessions/2026/10/16/session-4a4fea68/) — kind/agent model/sonnet mod/ai/sessions task/owner-words.md framework/sessions · $0.27
- 2026/10/15 [Clarity refine audit](/framework/ai/sessions/2026/10/15/session-f2708f57/) — kind/agent model/sonnet work/read-only task/refine-audit framework/refine · $0.14
- 2026/10/15 [Clarity trace page system](/framework/ai/sessions/2026/10/15/session-eb5e27d5/) — kind/agent model/sonnet work/read-only task/page-system · $0.14
- 2026/10/15 [Debug views](/framework/ai/sessions/2026/10/15/session-eafccb46/) — kind/agent model/sonnet work/read-only task/page-system · $0.14
- 2026/10/15 [Clarity live post](/framework/ai/sessions/2026/10/15/session-e9ea50e3/) — kind/agent model/sonnet work/read-only task/live-post page/live-cards · $0.14

## Owner asks
- 2026-10-15 Voice mastermind: answer within seconds every time (best guess or 'looking into it'), han… (?, held)
- 2026-10-15 Servex restart plan: a restart must not drop the voice call; a fresh mastermind may answe… (?, noted)
- 2026-09-30 Memory: dormant idle agents, working cap, auto-compaction (task-mastermind-dormant-idle, building)
- 2026-09-30 Page inbox for necessary agent coordination (task-mastermind-page-inbox, building)
- 2026-09-30 Agents never take over the owner's tabs (mastermind-servex-8, landed)

## Commits
- b59e1a68d Server/README.md: note MentionSync.js in the BOOT_TEST list
- 91a9acec1 Close the five unchecked JSONL writers: Write/Edit guard, Append.js check(), ledger append_checked, flags.jso…
- c340ed944 Models page: capability before cost (Phase 15 quality bar)

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 42,093 tokens of reading, under the 100k limit).

Question: Tests must not write fake agents into the real store

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Tests must not write fake agents into the real store"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
