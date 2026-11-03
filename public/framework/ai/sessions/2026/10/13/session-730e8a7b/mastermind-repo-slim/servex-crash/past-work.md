<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Servex crashes with exit 3221226505 and sustain hides it  find the cause from the node fatal report  fix it  and make every crash visible" (words: servex, crash, exit, 3221226505, sustain, hid, find, cause, node, fatal, report, fix, every, visible)

## Tasks (8, best first)
- 2026-09-28 [The popup's real cause, found and fixed — plus a repo-wide guard](/framework/ai/sessions/2026/09/28/b42621ed-33f7-41f0-b19b-12c679306b9a/hidden-windows/) — What landed, updated — one real cause found and fixed (the Servex logon task's powershell -WindowStyle Hidden flash — see the first landing note below), 17 files swept for missing windowsHide, and the enforcement made per-call instead of file-wide. A second r… · paths 1/2 exist, gone: framework/ai2/2026-09-28/hidden-windows/
- 2026-09-24 [servex-crash](/framework/ai/sessions/2026/09/24/servex-crash/servex-crash/) — A Servex restart is now invisible: the dev server keeps running, and nothing the owner is looking at reloads or errors. - The gate (Servex/gate.mjs) holds port 80 through any Servex restart or crash, so a reload waits instead of showing Chrome's error page. -… · paths 0/1 exist, gone: framework/ai2/live/
- 2026-09-25 [Quick-fix worktrees: a warm pool, and a smoke test before every merge](/framework/ai/sessions/2026/09/25/quickfix-worktrees/) — One quick-fix worktree is always warm, and nothing merges without a smoke test. Call take_worktree, write, then node Server/merge.mjs <path> <pages>, then return_worktree. ![Live card with the pool](/framework/ai/2026-09-25/quickfix-worktrees/live-1920.png) s… · paths 0/1 exist, gone: framework/ai2/live/
- 2026-10-12 [Server: Whisper survives a Servex restart](/framework/ai/sessions/2026/10/12/session-e4a1482d/transcription-crash/) — Dictation broke because every Servex restart killed Whisper (2 to 14 s to reload); Whisper now outlives Servex and is adopted by the next one. a loop that dictates and reloads the page: [Server/TranscribeLoop.mjs](/Server/TranscribeLoop.mjs); 10 min with file…
- 2026-10-07 [Token accounting: fixed the real undercount (144/145 project folders …](/framework/ai/sessions/2026/10/08/token-accounting/token-accounting/) — Found and fixed the real accounting bug, and planned the realtime sessions page. Found it — [findings.md](/framework/ai/2026-10-07/token-accounting/findings.md): a case-sensitive match hid 144 of 145 worktree folders from the cost ledger; readers fell back to…
- 2026-10-02 [The card pipeline: every major ask gets a readable card, by node](/framework/ai/sessions/2026/10/03/card-pipeline/card-pipeline/) — Every major ask now gets a real card, written by code — the owner's dashboard explains why each score is what it is. Ask -> card, by node: is_major()/ensure_card() on every 60s tick. 3 of today's 4 named asks got a real card just now; the 4th already had one.… · paths 2/5 exist, gone: framework/ai2/2026/10/02/page-extends-item-one-set-persistence-in/ framework/ai2/2026/10/02/ext-panel2-header-toolbar-main-with-side/ framework/ai2/2026/10/02/ai-system-docs-the-system-tab-now-explai/
- 2026-09-30 [Voice sessions: fixed the doubled chat line, plus 10 second-review fi…](/framework/ai/sessions/2026/09/30/voice-sessions/voice-sessions/f-dupe-line/) — What landed: commit 1486ea2 in C:/Code/lew42/worktrees/voice-fixes. Part A, the double line on the ✦ sheet: fixed in rail.js (own_ats Set), proved with a headless run — the sentence shows once, not twice. B1 New session always starts fresh (fresh: true throug… · paths 2/2 exist
- 2026-09-28 [Fresh-eyes review: a new agent checks every task before merge](/framework/ai/sessions/2026/09/28/b6fa1bc1-fad0-4bdd-9b20-8cd1cd20afb4/fresh-eyes-review/) — A fresh agent now reviews every task before it merges, sized by the diff — none / light (Sonnet) / full (Opus, with screenshots). Reviewed: 10 fixed, 2 declined — [review.md](/framework/ai/2026-09-28/fresh-eyes-review/review.md) Review built into the task sys…

## Docs and readmes
- [Tool collapse: 81 Servex tools in every session, a plan to …](/framework/ai/doc/tool-collapse.md) — Plan only, 2026-10-15. Nothing in Servex was changed and nothing restarted. The numbers come from a script you can rerun: [ToolCollapse.mjs…
- [Page health — is it working? After every change, the pages …](/framework/ai/health/readme.md) — ## Use Run node Server/health-supervisor.mjs. It keeps one Server/health.mjs per tree alive, and that loads pages from HEALTH_BASE, the own…
- [framework/audit — the 2026-08-15 doc audit: one report per …](/framework/audit/readme.md) — ## Use Start at [Priorities](/framework/audit/overview/priorities/). A module's report is doc/<core|ext|dev>-<Name>.md, served as the Docs …
- [Framework — everything it offers is organized, visual, brow…](/framework/readme.md) — ## Index - [live](/live/) — the owner's live voice-work feed (lives at public/live/, not in this folder) - [core](./core/) — the seven clas…
- [Servex](/framework/servex/readme.md) — The always-on process on this machine (port 80). It runs the Claude agents, starts the dev servers, and owns every log file. It is not the …
- [The open-work line: every page says what is being worked on](/framework/core/Page/ai/doc/page-work-line.md) — What you see: under a page, one line, 2 open tasks on this page · 1 below. Click it for the task links. A page with no open work shows noth…
- [roles.md](/framework/servex/doc/roles.md) — you ├── this VS Code tab ............ the root mastermind today (routes, merges, settles disputes) │ └── Servex (always on) ├── master assi…
- [AITask — the AI working log, rendered: one task's page, a d…](/framework/ai/AITask/readme.md) — ## Use - Moved verbatim to [doc/api.md](./doc/api.md): the API. - The Session tab is a chat: talk in the stream, every tool call folded to …

## Sessions tagged with these words
- 2026/10/17 [Voice mastermind Opus session](/framework/ai/sessions/2026/10/17/session-0368b7c5/) — kind/owner model/opus mod/ai/sessions task/voice-opus servex/voice · $20.90
- 2026/10/16 [Inbox labels](/framework/ai/sessions/2026/10/16/session-e91fc031/) — kind/owner model/sonnet mod/core/page mod/servex mod/.claude/skills/mastermind task/inbox-labels · $1.45
- 2026/10/16 [Transcripts.mjs essence file builder](/framework/ai/sessions/2026/10/16/session-7d42f623/) — kind/owner model/sonnet mod/server task/past-work servex/transcripts · $1.26
- 2026/10/16 [Voice session 2026-10-16](/framework/ai/sessions/2026/10/16/session-24f68eac/) — kind/owner model/opus mod/ai/sessions task/voice-20261016 servex/voice · $18.12
- 2026/10/15 [Voice mastermind MCP gateway](/framework/ai/sessions/2026/10/15/session-eda55316/) — kind/owner model/sonnet mod/servex mod/ux/dictate task/mastermind-repo-slim servex/voice · $1.28
- 2026/10/15 [Voice mastermind 2026-10-15](/framework/ai/sessions/2026/10/15/session-ec7470e9/) — kind/owner model/opus work/read-only task/voice-20261015 servex/voice · $4.27

## Owner asks
- 2026-10-03 Page: AI cost line broke /framework/ai/ title (fixed db0e77af); links styled everywhere; … (task-mastermind-layout-gate, building)
- 2026-09-30 Servex docs: the agent system as flowcharts (task-mastermind-servex-docs, routed)
- 2026-09-30 Readmes: every agent reads the chain top-down, again on a directory switch (mastermind-servex-9, routed)
- 2026-09-30 Logs: page.jsonl curated vs log.jsonl everything (recommendation) (mastermind-servex-9, routed)
- 2026-09-30 Proposals: a Proposal class; review, decide, becomes a task; node-led loop; impact-weight… (mastermind-servex (next instance; spawn at the 10 PM reset), queued)

## Commits
- 6dcdc47f3 Servex: revive() once per process; a second Servex on the same port refuses before it touches the registry
- c123de090 Servex: a gate holds port 80 so a restart or crash never shows an error page

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 46,762 tokens of reading, under the 100k limit).

Question: Servex crashes with exit 3221226505 and sustain hides it: find the cause from the node fatal report, fix it, and make every crash visible

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Servex crashes with exit 3221226505 and sustain hides it: find the cause from the node fatal report, fix it, and make every crash visible"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
