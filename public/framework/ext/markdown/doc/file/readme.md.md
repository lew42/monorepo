The module's own readme — the maintainer's document, read at
`/framework/ext/markdown/readme.md` as a raw file (GitHub, an editor) and
folded into the page.js Overview via `md.details()`.

## What changed today

Restructured to the `documentation` skill's shape: a short conceptual
section per aspect, with anything that ran past two paragraphs broken out to
`doc/*.md` and linked — `doc/sanitization.md`, `doc/relative-links.md`,
`doc/file-labels.md`, `doc/proposed.md`. The readme itself is now closer to
one screen; the long-form record lives at those four urls, each also reachable
as its own **Docs** tab entry via `notes:`.

## The trap it demonstrates about itself

The readme states the rule that a relative link inside a fetched `.md` file
resolves against **the fetched file**, not the document or the route a page
happens to live at — and every cross-link inside this module's own `doc/*.md`
files has to obey exactly that rule to avoid pointing at a `doc/`-shaped url
that doesn't exist as a route. Written up in full at
[Relative links](/framework/ext/markdown/docs/relative-links/).

## Improvements

1. **None found beyond the restructuring already done.** The prior readme
   carried five design decisions and a full incident writeup in one file;
   splitting them out was the fix, and it's applied. *(n/a)*.
