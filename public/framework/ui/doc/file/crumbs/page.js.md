A trail template, plus the one component in the directory that explains
`Router.mark_links()` from the inside: the links are real urls, so `.in-path`
lights the whole trail up with nothing here reading `window.location`.

## Why there is no `ui.crumbs()`

The removed function took `[text, url]` pairs typed by hand — and a
hand-typed trail can be *wrong*, which is the one thing a breadcrumb may not
be. The honest fix (deriving from `Page.chain()`) isn't built; the five-line
template is what exists until it is.

## Improvements

1. **A real `Page.chain()`-derived crumbs helper is the natural next step**
   once a page wants one — today the ancestry is available on every `Page`
   and nothing in this directory reads it. *(medium, useful — no caller yet,
   so speculative until one exists)*
