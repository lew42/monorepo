# Minion brief, batch 4: one module's doc/architecture.md

Same as `../architecture-md/minion-brief.md` (read it) with these changes:
- Worktree: `C:\Code\lew42\worktrees\architecture-md-4` (branch `worktree/architecture-md-4`), never the main tree.
- Also add `{"file":"architecture.md"}` as a line to the module's `doc/files.jsonl` (create the file with that one line if it does not exist). Check the existing lines first; do not duplicate. Append with `node .claude/hooks/append.mjs <target.jsonl> <lines.json>` (hand writes to .jsonl are blocked by a hook).
- Fence: that module's `doc/architecture.md`, `doc/files.jsonl`, readme `More` line, page.js `notes:` entry. Nothing else. Commit by exact path (other minions commit in the same worktree at the same time: never `git add -A`).
- If the module has few decisions (thin source), write a short honest doc (20-40 lines); never invent decisions.
