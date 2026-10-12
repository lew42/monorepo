# ai-classes-asks: state

## Done
- `ai/cards/faces.js` was the largest function bag in AI code (12 exports, 9 importers). It is now `class Faces` with static members (`Faces.when`, `Faces.row`, `Faces.full`, ...). Commit 211a55e0c, merged to michael/dev. Proof: `/framework/ai/` and this task page load with no page errors (check_page); all touched files pass `node --check`.
- The old `card.js` re-exports of the same functions are removed; `rail/live.js` now imports `Faces`.

## Not tonight (smallest next step each)
- `ai2/faces.js` is a one-line `export *` shim; it now exports only `Faces` (no importers left). Delete once confirmed.
- Other lowercase bags in `ai/` (census: `node public/framework/code/patterns/function-bag-census.mjs --repo`, ~30 files, `cards/tasks.js`, `rail/inbox.js`, `cards/chat.js` next): same recipe, one per commit.
- Preview levels inline/card/detail as one class API and live-property class cards: needs a short class-architecture page first (CLAUDE.md "design before you build"); start by naming the three levels on `ai/classes/`.
