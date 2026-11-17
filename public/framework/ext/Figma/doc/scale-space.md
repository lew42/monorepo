# Scale space: one responsive master per layout, instanced at all 8 Scale modes (2026-11-16)

Built in Lew42 v2, frame **Lab · Scale space** (`174:62`, page Explore – Sizing, below Lab · Mode split). No master, variable or other frame was touched. Question: [owner-words-2026-11-16.md](./owner-words-2026-11-16.md) ("do you have to change the flex direction to stack?").

## Conclusion

**You do not need a Direction variant for these layouts.** Horizontal + wrap, with children set to Fill and a min width bound to `card-min`, stacks and unstacks by itself, and one master covers 360 to 3440 with no overflow. Only the no-wrap Sidebar + Main fails, and wrap fixes it. What one master does not do is *grow*: above 1920 the layout is correct but sparse, because the grid is capped at 1600.

## How the test works

- **Master** (build at 1000 Default, Fill widths, nothing fixed except the rail's 280): root (vertical, width bound to `width`, padding bound to `section-pad`, centred) holding a **Grid** (horizontal, wrap, Fill, `maxWidth` bound to `squeeze`, gap bound to `gap`). Children: Fill, `minWidth` bound to `card-min` (the text column also gets `maxWidth` bound to `measure`).
- **Instance** (8 per layout): only two overrides, the Scale mode on the root, and `width` bound to the `width` variable (so it follows the mode: 360, 400, 600, 1000, 1600, 1920, 2600, 3440). Cards stay Auto.
- **Wrapper rule** ([mode-split.md](./mode-split.md)): on 1920, 2600 and 3440 the nested **Grid** gets an explicit Default mode, so the page keeps its margin and the cards stay card-sized (Default pad 48, `card-min` 320, cap 1600). Setting a Scale mode on a layer *inside* an instance works and needs no detach.

## Results (measured from the layout, not eyeballed: column count, card widths, overflow)

W = works, S = squeezed, O = overflow, P = too sparse (correct, but a small block in a big page), 2+1 = last card stretches full width.

| Layout (master) | 360 | 400 | 600 | 1000 | 1600 | 1920 | 2600 | 3440 |
|---|---|---|---|---|---|---|---|---|
| Three cards `174:65` | W (1 col) | W (1) | W (1) | W, 2+1 | W (3) | W (3) | P | P |
| Split `174:111` | W (stack) | W | W | W (387/483) | W | W | P | P |
| Stat tiles `174:127` | W (1) | W (1) | W (1) | W (2×2) | 3+1 stretch | W (4) | P | P |
| Sidebar + Main, no wrap `174:171` | **S** (Main 34 px, 4239 tall) | **S** (62 px) | tight (232 px) | W | W | W | P | P |
| Sidebar + Main, wrap `174:191` (extra) | W (rail above main) | W | W | W | W | W | P | P |

Breakout rows: Three cards `174:213`, Split `174:496`, Stat tiles `174:627`, Sidebar + Main `174:966`, wrap `174:1129`. Row PNGs: [three-cards](./scale-space/three-cards.png), [split](./scale-space/split.png), [stat-tiles](./scale-space/stat-tiles.png), [sidebar-main](./scale-space/sidebar-main.png), [sidebar-main-wrap](./scale-space/sidebar-main-wrap.png) (a 12,760 px row, scaled to about 0.24; the per-column numbers above come from the API).

## What one master covers, and what needs more

- **One master covers all 8 tiers:** Three cards, Split, Stat tiles and Sidebar + Main (wrap). Stacking happens at the wrap point, no Direction needed.
- **Needs wrap on, or it fails at ≤600:** Sidebar + Main. Without wrap Main is crushed to a sliver (a letter per line). A bound min width on Main (`card-min`, not a hardcoded 480, which overflowed 360 and 400 in my first try) wraps it below the rail.
- **Still needs a per-tier version or a Direction variant:** (1) a rail that turns into a top bar (the rail keeps its 280 width when wrapped; its own items cannot turn from column to row); (2) Masonry, which swaps 1/2/3 columns; (3) an order flip (image first on mobile).
- **Two defects wrap leaves:** the last card of an uneven row stretches full width (Three cards at 1000, Stat tiles at 1600: the orphan is 902 and 1470 wide). Pick `card-min` so the usual count divides evenly, or accept it at one tier. And above 1920 the layout does not add columns (3 or 4 tiles in a 1600 cap on a 3440 page); more columns needs a wider cap on the outer frame, which brings back the Mega-padding question in [mode-split.md](./mode-split.md).

## Which size to build the master at

**Build at 1000 Default.** It is the collection default, so any layer with no mode already resolves there, and a master built there carries no explicit mode (an explicit mode on a master pins it, [drop-test.md](./drop-test.md)). Rules: every width Fill or bound to `width`; every child min width bound to `card-min`; only fixed number allowed is a deliberate one (the rail's 280). Never build at 360 or Mega: their numbers get baked in. The mode on the instance (not the master) is what makes it respond.

## Not done

Instances were not cropped at 1:1 (the 3440 ones are too wide to read as a picture); judgements come from measured widths. Text size and the rail's 280 are not tied to Scale. Mega legibility of the cap (1600 vs `squeeze` 2400) was not tried.
