<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Problem  quick_fix to fixer 1 fails with  no quick fix worktree is ready for the fixer to hold  take_worktree would also" (words: problem, quick, fix, fixer, fail, worktree, ready, hold, take, would, also)

## Tasks (8, best first)
- 2026-10-25 [Problem: quick_fix to fixer-1 fails with "no quick-fix worktree is re…](/framework/ai/sessions/2026/10/25/session-e06424f1/mastermind-worktree-pool/) — (no outcome logged)
- 2026-10-01 [Fixer: the standing quick-fix agent and its hot path](/framework/ai/sessions/2026/10/01/quick-fix-path/fixer/) — What landed: fixer-1, the standing quick-fix agent, and the quick_fix hot path — reviewed (3 fixed, 1 declined, 2 noted), merged into michael/dev. standing fixer-1 (Sonnet, medium, bypassPermissions, holds+fast-forwards its own slot) — Fixer.js, proof pool-ho… · paths 2/2 exist
- 2026-09-25 [Quick-fix worktrees: a warm pool, and a smoke test before every merge](/framework/ai/sessions/2026/09/25/quickfix-worktrees/) — One quick-fix worktree is always warm, and nothing merges without a smoke test. Call take_worktree, write, then node Server/merge.mjs <path> <pages>, then return_worktree. ![Live card with the pool](/framework/ai/2026-09-25/quickfix-worktrees/live-1920.png) s… · paths 0/1 exist, gone: framework/ai2/live/
- 2026-10-25 [Dictation: why words arrive out of order — fixed on worktree/dictatio…](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/dictation-debug/order/) — Fixed, awaiting merge. Step 1 (retag_piece changes the id only) is on michael/dev (ce1f45f58); steps 2-3 (one clock via Session.clock.offset, said_at sent and written, bubbles ordered by said_at ?? at, also on reload) are on worktree/dictation-order-2. A Serv…
- 2026-10-24 [Dictation: Debug tab, and the stall found and fixed](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/dictation-debug/build/) — Ready to merge: branch worktree/dictation-debug (6 commits). [Report](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/dictation-debug/build/report.md) · [doc](/framework/ux/Dictate/doc/debug-tab.md) - ✅ The stall: one unanswered send blo… · paths 0/1 exist, gone: framework/ext/drawer/ai/debug/
- 2026-10-19 [A page watcher per taken pool worktree](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/worktree-watch/) — Landed 79a368328 (merged into michael/dev). Servex/WorktreeWatch.js, started by Pool when a worktree is taken, checks changed pages at 400/1200/1920/3440 and sends the holder one line (page, width, measurement, shot path) per page per 10 min, plus a clear log…
- 2026-10-03 [Link styles + merge gate: blue links fixed, text-touching-edges now f…](/framework/ai/sessions/2026/10/03/588af12b-12cf-4166-a7a4-a6cfa504194b/layout-gate/) — Landed — every <a> now gets the house link style, not just ones in prose, and Server/smoke.mjs fails the merge on text flush against an unpadded edge or anything above a page's title. Commit a3248c70 on michael/dev. links styled everywhere: [shot, /framework/… · paths 1/1 exist
- 2026-10-02 [quick-fix-path](/framework/ai/sessions/2026/10/01/quick-fix-path/) — The fast path: a voice fix this is live in 10-30 s via a warm quick-fixer on the qf pool and a light merge.mjs --quick; bigger work goes to a task mastermind; time to first fix measured by node.

## Docs and readmes
- [Quick fix](/framework/ai/quick-fix/readme.md) — The log of every small fix asked for by voice — "make this bold", "this gap is too big" — and how many seconds each one took to land. The l…
- [Cloudflare: what we would use, what it costs, what you give…](/framework/ai/doc/cloudflare.md) — The ask (2026-10-14, the owner): "What would you need from me" to let the agents configure Cloudflare, without the risk of spending hundred…
- [Fixtures, and what "approved" means](/framework/core/Layout/doc/fixtures.md) — A layout owns no content. The fixtures are what goes in its slots instead, and they *are* the separation between layout and content: pour t…
- [Figma troubleshooting: problems we hit and how they were so…](/framework/ext/Figma/doc/troubleshooting.md) — One dated entry per problem: what happened, why, the fix. Read this only when something goes wrong; the everyday recipe is [use-figma.md](u…
- [The flicker — why your words vanished and came back, and th…](/framework/ux/Dictate/doc/flicker.md) — The rule (the owner, 2026-10-24): while dictation is on, your words appear in place in the chat bubble, as if already sent. Nothing you are…
- [Repo size: what git holds, and the plan to slim it (2026-10…](/framework/ai/doc/repo-size.md) — Screenshots are the problem; the session logs are not. Pictures are 84% of git history. Every text record, all sessions included, is 30 MB.…
- [ai/merge — the "ready to merge" list and its Merge button](/framework/ai/merge/readme.md) — Page: [/framework/ai/merge/](/framework/ai/merge/). One card per branch an agent has marked ready; the owner's one decision per project is …
- [Would a real streaming server beat today's HTTP resend?](/framework/audio/Transcriber/doc/streaming.md) — Question (task-mastermind-audio, relaying the owner, 2026-09-29): today Transcriber.Whisper fakes "live" by re-POSTing the growing segment …

## Owner asks
- 2026-10-03 Page: AI cost line broke /framework/ai/ title (fixed db0e77af); links styled everywhere; … (task-mastermind-layout-gate, building)
- 2026-09-30 Agents never take over the owner's tabs (mastermind-servex-8, landed)
- 2026-09-30 Servex docs as flowcharts: ON HOLD (the owner) (?, dropped)
- 2026-09-30 Worktrees: remove merged ones; Servex drops their subdomains (task-mastermind-dormant-idle, building)
- 2026-10-02 Hamburger drawer: closing it sometimes doesn't give the page its space back (fixed itself… (task-mastermind-one-dictation, building)

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 43,853 tokens of reading, under the 100k limit).

Question: Problem: quick_fix to fixer-1 fails with "no quick-fix worktree is ready for the fixer to hold (take_worktree would also

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Problem: quick_fix to fixer-1 fails with \"no quick-fix worktree is ready for the fixer to hold (take_worktree would also"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
