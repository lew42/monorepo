# Site reach, re-run: everything that landed since 19:00 is linked, and the catalog's "new" marks are current

Budget: $5. Load the `sub-mastermind` skill first. The readme-upkeep task (19:23) built `Server/readme-reach.mjs` and linked everything up to then; since then landed: InstanceTree, one New session + MicIndicator, the Coverage tab, the one-tree apply (cards under `ai/sessions/YYYY/MM/DD/cards/`), the archive doc (`ai/sessions/doc/picture-archive.md`), the models page changes, `Server/doc/scripts.md`, `ai/sessions/doc/compaction.md`, `ai/doc/unreferenced-verdicts.md`, 24 modules' `doc/architecture.md`, the retired shims folder, the Figma tokens page changes. The catalog (`/framework/catalog/`, `build.mjs`) marks pages NEW by date. Your log is this dir's `task.jsonl`. CLAUDE.md: link every mention, and every page.

## Deliverable

1. `node Server/readme-reach.mjs` on current `michael/dev` with the list above added to its input; the table in this task dir; two numbers that must agree (items checked vs items listed).
2. One link line per miss in the right readme (the module's, or `ai/readme.md` / `public/framework/readme.md` for top-level docs); keep every readme under 100 lines.
3. `node public/framework/catalog/build.mjs` (or its documented command) so the catalog's cards and NEW marks include today's pages; `check_page` the catalog at 1200.
4. Commit readmes and the catalog data by path on `michael/dev`; card with the counts; landing line checked with `tail -1`.

Fence: `readme.md` files (one line each), `public/framework/catalog/catalog.jsonl` (regenerated), this task dir. Sonnet, low effort.
