# Misnamed scripts, batch 5: the last six are function bags; four become classes, the two Servex cores get a plan

Budget: $8. Load the `sub-mastermind` and `code` skills first. Same ask and method as batches 1–4 (`../scripts-rename-4/requirements.md`, `Server/RenameScript.mjs`, `Server/doc/scripts.md` lists the six that remain). These six are not misnamed files but function bags the code skill says should be classes: `Server/ask-each.mjs` (26 refs), `Server/browser.mjs` (45 refs, the browser launcher), `Server/collab.mjs`, `Server/decide.mjs`, `Servex/agents/Agents.js` (82 refs), `Servex/agents/directory.js` (131 refs). Your log is this dir's `task.jsonl`.

## Deliverable

1. **The four Server ones become classes** (`AskEach`, `Browser`, `Collab`, `Decide`: file named for the class, the old lowercase file kept as a one-line shim that re-exports, so no caller breaks today; callers listed first, file:line, and the callers inside `Server/` and `.claude/` updated by `RenameScript --plan`/`--apply`); `node --check`, tests green, hooks dry-run, undo proven on a worktree copy; `merge.mjs`.
2. **`Agents.js` and `directory.js`: a plan, not a change** (82 and 131 refs in the live agent host is major surgery, CLAUDE.md "ask before"): `Servex/agents/doc/class-plan.md`, one screen: what the class would be (`Agents`, `Directory`), its API, the callers by count, the shim strategy, the test on a private port, and the estimated size; linked from the Servex readme. A `decision` line says it waits on the owner.
3. `Server/doc/scripts.md` marks the four and links the plan; 0 misnamed remain, 2 planned; card (title "Scripts: the last four function bags are classes; two Servex cores have a plan"); landing line checked with `tail -1`; the live Servex is restarted by the mastermind.

Fence: the four scripts, their shims and callers' path lines, `Server/RenameScript.mjs`, `Server/doc/scripts.md`, `Servex/agents/doc/class-plan.md`, one readme line, this task dir. Servex files untouched beyond the doc. Sonnet.
