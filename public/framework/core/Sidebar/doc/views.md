# The `$` handles

*Rewritten 2026-09-18 — the proposal below the fold was adopted the day it was
written down: `$bar`, `$menu` and `$mode` measured "assigned, never read,
by anything, anywhere" and are gone. What is left is what earns its keep.*

| property | assigned | read |
|---|---|---|
| `$toggle` | `toggle()` | Escape refocus (`render()`), `aria-expanded` (`open()`) |
| `$rail` | `render()` | **never** |
| `$tree` | `nav()` | `reveal()` — the cold-load fold walk |

## Usage

`grep -rn "\$toggle\|\$rail\|\$tree" public/` finds the three assignments and
`reveal()`'s reads of `$tree`; nothing outside the class reads any of them either.

## Necessity

**`$toggle` is essential** — `open()` cannot write `aria-expanded` without it, and
the Escape handler cannot return focus.

**`$tree` is essential for the same reason `$toggle` is**: `reveal()` walks
`this.$tree.nodes` and `this.$tree.rows` to open the branches down to the current
page, and `adapt_to()` at the end of that walk is a method ON the tree. There is no
way to do either without holding the tree.

**`$rail` is the one carried over from before, on the same terms the original
`$bar`/`$menu` were kept — and rejected for the same reason.** Nothing reads it;
it exists because `render()` assigning `this.$rail = div.c(...)` costs nothing
extra to write and *might* let a subclass reach the sticky box without a query.
Nobody has ever subclassed `Sidebar`. Dropping it is one line
(`div.c("sidebar-rail", () => {…});`, no `this.$rail =`) and was left for the next
pass through this file rather than folded into an already-large rewrite — see
`doc/decisions.md`'s 2026-09-18 section.

## Simplicity

The naming rule still holds: **name a `$prop` after the class it carries.**
`$tree` holds `new Tree(…)`, kebab class `.ui-tree` (`ux/Tree`'s own, not this
module's), and `$rail` holds `div.c("sidebar-rail")` — CSS to JS and back with no
detour.
