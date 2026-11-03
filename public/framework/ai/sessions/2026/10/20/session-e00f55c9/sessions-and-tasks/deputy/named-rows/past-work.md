<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Sessions page  a named agent s row opens a working page" (words: session, named, agent, row, open, work)

## Tasks (8, best first)
- 2026-08-14 [browser-cli-bridge](/framework/ai/sessions/2026/08/14/browser-cli-bridge/) — [ext/Ask](/framework/ext/Ask/) — a browser input talks to a Claude Code session, and the reply lands in this log. Every chat line above arrived through it. - A turn is a process, not a pipe. claude -p --resume <id> replays a session from its transcript, takes… · paths 1/1 exist
- 2026-10-20 [AI index: a day stream of task and session changes](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/index-stream/) — Every task or session change now appends one line to that day's index.jsonl, and the dashboard patches the changed row from it. one stream line per change, per day folder: sessions/YYYY/MM/DD/index.jsonl, written by the new class [AIIndexStream](/Server/AIInd…
- 2026-10-16 [Session pipeline: digest.json and tags for the last 3 days](/framework/ai/sessions/2026/10/16/voice-20261016/past-work/) — Round 4 steps 3 and 4 landed. digest.json beside each session folder, node only, add only: 587 of 607 sessions (20 have no folder yet); a second run wrote 0 and kept 587 (commit bd39fad93) tags filled for the last 3 days, newest first: procedural (kind/ model… · paths 2/2 exist
- 2026-10-13 [framework/ai: one tree, the Inbox cards moved into the sessions store](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/one-store-apply/) — One tree: every Inbox card now lives in ai/sessions/YYYY/MM/DD/cards/, and ai/2026/ is gone. A card keeps its address, so every old link still opens it. ![a moved card, opened from the Inbox](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-… · paths 2/2 exist
- 2026-10-13 [SessionIndex: 1,491 task rows in memory, 1–2 s load, raw-log path on …](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/session-index/) — One in-memory SessionIndex (extends ext/Query) holds 1,491 rows from 1,491 task files, loads in 1.1–2 s (+21–23 MB heap); PastWork and FollowUp read through it with identical output; ux/Dictate = 33 tasks, 32 with a raw transcript path. Commits c5a9864ba, ab0…
- 2026-10-12 [Sessions: rows come from a node query, not every file](/framework/ai/sessions/2026/10/12/session-87bec773/server-query/) — Sessions now asks node for the rows it shows — default on the dev socket; ?source=files keeps the old path. node holds the data, socket query API: [ext/Query](/framework/ext/Query/), 30–40 ms per query client gets only what it shows: heap 33 → 17 MB, socket 9… · paths 1/1 exist
- 2026-10-12 [Sessions grid: newest month first, live, current model, one row per s…](/framework/ai/sessions/2026/10/12/session-eecd88fa/sessions-grid/) — Round 2 of the Sessions grid is in: one list by recency, five role chips, columns that resize, cost freshness shown. Details: [grid-loading.md](/framework/ai/sessions/doc/live/grid-loading.md). one grid sorted by recency: the Now strip is gone, working rows s…
- 2026-10-12 [Sessions: close the open asks](/framework/ai/sessions/2026/10/12/session-15fbffb1/sessions-asks/) — All four open points are done: roll-ups, red flags, tasks migration, and the resume tier now shown on every row. month/year roll-ups: AISessionIndex.mjs --check totals match red flags and mastermind tag: 0074f0578 tasks migration: 7fa3d978b resume tier on eac…

## Modules that exist now (files outside the module that import it)
- [core/Session](/framework/core/Session/) — used by 15 files
- [ext/Session](/framework/ext/Session/) — used by 11 files
- [ui/row](/framework/ui/row/) — used by 7 files
- [ux/Browse](/framework/ux/Browse/) — used by 4 files

## Docs and readmes
- [Claim — a tab claimed by an agent: a ring around the viewpo…](/framework/dev/Claim/readme.md) — ## Use mcp__site__claim tab: "3e83f2c0", note: "<task-slug>" — ring the tab you drive mcp__site__release tab: "3e83f2c0" — when the task la…
- [Figma architecture — the browser reads, an agent writes](/framework/ext/Figma/doc/architecture.md) — The Figma module shows tracked Figma files as routed pages. The browser only reads JSONL and screenshots that already sit in the repo; an a…
- [Session architecture — the browser is a thin client, Servex…](/framework/ext/Session/doc/architecture.md) — ext/Session is the browser half of a voice session: one ✦ press is one session, and its whole conversation is one JSONL file that Servex wr…
- [Sessions and tasks: a spawned agent is a session, a task is…](/framework/ai/doc/sessions-and-tasks.md) — Decision (the owner, 2026-10-19). The naming was the bug. An agent the SDK spawns is a session: it has a session id. It is not a task. We u…
- [audit/browsable — the prime objective's scorecard: how deep…](/framework/audit/browsable/readme.md) — ## Use findings.json is the generated baseline; page.js only renders it, so every number moves when it is regenerated: js const { totals, b…
- [Tree — nested rows you can open, drag and drill into. One c…](/framework/ux/Tree/readme.md) — Rows from a plain array, or straight from a Page's children. The keyboard is always on. Drag, the drill-down and the row buttons are proper…
- [Asks about dev: 1 open, 0 done](/framework/dev/doc/refined-asks.md) — Generated by node Server/AskIndex.mjs from the refined asks in each session's asks.jsonl; never hand-edited. Newest first. Open ones are al…
- [Ask — talk to a Claude Code session from the browser; for p…](/framework/ext/Ask/readme.md) — ## Use js import { ask, available } from "/framework/ext/Ask/Ask.js"; if (available()) { const { text } = await ask("Name the three widest …

## Sessions tagged with these words
- 2026/10/16 [Owner check: voice session 2026-10-16 items](/framework/ai/sessions/2026/10/16/session-4a4fea68/) — kind/agent model/sonnet mod/ai/sessions task/owner-words.md framework/sessions · $0.27
- 2026/10/15 [Clarity voice mastermind](/framework/ai/sessions/2026/10/15/session-e1a13a37/) — kind/agent model/sonnet mod/ai/sessions task/mastermind-repo-slim framework/ai · $0.25
- 2026/10/15 [Voice component refine and audit](/framework/ai/sessions/2026/10/15/session-9afd8738/) — kind/agent model/opus mod/ai/sessions task/refine-audit framework/refine · $0.88
- 2026/10/15 [Refine-audit review](/framework/ai/sessions/2026/10/15/session-96266d4e/) — kind/agent model/opus mod/ai/sessions task/refine-audit framework/refine · $0.91
- 2026/10/15 [Voice refine audit review](/framework/ai/sessions/2026/10/15/session-8e081544/) — kind/agent model/opus mod/ai/sessions task/refine-audit framework/refine · $0.79
- 2026/10/15 [Past-work discovery landing check](/framework/ai/sessions/2026/10/15/session-7620fac2/) — kind/agent model/sonnet mod/ai/sessions task/owner-words.md framework/sessions · $0.24

## Owner asks
- 2026-09-30 Memory: dormant idle agents, working cap, auto-compaction (task-mastermind-dormant-idle, building)
- 2026-09-30 Design and code: /framework/design/ and /framework/code/ as browsable knowledge; skills t… (task-mastermind-design-code, routed)
- 2026-09-30 Memory: dormant idle agents, working cap, auto-compaction (task-mastermind-dormant-idle, landed)
- 2026-09-30 Design and code: /framework/design/ and /framework/code/ as browsable knowledge; skills t… (task-mastermind-design-code, landed)
- 2026-10-03 Servex: worktree pool stuck (qf-6, qf-9 held 17h by finished agents) (mastermind-servex-10, building)

## Commits
- 2939b8d99 todo: named agent rows on the sessions page 404 (prompts file, ai-logs by name)
- d1168394f page tool: a session folder it makes is named for its agent and found again by the scan
- c8d9c59aa mastermind-cheap-models: spawn-decision log, 5-question Haiku proving ground, pace calibration, ask-audit ext…
- 44b838786 token-reduction: results-gated spend, revive keeps provider, landed-task reap proof
- 2ef2f5a3c drawer-chat round 2: the composer is one real panel, not a box in a box
- c6385f3ee session-gate: document Pool.take_sync in the Servex / agents readmes
- 41d312562 Mobile rail: second button reads ⋯ More, not a second ☰

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 42,753 tokens of reading, under the 100k limit).

Question: Sessions page: a named agent's row opens a working page

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Sessions page: a named agent's row opens a working page"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
