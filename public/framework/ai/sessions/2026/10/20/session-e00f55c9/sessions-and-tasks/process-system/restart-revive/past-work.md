<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Servex  a restart brings back queued and working agents  not just one" (words: servex, restart, bring, back, queued, work, agent, not, just, one)

## Tasks (8, best first)
- 2026-10-20 [Servex agents: logs over messages, round 3 (prompts, items, skills, o…](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/system-architect/) — Round 3: all five asks landed; old AI data is in the store and the worktree pool frees itself. [mastermind skill](/.claude/skills/mastermind/SKILL.md): handle every prompt at once; Refine is the future, not used yet [core/Item](/framework/core/Item/): items s… · paths 1/1 exist
- 2026-10-20 [Phone sheet: reconnects after a Servex restart, one layout that only …](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/mobile-sheet/) — The phone ✦ sheet reconnects after a Servex restart, and is one three-row layout at every height. Merged 3415f5018. | Before | After | |---|---| | ![](/framework/ux/Dictate/surfaces/sheet-steps/before/sheet-003.png) | ![](/framework/ux/Dictate/surfaces/sheet-… · paths 2/2 exist
- 2026-10-16 [Servex checkup: nudge verified, skill tool and task.home built, dorma…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/checkup-servex/) — Compaction nudge verified on dev and logged needs_restart; helper-cost-fix stopped; expensive dormant agents left dormant with a read-don't-wake rule; skill tool and spawn task.home built; per-prompt door answered (ask_mastermind); coordination rule added to …
- 2026-10-14 [Tasks: in flight, queued and landed today, one live page](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/tasks-dashboard/) — [/framework/ai/tasks/](/framework/ai/tasks/) lists what is in flight, queued and landed today, live, from the real state. - ✅ One list, three groups, in order; a row opens the task card beside it. Proof: sheet-list-400-1200-1920-3440.png, shot-1920-detail.png… · paths 1/2 exist, gone: framework/ai/tasks/lanes/
- 2026-10-13 [framework/ai: one tree, the Inbox cards moved into the sessions store](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/one-store-apply/) — One tree: every Inbox card now lives in ai/sessions/YYYY/MM/DD/cards/, and ai/2026/ is gone. A card keeps its address, so every old link still opens it. ![a moved card, opened from the Inbox](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-… · paths 2/2 exist
- 2026-10-13 [Git status: the log sweeper now covers every record kind; a Servex re…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/tidy-git-status/) — The sweeper's allowlist is widened and today's dirty records are committed; it runs only after a Servex restart. Landed by the mastermind from the agent's own answer (the agent ended without a landing line). LogSweeper ALLOW widened (sessions day index.json, …
- 2026-10-12 [Owner inbox: one owner_note path pinned to the top](/framework/ai/sessions/2026/10/12/session-d2fd8fab/owner-inbox/) — owner_note landed. Agents now tell the owner through one tool; the note sits first in the AI Inbox until the owner opens it. note reaches the owner and stays: score 100, no decay, first row; headless at 400/1200/1920/3440, no errors ([STATE.md](/framework/ai/…
- 2026-09-30 [Servex: idle agents go dormant, 5 working at most, auto-compaction](/framework/ai/sessions/2026/09/30/2976c23c-62af-4aa8-b898-5e56e1c025f8/dormant-idle/) — Idle agents go dormant; at most 5 work; big agents compact (106a51a1, live). idle 3 min: the process exits, the session is kept: [proof.txt](proof.txt), 4 agents to 1 process a dormant agent answers within 15 s, context intact: [proof.txt](proof.txt) working …

## Modules that exist now (files outside the module that import it)
- [ui/background](/framework/ui/background/) — used by 0 files

## Docs and readmes
- [One stream for the UI, node and the agents: a design (not b…](/framework/core/Item/doc/one-stream.md) — Status: design, 2026-10-22, by the system architect. Building waits: the owner put the full nested-items work behind sessions, tasks and pr…
- [Inbox — one ranked list of what wants the owner's attention…](/framework/core/Page/ext/Inbox/readme.md) — An inbox is a list of rows (notes, questions, landed tasks, cards that wait on the owner) sorted by one number, Inbox.rank. There are two v…
- [Undone asks, 2026-10-17: 620 of 1,150 have no landing, and …](/framework/ai/doc/undone-asks-2026-10-17.md) — The page is [/framework/ai/asks/undone/](/framework/ai/asks/undone/); the numbers come from node Server/UndoneAsks.mjs --json (class Undone…
- [live.js — notes and design reasons](/framework/ai/rail/doc/live-notes.md) — ## THE LIVE CARD (/framework/ai2/live/) The first card that does not come from ai/board.jsonl (the owner, 2026-09-23). It shows what is goi…
- [Processes snapshot and visualization](/framework/ai/rail/doc/Processes-notes.md) — ## Overview The Processes section displays /framework/ai2/live/'s "Processes" block, showing memory and CPU usage snapshots from Servex. ##…
- [A thing has a page; it is not one (2026-10-08)](/framework/core/Page/doc/composition.md) — Rule: when something (a task, a session, an agent) needs a page, give it one by reference — thing.page and page.thing — rather than extendi…
- [Inbox — one class, two views: a page's rail, and its small …](/framework/core/Page/ext/Inbox/doc/readme-before-2026-10-19.md) — The rail is a [Browse](/framework/ux/Browse/) (2026-10-14): Inbox.Rail extends Browse, the one list-and-detail view the Inbox and Sessions …
- [Where styles_loaded() is awaited, and why not one line later](/framework/core/Router/doc/styles-loaded.md) — A page imported on *this* navigation has just called View.stylesheet() at module scope, and its <link> is not in document.styleSheets yet —…

## Sessions tagged with these words
- 2026/10/15 [Spawn policy review](/framework/ai/sessions/2026/10/15/session-e94bf72b/) — kind/agent model/opus work/read-only task/spawn-policy servex/policy · $0.60
- 2026/10/15 [Remote full registry](/framework/ai/sessions/2026/10/15/session-d75b6d76/) — kind/agent model/sonnet work/read-only task/remote-full-registry servex/remote-tools · $0.14
- 2026/10/14 [Clarity voice connector](/framework/ai/sessions/2026/10/14/session-9a02d4eb/) — kind/agent model/sonnet work/read-only task/mastermind-repo-slim servex/voice · $0.15
- 2026/10/14 [Clarity r2-archive](/framework/ai/sessions/2026/10/14/session-4085644e/) — kind/agent model/sonnet work/read-only task/mastermind-repo-slim servex/policy · $0.14
- 2026/10/16 [Inbox labels](/framework/ai/sessions/2026/10/16/session-e91fc031/) — kind/owner model/sonnet mod/core/page mod/servex mod/.claude/skills/mastermind task/inbox-labels · $1.45
- 2026/10/16 [Voice session review and refinement](/framework/ai/sessions/2026/10/16/session-da50b6af/) — kind/agent model/opus work/read-only task/refine-build · $0.89

## Owner asks
- 2026-10-03 Servex: worktree pool stuck (qf-6, qf-9 held 17h by finished agents) (mastermind-servex-10, building)
- 2026-09-30 Worktrees: remove merged ones; Servex drops their subdomains (task-mastermind-dormant-idle, building)
- 2026-10-15 Servex remote MCP: voice-agent directives in the MCP server instructions + ask_mastermind… (?, queued)
- 2026-10-15 Voice mastermind: answer within seconds every time (best guess or 'looking into it'), han… (?, held)
- 2026-10-15 Servex restart plan: a restart must not drop the voice call; a fresh mastermind may answe… (?, noted)

## Commits
- a2174a634 Server: worktree-restart.mjs revives a worktree's dev server after its process dies

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 42,093 tokens of reading, under the 100k limit).

Question: Servex: a restart brings back queued and working agents, not just one

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Servex: a restart brings back queued and working agents, not just one"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
