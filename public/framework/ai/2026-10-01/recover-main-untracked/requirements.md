Budget: $40

# recover-main-untracked — put back the 595 untracked files that were deleted from the main tree at 22:36

At 22:36 on 2026-10-01, `task-mastermind-ai2-inbox-read` ran `rm -rf` over every path `git status` listed as untracked in `C:/Code/lew42/monorepo` (the MAIN tree). The list is [deleted-paths.txt](deleted-paths.txt) — 601 paths, 595 gone. Committed code is untouched. Lost: every October card (`public/framework/ai/2026/10/**`), today's task folders for ~15 fixes, review reports and `spend.json` files back to 09-23, `.claude/skills/openrouter/`, `.claude/skills/every-prompt/improvements.md`, `Servex/experts.json`, and uncommitted module files (`public/framework/audio/Voice/`, `ext/Chat/ai/`, `ext/Session/ai/`, `ext/Refine/ai/`, `ai2/ai/`). You own the recovery. The incident card is `2026/10/01/601-untracked-files-were-deleted-from-th`.

## Rules (each one has already cost someone)
- **Never overwrite a file that exists now.** Agents are re-creating their own files as you work (line-filter already did). Restore only where the path is missing; if it exists, log `kept-existing`.
- **Never run `git clean`, `checkout --`, `reset`, `stash` or any `rm` in main.** You add files; you remove nothing. Restored files stay untracked, exactly as they were — commit nothing.
- **Compute, don't recall (law 7):** every restore is done by a node script that reads the sources and writes `recovered.jsonl` in this dir (through `append.mjs`) — one line per path: `{"recover":{"path","source","confidence","bytes","status"}}` (`status`: restored | kept-existing | owner-asked | no-source | skipped-generated). The card report is made from that file by a script, never typed from memory.
- **Skip generated files:** any `files.jsonl`, and a `page.jsonl` OUTSIDE `public/framework/ai/2026/` (those are a module page's server-written log; the server rebuilds them). A card's `page.jsonl` under `public/framework/ai/2026/10/` IS content — restore it. Skip `nul`.
- Every look is headless. Never the owner's name. Log through `node .claude/hooks/append.mjs <task.jsonl> <lines.json>`.

## Sources, cheapest and most exact first
1. **Another worktree already has it.** Many task folders were built in a worktree (`C:/Code/lew42/worktrees/<name>/<same path>`, 44 of them: `git worktree list`). Same path present there → copy. Also `.worktree-logs/*.patch` (salvaged log diffs).
2. **The owning agent is alive and has it in context.** The registry (`%LOCALAPPDATA%/lew42/servex/registry.json`) names agents by task dir, and dormant agents (`minion-voice-tts`, `minion-card-threaded-replies`, `minion-chat-duplicate-messages`, `minion-nested-sheet-example`, `minion-dictate-stop-sound`, `minion-sheet-*`, `task-mastermind-openrouter` for `.claude/skills/openrouter/`, `task-mastermind-local-ai`…) resume in place. Send each ONE message: "these N files of yours were deleted from main at 22:36 (list); re-create them from your transcript where the path is still missing; touch nothing else; reply done". Log `owner-asked`, and verify afterwards.
3. **Transcript replay.** Every Servex agent is a claude session whose transcript is `C:/Users/mike/.claude/projects/C--Code-lew42-monorepo/<session-id>.jsonl` (1,700+ files; the session id is in the registry row; otherwise `grep -l` the path). Tool calls are recorded in full: `Write` (`file_path`, `content`), `Edit` (`old_string`, `new_string`, `replace_all`), `MultiEdit`, and `Bash` heredocs / `append.mjs` calls. Replay a path's Write then its Edits in time order across all sessions that touched it → the final content. Confidence `exact` when the last op was a Write or every Edit applied cleanly; `partial` otherwise.
4. **Cards.** `public/framework/ai/board.jsonl` (393 KB, tracked, intact), `%LOCALAPPDATA%/lew42/servex/logs/cards/*.jsonl` and `servex.jsonl` hold the card events. Read how `create_card` / `card_reply` write a card folder (`Servex/agents/Layers.js` ~246, `Servex/cards*.js`, `Servex/agents/Sessions.js` ~316) and rebuild each October card's `page.jsonl` in that exact shape from the events, in time order, plus the folder-index lines in `public/framework/ai/2026/10/page.jsonl` and `.../10/01/page.jsonl` (one card, the incident card, already exists there — keep it). Then open `/framework/ai/2026/10/01/` headless and screenshot it: the cards are back.
5. **Servex agent logs** `%LOCALAPPDATA%/lew42/servex/logs/agent-*.jsonl` carry tool inputs too (sometimes truncated) — a fallback for 3.

## Order
Cards first (the owner reads them), then today's task folders, then skills and `Servex/experts.json`, then older reviews/spend, then module `ai/` folders. Use Sonnet minions for the mechanical replay (one for cards, one for transcripts), each with the fence "write only paths in deleted-paths.txt that do not exist"; they may work in main for this task only, because the files are untracked and nothing merges. You judge conflicts and verify.

## Proof (on the incident card)
- The counts from `recovered.jsonl`: restored / kept-existing / owner-asked / no-source / skipped-generated, by a script.
- The screenshot of `/framework/ai/2026/10/01/` with the cards back.
- The list of `no-source` paths, so the owner knows what is truly gone.
- Land with a landing line in this dir's task.jsonl; report one screen on the card; then end.
