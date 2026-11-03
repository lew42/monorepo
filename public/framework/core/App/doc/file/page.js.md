This module's own `Doc` page — `subject: App`, three member lists, and eight
notes covering the class plus its two sibling modules (`mode.js`, `Font.js`).

## The Overview is the two-line pitch, then the six steps

`content()` opens with the boot one-liner (`window.app = new App()`), then the
six-step diagram, then the `render()` override template and the `font()` example
— code first, prose as caption, per the `documentation` skill's rule for an
Overview.

## Improvements

1. **The Files tab was entirely missing before this pass** — no `files:` key, no
   `doc/file/*.md` for any of the six files in this directory. Every other list
   (`properties`, `methods`, `notes`) was current; only Files was never wired up.
   Fixed here. *(simple, important — done.)*
2. **No `overview:` rail.** The Overview is prose and code blocks only, with no
   live demo card — reasonable for a boot sequence (there is nothing to demo
   without hijacking the page you're reading), but it means this page is the one
   place in the module that doesn't follow "show, don't tell" literally. Worth
   naming as a deliberate exception rather than an oversight. *(simple,
   speculative.)*
