# Naming and structure: v4 (2026-11-17 ~19:25, voice-app)

**Status:** approved to pilot on 1920 Desktop (mastermind-naming-pilot is building it). His words: [owner-words-2026-11-17-naming.md](../owner-words-2026-11-17-naming.md). Earlier proposals: [web](./proposal-web.md), [kits](./proposal-kits.md), [minimal](./proposal-minimal.md).

## The template (every size page, Root assumed)

```
X Tier                          page, e.g. "1600 LG"
├─ X · Preview                  the best of this size, as instances
├─ X · Default                  surface: padding + fill → [X · Content]
├─ X · Content                  ONE X-wide card, padded; bare Content masters stacked inside with dividers
│  ├─ X · Content               placeholder: bare, dashed outline, title = its own name
│  ├─ X · Content · Text
│  └─ X · Content · …
├─ X · 2                        X · 2 · Equal, X · 2 · Sidebar, …   (each column holds a smaller · Default)
├─ X · 3                        X · 3 · Equal, …
└─ X · 4                        X · 4 · Equal
```

**Rules:**
- **Surfaces pad; bare things don't.** Default and Card have padding and a fill. Content and the column layouts have neither.
- **Each size defines its own Content, in its own card.** The Content sits a little narrower than X because of the card's padding, and that's fine.
- **Larger pages show smaller Content only as instances,** never as masters. For example, a 1920 Default holds a `1600 · Content` instance.
- **Names carry the size** on every folder and master. Columns are named `Column 1` … `Column N`.

## Which sizes have Content, and where it can go

Content stops at 1600: a single line of body text wider than that is unreadable. The nearby small sizes share one set.

| Page | Has `X · Content`? | Its Default holds | Its `X · 2` columns hold |
|---|---|---|---|
| 3440 Mega | no | 1920 · Default (or 1600 · Content) | 1600 · Default |
| 2600 XL | no | 1600 · Content | 1000 · Default |
| 1920 Desktop | no | 1600 · Content | 1000 · Default |
| 1600 LG | **yes** | 1600 · Content | 600 · Default (columns ≈ 800) |
| 1000 Default | **yes** | 1000 · Content | 600 · Default / 400 · Default |
| 600 SM | **yes** | 600 · Content | 400 · Default (rare) |
| 400 Mobile | **yes** | 400 · Content | none (one column) |
| 360 XS | no | 400 · Content (squeezes ~40) | none |

**Picking a column's Default:** use the nearest size. A piece may be squeezed by up to about 10% (1000 into 960) or stretched by up to about 1.6× (600 into 800). Never squeeze it more than that.

**Jump rule:** a piece goes into a surface up to about 1.6× its size, never more. Allowed: 1600 → 1920, 1000 → 1600, 600 → 1000, 400 → 600. Never: 400 → 1600, 360 → 3440. Each Preview shows its own Content in its own Default, plus the next smaller size's Default in `X · 2`. That is the "nesting space", shown once per page, not every combination.

## Building

```
Drag 1920 · Default             → a band showing "1600 · Content"
Swap that content               → 1600 · Content · Text + Media
Swap the Default itself         → 1920 · 2 · Equal: two 1000 · Defaults
Swap a column                   → 1000 · Card, or a 1000 · Content
```

The one-child limit: an instance takes no new children. For more stacked content, use a Content master that already stacks, or detach that one child.

## Open

- **Narrow sidebars (~300):** the smallest piece is 360/400, so a 300 sidebar column squeezes it too much. A sidebar may need its own Content of about 300 (owner's 300/700 example).

- Card per size (`X · Card`) or just the Default? For now Card = Default + corners + shadow, defined at 1000 and below.
- At 1920, `section-pad-x` is 72 (measured in the pilot), so the inner area is 1776, not 1600. The "1600" label is approximate until the token test.

## Pilot built (1920 Desktop)

Built 2026-11-17 by mastermind-naming-pilot in [Lew42 v2](https://www.figma.com/design/ADpu9u2V0BlEZfR3rrMfER/Lew42-v2?node-id=252-829), beside everything that was there (rule 14). Nothing old was moved, renamed or deleted, and your `image 1` stays where it was. Lint shows 0 errors on every new column, and every new master has a description (rule 21).

**Try it:** on 1920 Desktop, open `Root Column - Pilot · Build demo`. Select the `Content` layer inside step 1's `1920 · Default`, then use the swap menu to pick any `1600 · Content · …` master.

### What is where

| Page | Root column (new, first in Root) | Masters inside (ids) |
|---|---|---|
| 1920 Desktop | `Root Column - Pilot · Masters` `252:776` (1920 wide) | `1920 · Default` `252:797`; folder `1920 · 2` `252:800`: `1920 · 2 · Equal` `252:801`, `1920 · 2 · Sidebar` `252:806`; folder `1920 · 3` `252:811`: `1920 · 3 · Equal` `252:812`; folder `1920 · 4` `252:819`: `1920 · 4 · Equal` `252:820` |
| 1920 Desktop | `Root Column - Pilot · Build demo` `252:829` | instances only: steps 1–5 |
| 1600 LG | `Root Column - Pilot · Masters` `251:542` (1600 wide) | `1600 · Default` `251:544`; folder `1600 · Content` `252:778` (one 1600-wide white card, section-pad, radius, dividers): `1600 · Content` `252:779`, `· Text` `252:781`, `· Text + Media` `252:784`, `· 2 · Equal` `252:790` |
| 1000 Default | `Root Column - Defaults` `251:970` | `1000 · Default` `251:972` |
| 600 SM | `Root Column - Defaults` `251:1288` | `600 · Default` `251:1290` |
| 400 Mobile | `Root Column - Defaults` `251:1728` | `400 · Default` `251:1730` |

- **Defaults, at every size:**
  - Each has section-pad padding and a Scheme `fill`, with no corners.
  - Scheme White is set on the master, and Scale is pinned to the master's own tier, so it looks the same wherever it is dropped.
  - The smaller ones are leaves for now: just an h1 with their own name.
- **`1920 · Default`** is 1920 × 205. It holds one `1600 · Content` instance named `Content` (Fill, 1776 wide).
- **The 1600 Content masters** are bare (no fill, no padding) and Fill the card, so they are 1472 wide inside the 1600 card at 1600 LG.
  - `· Text` is an h2 and a body paragraph on `text-gap`; the body stops at 720.
  - `· Text + Media` is built from a `· Text` instance (layer `Text`) and an Image instance (layer `Media`).
  - `· 2 · Equal` is two `· Text` instances, layers `Column 1` and `Column 2`.
  - The placeholder has a 1 px dashed stroke bound to Scheme `muted`.
- **The column layouts:**
  - Each is 1920 wide and horizontal, with gap `gap` (44), no padding and no fill. Scale is pinned to 1920 Desktop.
  - The columns are instances of the smaller Defaults, named `Column 1` … `Column N`, and they Fill.
  - Measured column widths: 2 · Equal is 938 each; 2 · Sidebar is 400 (fixed) plus 1432; 3 · Equal is 610; 4 · Equal is 447.
- **The Build demo, one step each:**
  1. `1920 · Default`, as dragged in.
  2. Its `Content` swapped to `· Text + Media`.
  3. The Default itself swapped to `1920 · 2 · Equal`.
  4. Then `Column 2` swapped to `Card` (`16:364`).
  5. Two more Defaults, with `Content` swapped to `· Text` and to `· 2 · Equal`.

### What the swaps did (checked by reading the nodes back)

- Swapping the nested `Content` keeps its layer name and its Fill width (1776).
- Swapping the whole Default to `1920 · 2 · Equal` works: you get two `1000 · Default` columns, 938 wide each.
- Swapping `Column 2` to `Card` keeps it at Fill.
- The `1600 · Content` folder was first built on 1920, then moved to 1600 LG with `appendChild`. Every id stayed the same, and the `Content` inside `1920 · Default` still points at `252:779`.

### Surprises

- **Fill columns are not equal boxes when their padding differs.**
  - In step 4 the Card is 958 wide and the `1000 · Default` beside it is 918.
  - Figma shares out only the space left after each child's padding. The Card follows 1920, so it pads 68 per side; the 1000 Default pads 48. Twice the 20 px difference is 40.
  - A Card pinned to 1000 would even them out.
- **Columns are ragged when their content differs.**
  - In step 4 the two columns are 155 and 343 tall.
  - A row that hugs its height can't stretch every child: if every child Fills, the row never grows.
  - Only `2 · Sidebar` fixes it. Its sidebar column Fills the row height and the main column hugs.
- **A text node can't bind `maxWidth` to a variable** (Figma's error: `invalid field for text node`). The body uses a plain 720 max width, which lint accepts. Binding it to `measure` would need a wrapper frame, which adds a layer.
- **Root got wider.** The 1920 Desktop Root went from 9068 × 4608 to 13420 × 4608, about 2.9 : 1 (rule 12 asks for 2 : 1 or squarer). It shrinks back once the pilot is approved and the old `Specimens` column moves to Archive.
- **The inner width is 1776.** `section-pad-x` at 1920 is 72, so the content area is 1776, not 1600 (see Open).
