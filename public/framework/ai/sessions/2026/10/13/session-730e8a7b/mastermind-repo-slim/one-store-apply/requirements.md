# One tree, applied: the Inbox cards move into the sessions store

Budget: $20. Load the `sub-mastermind` skill first; you are an Opus task mastermind because this is the scripted move every AI page reads, across 656 records that carry card ids. The owner's words: `../requirements-8.md` ask 3 ("port everything over to one single data structure… no stale fragments"). **The brief is already written, with the exact lines to change: `../one-store/doc/next.md`** (the one-store task's landing, 18:29: date folders gone, the one-tree decision made, the dry-run manifest and the census in `../one-store/`). Your log is this dir's `task.jsonl`. CLAUDE.md: moves are scripted (dry run, manifest, undo proven on a worktree copy first), never destructive, link every mention, old URLs keep answering.

## Deliverable, in the order next.md gives

1. `Cards.dir(id)` / `Cards.url(id)` resolver in `Servex/cards/Cards.js` (new folder if it exists, else the old), every caller in next.md's table switched to it, tested on a private Servex from a worktree (create a card, open it, reply to it, both paths).
2. The move: `git mv` by script from the manifest, relink (`Server/TaskMove.mjs --relink` or the one-store script), the redirect for old card URLs, undo proven on a worktree copy, then the real apply; `check_page` on `/framework/ai/`, the Inbox, a card page and a session page at 1200; smoke clean; `merge.mjs` (the git-guard now refuses a plain `git merge` in the main tree: that is the fix from task-log-race, do not work around it).
3. `ai/readme.md`'s three-line pattern updated to the final truth; `ai/doc/task-folders.md` gets the applied decision with the counts (folders moved, links relinked, verify 0 bad).
4. Owner note (kind `decision`): one tree now, what moved, the undo; card report; landing line (check it with `tail -1` after your commit).

Fence: the files next.md lists, the moved card folders and their relinked mentions, `ai/readme.md` and `ai/doc/task-folders.md`, this task dir. Coordinate by `send_to_agent` with `task-mastermind-ai-modules-home` (moving modules under `ai/` right now) so the two moves do not cross; the live Servex is restarted by the mastermind after you land (the resolver is read at Servex load).
