# Roots pass: every page is one Root (Lew42 v2, 2026-11-16)

**Result.** Every page in scope now has exactly one top-level frame named `Root`: vertical, 5% black, padded and gapped with the Scale tokens. Nothing overlaps. Master folders come first, with a purple 1 px stroke (Colors `master`, #8B5CF6). Lint's new page-root rule passes on all of them, with 0 child-driven widths and 0 unstyled text. The rule itself is in [Figma readme](/framework/ext/Figma/readme.md) and [lint.md](/framework/ext/Figma/doc/lint.md).

## Per page

| Page | Top level before → after | Connectors | Masters renamed | Lint errors left (content, not structure) |
|---|---|---|---|---|
| Showcase | 2 → 2 (Root + Present start) | 0 | 0 | 9 same-on-same in Button instances |
| Index | 2 → 1 | 0 | 0 | now owned by preview (1 loose image added since) |
| 360 XS | 2 → 1 + Archive | 0 | 4 | 0 |
| 400 Mobile | 2 → 1 + Archive | 0 | 4 | 0 |
| 600 SM | 2 → 1 + Archive | 0 | 4 | 0 |
| 1000 Default | 3 → 1 + Archive | 0 | 5 | 0 |
| 1600 LG | 2 → 1 + Archive | 0 | 5 | 0 |
| 1920 Desktop | 2 → 1 + Archive | 0 | 0 | 47, all inside the owner's own nodes (left as is) |
| 2600 XL | 9 → 1 | 4 deleted (up to 13,476 px) | 5 | 96 (85 white-on-white cards) |
| 3440 Mega | 2 → 1 + Archive | 0 | 0 | 0 |
| Templates | 5 → 1 | 0 | 5 (LG/XS/3440 prefixes) | 37 |
| Elements | 18 → 1 + Archive | 0 | 0 | 55 |
| Text | 1 → 1 | 0 | 0 | 12 |
| Icons | 13 → 1 | 0 | 0 | 65 |
| Scale | 6 → 1 | 0 | 0 | 329 (mostly raw values in old test frames) |
| Squeeze, Columns, Card vs Section | 1 → 1 each | 0 | 0 | 3, 116, 36 |
| Explore – Color permutations, Icon + title | 2 → 1 each | 0 | 0 | experiments, not touched inside |
| Explore – Layout examples, Figma → CSS, Legacy vs Latest | 1 → 1 each | 0 | 0 | experiments |

Skipped: AI and Live (another agent's), Explore – Sizing and Drag playground (Lab builds in progress). Lint, read-only: AI 9 and Live 3 page-root errors; Sizing 10 and Drag playground 54 unstyled texts.

## Fixes that went beyond moving frames

- **Templates overlap, cause:** inside the `Rail + Main + Rail` master, the left rail took the Mega width, so its Navigation was 3440 wide and the master drew 6,987 px over its neighbours. Left rail now sets 360 XS, and Region · Main is Fill (2336 wide, still 2600 XL). It draws 3440 now.
- **Text styles:** 41 unstyled Inter texts styled (Elements 18, 2600 XL 22, Columns 1); masters first, so instances follow. Inter is now 0 on every page.
- **Res sets:** labels use `h1`; the `display` style was deleted after preview cleared the last 3 users on 1000 Default.
- **Child-driven widths:** 29 Hug parents set to Fixed at their current width (no visual change): Showcase 6, 2600 XL 13, Templates 7, Scale, Icons and Elements 1 each.

## Same name on two pages (for a later merge)

`Three cards` (1000 and 1600), `Rail + Main + Rail` (2600 and Templates).

Shots: `shots/` beside this file (gitignored).
