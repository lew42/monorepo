# Build A: the data backbone (plan step 1), in a worktree, NOT merged

**Your job:** make the delta path correct and fast without changing any data shape, prove it with tests, and leave it on a branch for the owner. Read first, in order:

1. [../../plan.md](../../plan.md), step 1 (your scope) and the forks table.
2. [../../ids-and-paths.md](../../ids-and-paths.md): the DECIDED section (dotted paths; each level's `get` takes the rest of the path).
3. [../../seats/items/notes.md](../../seats/items/notes.md) and [../../seats/streaming/notes.md](../../seats/streaming/notes.md): the bugs, proved, with file:line.
4. [../../seats/delta-flow/](../../seats/delta-flow/), if it has landed (it's being written now): the one path a change takes, and `demo-delta-flow.mjs`. If it isn't there yet, start without it and read it when it lands.

## Setup

- **Your own worktree:** `git worktree add C:/Code/lew42/worktrees/backbone -b worktree/backbone michael/dev`. Every edit goes there; nothing goes in the main tree except your task log in this folder.
- **A dev server for it:** use Servex's `list_servers` / `start_server` to serve the worktree, and log its url in your task log.
- **Commit after every working step,** in the worktree, by path.

## Scope (plan step 1a, 1b, 1c)

- **1a. Fixes:**
  - every hop names its list (`core/Item/Store.js`, `hops`);
  - `set()` reads dotted path keys, with each level's `get` taking the rest;
  - `List` keeps an id-to-member Map (`core/List/List.js`);
  - `Item.get` stops searching every list (old lines replay, with a warning);
  - `by`/`ts` are stripped into a clock for every Item;
  - `set(prop, item)` adopts the item, and `hops` learns property names (seat a, E7/E9);
  - one offset per socket in `Server/plugins/SocketServer/Tail.js` (the lost update; seat e has `race.mjs`);
  - linear replay: `lists()` cached, a pseudo-property line no longer walks the whole tree, `core/Session/SessionTasks.js` applies new lines only.

  **Old files must still replay identically:** prove it by replaying every real `session.jsonl`, `task.jsonl` and `page.jsonl` before and after, with a node script that compares the results.
- **1b. Tests through a real Store and a real file:** fill the persistence matrix ([streaming notes](../../seats/streaming/notes.md) §10). Every persisting class (`Item`, `List`, `Task`, `Prompt`, `Question`, `Session`, `Page`), standalone and nested, for add, set, move, remove and replay. One `X.test.mjs` per class where it fits.
- **1c. A study, not a build,** written as `backbone/f1-live-instance.md` in your worktree's copy of this folder:
  - fork F1, where the one live instance per root should run (Servex or each project's dev server);
  - what each server owns today;
  - what moving it would take.

## Fences

- **Change no data shape:** no new line verbs beyond reading dotted keys, and no session-shape work (that's plan step 4).
- **Don't merge.** Don't restart Servex or the main dev server. Never touch the main tree's code.
- **Prove it:** all existing tests and yours pass; `node Server/smoke.mjs <worktree>` passes; the voice session `v-sq8y7db` replays in under 200 ms with the same `progress()`.
- **When done:** run `node Server/review.mjs <this task dir> <worktree>` so a fresh reviewer reads it, answer every finding, then land your task log with the branch name, the server url, the test counts and the review phrase. The owner merges.
- **Write as you go:** decisions and findings go into your task log the moment they happen, so a fresh agent could carry on from it. If your context passes about 300k, write a handover note in this folder and say so.
- **Budget:** about $60. Spawn no one except the reviewer.
