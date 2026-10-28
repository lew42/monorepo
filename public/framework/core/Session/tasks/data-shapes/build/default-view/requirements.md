# Build B: one default view for every Item, and a live demo (plan step 2), in a worktree, NOT merged

**Your job:** the owner "needs to see things more". Every object should draw as a small, collapsible view that shows what it is and what it holds, live as it changes. Read first:

1. [../../plan.md](../../plan.md), step 2 and fork F5.
2. The owner's words: asks 25, 26, 32, 33, 43 and 44 in [../../requirements.md](../../requirements.md).
3. **What already exists, which you build from (never a second system):**
   - `ux/Content/Object/` and its readme: `object()` in `Object.js`, `view()` in `DefaultView.js`, `inspect()` in `Inspect.js`, `InstanceTree.js`;
   - its census, `ux/Content/Object/doc/census.md`;
   - `code/objects/readme.md`;
   - the object log, `core/Page/card/log/Logger.js` and `LogView.js`;
   - `core/View/` (the view base);
   - the readme layout rules in `doc/rules.md`.
4. The `page` skill, and `ui-ux` if it fits, before drawing anything the owner will see.

## Setup

- **Your own worktree:** `git worktree add C:/Code/lew42/worktrees/default-view -b worktree/default-view michael/dev`. Every edit goes there.
- **A dev server for it:** use Servex's `list_servers` / `start_server`, and log its url in your task log.
- **Commit after every working step,** in the worktree, by path.

## Scope

- **F5: three overlapping object views exist.** Merge them into ONE default view, or keep two with a stated reason. Old entry points keep working, re-exported and marked deprecated (`doc/rules.md`: lingering legacy is marked).
- **The default view:**
  - **collapsed:** a row with the class's `static icon`, the id, the class name as a small label, and counts ("3 tasks");
  - **open, on click:** its data by type. A string or number is written out; an Item or List nests its own default view, lazily; a reference shows where it points.

  It's live: it subscribes to the item's `delta` events and redraws only the row that changed, with no flicker.
- **`views`, an array** (ask 33): an object can draw in two places at once, and a change updates both. `List.render()` draws each member through its own view.
- **A live demo page,** under `core/Item/` (a demo page, linked from the Item readme):
  - a small tree is built step by step (a root, a List, a nested Item two levels down) and changed, saved to a scratch Store, and replayed;
  - the default view shows each object as it's made and changed, and a log of the lines written sits beside it.

  The owner should get it by clicking, not reading. Keep text to one line per step.
- **Look at it:** screenshots at 1920 and at phone width (headless only, never the owner's tabs), judged against the page skill before you call it done.

## Fences

- **No data-shape changes** (build A owns the Item/List/Store internals; if you need a hook from it, log the request rather than editing `core/Item/Store.js` or `core/List/List.js`).
- **Don't merge.** Don't restart Servex or the main dev server.
- **When done:** run `node Server/review.mjs <this task dir> <worktree>` so a fresh reviewer reads it, answer every finding, and land your task log with the branch, the server url, the screenshots and the review phrase.
- **Write as you go.** If your context passes about 300k, write a handover note in this folder.
- **Budget:** about $50. Spawn no one except the reviewer.
