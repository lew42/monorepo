<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Test system  tests that run themselves when something changes" (words: test, system, run, themselv, when, someth, chang)

## Tasks (8, best first)
- 2026-10-20 [Process system: node runs a task's phases, completion automatic](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/process-system/) — Ready to merge: task/process-system (merges clean). - ✅ Study notes + doc fixes, maps indexed ([ai/doc/readme.md](/framework/ai/doc/readme.md)) - ✅ [process.md](/framework/core/Task/doc/process.md) with class sketch - ✅ Slice 1: Process + ProcessRunner, moves…
- 2026-10-13 [follow-up: runs daily from TaskLoop](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/followup-daily/) — TaskLoop.follow_up_daily runs FollowUp --write once a day, posts one owner_note row, LogSweeper commits follow-up.md and follow-up-full.md. Tested with a harness: stale file, run, note posted (39 flagged / 124 healthy). Not tested on a private Servex port; ne…
- 2026-10-13 [asks tally re-run: what changed today](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/asks-tally-rerun/) — Page /framework/ai/doc/asks-outcomes leads with What changed today. 316 features in the data and on the page; before 101 done, 118 partly, 90 not done; after 86 done, 137 partly, 93 not done. 5 moved to done, 101 re-judged, 58 asks added from today's dictatio… · paths 0/1 exist, gone: framework/ai/doc/asks-outcomes
- 2026-10-12 [step-runner](/framework/ai/sessions/2026/10/12/session-87bec773/step-runner/) — The Step runner is live: a task's steps carry time estimates ("do it (N min)"), a hook prompts each next step at no extra turn, and the [TaskLoop](/framework/servex/doc/task-loop.md) sends one nudge when a step runs past 2× its estimate. Before: 0 of 16 tasks…
- 2026-10-12 [Skill prune: safe half of the usage audit](/framework/ai/sessions/2026/10/12/session-e36e227a/skill-prune/) — Safe half of the skill audit landed — [STATE.md](/framework/ai/2026-10-12/skill-prune/STATE.md) reviewer, checker, voter get a skill in roles.js: three rows added, module imports and resolves all three never-called skills archived: assistant, performance, pro…
- 2026-10-01 [llama-server as a local model provider: chat page, test ladder, two f…](/framework/ai/sessions/2026/09/24/servex-mastermind-opus/local-ai/build/) — Servex runs a model on this machine's own GPU — proven with real replies, not just wired up. start/stop/swap one llama-server model, idle unload: Servex/ext/local/llama.js a local provider for the SDK (local/<slug>): Servex/ext/local/provider.js, Agents.js, t… · paths 2/2 exist
- 2026-10-01 [Local AI phases 2+3: Servex runs llama-server as a model provider](/framework/ai/sessions/2026/09/24/servex-mastermind-opus/local-ai/) — Servex talks to a model on this machine's own GPU — merged, restarted, and verified live (a real reply came back from llama-server through the Claude Agent SDK after the restart). checked first (Phase 3 ask 2): llama-server already speaks the Anthropic Messag… · paths 2/2 exist
- 2026-10-01 [Process monitor: free RAM when it runs low](/framework/ai/sessions/2026/09/30/2976c23c-62af-4aa8-b898-5e56e1c025f8/process-monitor/) — RAM squeeze merged (43ca0e5b); needs a Servex restart ![](idle/live-1920-processes.png) idle worktrees' server, watcher and Chromium stopped: 30 tests dormant in 30 s under 6 GB free: 78 tests dormant_after per agent and request; voice pair warm; resume 0.15 … · paths 1/1 exist

## Modules that exist now (files outside the module that import it)
- [core/Test](/framework/core/Test/) — used by 0 files, no readme
- [ext/filesystem](/framework/ext/filesystem/) — used by 29 files
- [ext/System](/framework/ext/System/) — used by 8 files

## Docs and readmes
- [AI system architecture — files are the memory, code runs th…](/framework/ai/doc/architecture.md) — The AI system is everything that lets agents do work here and lets the owner see it: Servex runs the agents, the readme chain tells them wh…
- [System architecture — three fitted lengths, four rungs, one…](/framework/styles/system/doc/architecture.md) — The design system is the spacing vocabulary: every space on the site is one of a few lengths defined in framework.css, and the words you ty…
- [Organization system: decisions (2026-10-12)](/framework/ai/doc/organization-decisions.md) — - Heartbeat is a script, not a Servex change. Servex/Heartbeat.js and TaskLoop.js watch open tasks every few minutes; an hourly systems wak…
- [The card system — which card, when](/framework/core/Page/card/doc/system.md) — ## A card is a mini page — the owner's decision The owner's decision (2026-09-29, about 8:40 PM), settled, not provisional: a card is a tin…
- [Why four rungs, and not two](/framework/styles/system/doc/census.md) — Two would have been nicer. The site's own CSS says four. ## What was counted On 2026-09-17 every padding / margin / gap declaration under p…
- [AI system: the owner's asks, merged (2026-10-12)](/framework/ai/doc/asks.md) — The owner's own prompts that touch the ai system, tagged by Haiku, folded into one ask each, then checked against the code by Sonnet. Open …
- [Audits: every system that checks what was asked against wha…](/framework/ai/doc/audits.md) — The owner asks for things in long prompts; many asks were never filed or never finished. Over September and October several systems were bu…
- [Sessions and tasks: a spawned agent is a session, a task is…](/framework/ai/doc/sessions-and-tasks.md) — Decision (the owner, 2026-10-19). The naming was the bug. An agent the SDK spawns is a session: it has a session id. It is not a task. We u…

## Sessions tagged with these words
- 2026/10/15 [Clarity trace page system](/framework/ai/sessions/2026/10/15/session-eb5e27d5/) — kind/agent model/sonnet work/read-only task/page-system · $0.14
- 2026/10/15 [Debug views](/framework/ai/sessions/2026/10/15/session-eafccb46/) — kind/agent model/sonnet work/read-only task/page-system · $0.14
- 2026/10/15 [Class map page system](/framework/ai/sessions/2026/10/15/session-c6902aa6/) — kind/agent model/sonnet work/read-only task/page-system docs/classes · $0.14
- 2026/10/15 [Page system audit and documentation review](/framework/ai/sessions/2026/10/15/session-c57d1c4b/) — kind/owner model/opus mod/ai/sessions task/page-system · $17.87
- 2026/10/15 [Voice system requirements](/framework/ai/sessions/2026/10/15/session-c55bafbb/) — kind/agent model/sonnet work/read-only task/ai-system · $0.15
- 2026/10/15 [Debug views requirements](/framework/ai/sessions/2026/10/15/session-baaf8f25/) — kind/owner model/haiku mod/ai/sessions task/page-system · $0.26

## Owner asks
- 2026-10-02 AI system docs: the System tab now explains the whole thing (task-mastermind-ai-system-docs, landed)
- 2026-09-30 Review: one review skill, system questions, screenshots at 4 widths (task-mastermind-review, building)
- 2026-09-30 Dictation: sheet shows the chat and mic; release the mic when hidden (minion-sheet-regression, building)
- 2026-09-30 Servex docs: the agent system as flowcharts (task-mastermind-servex-docs, routed)
- 2026-09-30 AI: /framework/ai/ becomes the AI system's home, stale page deleted (task-mastermind-ai-page, building)

## Commits
- 2df168ccd test mastermind brief: a small test system that runs on change
- ee2ed62d6 process-system: Process extends Task (phases node runs in series) + ProcessRunner; one item call creates a bu…
- 8d1b41ce5 TaskMigrate: never write source (step 3d makes it who asked); brief path goes in data.brief
- 60a61163a ai-system run: readme smoke-test rule, audit, logging, tags and asked-for docs; task-loop defaults fixed
- 0e10a9854 ext/Shots: ShotsView (browser side) - round tree, before/after/overlay, judge buttons
- 359f25a40 docs-check fixes: resync the stale CLAUDE.md copy, de-dupe its write, name the System tab's two unlinked sub-…
- 63f57895c merge: local-ai -- Servex runs llama-server as a local model provider
- a99800701 process-monitor idle: stale VS Code sessions, idle-gated game close, commit charge

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 42,048 tokens of reading, under the 100k limit).

Question: Test system: tests that run themselves when something changes

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Test system: tests that run themselves when something changes"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
