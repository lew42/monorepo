# Cross-review: do the nine build branches fit together? (read-only, before integration 2)

**Why:** nine branches landed today, none merged. After the reset, one integration branch will hold all of them for the owner to review and merge. A fresh reviewer who built none of them should read them side by side first, and name where they clash or drift from the plan.

**The branches** (each one's landing and review are in its folder under `build/`):

| Build | Branch | Based on |
|---|---|---|
| A backbone, B default view, C class docs | merged together as `integration/data-shapes` | michael/dev |
| D one writer | `worktree/one-writer` | integration |
| E browser refs | `worktree/browser-refs` | integration |
| F worktree preview | `worktree/worktree-preview` | michael/dev |
| G deprecation marks | `worktree/deprecate` | integration |
| H test view | `worktree/test-view` | integration |
| I generic item tool (may still be running) | `worktree/item-generic` | D |

Read [../../plan.md](../../plan.md), then each branch's diff against its base (`git diff <base>...<branch> --stat`, then the files that matter).

## Answer

1. **Clashes:** files two or more branches change (D, E and I all touch `core/Item/Store.js` or `Servex/agents/page_tools.js`). For each, will a merge go clean, conflict, or merge cleanly but break? Give the merge order that minimises trouble.
2. **Drift from the decisions:**
   - dotted paths, read but written nested;
   - each level's `get` taking the rest of the path;
   - short random ids, with readable ones only for code-made structure;
   - absolute references, with backlinks in memory and forwards across files;
   - one writer;
   - no `SessionRef`;
   - `item.move_to`;
   - views never stored.

   Name any branch that went another way.
3. **Duplicates:** two branches building the same thing two ways (law 6: one of everything).
4. **The riskiest change for the live site** if merged, and the check that would catch it.
5. **What integration 2 must test** beyond each branch's own tests.

## Write

- **`review.md` in this folder:** one screen, ranked, with file:line evidence and a one-line recommendation each, then the merge order.
- **Fences:** read-only. Write only here; no code edits; spawn no one; never merge. Commit by path. Budget about $20. **Finish by about 21:20.** If build I hasn't landed, review what it has committed and say so.
