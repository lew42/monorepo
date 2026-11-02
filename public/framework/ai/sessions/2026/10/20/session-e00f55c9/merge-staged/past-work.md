<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "merge mjs keeps refusing because of stray staged files  fix the loop  you are a mastermind  on Sonnet  high effort " (words: merge, mj, keep, refus, because, stray, staged, fil, fix, loop, you, mastermind, sonnet, high, effort)

## Tasks (8, best first)
- 2026-10-20 [Quick fix merge: Whisper card on /framework/audio/](/framework/ai/sessions/2026/10/20/session-e4971f1a/task-mastermind/) — Cherry-picked qf-7 commit 83630fa8e into michael/dev as 60cbbf5ea (merge.mjs refused: 2 dirs, no dev server on qf-7). Page checked at 400 and 1200: Whisper card and tab show, no overflow.
- 2026-10-03 [Link styles + merge gate: blue links fixed, text-touching-edges now f…](/framework/ai/sessions/2026/10/03/588af12b-12cf-4166-a7a4-a6cfa504194b/layout-gate/) — Landed — every <a> now gets the house link style, not just ones in prose, and Server/smoke.mjs fails the merge on text flush against an unpadded edge or anything above a page's title. Commit a3248c70 on michael/dev. links styled everywhere: [shot, /framework/… · paths 1/1 exist
- 2026-10-02 [merge.mjs --quick + review.mjs widthsFor — one screenshot at the widt…](/framework/ai/sessions/2026/10/01/quick-fix-path/quick-merge/) — Applied to michael/dev's working tree (not yet committed — the owner commits): widthsFor in review.mjs, and merge.mjs --quick. widthsFor(files, numstat, pages), exported from review.mjs: 1200 alone for words, all four for anything that can reshape layout, 400…
- 2026-09-29 [PageFiles: a folder that arrives by a git merge now gets its own log](/framework/ai/sessions/2026/09/29/page-files-merge-fix/page-files-merge-fix/) — A folder that arrives all at once (a git merge) now gets its page.jsonl too. handle() calls ensure() on the containing folder of any surviving event, not just the changed entry, so one lucky event anywhere inside a new subtree backfills the whole thing via a … · paths 1/1 exist
- 2026-09-30 [probes.mjs: score a model's probe run on six fixed checks, label a/b/…](/framework/ai/sessions/2026/09/30/probe-tasks/runner/) — Built Servex/ext/openrouter/evals/probes.mjs per probes.md/probes.json's design, and ran it for real. --dry-run prints model/probe/prompt/dir and spawns nothing — shown for page-blog and log-line. One real run each of page-blog and log-line on claude-haiku-4-… · paths 1/1 exist
- 2026-09-28 [Fresh-eyes review: a new agent checks every task before merge](/framework/ai/sessions/2026/09/28/b6fa1bc1-fad0-4bdd-9b20-8cd1cd20afb4/fresh-eyes-review/) — A fresh agent now reviews every task before it merges, sized by the diff — none / light (Sonnet) / full (Opus, with screenshots). Reviewed: 10 fixed, 2 declined — [review.md](/framework/ai/2026-09-28/fresh-eyes-review/review.md) Review built into the task sys…
- 2026-09-28 [merge.mjs finds changed pages itself; smoke.mjs follows their links](/framework/ai/sessions/2026/09/28/b784a919-ce8c-4785-90d5-92b615b91d7c/smoke-links/) — Landed. Server/merge.mjs finds a branch's changed pages itself and hands them to Server/smoke.mjs, which follows every link on each page one level deep and fails on a 404 or a real load-error screen, naming both. A new page also gets a screenshot. Why: 7 tile… · paths 0/2 exist, gone: framework/ai2/2026/09/24/system-design/ framework/ai2/2026-09-28/smoke-links/
- 2026-09-28 [review-fixes](/framework/ai/sessions/2026/09/28/ce1cbe96-a28c-43d3-897e-4629ae753aeb/source-library/review-fixes/) — All 8 assigned review findings closed (1, 2, 3, 4, 6, 7, 9, 10); findings 5 and 8 left for the mastermind, as the brief said. - [/framework/sources/](/framework/sources/) — the library front page, fixed (finding 1: sources was never in page.js's children:, so… · paths 2/3 exist, gone: framework/ext/DesignTool/files/

## Modules that exist now (files outside the module that import it)
- [core/Layout](/framework/core/Layout/) — used by 33 files
- [ext/files](/framework/ext/files/) — used by 24 files
- [ext/filesystem](/framework/ext/filesystem/) — used by 32 files
- [ext/highlight](/framework/ext/highlight/) — used by 24 files
- [ext/layout](/framework/ext/layout/) — used by 19 files
- [ux/Filter](/framework/ux/Filter/) — used by 4 files

## Docs and readmes
- [The flicker — why your words vanished and came back, and th…](/framework/ux/Dictate/doc/flicker.md) — The rule (the owner, 2026-10-24): while dictation is on, your words appear in place in the chat bubble, as if already sent. Nothing you are…
- [Fixtures, and what "approved" means](/framework/core/Layout/doc/fixtures.md) — A layout owns no content. The fixtures are what goes in its slots instead, and they *are* the separation between layout and content: pour t…
- [AI system architecture — files are the memory, code runs th…](/framework/ai/doc/architecture.md) — The AI system is everything that lets agents do work here and lets the owner see it: Servex runs the agents, the readme chain tells them wh…
- [Undone asks, 2026-10-17: 620 of 1,150 have no landing, and …](/framework/ai/doc/undone-asks-2026-10-17.md) — The page is [/framework/ai/asks/undone/](/framework/ai/asks/undone/); the numbers come from node Server/UndoneAsks.mjs --json (class Undone…
- [LayoutRules — three, because CSS answers the rest](/framework/core/Layout/doc/rules.md) — The defaults are accepts: "any" and allowed_in: "any". A layout that says nothing restricts nothing and goes anywhere. The owner: *you don'…
- [Research worth keeping — eleven layout rules, and the measu…](/framework/core/Page/layout/doc/research.md) — Each rule below was decided once, with real numbers, in a task you can open. Read the rule; open the task only if you are about to break it…
- [audit — the whole site measured and ranked worst-first, for…](/framework/ext/DesignTool/audit/readme.md) — ## Use Open [/framework/ext/DesignTool/audit/](/framework/ext/DesignTool/audit/) — the saved run loads instantly; "Re-measure live" is 168 …
- [The Figma ↔ browser loop: the design is the spec, tools che…](/framework/ext/Figma/doc/figma-browser-loop.md) — Recorded from the owner's dictation, 2026-10-12 (session f155ecbd). The problem: layouts keep breaking — grounds with no padding, wasted sp…

## Sessions tagged with these words
- 2026/10/13 [Architecture md filesystem module](/framework/ai/sessions/2026/10/13/session-6bd8fba7/) — kind/agent model/sonnet mod/ext/filesystem task/mastermind-repo-slim docs/architecture · $0.28
- 2026/10/16 [Inbox labels](/framework/ai/sessions/2026/10/16/session-e91fc031/) — kind/owner model/sonnet mod/core/page mod/servex mod/.claude/skills/mastermind task/inbox-labels · $1.45
- 2026/10/15 [Voice mastermind MCP gateway](/framework/ai/sessions/2026/10/15/session-eda55316/) — kind/owner model/sonnet mod/servex mod/ux/dictate task/mastermind-repo-slim servex/voice · $1.28
- 2026/10/15 [Clarity voice mastermind](/framework/ai/sessions/2026/10/15/session-e1a13a37/) — kind/agent model/sonnet mod/ai/sessions task/mastermind-repo-slim framework/ai · $0.25
- 2026/10/14 [Module inbox loop](/framework/ai/sessions/2026/10/14/session-ef693241/) — kind/owner model/sonnet mod/servex mod/server task/mastermind-repo-slim framework/inbox · $1.44
- 2026/10/14 [Catalog previews](/framework/ai/sessions/2026/10/14/session-e94e007a/) — kind/agent model/sonnet mod/ai/sessions task/mastermind-repo-slim framework/sessions · $0.19

## Owner asks
- 2026-10-03 Page: AI cost line broke /framework/ai/ title (fixed db0e77af); links styled everywhere; … (task-mastermind-layout-gate, building)
- 2026-09-30 Inbox: core/Page/ext/Inbox extension; AI 2 Inbox to /framework/ai/; Needs you a filter; L… (servex-mastermind-opus (spawn after the 4:50 PM reset), queued)
- 2026-09-30 AI 2: importance score 1–100 on Needs you, ranked (mastermind-servex-9, routed)
- 2026-09-30 Page: audit of every layout, priority pages, reuse by default (mastermind-page, building)
- 2026-09-30 Skills: structure for content, layout, UI and navigation (proposal first) (mastermind-servex-9, routed)

## Commits
- fa90c3a41 ai2 move: one dated store, no duplicates. move-ai2.mjs merges every unique line in, then removes the copies
- ecd145991 rules: keep GitHub current; merge.mjs pushes michael/dev after each landing
- 8ede86afc chat-split-fixes: one shared cursor pair per bubble, Prompt-closed merge, shared cursors.js
- 6e640ddc7 Chat: the open bubble stays last, never split by what lands in between
- 71d2d7d48 chat round 2: fix review findings, moving cursor mark replaces standing ticks/per-node dots
- e7213d461 Merge michael/dev into worktree/qf-2: merge.mjs header keeps both the --gate-only line and the NAV GATE parag…
- 3fa8a3f63 review.mjs: --range keeps the worktree argument, so a page review shoots the worktree's server, not the main …
- 44b838786 token-reduction: results-gated spend, revive keeps provider, landed-task reap proof

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 44,684 tokens of reading, under the 100k limit).

Question: merge.mjs keeps refusing because of stray staged files: fix the loop (you are a mastermind, on Sonnet, high effort)

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "merge.mjs keeps refusing because of stray staged files: fix the loop (you are a mastermind, on Sonnet, high effort)"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
