# Proposed

Findings from an earlier every-member audit, re-verified today. **Not
applied** — this page is only allowed to record them.

## `md.c(classes, content)` has no caller

Zero call sites in `public/`, sandboxes included; the only occurrences are its
own definition (`md.js`) and its own docs. It exists for symmetry with
`div.c()` / `p.c()`, and the symmetry is real — but `md("…").ac("note")` is
the same length, already works, and is what every real call site writes.

*Options:* (a) keep for symmetry; (b) delete; (c) keep and use it somewhere,
so it's at least exercised.

*Weighing:* symmetry with the element factories is worth something — a reader
who knows `p.c()` will reach for `md.c()` — but `md()` is not an element
factory, it's a parser, and `.c()` on it promises a shape it can't always
deliver: multi-block content is a wrapper `div`, so the classes land on the
wrapper rather than on anything you actually wrote.

**Recommendation: (b)** — delete it, and say in the readme that classes go on
with `.ac()`.

## `marked` is re-exported twice and imported by nobody

`md.js` exports it; `public/app.js` re-exports it again
(`export { default as md, marked } from "./framework/ext/markdown/md.js"`);
no file in `public/` imports `marked` from either location.

*Options:* (a) keep — an escape hatch for a page that wants a parser option;
(b) drop it from `app.js`, keep it on `md.js`; (c) drop both.

**Recommendation: (b).** A vendored parser is worth being able to reach from
the module that vendors it; putting it on the site's own `/app.js` surface
suggests it's part of the framework's public API, which it isn't — nothing
should configure `marked` directly except this module.

## Open, smaller

- `md.cache` is keyed by url and never evicted on success. Fine for a docs
  site; revisit if a page ever fetches something large or long-lived.
- Exporting `md` from `app.js` (as it already is) means every page in a tree
  that imports any `ext/` pulls the parser — `/framework/` does, because a
  `Page` imports its children for the sidebar. A page outside that branch
  pays nothing. If that budget ever matters, a topic page can `import`
  `md.js` lazily inside `content()` instead of at module scope.
