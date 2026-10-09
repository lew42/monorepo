# Merge AI 2 into AI — archive and move, never delete

**Goal (owner, 2026-10-08):** fold the AI 2 dashboard (`public/framework/ai2/`) into the AI module (`public/framework/ai/`) so no zombie is left.

- **Rules:** nothing is deleted; data is moved by script, never rewritten; no duplicates.
- **Same ask elsewhere:** work item 3 in `public/framework/ai/2026-10-08/task-audit/work-items.md`.
- **Key fact:** ai2 has no data tree of its own. `/framework/ai2/<date>/<card>/` is just another URL for cards stored under `ai/YYYY/MM/DD/` (`ai/doc/ai2-and-date-layout-2026-10-08.md`).

You are a **Sonnet 5.5 mastermind** owning this task end to end; build it yourself (Haiku 5.5 minion via `spawn_agent`, parent = you, only for cheap reading, under 60k tokens). Work in a **worktree**; scripted moves only (see CLAUDE.md "Moves and renames are scripted"); smoke-test, commit after each working step, review the diff, merge. Run `node Server/usage-now.mjs` before spawning. No OpenRouter. Keep `STATE.md` in this dir current so a fresh session can resume. Everything you create is linked from the site. One-sentence chat replies.

## Steps
1. **Inventory (a script, not prose).** List every file in `ai2/`, what imports it (grep the repo for `/framework/ai2/` and relative imports), what URLs on the site resolve through `ai2` (routes, links in readmes/cards/pages), and which `ai2` files are live vs dead (no importers, not routed). Write `inventory.md` + the script; show counts.
2. **Decision (record the alternative):** move the live `ai2` files into `public/framework/ai/` under the right class folders (follow CLAUDE.md "Write classes": one class per file named for the class; e.g. cards under `ai/cards/`), leave **one-line re-export shims** at every old `ai2` path/import so nothing breaks, and keep `/framework/ai2/...` URLs resolving (a route alias or redirect). Dead files are **moved to an archive folder** (`ai/archive/ai2/`) with a manifest, never deleted.
3. **Do it with ONE script**: dry-run first (counts: files to move, shims, importers to update, URLs affected), then `git mv` + exact-path rewrites + manifest of old to new, reversible. Prove the pages that use it still load at the four widths: the AI tabs (Inbox, Dashboard, Log, System, Sessions) and a card page, with zero same-origin 404s (`node Server/merge.mjs <worktree> --dry-run` must pass).
4. Update the readmes (`ai/readme.md`, the module readmes touched) and `ai/doc/ai2-and-date-layout-2026-10-08.md` with what is now true. Add the new class names to `ai/readme.md`'s index.
5. Do NOT touch the session folders or `ai/sessions/` (minion-session-class owns them), and nothing under `core/Page` semantics; if you need a change there, note it and stop.

Land with `finish-task`; commit with attribution; no loose files; leave no worktree behind.
