# Lists: how to store order and updates: options to compare

The owner's words are verbatim in [owner-words.md](owner-words.md). This is research plus small prototypes. Do NOT change the framework's real files.

## Read first (only these)
- `public/framework/ai/2026-09-30/proposal-flow/page-item-design.md`: the design so far (one `set(delta)`, page.jsonl lines, Item + List, the `saver`).
- `public/framework/core/List/List.js` and `core/Item/Item.js`: what exists.
- `public/framework/core/Page/Log.js`: how page.jsonl lines are replayed today.
- `public/framework/ext/Draggable/Sortable.js` and `public/framework/ux/Tree/` (the drag tree, `TreeDrag`): the drag-and-drop that will produce moves.

## The design requirements (draft; some are preferences, not rules)
1. **Append-only:** each change is ONE small line; the file is never rewritten. A move should be ONE line, not one per shifted item.
2. **Replay is fast and simple:** rebuilding the order shouldn't need walking a long chain.
3. **Few ids, little namespace overhead:** the owner dislikes "a lot of ids". If ids are needed, they should be cheap, local to the list, and automatic.
4. **Concurrent edits don't corrupt the order** (two tabs, or an agent and the owner).
5. **Works for page children too:** a page's sub-pages as a List, drag-and-drop in the tree UI, each child stored in the parent's file or broken out into its own.
6. **Live:** lines stream to other tabs (tail) and apply in place.

## Compare at least these, then recommend ONE (and give the runner-up)
- **A. Ids + `after`** (the current proposal): a linked order.
- **B. Fractional order keys:** each item has a sortable key (e.g. "a0", "a0V", "a1"); inserting between two items makes a key between theirs. One line per move, no renumbering, order = sort by key. The key can double as the item's identity in the list.
- **C. Indexes with a batched renumber:** an `order` line with the full list of ids or indexes after each change.
- **D. Anything better you know of** (CRDT-style list sequences…).

For each: the line format, the replay cost, a move, an insert, a delete, two concurrent moves, and how it meets requirements 1–6.

## Output
- `report.md`: one screen. A table of options × requirements, then the recommendation and the runner-up.
- `prototype/`: a tiny runnable node script per option (`node prototype/B.mjs`) that writes a .jsonl, replays it, and prints the order after a scripted series of insert, move, delete and two concurrent moves. Use plain node, no npm packages.
- Log one line to this task's `task.jsonl` through `node .claude/hooks/append.mjs` when done.

