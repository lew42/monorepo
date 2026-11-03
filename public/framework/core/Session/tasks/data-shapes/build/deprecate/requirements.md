# Build G: mark the lingering legacy, from the integration branch, NOT merged

**The owner (ask 30, now in `doc/rules.md`):** "if it's old and not used, we need it to be deprecated essentially and marked as so, so that we don't do it anymore." An old way left unmarked gets copied by agents.

**Source:** seat (h)'s table, [../../seats/legacy/shape.md](../../seats/legacy/shape.md) and [notes.md](../../seats/legacy/notes.md). It gives each legacy piece, its definition, its replacement and its removal condition.

## Setup

`git worktree add C:/Code/lew42/worktrees/deprecate -b worktree/deprecate integration/data-shapes`, then lock it.

## Scope: mark and point, nothing is removed or rewritten

1. **On each piece in seat (h)'s table, as it stands on the integration branch** (build A already changed some, so check each one), put one comment line at the definition, worded the same everywhere so a search finds all of them:

   ```js
   // DEPRECATED (2026-10-28): use <replacement>. Guide: <path>. Remove when: <condition>.
   ```

2. **Docs that still teach the old way** (seat h counted 38 doc lines for `page.children` alone) get one line saying it's the old way and linking the replacement. Rewrite no examples beyond that line.
3. **Move each guide** that seat (h) wrote beside the module it's about (`migration-children-to-pages.md` goes to `core/Page/doc/`), linked from that module's readme. Seat (h)'s copy stays, with a line pointing at the new home.
4. **A census script** (in the worktree, `Server/Deprecated.mjs`, with a dry run) that lists every `DEPRECATED (` mark with its live caller count, so the next removal step is computed, never recalled.
5. **Prove nothing changed in behaviour:** the integration branch's tests and smoke still pass the same.

## Fences

- Comments and docs only, plus the census script. No code behaviour changes, no renames, no removals.
- **Don't merge.** When done: run `node Server/review.mjs <this task dir> <worktree>`, answer every finding, and land with the branch, the mark count and the review phrase.
- **Budget:** about $12. Spawn no one but the reviewer. **Finish by about 21:00.**
