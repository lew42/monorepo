The lesson behind most width-dependent breakage: a track with **one bound
instead of two**. A floor with no ceiling runs away; a ceiling with no floor
collapses.

Its table is five measured cases from `library/`, each naming the missing half
and what it cost — 128 characters a line, a track collapsed to 62px, 261
characters at 3440, 83% of a pane outside its parent, 296px off the page.

## It states the four spellings as one idea

`min(x, 100%)` as a floor, an em ceiling for prose, `1fr` for tiles, and
`minmax(0, …)` / `min-width: 0` as the same declaration in two syntaxes. That
last equivalence is the one readers miss most often, and it is why the file
puts the flex and grid forms on adjacent lines.

## It ends on "a bound is not a breakpoint"

None of the declarations name a viewport width. That connects it to
[Responsiveness](/framework/ext/LayoutTool/knowledge/responsiveness/) — the
width at which a layout changes should be a consequence of its bounds, which is
what makes an unchosen edge a finding.

## Improvements

1. **Overlaps `styles/rules/nesting/`**, which owns the same six departures
   from normal flow with its own live demos. The two should cite each other
   rather than each grow the other's content; this file links the library
   entries but not that page. *(simple, useful.)*
