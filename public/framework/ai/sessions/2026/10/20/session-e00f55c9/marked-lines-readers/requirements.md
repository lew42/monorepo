# Marked lines: what breaks if the writers switch? A scan, so the switch can be made safely

Run as a minion on Haiku: a read-only scan with no edits outside this folder.

**What it is:** a saved line can spell a method call bare (`{"start":{}}`) or marked (`{"start()":{}}`), and a list item bare (`{"tasks":{"c3":…}}`) or marked (`{"#c3":…}`). Every reader in `core/` reads both spellings. The writers still use the bare one until `Store.marked_lines` is set to true. The docs are `public/framework/core/doc/status.md` (the "Marked lines" paragraph) and `public/framework/core/Item/doc/line-format.md`.

**The risk:** a tool outside core that reads JSONL lines by matching the bare spelling would miss marked lines. Examples: a node script testing `line.start`, a grep for `"complete":`, a dashboard that counts `"landed_at"`.

## Do
1. **List every reader of saved lines outside `public/framework/core/`:** `Server/`, `Servex/`, `.claude/hooks/`, `public/framework/ai/`, `public/framework/ext/` and `ux/`.
   - Look for code that reads a verb or a list member by key: `.start`, `.complete`, `["complete"]`, `.tasks?.`, `"start":`, and greps in shell scripts.
   - For each one, give `path:line` and whether it would miss the marked spelling: yes, no, or unsure.
   - Write the result to `readers.md` in this folder as a table.
2. **End with one line:** "safe to switch", or "fix these N first", with the list.

**Budget:** under 60k tokens. "None found" is a fine answer. Report to vscode-mastermind in one line, naming the file.
