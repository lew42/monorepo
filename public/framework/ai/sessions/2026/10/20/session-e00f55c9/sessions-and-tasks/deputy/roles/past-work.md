<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Roles  a Role class  each session records its role  and pages show it" (words: rol, role, clas, each, session, record, show)

## Tasks (8, best first)
- 2026-10-20 [Roles: a Role class, each session records its role, and pages show it](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/deputy/roles/) — public/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/deputy/roles/requirements.md
- 2026-10-09 [Sessions: red flags, roles and stable In-flight](/framework/ai/sessions/2026/10/09/session-1c89ffc4/sessions-red-flags/) — Sessions now flag expense and stalls, and (unknown) is small. negative durations gone: resumed agents kept an old stop time; now clamped (AISessionRows.span_ms) (unknown) role: 7,270 sessions down to about 427, classified from source, Servex registry and firs…
- 2026-10-08 [Session class: cost, audit, record, lifecycle, tags and filters](/framework/ai/sessions/2026/10/08/3f5a5fec-dbf0-4a4b-8573-560f281a0be3/session-class/) — The Session class, the audit and the Sessions page work are merged into michael/dev. Session.js prices a Claude session per message id, with subagents; the audit proves it against an independent recompute ([session-class](/framework/ai/sessions/doc/session-cl…
- 2026-10-22 [readme-roles](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/readme-roles/) — Ready to merge, not merged: branch task/readme-roles (3 commits). - ✅ CLAUDE.md 3,763 → 1,319 words; framework rules are one line each in [the framework readme](/framework/readme.md), long form in [doc/rules.md](/framework/doc/rules.md) - ✅ Six role readmes: …
- 2026-09-29 [Voice sessions: the roles table, the echo link, and which log agents …](/framework/ai/sessions/2026/09/30/voice-sessions/voice-sessions/c-roles/) — Landed in worktree qf-9, commit c65ce26c — not yet merged into michael/dev, so these links aren't live on the site yet. Names reconciled into [one roles table](/framework/ai/2026-09-22/tiers-design/doc/roles.md): fast/smart assistant, directory mastermind, ta… · paths 1/1 exist
- 2026-10-22 [Prompt audit: Haiku sorts each owner prompt, Sonnet finds each sessio…](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/prompt-audit-system/) — The prompt audit runs: one command per session, results beside the session, nothing filed as tasks. [How to run it, cost](/framework/ai/doc/prompt-audit.md) both passes on session 7efd07d5: 22 prompts, 376 items, $2.01; two reviewer rounds with feedback recor… · paths 1/1 exist
- 2026-10-20 [Sessions: record-only (cloud voice) sessions get a snapshot](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/cloud-sessions-listed/) — Cloud voice sessions now get a day-index snapshot, so the grid and dashboard can list them. snapshot for a record-only folder: AISessionIndex.record_snap() + load_records() + a watch on session.jsonl; test AISessionIndex.test.mjs passes grid kind chip cloud v… · paths 1/1 exist
- 2026-10-20 [Tab session record: tab folders get session.jsonl and their prompts](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/tab-session-record/) — Scope cut to the SessionStart hook only (owner: DRY). prompt-relay.mjs, Echo.js, DayPromptsRefine.mjs and context-loss.md are back to their earlier versions; .claude/hooks/session-page.mjs still writes session.jsonl line 1 once; the sessions readme row says s…

## Modules that exist now (files outside the module that import it)
- [core/Session](/framework/core/Session/) — used by 13 files
- [ext/Classify](/framework/ext/Classify/) — used by 1 files
- [ext/Session](/framework/ext/Session/) — used by 11 files
- [ui/controls](/framework/ui/controls/) — used by 16 files

## Docs and readmes
- [AI — the folder where the AI system's records live and the …](/framework/ai/readme.md) — Priorities now: [priority.md](priority.md) — the ranked list every mastermind reads before it spawns. Who does what: [doc/readme-system.md]…
- [Refine queue — the owner's past prompts, refined one at a t…](/framework/ext/Refine/doc/refine-queue.md) — The owner dictates long prompts; an agent condensing one can drop a specific suggestion. The refine queue turns every past owner prompt int…
- [AI records — what is on disk, who writes it, who reads it; …](/framework/ai/doc/records.md) — Moved word for word from [the ai readme](../readme.md) on 2026-10-22, so the readme stays an index ([move map](../sessions/2026/10/20/sessi…
- [Context drift: why a long-running agent forgets its role, a…](/framework/ai/doc/context-drift.md) — Context drift is what happens to a long session. The instructions it started with (its role readme, its rules) sit hundreds of thousands of…
- [What every agent reads, the roles, and a readme audit (prop…](/framework/ai/doc/readme-system.md) — The owner's ask: rules get lost because nobody is sure which files each agent reads. Measured below; the moves are proposals until the owne…
- [Session architecture — a record is its dated folder, and no…](/framework/core/Session/doc/architecture.md) — Session is the base class for any record that is made at a moment and lives in its own folder: <root>/YYYY/MM/DD/<slug>/ with a page.jsonl …
- [AISession — one Claude session as a class family](/framework/ai/AISession/readme.md) — AISession reads one session's transcript once and keeps its cost; the classes beside it are the views and tools that grow around that. The …
- [roles.md](/framework/servex/doc/roles.md) — you ├── this VS Code tab ............ the root mastermind today (routes, merges, settles disputes) │ └── Servex (always on) ├── master assi…

## Sessions tagged with these words
- 2026/10/20 [Ultracode](/framework/ai/sessions/2026/10/20/session-730e8a7b/) — kind/owner mod/ai/sessions mod/.claude/skills/voice-mastermind framework/digest · $646.14
- 2026/10/17 [Voice mastermind Opus session](/framework/ai/sessions/2026/10/17/session-0368b7c5/) — kind/owner model/opus mod/ai/sessions task/voice-opus servex/voice · $20.90
- 2026/10/16 [Owner check: voice session 2026-10-16 items](/framework/ai/sessions/2026/10/16/session-4a4fea68/) — kind/agent model/sonnet mod/ai/sessions task/owner-words.md framework/sessions · $0.27
- 2026/10/16 [Voice session 2026-10-16](/framework/ai/sessions/2026/10/16/session-24f68eac/) — kind/owner model/opus mod/ai/sessions task/voice-20261016 servex/voice · $18.12
- 2026/10/16 [Past-work task mastermind](/framework/ai/sessions/2026/10/16/session-1fe7009b/) — kind/owner model/sonnet mod/ai/sessions mod/core/page mod/ai/aisession task/past-work · $11.04
- 2026/10/15 [Past-work-map session directory logs](/framework/ai/sessions/2026/10/15/session-e5f06b7c/) — kind/owner model/sonnet mod/ai/sessions task/past-work-map · $0.53

## Owner asks
- 2026-09-30 Grip: show zone ~50px, grab zone 1px toward the scrollbar; names for grip, preview rail, … (task-mastermind-grip-zones, building)
- 2026-10-12 Pages as live streamed parts; each page shows its own tasks (asked 9x) (mastermind-page-ai-api, routed)
- 2026-10-02 ext/panel2 (header toolbar, main with sides, footer) + AI dashboard: Sessions view (every… (task-mastermind-panel2-sessions, building)
- 2026-09-30 Dictation: sheet shows the chat and mic; release the mic when hidden (minion-sheet-regression, building)
- 2026-09-30 Prompts: each owner prompt becomes a refined Inbox card (servex-mastermind-opus (by hand until built), building)

## Commits
- dad351ff1 deputy/roles: the Role class brief (queued until the roles.js reshape merges; look first)
- 17877f6ce core/Page: owner start doc, class map, Router link; readme claims verified (6 stale fixed)
- 4b2ccb1ab docs: classes-as-structure, readme-as-memory, no hard role fences; brief for the AI-system docs mastermind
- c0e88f94c AI 2: dollar cost on every preview and card; honest per-task cost split by time; detail pages fill the column

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 42,685 tokens of reading, under the 100k limit).

Question: Roles: a Role class, each session records its role, and pages show it

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Roles: a Role class, each session records its role, and pages show it"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
