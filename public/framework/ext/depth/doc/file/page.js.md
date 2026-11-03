# page.js

The reader's introduction, and the demo at the same time — **this page is the
scene**. It calls `depth()` on its own first line and marks three of its own blocks
as layers, so scrolling the documentation is scrolling the thing being documented.

## Why the page is the demo

`ext/demo`'s box is the site's one stage, and it is the wrong stage here. The effect
needs a `.page` to be the scene and a `.pages` region to scroll; inside a demo box
there is neither, and `wire()` would climb out and turn the *documentation page*
into the scene anyway. Rather than fight that, the page leans into it — which is
also the honest presentation, because the claim being made is "this is subtle enough
to put under real content" and the page is real content.

The cost: the reader cannot see the page with the effect off. The slider is the
answer — dragging it to 0 flattens everything, which is the A/B.

## `subject: View`

The ext patches `View.prototype.depth`, so `View` is the subject and `depth` is the
one method. `Doc` then shows the live patched source and the *Replaced at runtime*
banner, which is exactly what a reader needs to see: the method is not on `View` in
`core/`, it arrives because this module was imported. Same pattern as `ext/catalog`
and `ext/tabs`.

The module's own default export — `depth()`, the function that builds the scene — is
documented in the Overview and the readme rather than the API tab, because it is not
a member of anything.

## Improvements

1. **No `overview:` rail.** The three layered blocks are a sequence, not variants,
   so a rail would be wrong — but a genuine variants rail (one step vs five, slider
   at 0 vs 2) would answer "how much is too much" better than prose does.
   *(medium, later)*
2. **The page does not state its own depths.** A reader watching the boxes move has
   to open the source to learn they are at 1 and 3. Printing each block's `--depth`
   in its corner would make the demo self-describing. *(simple, medium)*
