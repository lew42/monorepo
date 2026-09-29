## The quick answer (core/Page columns)

| question | answer |
|---|---|
| flex or grid? | **Flex.** Columns sit in a flex row (`.page-columns-row`) |
| a column's default size | `flex: 0 0 clamp(16em, 34cqi, ~42em)`: no grow, no shrink, sized by the room |
| what the drag changes | three CSS variables on **the dragged column only**: `--page-column-flex: 0 0 <px>`, `--page-column-min: 0`, `--page-column-max: none` |
| what the mouse moves | the dragged column's **flex-basis** (through that variable), on every `pointermove` |
| do the other columns move? | **No, they stay put.** Nothing grows or shrinks, so only ONE column changes, and the ones to its right slide over. The row scrolls when it's wider than the screen, like Miller columns |
| two-column trade (A grows, B shrinks)? | **Not built.** Today it's one column, not a pair |
| saved? | **No**, only for the visit. A reload resets it (per-page widths are an open item) |

Code: `core/Page/Page.class.js` (the seam, `resize_column()`), `core/Page/Page.css` (the flex line). Side rails (sidebar, drawer, dev bar) use a separate gesture, `ext/grip`, which writes one width.

## Compared: core Page vs /imagine/paging

| system | flex or grid? | drag changes | one column or a trade between two? | saved? | built into core, or unique to the demo? |
|---|---|---|---|---|---|
| **core Page columns** — `core/Page/Page.class.js` `resize_column()`, called from the drag handle's `pointermove` in `column_grab()` | Flex row (`.page-columns-row`, `Page.css`) | The dragged column's own `--page-column-flex` (to `0 0 <px>`), plus `--page-column-min: 0` and `--page-column-max: none` — a flex-basis in px, set as an inline style | One column only. Nothing else grows or shrinks; columns to its right just slide over in the scrolling row | No — per visit only. Reload rebuilds the columns and the width goes with them (`resize_column()`'s own comment: "where a width would be stored... is open") | Built into core. Every `.columns()` page gets it for free |
| **/imagine/paging navigation/columns** — `navigation/navigation.css` rule `.paging-nav-fixed .page.columns .page-column-body:not(...)`, and `templates/columns/page.js` (the plain columns write-up) | Same flex row — it's the *same* `.page.columns` markup from core, just with an extra CSS class on top | Nothing new. `navigation.css` line 47 says outright: "Want one wider? Drag its seam... which is this rule applied by hand to one column. Same mechanism, no second idea." There is no separate drag code anywhere under `public/imagine/paging/` — confirmed by grep: no `grip(`, no `pointermove` handler, no second `--page-column-*` writer in the whole tree | N/A for the fixed-width demo — that page's whole point is that NO column trades width with another (`.paging-nav-fixed` floors every column at its own min-width and stops it negotiating, so a new column is appended, not paid for by its neighbours). Drag-to-resize, when used on this page, is core's one-column-only gesture, unchanged | No — same as core, because it *is* core's `resize_column()` | Not unique — it's a CSS class (`.paging-nav-fixed`) layered over core's existing mechanism, proposed in `navigation.css`'s own comment to move into `Page.css` as a real width word (see `/framework/ai/2026-09-05/nav-stability/`) |
| **ext/grip** — `ext/grip/grip.js`, the `grip()` factory (used by `DevBar`, `ext/drawer`, `/layouts/shell/Shell.js` for side rails, not by paging) | Neither — it's mechanism-agnostic. `grip()` just reports a pointer-implied pixel width via a `write(px)` callback; the CALLER decides whether that becomes a flex-basis, a grid track or a plain `width` | Whatever the caller's `write(px)` sets — grip itself sets nothing but one internal `--grip-y` (for the pill's vertical position). The doc comment names `size_rail()` in `/layouts/shell/page.js` as a real caller | One rail only — grip is built for a single edge of a single box, never a pair trading width | Depends on the caller. `write()` can persist on every call, or `done(width)` can persist once on release (`grip.js` comments, both optional) — grip doesn't decide, the caller does | Framework-level utility (`framework/ext/`), reused by several side-rail consumers; not a columns system at all, just the shared drag gesture underneath one |

**Recommendation:** Use core's `resize_column()` for anything that is genuinely a `.columns()` page — paging doesn't reinvent it, and neither should new code; a second implementation would be the "no second idea" mistake `navigation.css` explicitly avoided. The one real gap on both is persistence — nobody saves a dragged column width past the visit, which is worth fixing once, in core, rather than per-demo. `ext/grip` is a different tool (a bare pointer→pixel gesture for a single rail) and isn't a competing columns system, so it's not a candidate to replace either.

- [x] A minion compares this with the `/imagine/paging/` column system
