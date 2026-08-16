One stylesheet, ~190 lines, one `@layer theme` block. Two component tokens —
`--sidebar-bg` and `--sidebar-ink` — and every other colour in the file is
`color-mix` off the ink, so a theme cannot set them inconsistently.
[`tokens`](/framework/core/Sidebar/docs/tokens/) has the full derivation and
why the active fill isn't `--wash`.

## No width, no position

The file sets `display: flex; flex-direction: column` and nothing about the
panel's own size or placement — that is what lets the same component be a
fixed rail, a flex `basis` child, or a sticky top bar, depending only on what
contains it. [`placement`](/framework/core/Sidebar/docs/placement/).

## One breakpoint, one behaviour

Below `52em` the panel becomes the bar: `.sidebar-menu` goes from a plain flex
column to an absolutely-positioned drop-down against the now-sticky bar. No
JS, no resize listener — the button that opens it is always in the DOM, shown
only by the media query. [`narrow`](/framework/core/Sidebar/docs/narrow/).

## Two em traps, both about sizing text on the padded box

`.sidebar-group-title`'s `.h4` and `.sidebar-link`'s label both size text on an
inner `<span>`, never on the padded row — an `em`-valued `--gutter` resolves
against whichever element uses it, so sizing and padding the same element
measured two different pixel gutters from one custom property.
[`comp`](/framework/core/Sidebar/docs/comp/).

## Improvements

1. **None of the trap comments duplicate the doc files — they're load-bearing
   and file-local**, which is the right call: a reader mid-edit sees the trap
   without leaving the CSS. Nothing here wants trimming. *(n/a)*
2. **The narrow-screen block is 22 lines inside a 190-line file.** Not long
   enough to earn its own stylesheet, and splitting it would separate a rule
   from the selector it overrides at the same breakpoint. Leave it.
   *(simple, speculative — a non-change, recorded for the next reader who
   wonders)*
