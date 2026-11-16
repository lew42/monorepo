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
| | `Card` | 34:478 | **`Card` on Scale** |
| | `Nav item` | 34:484 | none |
| | `Sidebar` | 34:486 | none |
| | `Page card` | 34:500 | near-`Card` |
| | `Miller Set`, `Miller Mobile Set`, `Sidebar Layout Set`, `Two Columns Set`, `Three Columns Set`, `Scale Regions Set`, `Single Column Set` | 34:1513, 34:1572, 34:5646, 34:5795, 34:5822, 34:5871, 34:6349 | layout permutations (see below) |

`Explore – Sizing`, `Layout examples`, `Figma → CSS` and `Legacy vs Latest` hold plain frames only, no components. The 2600 page's owner-placed `Connector · yes` (43:2638) is not a component.

## Near-duplicates

- **`Button`**: Scale 23:506 and 2600 34:476. Keep Scale's.
- **`Card`**: Scale 16:364, 2600 34:478, `Card Set` 34:244, and `Page card` 34:500. Four takes on one thing.
- **Seven layout sets** on the 2600 page are permutations (columns, Miller, sidebar) and conflict with the lean toward a minimal set of building blocks ([design-system-notes.md](./design-system-notes.md), "Open question: layout components").
- **Test masters** (`Master 1`-`6`, twice) are experiments, not system parts.

## Proposed minimal level-one set

Text, icon, button, image, card, and one or two layouts, leaning on browser defaults.

| Part | Proposal | Source |
|---|---|---|
| Text | Not a component: text styles (checking the file's styles is open) | none |
| Icon | One `Icon` component (square, size by variant) | new, needs OK |
| Button | `Button` (Scale 23:506) | **keep** |
| Image | One `Image` placeholder (fill, aspect via variant) | new, needs OK |
| Card | `Card` (Scale 16:364) with a `with media` variant folded in | **keep, merge** 16:374 and `Card Set` 34:244 into it |
| Heading | `Heading Set` (34:466) is 52 variants; trim to what the rule set needs | **keep, trim** |
| Layout | Two building blocks: `Columns` (a row of Fill slots) and `Sidebar layout` (sidebar + main) | **merge** the seven sets into two |
| Nav item, Sidebar | Keep only if a `Sidebar layout` needs them | **keep for now** |

## To delete (later, with the owner's OK, git-style: move aside first)

- 2600 `Button` 34:476 and `Card` 34:478 (duplicates of Scale's).
- `Page card` 34:500 (fold into `Card`).
- The seven layout sets, after two are chosen.
- The test masters, after the mode work is documented.

## Next (not started)

Rename `Page 1` to `Index` and list the kept masters one instance each with name, home page and purpose. No new component until the owner decides.
