# Servex: the pool froze Servex for 20+ minutes restoring 40,000 files one by one

**What happened (2026-10-25, 03:09–03:30+, measured by the VS Code tab).** Servex stopped answering: `/agents`, `list_agents` and every agent message timed out, with Servex's CPU near zero. Its crumbs log shows the cause: `Pool.restore()` (`Servex/Pool.js:736`) running `execFileSync("git show HEAD:<file>")` once per file, about 30 a second, for the whole of slot `qf-7`. That's 21,000+ calls before the log rotated, and still going.

- `qf-7` sits on branch `salvage/qf-7-2026-10-25` with **40,238 files staged as deleted** (`D  .claude/hooks/append.mjs`, …): the whole tree. Restoring a file's content leaves its index entry deleted, so the dirty count never drops.
- The loop that walks every dirty file and restores it is most likely `Pool.js:511` (the return path), or `:233` or `:380`. Each `restore()` is synchronous, so the event loop is blocked for the whole walk.
- Earlier the same day, qf-7 hit ENAMETOOLONG and a `git diff` that printed its usage (commit 20c9f4e2a). Find which step left the index with every file deleted.

## Fix

1. **Never block the event loop on a per-file git.** Restore in batches and asynchronously: `git checkout HEAD -- <≤100 paths>` (or `git restore --source=HEAD --staged --worktree`) for tracked files, then `fs.rm` for files that aren't in HEAD. This is the same rule as `dirt()`'s hash-object note at `Pool.js:713`.
2. **A slot whose index is broken is not restored file by file.** If most of the tree is staged as deleted, or more than about 500 files are dirty, reset the slot in one call (`git reset --hard` plus `git clean`, after salvaging any real work as the code already does), or remove and remake it. Log one line saying which you did.
3. **Find and fix what staged the whole tree as deleted** in salvage, and add a test that a broken slot recycles in seconds.
4. **Watchdog:** if Servex's event loop lags more than about 5 s, write one line naming the running operation (crumbs already has it), so the next freeze is found without a manual hunt.

Fences: `Servex/Pool.js` and its tests. It goes live at a Servex restart; the owner's standing rule allows that restart once it's merged (and not during a voice call).
