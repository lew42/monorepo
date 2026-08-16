The module's own docs page — now a `new Doc({ subject: md, … })` rather than
the plain `Page` it used to be. Demonstrates every entry point live, in the
Overview's rail, rather than just describing them.

## What each demo shows

The first three cards show the two entry points side by side — `md()` as a
tag function, `view.md()` set into an existing element, one/many-block
adoption. A fourth demonstrates the fence file-label feature added today
(a real fenced block naming a file, rendered with its label). A fifth calls
`md.file()` against a file that does not exist, so the "Not written yet"
copy is not asserted in prose — it's the actual render a reader sees.

## Why `subject: md` and not no subject at all

`md` is "a function with properties" — the second of `Doc`'s four `subject`
shapes, alongside a class, a namespace object, and nothing. `md.file`,
`md.details`, `md.c` and `md.resolve` are real members worth their own pages
with real source, so `subject: md` earns the API tab rather than leaving
those four undocumented as prose alone in a note.

## Improvements

1. **The false "Replaced at runtime" banner shows on every method page.**
   Not this file's bug — `Doc.member_page()`'s `patched()` check — but it is
   this file's declaration (`subject: md`) that exercises it on a live page.
   See the audit report's top recommendation. *(medium, important — belongs
   to `ext/doc`, not here)*.
2. **No `overview:` rail split.** The Overview is one `content()` with five
   demos in a row rather than several sibling `overview:` cards. Acceptable
   at this size (five short demos read fine as one scroll), but the module
   would want the rail the moment a sixth demo arrives. *(simple, useful,
   speculative until it actually grows)*.
