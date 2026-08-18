The `Doc` for the rail: a code block, a live demo that opens it in place, and
the design record — about as small as `page.js` gets, because a rail has
almost nothing to browse: one function, two slots, three calls.

## The demo drawer and a real caller share nothing but the import

The demo button's `drawer(($slot, $body) => { … })` call is written exactly
the way `ext/Panel` or `ext/layout` would write it — there is no special "docs
mode" for the widget, so what a reader clicks here is precisely what a real
caller gets.

## The icon was chosen by measuring the loaded font, not guessing

`right_panel_open` is not in this site's Material Icons build, and rendered as
384px of literal fallback word — which forced the whole framework sidebar from
231px to 344px through `min-width: auto` before anyone traced why. `icon:
"view_sidebar"` was picked because it is actually in the glyph set this site
loads.

## Improvements

1. **The icon-safety lesson here is a comment, not a check** — nothing
   verifies a page's `icon:` against the loaded glyph set before it ships. A
   small script that diffed every `page.js`'s `icon:` against the Material
   Icons build would catch the next 384px sidebar before a reader does.
   *(simple, speculative.)*
