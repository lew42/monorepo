<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "URGENT quick fix merge  same blocker as last time  task mastermind cherry picked 83630fa8e as 60cbbf5ea  worktree C Co" (words: urgent, quick, fix, merge, same, blocker, last, time, task, mastermind, cherry, picked, 83630fa8e, 60cbbf5ea, worktree)

## Tasks (8, best first)
- 2026-10-20 [URGENT quick-fix merge, same blocker as last time (task-mastermind ch…](/framework/ai/sessions/2026/10/20/session-e4971f1a/task-mastermind-2/) — (no outcome logged)
- 2026-10-20 [Quick fix merge: Whisper card on /framework/audio/](/framework/ai/sessions/2026/10/20/session-e4971f1a/task-mastermind/) — Cherry-picked qf-7 commit 83630fa8e into michael/dev as 60cbbf5ea (merge.mjs refused: 2 dirs, no dev server on qf-7). Page checked at 400 and 1200: Whisper card and tab show, no overflow.
- 2026-09-25 [Quick-fix worktrees: a warm pool, and a smoke test before every merge](/framework/ai/sessions/2026/09/25/quickfix-worktrees/) — One quick-fix worktree is always warm, and nothing merges without a smoke test. Call take_worktree, write, then node Server/merge.mjs <path> <pages>, then return_worktree. ![Live card with the pool](/framework/ai/2026-09-25/quickfix-worktrees/live-1920.png) s… · paths 0/1 exist, gone: framework/ai2/live/
- 2026-10-07 [Token accounting: fixed the real undercount (144/145 project folders …](/framework/ai/sessions/2026/10/08/token-accounting/token-accounting/) — Found and fixed the real accounting bug, and planned the realtime sessions page. Found it — [findings.md](/framework/ai/2026-10-07/token-accounting/findings.md): a case-sensitive match hid 144 of 145 worktree folders from the cost ledger; readers fell back to…
- 2026-10-02 [merge.mjs --quick + review.mjs widthsFor — one screenshot at the widt…](/framework/ai/sessions/2026/10/01/quick-fix-path/quick-merge/) — Applied to michael/dev's working tree (not yet committed — the owner commits): widthsFor in review.mjs, and merge.mjs --quick. widthsFor(files, numstat, pages), exported from review.mjs: 1200 alone for words, all four for anything that can reshape layout, 400…
- 2026-10-02 [quick-fix-path](/framework/ai/sessions/2026/10/01/quick-fix-path/) — The fast path: a voice fix this is live in 10-30 s via a warm quick-fixer on the qf pool and a light merge.mjs --quick; bigger work goes to a task mastermind; time to first fix measured by node.
- 2026-10-13 [Record files: a plain git merge dropped appended lines](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/task-log-race/) — Cause found, fixed, guarded, recovered. - ✅ Writer: a plain git merge --no-ff run in the dirty main tree at 17:38:07 (git parks the tree, hard-resets, the put-back failed). Not an autostash, not append.mjs, not LogSweeper; committed history never lost a line.…
- 2026-10-08 [Task audit: every task categorised, every loose end has a fix and a v…](/framework/ai/sessions/2026/10/08/f74e9f54-7e5e-4567-b09f-9b6fee492350/task-audit/) — Audit landed: 1,303 tasks categorised, 244 open loose ends each with a suggested fix and a verdict. Loose ends listed with a fix per row: [by-system.md](/framework/ai/2026-10-08/task-audit/by-system.md), 54 now, 145 later, 43 superseded, 2 in-flight Prioritis…

## Modules that exist now (files outside the module that import it)
- [core/Task](/framework/core/Task/) — used by 515 files
- [core/tasks](/framework/core/tasks/) — used by 5 files, no readme
- [ext/AITask](/framework/ext/AITask/) — used by 5 files
- [ext/tasks](/framework/ext/tasks/) — used by 5 files, no readme
- [ext/Timeline](/framework/ext/Timeline/) — used by 5 files
- [ui/tasks](/framework/ui/tasks/) — used by 5 files, no readme

## Docs and readmes
- [Follow-up: every task of the last 10 days](/framework/ai/doc/follow-up-full.md) — 1035 tasks, flagged first. Summary: [follow-up.md](follow-up.md). | task | group | session | model | started | last log | step | state buck…
- [Quick fix](/framework/ai/quick-fix/readme.md) — The log of every small fix asked for by voice — "make this bold", "this gap is too big" — and how many seconds each one took to land. The l…
- [The owner on sessions, tasks and losing work (2026-10-20, d…](/framework/ai/doc/owner-2026-10-20-who-makes-tasks.md) — The essence of a long dictation, recorded here so it survives the chat. Each point is the owner's position; the answer or decision follows …
- [Nested tasks — subtasks, in parallel or in series](/framework/ai/AITask/doc/nested.md) — A task can have subtasks, to any depth. Some run at the same time (parallel), and some wait for others to finish first (series). The [task …
- [Task lifecycle: one design for prompt to landed change (pro…](/framework/ai/doc/task-lifecycle.md) — See also: the seven-step shape of a bigger task (requirements and plan, a minion builds, a fresh reviewer, merge, land) is in the [mastermi…
- [Task templates: the routine procedure is a field, and node …](/framework/core/Task/doc/templates.md) — What this is: a task says what kind of work it is (template: "code"), and node does the routine steps that kind of work always needs: the w…
- [Asks — what the owner asked for, and whether it happened](/framework/ai/AITask/doc/asks.md) — An ask is one thing the owner asked for, written down in their own words. It is a line in the running session's task.jsonl, using [ext/JSON…
- [What a task cost — cost_usd](/framework/ai/AITask/doc/cost.md) — Every task card shows what the task cost, in dollars. Dollars and not tokens, because each model charges a different price per token, so a …

## Sessions tagged with these words
- 2026/10/13 [Minion arch timeline](/framework/ai/sessions/2026/10/13/session-19f42d95/) — kind/agent model/haiku mod/ui/timeline task/mastermind-repo-slim docs/architecture · $0.20
- 2026/10/16 [Inbox labels](/framework/ai/sessions/2026/10/16/session-e91fc031/) — kind/owner model/sonnet mod/core/page mod/servex mod/.claude/skills/mastermind task/inbox-labels · $1.45
- 2026/10/15 [Voice mastermind MCP gateway](/framework/ai/sessions/2026/10/15/session-eda55316/) — kind/owner model/sonnet mod/servex mod/ux/dictate task/mastermind-repo-slim servex/voice · $1.28
- 2026/10/15 [Clarity voice mastermind](/framework/ai/sessions/2026/10/15/session-e1a13a37/) — kind/agent model/sonnet mod/ai/sessions task/mastermind-repo-slim framework/ai · $0.25
- 2026/10/14 [Module inbox loop](/framework/ai/sessions/2026/10/14/session-ef693241/) — kind/owner model/sonnet mod/servex mod/server task/mastermind-repo-slim framework/inbox · $1.44
- 2026/10/14 [Dictate-next-4 review](/framework/ai/sessions/2026/10/14/session-eadb28a6/) — kind/agent model/opus mod/ai/sessions task/mastermind-repo-slim framework/ai · $0.83

## Owner asks
- 2026-09-30 Worktrees: remove merged ones; Servex drops their subdomains (task-mastermind-dormant-idle, building)
- 2026-10-02 Hamburger drawer: closing it sometimes doesn't give the page its space back (fixed itself… (task-mastermind-one-dictation, building)
- 2026-10-03 Page: AI cost line broke /framework/ai/ title (fixed db0e77af); links styled everywhere; … (task-mastermind-layout-gate, building)
- 2026-10-12 38 voice/transcription asks tagged, plus realtime dictation tasks (mastermind-voice-to-session-page, routed)
- 2026-10-15 Voice mastermind: answer within seconds every time (best guess or 'looking into it'), han… (?, held)

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 47,546 tokens of reading, under the 100k limit).

Question: URGENT quick-fix merge, same blocker as last time (task-mastermind cherry-picked 83630fa8e as 60cbbf5ea): worktree C:/Co

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "URGENT quick-fix merge, same blocker as last time (task-mastermind cherry-picked 83630fa8e as 60cbbf5ea): worktree C:/Co"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
