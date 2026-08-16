## What this file is

The vocabulary itself: `MODES`, `SHAPES`, the two default lists (`BOX`, `PAGE`),
and the `words` map every bar and panel group draws through. Full reasoning:
[The control vocabulary](/framework/ext/layout/doc/vocabulary/); the property
page for the map itself: [`layout.words`](/framework/ext/layout/api/words/).

## `shape` writes `false` for `sheet`

`sheet` is the plain `.page` — a shape with *no class* — so its entry writes
`word !== "sheet" && word` into `menu()`'s `choose` callback, which resolves to
`false` rather than a string. `menu()`/`toggle()` treat a falsy word as "remove,
add nothing," which is the one place in this file a word does not correspond
1:1 with a class name.

## `fill`'s second handler

`fill: $el => toggle($el, "fill").click(() => $el.style("overflow", ...))`
chains a *second* click handler onto the same button `toggle()` returns.
`toggle()`'s own handler runs first (flips the class), so by the time the second
handler reads `$el.hc("fill")` the class is already in its new state — the
ordering is load-bearing and unstated anywhere but the inline comment.

## `draw()` is the one place an unregistered word is forgiven

`list.split(" ").filter(Boolean).forEach(word => words[word]?.($el))` — every
bar and panel render funnels through this line. It is the single point that
makes "half a bar beats no bar" true; nothing else in the module re-implements
word lookup.

## Improvements

1. **`fill`'s two-handler chain is the kind of ordering dependency that survives
   a refactor by accident, not by design.** A single handler doing both — flip
   the class, then read the *new* state directly rather than through a second
   `.click()` — would make the ordering requirement disappear rather than remain
   documented. *(simple, useful)*
2. **`BOX` and `PAGE` are exported constants, but nothing enforces that a word
   named in them actually exists in `words`.** A typo in either string silently
   drops a control from every default bar, the same failure mode noted in
   [`layout.words`'s traps](/framework/ext/layout/api/words/) — a one-line
   dev-mode assertion (`BOX.split(" ").every(w => words[w])`) at the bottom of
   this file would catch it at import time instead of in the browser. *(simple,
   important)*
3. **The five knob words (`gap`, `column`, `pad`, `basis`, `measure`) are five
   near-identical `knob($el, token, min, max, step)` calls.** Reads fine at nine
   lines; if a tenth or eleventh knob word shows up, a small table (`{ gap: [1,
   4, 0.25], … }`) reduced to one `Object.entries(...).forEach` would read as one
   pattern instead of five repetitions of it. Not worth doing at the current
   size. *(medium, speculative)*
