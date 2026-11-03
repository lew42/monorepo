The Doc page — and, unlike `Item`'s, an interactive demo rather than an
automated test suite: a live three-node outline (`build()`), a single root
listener (`draw`), and four buttons that reorder, reparent, rename and reset
it. "One listener, every change" is demonstrated, not asserted.

## What changed in this audit

Converted from `new Page({...})` to `new Doc({...})`: added `subject: List`
(and its import, missing before this pass — `subject` was referenced with
nothing importing the class), the `properties`/`methods` lists, `notes:
"adoption"`, and `files:`. The demo, `outline()`, and `build()` are untouched;
verified with `node --check` after the edit.

## Improvements

1. **This page has no automated checks — only buttons a human has to click.**
   `Item`'s page asserts eighteen claims on load with a pass/fail tally; this
   one asserts nothing unless a reader manually reorders, renames and resets.
   A reader who skips clicking sees a static outline and no proof any of the
   claims in the prose are true. Porting `Item`'s `row()`/`checks` pattern here
   — e.g. "move reorders", "rename triggers one redraw", "reset restores three
   nodes" — would close the gap and is close to a copy-paste away, since the
   scaffolding already exists next door. *(medium, important — this is the
   single biggest asymmetry between the two pages in this pair.)*
2. **The four buttons have no code shown alongside them.** A reader sees
   "Gamma to front" and has to open dev tools or read this source to learn it
   calls `root.find("Gamma").move(root, root.find("Alpha"))`. A `code.js` block
   pairing each button's label with its one-line call — the way `Item`'s "The
   verbs" section does — would make the demo self-explanatory without
   requiring the click. *(simple, useful.)*
