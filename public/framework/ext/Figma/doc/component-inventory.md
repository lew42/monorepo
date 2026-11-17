# Lew42 v2: component inventory and a proposed level-one set (2026-11-16)

A read-only inventory of every component in Lew42 v2 (`ADpu9u2V0BlEZfR3rrMfER`) and a **proposal**, not a decision. Nothing was deleted or built; `Page 1` is not yet renamed `Index`. Rules: [design-system-notes.md](./design-system-notes.md), "Core rules".

## What existed before today's Explore pages

All on the `Scale` page (5:5), made in earlier sessions. `Page 1` (0:1) is empty.

- **`Button`** (23:506), **`Card`** (16:364), **`Card · with media`** (16:374), **`Content · Stat`** (15:131).
- **`Size · Default`** (9:2): a test component for the page-size modes.
- **Test masters** `Master 1`-`Master 6` (19:459, 19:479, 19:499, 19:519, 19:544, 21:502) and a second `Master 1`-`3` (18:437, 18:442, 18:447), used for mode-precedence tests (the frame `Scratch · mode precedence tests`, 18:436).

## What today's Explore agents made

| Page | Component | Id | Duplicates |
|---|---|---|---|
| Explore – Color permutations | `Card Set` (7 variants) | 34:244 | `Card` on Scale |
| Explore – Icon + title | `Heading Set` (52 variants) | 34:466 | none (new space) |
| Explore – 2600 layouts | `Button` | 34:476 | **`Button` on Scale** |
| | `Card` (deleted 2026-11-16, swapped to 16:364) | 34:478 | was **`Card` on Scale** |
| | `Nav item` | 34:484 | none |
| | `Sidebar` | 34:486 | none |
| | `Page card` (deleted 2026-11-16; its one instance became the frame `Page card` 106:127) | 34:500 | was near-`Card` |
| | `Miller Set`, `Miller Mobile Set`, `Sidebar Layout Set`, `Two Columns Set`, `Three Columns Set`, `Scale Regions Set`, `Single Column Set` | 34:1513, 34:1572, 34:5646, 34:5795, 34:5822, 34:5871, 34:6349 | layout permutations (see below) |

`Explore – Sizing`, `Layout examples`, `Figma → CSS` and `Legacy vs Latest` hold plain frames only, no components. The 2600 page's owner-placed `Connector · yes` (43:2638) is not a component.

## Near-duplicates

- **`Button`**: Scale 23:506 and 2600 34:476. Keep Scale's.
- **`Card`**: Scale 16:364 is the only Card now (2600 `34:478` and `Page card` `34:500` deleted 2026-11-16). `Card Set` 34:244 is still an experiment to merge.
- **Seven layout sets** on the 2600 page are permutations (columns, Miller, sidebar) and conflict with the lean toward a minimal set of building blocks ([design-system-notes.md](./design-system-notes.md), "Open question: layout components").
- **Test masters** (`Master 1`-`6`, twice) are experiments, not system parts.

## Proposed minimal level-one set

Text, icon, button, image, card, and one or two layouts, leaning on browser defaults.

| Part | Proposal | Source |
|---|---|---|
| Text | Not a component: text styles (checking the file's styles is open) | none |
| Icon | `Icon.Item Set` on the `Icons` page (the owner is editing it) | **keep**, existing |
| Button | `Button` (Elements 23:506, moved from Scale) | **keep**, done |
| Image | `Image` placeholder (Elements 48:4583) | **done** (the owner asked for it) |
| Card | `Card` (Scale 16:364) with a `with media` variant folded in | **keep, merge** 16:374 and `Card Set` 34:244 into it |
| Heading | `Heading Set` (34:466) is 52 variants; trim to what the rule set needs | **keep, trim** |
| Layout | Two building blocks: `Columns` (a row of Fill slots) and `Sidebar layout` (sidebar + main) | **merge** the seven sets into two |
| Nav item, Sidebar | Keep only if a `Sidebar layout` needs them | **keep for now** |

## To delete (later, with the owner's OK, git-style: move aside first)

- 2600 `Button` 34:476 (duplicate of Scale's; `Card` 34:478 and `Page card` 34:500 are already gone).
- The seven layout sets, after two are chosen.
- The test masters, after the mode work is documented.

## Done after the owner's go (2026-11-16)

- **One `Button`:** the 2600 duplicate (34:476) is removed; its instances were swapped to the original (23:506), labels kept. The original moved to the new **`Elements`** page (48:4568), next to a new **`Image`** master (48:4583, placeholder) and a text-styles specimen (text is styles, not a component). The icon item's home stays the `Icons` page.
- **Naming:** the seven 2600 layout sets are renamed to the class convention ([design-system-notes.md](./design-system-notes.md)): `Layout.Miller Set`, `Layout.Miller.Mobile Set`, `Layout.Sidebar Set`, `Layout.Columns.Two Set`, `Layout.Columns.Three Set`, `Layout.ScaleRegions Set`, `Layout.Columns.One Set`. `Card Set` and `Heading Set` already fit. The pages `Index`, `1920 Pages` and `Icons` were left alone (the owner is editing them).

## Encapsulation: instances whose main component lives in another file (read-only)

Found by checking each instance's main component for `remote`. Nothing else in v2 is remote: `Scale`, every `Explore` page and `Elements` are clean.

- **`Icons` page (43:5481):** top-level instances `Page · Icons` (43:6068) and `Workspace` (43:6252) are instances of Big Sloppy's `Page Set/Size=1920` (main 43:2676). Inside them come ~450 remote instances: `.Section` (43:2659), `Icon` (43:3329), about 90 `icon-*` and `Icon.Item Set/Size=*` variants, `.Masonry` (43:2718) and `Card` (43:2711).
- **`Index` page (0:1):** the one `Icons Preview` instance (local main 43:7935) contains a nested remote `Page` and ~60 remote icon instances.
- **`1920 Pages` (43:8101):** clean; the local `Page` master (43:8103) has no remote instances.
- **Fix when the owner is ready:** detach the top-level `Page · Icons`, `Workspace` and the Icons Preview's nested `Page`, then point their icons at the local `Icon.Item Set` (43:6069) and rebuild the sections from local parts.

## Page padding (the `Page` master)

`Scale` already has `section-pad-x` / `section-pad-y` and binds them: 33 times each, on every `Section` frame (and `pad-x`, `pad-y` are bound 118 and 112 times, mostly on cards). Values match in every mode except Mobile (pad-x 24 vs section-pad-x 16; pad-y 32 equals section-pad-y 32). The local `Page` master (43:8103) binds `pad-x` left and right but `section-pad-y` top and bottom.

**Suggestion: bind the page edge to `section-pad-x` / `section-pad-y`, both,** since that is what a Section already uses, so a Section placed in a Page lines up at every mode. No new token. Side note: 6 test cards on `Scale` (e.g. 18:439) bind `pad-x` to a vertical padding; harmless, but wrong axis.

## Next (not started)

Rename `Page 1` to `Index` and list the kept masters one instance each with name, home page and purpose. No new component until the owner decides.
