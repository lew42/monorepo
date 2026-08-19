## flow.css

The scrubber strip — 37 lines, one row of controls under a workspace. Structure and one
quiet skin; every colour is a token, so dark comes free.

## The one thing that is not obvious

```css flow.css
.panel-flow-bar button.panel-flow-btn { inline-size: 1.7em; block-size: 1.7em; padding: 0; }
```

⚠ `button.` on purpose. The theme styles **every** `button` as a small uppercase label
(`.theme-lew42 :is(button, .btn)`, 0-2-0, padded 0.7em/1.4em) — right for READ GUIDE and
four times too wide for a 1em icon. `.panel-flow-bar .panel-flow-btn` is 0-2-0 too, so it
would win or lose on file order; adding the element name makes it 0-2-1 and the box is
reclaimed for good. `toolbar.css` reclaims `.panel-btn` the same way, one specificity
step higher, and its rules do not reach here: they are scoped to
`.panel-workspace .panel` and this strip is beside a workspace, not inside one.

## Sizing is the page's, not the strip's

The strip declares no width and no position: on the Doc page it rides `.bleed` with the
workspace above it, and on `/full/` the two sit in one `.flex.v` column, where the
workspace takes the room the strip leaves (`.page.layout-full > :last-child` is
`flex: 1 1 auto`, and `.panel-workspace` is `flex: 1 1 0`). ⚠ That is why the full route
stopped setting `--panel-height: 100%` — a column already sizes it, and 100% of the
window plus a 32px strip is a scrollbar.

## Improvements

1. **`.panel-flow-count` holds `min-inline-size: 3.5em`** so the strip does not jog as
   the number grows. Past 99 steps it will jog once. *(simple)*
