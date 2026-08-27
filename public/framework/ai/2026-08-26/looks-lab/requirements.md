# Looks lab — appearance recipes for column pages (S6a)

Sub-task of `ai/2026-08-26/column-pages/`. Full ask there; the piece this task owns —
verbatim from the owner, `column-pages/requirements.md` lines 21-23:

> focus on iterating different background + padding variations. grids should always
> have padding, unless it's a "flush" grid, (0 gap, 0 padding). and the background
> color behind a grid matters (maybe its transparent?), and the color of the new page
> matters (does it match the parent column?). scrollbars will also affect the visual
> column boundary, so make note to consider content length, and possibly avoid making
> long pages that force a scrollbar, especially if you're trying to get that
> "connected tab-to-content" look.
>
> we have that connected tab-to-content look for the top-tabs on the ext/Doc pages.

## Scope

Build `core/Page/overview/columns/examples/looks/` — one child page per recipe, each a
small live columns tree demonstrating ONE appearance variable, with a one-line verdict:

1. Backgrounds — grid/content column backgrounds: transparent (ambient `--wash`) vs
   `--tint` vs `--surface`; does a child column match its parent's background or the
   ambient? `--wash` → `--tint` → `--surface` only, never `--well`.
2. Padding — a padded grid vs a flush grid (0 gap, 0 padding) inside a column.
3. Seams + scrollbars — a column whose long content grows a scrollbar that breaks the
   column boundary (broken vs fixed), and the tab-to-content look surviving a seam.

## Fences

- Own `examples/looks/` only. Do not touch `examples/page.js`, `examples/grids/**`, or
  anything else under `core/Page` — siblings are editing other parts concurrently.
- Never kill/restart the dev server; never drive the owner's live tabs (headless
  Playwright only); never `git stash`; never commit.

## Assumption log

- Task dir separate from `column-pages` (its own slug) since this agent's fence is one
  subtree; `group: pages` ties it back to the same board thread.
