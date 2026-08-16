Two rules for native `<dialog>`: a max-width and ink restatement in `theme`,
a `margin: auto` restatement in `util`.

## Both rules exist because of a UA default fighting a framework default

The UA sets `color: CanvasText` on a dialog, which blocks inheritance of the
theme's ink until restated. `margin: auto` is the UA's own centring, and
`.flex > * { margin: 0 }` erases it the instant a dialog sits inside a flex
column — so it's declared a second time from `@layer util`, the one place in
this library a later layer settles an argument with a utility rather than
with the theme.

## Improvements

Nothing ranked: two rules, both commented with the exact mechanism that
would otherwise make them look redundant.
