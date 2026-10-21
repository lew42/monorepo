<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Servex Pool  stop the quick fix pool leaking slots" (words: servex, pool, stop, quick, fix, leak, slot)

## Tasks (8, best first)
- 2026-09-25 [Quick-fix worktrees: a warm pool, and a smoke test before every merge](/framework/ai/sessions/2026/09/25/quickfix-worktrees/) — One quick-fix worktree is always warm, and nothing merges without a smoke test. Call take_worktree, write, then node Server/merge.mjs <path> <pages>, then return_worktree. ![Live card with the pool](/framework/ai/2026-09-25/quickfix-worktrees/live-1920.png) s… · paths 0/1 exist, gone: framework/ai2/live/
- 2026-10-17 [Servex pool: reclaim frees slots whose work is on michael/dev; node S…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/pool-reclaim/) — pool-status.mjs lists every slot with holder, branch, ahead, uncommitted and FREE/KEPT. Reclaim frees clean-stopped and landed-by-diff slots (commits kept on landed/<slot>-<date>-<sha>) and a hold whose holder was gone 12 h+; kept slots name their branch. Liv…
- 2026-10-03 [Servex: free the stuck pool slots, and stop them sticking](/framework/ai/sessions/2026/10/03/pool-unstick/) — public/framework/ai/2026-10-03/pool-unstick/requirements.md
- 2026-10-03 [Servex: dev-server RAM leak reaped, and the hand-started-server leak …](/framework/ai/sessions/2026/10/02/node-reap/) — Reaped now, then guarded against it happening again. Reap now: 60 node processes/2319MB -> 16/859MB, freed 1460MB. result.json. Server stops on pool-return or landed task: already built (Worktrees.js/Pool.js, 2026-10-01); this run's reasons prove it. Idle, no… · paths 1/1 exist
- 2026-10-02 [quick-fix-path](/framework/ai/sessions/2026/10/01/quick-fix-path/) — The fast path: a voice fix this is live in 10-30 s via a warm quick-fixer on the qf pool and a light merge.mjs --quick; bigger work goes to a task mastermind; time to first fix measured by node.
- 2026-10-01 [Fixer: the standing quick-fix agent and its hot path](/framework/ai/sessions/2026/10/01/quick-fix-path/fixer/) — What landed: fixer-1, the standing quick-fix agent, and the quick_fix hot path — reviewed (3 fixed, 1 declined, 2 noted), merged into michael/dev. standing fixer-1 (Sonnet, medium, bypassPermissions, holds+fast-forwards its own slot) — Fixer.js, proof pool-ho… · paths 2/2 exist
- 2026-10-18 [servex-small: four small Servex fixes](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/servex-small/) — Three fixes landed and one was already there; the live Servex still needs a restart by the mastermind. [x] list_agents live rows by default: already shipped in 9374a54db, default 1 row/203 B vs all 1204 rows/204 KB. [x] reply_to answered once: envelope wordin…
- 2026-09-30 [ai2-soak-leak](/framework/ai/sessions/2026/09/30/ai2-soak-leak/ai2-soak-leak/) — Found and fixed: three /framework/ai2/ pollers never paused when the tab was hidden. agents.js (10s per open card), live.js (poll_agents 30s, poll_usage 60s, poll_pool 30s) and needs.js (20s needs-you scan) all ran a plain setInterval with no document.hidden … · paths 2/3 exist, gone: framework/ai2/2026/09/28/inbox-rows-are-the-real-pages-page-class/

## Docs and readmes
- [Quick fix](/framework/ai/quick-fix/readme.md) — The log of every small fix asked for by voice — "make this bold", "this gap is too big" — and how many seconds each one took to land. The l…
- [Fixtures, and what "approved" means](/framework/core/Layout/doc/fixtures.md) — A layout owns no content. The fixtures are what goes in its slots instead, and they *are* the separation between layout and content: pour t…
- [roles.md](/framework/servex/doc/roles.md) — you ├── this VS Code tab ............ the root mastermind today (routes, merges, settles disputes) │ └── Servex (always on) ├── master assi…
- [Tool collapse: 81 Servex tools in every session, a plan to …](/framework/ai/doc/tool-collapse.md) — Plan only, 2026-10-15. Nothing in Servex was changed and nothing restarted. The numbers come from a script you can rerun: [ToolCollapse.mjs…
- [Boot: what App stopped doing, and the unawaited constructor](/framework/core/App/doc/boot.md) — ## What App stopped doing App used to own url resolution (load_page, path_to_page_url, mark_links, load_ancestors, host?.()). All of it mov…
- [Doc architecture — a module is a page with four fixed tabs](/framework/ext/Doc/doc/architecture.md) — Doc turns a module into a browsable page: Overview, API, Docs, Files, plus any declared children. It is a class, [Doc.js](../Doc.js), that …
- [Session architecture — the browser is a thin client, Servex…](/framework/ext/Session/doc/architecture.md) — ext/Session is the browser half of a voice session: one ✦ press is one session, and its whole conversation is one JSONL file that Servex wr…
- [How each number was counted](/framework/servex/lifecycle/doc/counting.md) — Read only — nothing on this list stops or changes anything. The script is [ai/sessions/2026/09/29/3c88ad4d-b2e6-4899-b5c4-fbca0e2674e2/life…

## Sessions tagged with these words
- 2026/10/17 [Voice mastermind Opus session](/framework/ai/sessions/2026/10/17/session-0368b7c5/) — kind/owner model/opus mod/ai/sessions task/voice-opus servex/voice · $20.90
- 2026/10/16 [Inbox labels](/framework/ai/sessions/2026/10/16/session-e91fc031/) — kind/owner model/sonnet mod/core/page mod/servex mod/.claude/skills/mastermind task/inbox-labels · $1.45
- 2026/10/16 [Transcripts.mjs essence file builder](/framework/ai/sessions/2026/10/16/session-7d42f623/) — kind/owner model/sonnet mod/server task/past-work servex/transcripts · $1.26
- 2026/10/16 [Voice session 2026-10-16](/framework/ai/sessions/2026/10/16/session-24f68eac/) — kind/owner model/opus mod/ai/sessions task/voice-20261016 servex/voice · $18.12
- 2026/10/15 [Voice mastermind MCP gateway](/framework/ai/sessions/2026/10/15/session-eda55316/) — kind/owner model/sonnet mod/servex mod/ux/dictate task/mastermind-repo-slim servex/voice · $1.28
- 2026/10/15 [Voice mastermind 2026-10-15](/framework/ai/sessions/2026/10/15/session-ec7470e9/) — kind/owner model/opus work/read-only task/voice-20261015 servex/voice · $4.27

## Owner asks
- 2026-10-03 Servex: worktree pool stuck (qf-6, qf-9 held 17h by finished agents) (mastermind-servex-10, building)
- 2026-09-30 Servex docs: the agent system as flowcharts (task-mastermind-servex-docs, routed)
- 2026-09-30 Servex docs: the agent system as flowcharts (task-mastermind-servex-docs, dropped)
- 2026-09-30 AI 2 tab leak: pollers pause while hidden (minion-ai2-soak, landed)
- 2026-09-30 Servex docs as flowcharts: ON HOLD (the owner) (?, dropped)

## Commits
- f9571f86a feat(servex/pool): reclaim self-cleans slots of holders stopped 30+ min (non-destructive salvage), so a full …
- 95a272385 model-weights: rung 0 (HTML->View helpers) + primer A/B, section 5 harness fixes
- 628cd9a53 never-lose-a-wake: close every way a wake message could vanish
- 4dfc07189 process-monitor: stop idle worktree servers, per-role/per-request dormancy (asks 1, 2, 2b)
- dfb2eccec Add the Lifecycle study page under /framework/servex/lifecycle/
- 4500ebe8a lifecycle: creation log + reaper + keep list + pool salvage

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 47,219 tokens of reading, under the 100k limit).

Question: Servex/Pool: stop the quick-fix pool leaking slots

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Servex/Pool: stop the quick-fix pool leaking slots"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
