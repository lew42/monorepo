# Docs check: one tree (reviewer-one-tree-docs, Sonnet, 2026-10-13)

A fresh agent read only the readme chain (root → framework → ai → ai/cards), `ai/doc/task-folders.md` and `Servex/doc/readme-chain.md`. It could not write this file itself, because its write was denied, so its answer is saved here verbatim in substance.

## What it understood (all correct)

- **Folder:** `ai/sessions/YYYY/MM/DD/cards/<card>/`.
- **Id:** `YYYY/MM/DD/<card>`, never rewritten.
- **Page url:** `/framework/ai/YYYY/MM/DD/<card>/`, unchanged by the move.
- **Id to folder:** `ai/cards/CardDir.js`, or `Cards.dir(id)` in Servex, which falls back to the old folder.
- **Undo:** `node Server/TaskMove.mjs --undo --ledger card-moves --run <stamp>`.

## Findings, and what was done (commit 361d99d9d)

- ✅ **No signature for `CardDir` / `Cards.dir`:** fixed. `Servex/cards/readme.md` now names both: sync node vs plain string math.
- ✅ **`<stamp>` is not explained:** fixed. The `run` field in `card-moves.jsonl` holds it, newest first, and `--undo` with no `--run` takes the last.
- ✅ **The sweep of git-ignored cards has no command:** fixed. The three commands are now in `task-folders.md`.
- ✅ **"Not yet applied" contradicts "applied":** fixed. The line now says it was applied the same day.
- ✅ **Why cards sit beside sessions, not inside one, and the `cards` name clash:** fixed. One bullet in `task-folders.md`.
- ✅ **How the older `a-*` cards resolve:** fixed. They moved with the rest, and the stale line was corrected.
- ✅ **Who writes the year and month index pages:** fixed. It is `Cards.today()`, through the same rule (`Servex/cards/readme.md`).
- ⬜ **Links into the dated task folder may rot:** left as is. They are this task's own records, and records live with their task (CLAUDE.md).
- ⬜ **The root readme has no pointer to cards:** left as is. It indexes systems, and the chain reaches cards at `ai/readme.md`, one level down.
