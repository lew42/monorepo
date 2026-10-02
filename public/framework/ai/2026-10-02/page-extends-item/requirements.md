# Page extends Item: persistence as JSONL lines

The owner, 2026-10-02: "Page extends item? I thought we already agreed on that." **Approved; build it.**
The whole design is in [page-item-design.md](../../2026-09-30/proposal-flow/page-item-design.md). Read it first (all sections; the top ones supersede the lower ones where they differ).

## Build, in order (small merges, each one working on its own)
1. **One `set(delta)`** on Item, with the rules in the design: a method key calls the method, a settable value gets the nested delta, anything else is data and emits `change`. A replay flag means lines that are being replayed are never written back.
2. **Page extends Item.** Page's `children` Map and Item's `items` List become one tree model, or one is clearly derived from the other. Keep every existing page working: Log.js replay, `files`, `place`, `tab`, settings, the ext/ system, and the static site.
3. **Persistence in Item, as a part:** `static Store` (load, replay, append, tail) over the existing dev-socket Append and Tail RPCs. Each live change appends ONE line to the nearest page.jsonl. Item's current whole-JSON `saver` stays working, or migrates.
4. **List verbs as lines:** `add` (with `after`), `remove`, `move`, and `order` (one line for a sort or any bulk reorder). Ids, not indexes. Small arrays of plain values are just data (`set` the whole array). Changes in one tick are batched into one Append call, still one line each.
5. **A demo page** at /framework/core/Item/ (or core/Page/) that shows it working live: add, drag, sort, then reload and get the same list back, and a second tab updating via tail.
6. Update the `## Architecture` blocks in the List, Item and Page readmes.

## Rules
- This is core surgery, approved. Do a caller census first (`grep` for `.set(`, `children`, `items`, `saver`) and list the callers on the card. Keep a re-export or shim wherever a rename would break more than a few callers.
- An Opus task mastermind, with at most 2 Sonnet minions. Pool worktrees, `merge.mjs`, and the review skill. Screenshot the demo at 400 and 1920, and smoke-test /framework/, /framework/ai/, /framework/ai2/ and one jsonl page before each merge.
- Never wait on the owner. Pick, record the alternative, keep going.
