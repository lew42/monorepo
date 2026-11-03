# Integration 2: every build on one branch, fixed and tested together, NOT merged into michael/dev

**Why:** nine builds landed on 2026-10-28, none merged. The owner reviews and merges **one** branch. Read [../../plan.md](../../plan.md), its "After the reset: integration 2" section (the merge order, the fixes, the riskiest change and its check), then [../cross-review/review.md](../cross-review/review.md) in full.

## Steps

1. **A new worktree from michael/dev:** `git worktree add C:/Code/lew42/worktrees/data-shapes-2 -b integration/data-shapes-2 michael/dev`, then lock it.
2. **Merge in the cross-review's order,** testing after each step so a failure points at the branch just merged:
   1. `integration/data-shapes`;
   2. `worktree/deprecate`;
   3. `worktree/test-view`;
   4. `worktree/browser-refs`;
   5. `worktree/item-generic` (it contains D; never D alone);
   6. `worktree/worktree-preview`.

   Check each branch's tip first: none should end in a "worktree closed: … leftover file(s)" commit, and if one does, merge its parent instead.
3. **The fixes on the way in** (plan.md lists them; each is its own commit with a reason):
   - one id maker: `new_id()` returns `short_id()` (Page keeps its own);
   - one path walker: the item tool calls `root.get(path)` once, with `member()` only for old id-only hops;
   - **`item.move_to(dest)`** as the one verb for a move: it moves, re-paths backlinked refs, and leaves a `moved_to` forward when the move crosses files. Make the handoff (`move_item` in `Servex/agents/page_tools.js`) use it;
   - the default view also redraws on `"read"`;
   - the two duplicates (the same-title rule; the state-icon map);
   - build F's two direct `task.jsonl` appends (`Server/on-landing.mjs:38`) go through the one writer.
4. **Prove it,** with the cross-review's seven checks:
   - the full node suite against michael/dev, with no new failures;
   - a two-tab page edit (exactly one line per change, each change shown once), on this worktree's own dev server;
   - a hook timed with the entry point down (at most about 3 s, one line);
   - a task redrawing in the default view when the item tool changes it;
   - a handoff while the parent shows the task through a Ref (it follows the forward, never "gone");
   - one Ref object shared with the item tool's live root;
   - a long voice session page while lines stream (each redraw cheap);
   - smoke on `/framework/core/Item/`, `/framework/core/List/`, `/framework/core/Test/view/?test=Task` and one session page with child sessions.

   The Servex-side checks import this worktree's own `Servex/agents/page_tools.js` in node. **Never restart the live Servex.**
5. **Keep the folder and its dev server up** (locked), and log the url.
6. **Land:**
   - the branch and url;
   - the test counts against michael/dev's;
   - each fix with its commit;
   - each check with its proof;
   - one merge note for the owner: the single `merge.mjs` command, then the restart steps (`node Servex/sustain.mjs --restart` and a dev-server restart, never during a voice call), and the two-tab check to run straight after.

## Fences

- **Never merge into michael/dev.** Don't restart Servex or the main dev server.
- Fix only what the plan lists, or what integration breaks. Anything else is logged.
- **When done:** run `node Server/review.mjs <this task dir> <worktree>` so a fresh reviewer reads the combined diff, and answer every finding.
- **Budget:** about $60. Spawn no one but the reviewer.
