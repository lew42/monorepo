## What this file is

Nineteen lines: the one function a theme is allowed to carry, and
deliberately not a class. `lew42(app)` calls `app.font("Montserrat")` and
`app.font("Material Icons")`, called once from `app.js`'s `config()`.

## Why a function and not a class

The doc-comment states it directly: nothing in here may be triggered by
`.theme-lew42` appearing in the DOM, because a theme is designed to render
more than once on a page (see `layers/theme/guide/`'s side-by-side demos) and
behaviour does not survive duplication — two `.theme-lew42` boxes on one page
must not both try to load the fonts or wire up event listeners. A plain
function the *site* calls once sidesteps the whole question.

## Improvements

1. **Nothing ranked.** Nineteen lines, one job, and the doc-comment already
   states the one design decision (function, not class) that a reader would
   otherwise have to reconstruct from `framework/doc/theme-behaviour.md`.
