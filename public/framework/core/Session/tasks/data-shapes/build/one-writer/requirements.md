# Build D: one writer (plan step 1d), from the integration branch, NOT merged

**The owner (ask 41):** "the API in which the UI sends these deltas to the server so that they get saved, I think that should all flow through one data path, whether it's AI driven or UI driven… that needs to be our data backbone."

**Today:** there are three writers to the same record files.
- **The item tool** (`Servex/agents/page_tools.js`) checks each line by replaying it on a live root.
- **The browser** appends `page.jsonl` lines straight through the dev socket (`core/Item/Store.js`, `via_tool` / `FsFile.send`). It also falls back to a direct append when Servex is slower than 5 s, which made duplicate lines before.
- **The hooks** (`.claude/hooks/*.mjs`) and `Server/LogLine.mjs` append raw lines.

Every write from outside the tool makes the tool's live root stale, so it replays the whole file on its next call. Sources: [streaming notes](../../seats/streaming/notes.md) §7, [plan review](../plan-review/review.md) finding 5, and build A's F1 study (on the branch at `core/Session/tasks/data-shapes/build/backbone/f1-live-instance.md`).

## Setup

`git worktree add C:/Code/lew42/worktrees/one-writer -b worktree/one-writer integration/data-shapes`, then lock it (`git worktree lock`) so Servex leaves it alone. Start its dev server through Servex and log the url.

## Scope

1. **Every write to a record file** (`session.jsonl`, `task.jsonl`, `page.jsonl`, `improvements.jsonl`) **goes through one entry point,** which applies the line to the live instance, then appends it. That covers the browser Store for page files too, the hooks that write records, and `LogLine` for record files.
   - The raw append stays only as the fallback when the entry point is down. It must check the file's tail first, so no twin line is written (remove the blind 5 s self-append).
2. **Keep it in Servex for now:** the move to each project's dev server (fork F1) is ask-first. Shape the entry point as one function with one caller-facing signature, so F1 later moves it without touching the callers. Say how in your landing.
3. **Tests:**
   - two writers at once (the browser and the tool) on one file give no twin and no lost line;
   - a hook write no longer makes the next tool call replay the whole file (measure it);
   - the fallback, when the entry point is down, writes once.
4. Keep the integration branch's guarantees: its test counts, its replay comparison, and its smoke.

## Fences

- **Don't merge.** Don't restart Servex or the main dev server. Hooks in your worktree only: the main tree's `.claude/hooks` stay untouched.
- **When done:** run `node Server/review.mjs <this task dir> <worktree>` for a fresh review, answer every finding, and land with the branch, url, tests and review phrase.
- **Budget:** about $45. Spawn no one but the reviewer. **Finish by about 21:15.**
