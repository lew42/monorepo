# Card inventory — what the site already had

Eleven kinds of card-shaped thing, found before this system was built (nine from the
original three surveys, plus two the 2026-09-29 audit caught as missed —
`inventory-audit.md`, "Missed"). Full detail, one object per kind:
[`inventory.json`](../inventory.json). Screenshots of the first nine: [`inventory/`](../inventory/)
(no shots for the last two — they're page-internal layout systems, not directory-index cards).

| Kind | Uses | Background | Clickable | Expandable | Menu | Title pattern |
|---|---|---|---|---|---|---|
| Page preview | 71 | none / `--surface` on the thumb | yes | no | no | icon + title |
| `.card` / `.surface` | 59 | `--surface` | no | no | no | none |
| Chip / pill | 37 | `--wash` | sometimes | no | no | none |
| Panel region | 37 files | none of its own — opts into `.surface`/`.wash` | no | no | **yes** (toolbar) | none |
| Chat bubble | 13 | tint of `--prim` (the one kind NOT on a neutral ground) | no | no | no | none |
| Icon card (icard) | 8 | `--surface`, switches to `--wash` nested | yes | no | no | icon + title |
| AI2 rail row | 6 | none at rest, `--fill-a04` hover | yes | no | no | header bar |
| Switcher (active row) | 6 files | none at rest, current row `--fill-a08` or `--surface` | yes | no | no | none |
| Decision box | 3 | `--surface` | no | no | no | heading |
| Accordion row | 2 | white / `--surface`, or none | yes | **yes** | no | header bar |
| Object card | 2 | `--surface` | no | yes | no | heading |

**Panel** ([`/framework/ext/Panel/`](/framework/ext/Panel/)) and **the switcher**
([`/framework/core/Page/layout/switcher/`](/framework/core/Page/layout/switcher/)) are both
page-*internal* arranging systems, not directory-index cards — Panel's toolbar (a row of icon
buttons, transparent until hovered) is its stand-in for a ⋯ menu; the switcher's "card" is its
current-row highlight, not a box.

## What this system reused, and what it added

Reused directly: `.card`, `.surface`, `.wash`, `--pad-card`, `--radius`, `--card-edge` — every
kind above already leaned on at least one of these, just inconsistently (five different
spellings of "padding", border widths split 1px/2px with no rule — the full list is in the
inventory task's own [`findings.md`](/framework/ai/2026-09-29/cards-and-logs/inventory/)).

Added, in `card/card.css`: two more grounds (dark, strong hue — nothing in the inventory had
either), the nesting-level classes (nothing in the inventory nested past one level except
icard), and the header-bar-with-menu shape (only the AI2 rail row had one, and it is
deliberately corner-less, a variant rather than the base pattern).

Not touched: every kind above still renders exactly as it did before this task. `doc/system.md`
is where a NEW card picks a pattern from; nothing existing was migrated to it.
