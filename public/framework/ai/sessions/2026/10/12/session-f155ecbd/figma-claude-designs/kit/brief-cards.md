# Brief: Foundations · Cards: the card styles, worked through (owner, 2026-10-14)

The owner: "that's what I'd like to work on in terms of cards, different card styles… the simplest, most foundational, versatile, reusable… everything responsive: fill width, auto height… everything an instance of a component."

Start from the card set on Essentials ([essentials.md](essentials.md): `Card / Plain`, `Header + actions`, `Stat`, `List`, `Media`, `Feature`, `Callout`, and `Context` Form=Card). Edit those masters (rule 6 in [use-figma.md](/framework/ext/Figma/doc/use-figma.md)); never make parallel copies. Rules: [design/layout/doc/space.md](/framework/design/layout/doc/space.md) (equal heights, top-aligned; no ragged grids; reading width; nesting without over-boxing), [figma-layout.md](/framework/ext/Figma/doc/figma-layout.md), [grids.md](grids.md) (cards min 360, max 520). File `QYN0G2URSBHYH5I06MOjxU`; load the figma-use skill first. Keep calls lean (one script per row); if the shared tool limit hits, stop and record what's left.

## Page `Foundations · Cards` (new; after `Foundations · Type & spacing`)
Section rows (name + "use for…" left, specimens right), best first:
1. **Each card style, responsive:** the same instance at 280, 400 and 520 wide (min, mid, max). Fix any master that wraps badly (an icon dropping to its own line, a title breaking, a button overflowing): test with the longest real title.
2. **Density:** a `Density` variant (Comfortable / Compact) on the masters where it helps (padding from tokens: pad vs small-pad), shown side by side.
3. **Grids of cards:** 3-up and 4-up rows with equal heights (fixed row height named in the layer, content top-aligned), and one masonry of mixed card styles.
4. **Card on card** (nesting): a List card inside a section ground, a Stat row inside a card. Show where it reads well and where it's one box too many.
5. **Colour last:** the plain, stat and list cards on the dark ground (Text mode only).
6. Notes: the 4 cards you'd use for 80% of pages, and what you changed in the masters.

Make the page a 1920 `Page · Foundations · Cards` component. Screenshot at 100%, fix, report `kit/cards.md`, committed by path. Finish within about 90 minutes.
