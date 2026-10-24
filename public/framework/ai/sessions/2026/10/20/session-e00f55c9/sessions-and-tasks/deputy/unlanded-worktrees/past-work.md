<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Unlanded worktrees  what the closed worktrees left that never reached michael dev" (words: unlanded, worktre, closed, left, never, reached, michael, dev)

## Tasks (8, best first)
- 2026-10-20 [Unlanded worktrees: what the closed worktrees left that never reached…](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/deputy/unlanded-worktrees/) — public/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/deputy/unlanded-worktrees/requirements.md
- 2026-10-19 [A page watcher per taken pool worktree](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/worktree-watch/) — Landed 79a368328 (merged into michael/dev). Servex/WorktreeWatch.js, started by Pool when a worktree is taken, checks changed pages at 400/1200/1920/3440 and sends the holder one line (page, width, measurement, shot path) per page per 10 min, plus a clear log…
- 2026-10-17 [Worktrees: a plan-first script removed 6 landed worktrees, kept 23](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/worktree-cleanup/) — node Server/Worktrees.mjs --plan lists the 30 non-pool worktrees with a verdict. --apply removed the 6 whose work is on michael/dev (2 forced over regenerated files only) and left 23 alone: 3 with unmerged commits and 19 with real uncommitted files. No branch…
- 2026-10-03 [Servex: the main checkout never leaves michael/dev](/framework/ai/sessions/2026/10/03/main-branch-guard/) — public/framework/ai/2026-10-03/main-branch-guard/requirements.md
- 2026-09-29 [Drawer chip: selected-element context never reached the card-assistant](/framework/ai/sessions/2026/09/29/7eedf4fd-044f-49b9-ae35-8ed667240d78/chip-context-fix/) — Fixed and merged to michael/dev: the drawer's "this code block ✕" chip now reaches the assistant. find where the chip's data is dropped — one function, post_card() in [ext/drawer/tabs/ai.js](/framework/ext/drawer/), called card_prompt(re, entry.text, entry.vi… · paths 2/3 exist, gone: framework/ai2/2026/09/29/layout-explorer-3-columns-and-a-study-of/
- 2026-10-17 [Servex pool: reclaim frees slots whose work is on michael/dev; node S…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/pool-reclaim/) — pool-status.mjs lists every slot with holder, branch, ahead, uncommitted and FREE/KEPT. Reclaim frees clean-stopped and landed-by-diff slots (commits kept on landed/<slot>-<date>-<sha>) and a hold whose holder was gone 12 h+; kept slots name their branch. Liv…
- 2026-10-04 [Land sessions-tab-polish + data-grid: dead worktree servers, one real…](/framework/ai/sessions/2026/10/04/land-two-branches/land-two-branches/) — Both branches landed on michael/dev. sessions-tab-polish (8824068f), data-grid (ac28ba1e). Reviewed: size none, pass — both features were already built and reviewed twice by their own task masterminds; this task's job was landing them. land sessions-tab-polis… · paths 1/1 exist
- 2026-10-01 [Dev-server restarts scoped to loaded files; the page holds instead of…](/framework/ai/sessions/2026/10/01/page-holds/page-holds/) — Restarts now only fire for a file the server really loads; the page shows a strip instead of going blank. Restarts only when needed — merge.mjs now logs "not loaded, no restart"; run.js still swaps normally. Log lines in task.jsonl. The page holds — headless … · paths 1/2 exist, gone: framework/dev/Socket/doc/backoff/

## Docs and readmes
- [The LAN rule: a phone gets push traffic, never commands](/framework/dev/Socket/doc/lan.md) — The dev socket carries rpc:cmd (runs a shell command) and file writes, so it must never be open to the network. A phone on the home Wi-Fi s…
- [Research — a question dug by several minions into append-on…](/framework/ext/Research/readme.md) — Two shapes, one module. A topic is one question argued to a verdict, then closed. A program is several subjects dug continuously and never …
- [DevShell — Ctrl + \ opens a dark shell around the whole sit…](/framework/dev/DevShell/readme.md) — ## Use js /app.js import devshell from "./framework/dev/DevShell/DevShell.js"; render(){ …; devbar(this); devshell(this); }, // both mount;…
- [Lifecycle — how much is left running](/framework/servex/lifecycle/readme.md) — The owner asked: *"How many things are created that are never finished, how many servers are started that are never shut down properly, and…
- [Claim — a tab claimed by an agent: a ring around the viewpo…](/framework/dev/Claim/readme.md) — ## Use mcp__site__claim tab: "3e83f2c0", note: "<task-slug>" — ring the tab you drive mcp__site__release tab: "3e83f2c0" — when the task la…
- [DevShell — decisions](/framework/dev/DevShell/doc/decisions.md) — ## One core/Shell, mounted once, toggled by a class — not built and torn down dev/DevBar already proved the pattern this copies: mount the …
- [Asks about dev: 1 open, 0 done](/framework/dev/doc/refined-asks.md) — Generated by node Server/AskIndex.mjs from the refined asks in each session's asks.jsonl; never hand-edited. Newest first. Open ones are al…
- [Socket — decisions and record](/framework/dev/Socket/doc/decisions.md) — *moved from readme.md 2026-08-17; conclusive, not current guidance.* ## What a save does Three outcomes, decided per path by [changed()](/f…

## Owner asks
- 2026-09-30 Shell: header, sidebars, footer; the dark dev shell on Ctrl+\ (task-mastermind-dev-shell, routed)
- 2026-09-30 Shell: header, sidebars, footer; the dark dev shell on Ctrl+\ (task-mastermind-dev-shell (restart at 4:50 PM), queued)
- 2026-09-30 AI 2: Inbox default, Log tab, heartbeats out, tabs left (minion-ai2-rescue-merge, building)
- 2026-09-30 Agents never take over the owner's tabs (mastermind-servex-8, landed)
- 2026-09-30 Worktrees: remove merged ones; Servex drops their subdomains (task-mastermind-dormant-idle, building)

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 42,847 tokens of reading, under the 100k limit).

Question: Unlanded worktrees: what the closed worktrees left that never reached michael/dev

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Unlanded worktrees: what the closed worktrees left that never reached michael/dev"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
