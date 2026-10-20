# core/Item: items save through their parent — verify, write the rule, test it

Budget: $8. Sonnet, medium effort. Parent: mastermind-system-architect, who tails your `session.jsonl`: log there as you go (the `log` tool), not chat. Work in the worktree `C:\Code\lew42\worktrees\item-storage` (branch `worktree/item-storage`); commit there; do not merge.

## The owner's ask (2026-10-20, 16:40; essence in [owner-2026-10-20-who-makes-tasks.md](/framework/ai/doc/owner-2026-10-20-who-makes-tasks.md) section 12)

> An item added to a parent item logs its deltas to the parent's store; `item.set(prop, anotherItem)` wires it; not every item needs a file. Breakout is by need: inside the parent → its own `thing.jsonl` → its own `thing/` directory the moment a real file must sit beside it. One tail system for everything: `ext/JSONL` `live()` through `Item`.

## Do

1. **Verify by reading the code** (`core/Item/Item.js`, `core/Item/Store.js`, `ext/JSONL/`, how `core/Page` and `core/Task`/`core/Session` load their logs): when a child item is set on a parent, where do the child's deltas go? Which items own a file and why? Is `live()` reached through `Item` (one path for items, pages, sessions, tasks), or do some classes tail on their own? Write down what IS, with file:line pointers, before any change.
2. **The rule in `core/Item/readme.md`** (short section, plain sentences): an item added to a parent logs its deltas to the parent's store; not every item gets a file; breakout by need (inside parent → own `thing.jsonl` → own `thing/` dir). Mark each part ✅ built or ⬜ not built, honestly. "Dynamic upgrade" (an item moving itself from parent store to its own file when it needs one) is a noted idea, not built. Put the detail and the code pointers in `core/Item/doc/architecture.md` (it exists; add a section, keep the rest).
3. **Smallest unit tests** in `core/Item/Item.test.mjs` (keep its existing style: plain node, no framework): a child set on a parent → its delta lands in the parent's store with the child's path; a reload of the parent replays the child. Only test what the code does today; if a part of the rule is not built, say so in the readme instead of testing it.
4. Where tests are discussed (`core/Item/readme.md`, or `code/` testing notes if they exist), one line: "A testing system is a need, not now (2026-10-20)."
5. If the wiring is missing for a small, safe case (one method), you may fix it; anything larger: a one-paragraph brief in this folder named `next.md`, not code.

## Done when

- [ ] Findings with file:line in your log and in `doc/architecture.md`.
- [ ] Rule in `core/Item/readme.md` with ✅/⬜.
- [ ] `node public/framework/core/Item/Item.test.mjs` passes (and the other `core/*/*.test.mjs` still pass).
- [ ] Committed in the worktree; land with `finish-task` in your own `session.jsonl`. Do not touch `core/Task/`, `Server/SessionRecord.mjs`, `Server/TaskDirs.mjs`.
