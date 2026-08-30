What is left of the exhibit's stylesheet once `page.demo()` owns the band: the
one-title-per-surface rule that hides a demo app's own `h1` on a stage, and the
half-size zoom on a `demo.tree()` card. Twenty-seven lines, from ninety-three.

## The band moved to `shell.css` (demo-merge step 4)

`stage`, the layout bar, `source` and the caption used to be four direct
children of `.page.standard`, each choosing its own grid track — on a 3440
monitor that was a 3020px render sitting above a 936px code block with 2000px
of grey beside it. `.demo-exhibit` wrapped all four in one `flex-wrap` row
instead, on an `84em + 32em` basis that only split past ~2.5K.

`.demo-shell` is that row now, on `52em + 28em`, and it is the band for **every**
demo on the site rather than just a detail page's. Measured 2026-08-30: the band
splits from ~1310px of its own width, so a page whose chrome leaves less stacks
the code under the render — which at that width reads better than a 350px
column.

## The ground moved with it

A layout paints `--surface`; the page under it paints `--wash`; in light mode
those are close enough that a specimen and the page around it read as one
field. `.demo-shell .demo-stage.bleed .demo-screen` paints `--bg` (the site's
dark chrome colour, used in both themes) so a specimen reads as a screen sitting
on a canvas — which is what it is. It is keyed on `.bleed`, which is what a
sugar's own `run:` puts on its stage, so a `page.demo()` of a real page keeps the
page's ground instead of being framed as a specimen.

⚠ And the readout on that ground is a literal `rgba(255, 255, 255, 0.5)` rather
than `--subtle`, because `--bg` is dark in *both* themes — the one place on the
site whose ink does not follow light/dark.

## Improvements

1. **`.demo-stage .demo-app-root > .page-title` lives here, but nothing in this
   file emits either class** — `.demo-app-root` is `app.js`'s and `.demo-stage`
   is `stage.js`'s. It is here because hiding a specimen's own title is an
   *exhibit* decision, not a stage one; a reader grepping for the selector will
   not guess that. *(simple, speculative.)*
