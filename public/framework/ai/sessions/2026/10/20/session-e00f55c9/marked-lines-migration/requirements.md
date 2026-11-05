# Marked lines: move every file to the new spelling, then drop the old one from the code

Run as a **build process**: Haiku investigates → plan → Sonnet improves → vscode-mastermind approves → build test-first → review → merge. **Nothing is rewritten until the plan is approved.**

**The owner (2026-11-02, about 16:10):** "We don't really want our classes handling two different cases, and then every feature we build from now on has to accommodate the old way. We want to be moving towards the new way whenever possible… launch a migration task, think about what kind of scripts can reduce the agent's load, and then just convert everything over properly, hopefully without breaking anything."

**What changes in a file** (one line, same meaning; spec: [line-format](/framework/core/Item/doc/line-format.md)):

| | |
|---|---|
| old (bare) | `{"tasks": {"c3": {"start": {}}}}` |
| new (marked) | `{"tasks": {"#c3": {"start()": {}}}}` |

"Marked" means `name()` for a method call and `#id` for a list member.

**Where it stands:**
- Since `110635a9c`, writers save the marked spelling (`start()`, `#id`).
- Every reader in core, and the 8 outside tools, read both spellings. The tools go through the shared `LineKey` helper.
- Old files still hold bare lines.
- Docs: `core/Item/doc/line-format.md`, and the "Line keys" table in `core/Session/doc/classes.md`.

## Investigate (Haiku, a node script does the counting; under 60k tokens)
1. **Count, with a script:** every `.jsonl` the item system reads (`ai/sessions/**`, page.jsonl files, module `tasks/`), the number of lines in the old spelling, and the number of files.
2. **The risks:**
   - **Files being appended to while a migration runs.** Live session files and the readers' reset/gap detection are in `core/Item/doc/reset.md`.
   - **Snapshots** (`Server/Snapshots.mjs`).
   - **Tools that grep files for a bare verb.**
   - **Git noise:** how many files change.
3. **The owner's question about a new file extension.** These are valid JSON lines, with `()` and `#` in key names. Would something like `.jsonlog` help mark the new spelling, or would it only break the tools that look for `.jsonl`? Recommend one, with the alternative.

## The plan to write
1. **A migration script:**
   - `--dry` by default, with a manifest of every file and line count;
   - `--apply` rewrites a file only when it's quiet (no append in the last N minutes), one file at a time;
   - every rewritten file must replay identically: run `ReplayCompare` (the script that replays a file and diffs the result) on each before and after;
   - git is the undo, so commit in batches.
2. **Then remove the bare-spelling branches** from the core readers and from `LineKey`, test first: a bare line now warns once and is refused. That must wait until the count is 0.
3. **Then the docs:** one spelling only.

**Fences:**
- Worktree; commit by path; no `python -`.
- Never rewrite a file that is being appended to.
- Don't touch `.claude/` hooks' own logs, or records outside the item system.

**Budget:** about $10 across all steps.
