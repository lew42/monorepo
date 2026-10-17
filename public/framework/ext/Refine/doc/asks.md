# Refined asks: one record per ask, a topic list per module, done ones crossed off, the rest in the module's inbox

Code: `class AskIndex` in [`Server/AskIndex.mjs`](/Server/AskIndex.mjs), called by `RefineQueue.one()` after each prompt is refined. The owner's words: asks 1 and 2 of [`requirements-13.md`](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/requirements-13.md). Overview of all modules: [asks-by-module.md](/framework/ai/doc/asks-by-module.md).

## The record
- One line per refined ask in `asks.jsonl` inside the session's own folder, append-only: `{at, session, prompt_ref, id, ask, module, status}`; `status` starts `open`.
- A status change is a *later* line with the same `prompt_ref` + `id` (`done` with `done_by`, or `inboxed` with `inbox`); the last line wins when read. Nothing is rewritten.
- `module` is the module the refiner named; `AskIndex.module_of()` turns it into a real folder (alias table, nearest parent folder, unique folder name), or `null` for "site" and anything with no folder.

## The index
- `node Server/AskIndex.mjs` writes `<module>/doc/refined-asks.md` (open first, done struck through) and `ai/doc/asks-by-module.md`. Never hand-edited.
- The name is `refined-asks.md`, not `asks.md`: four modules already hold a hand-merged `doc/asks.md` (2026-10-12), which is linked from the generated page and never overwritten.

## The routing
- Done = AskTally judged a feature `done` (`ai/doc/asks-outcomes.jsonl`) and one of that feature's asks comes from the same prompt and says the same thing (word overlap). Strict on purpose: 19 of 1061 backfilled asks. A landing line is not searched separately; AskTally's feature status already comes from the landings.
- Not done, module known: `ModuleInbox.add(ask, source link)` once (the inbox is checked for the same source + text first), record becomes `inboxed`. Module unknown: stays `open`, counted on the overview.
- `node Server/AskIndex.mjs --plan | --backfill [--route] | --route [--module ux/Dictate]`; every command is safe to re-run. Test: `node Server/AskIndex.test.mjs`.

## Watch out
- `ModuleInbox.modules()` skips folders named `sessions`, so `ai/sessions`'s inbox is written but `ModuleReview` does not list it yet.
- Run the backfill from the main tree: a worktree does not hold the session folders that are still untracked there.

## Asks are also Tasks (step 8 of the task system plan)

`AskIndex.after_refine` now also adds one `Task` per newly recorded ask to the heard session's `task.jsonl`, through the item tool (`caller: refine-queue`; `source: {session, line, id}` links back to the ask, and a repeat call adds none). `AskIndex.tasks_view(dir)` lists those tasks read-only: the start of asks.jsonl becoming a view. Test: `Server/AskIndex-tasks.test.mjs`.
