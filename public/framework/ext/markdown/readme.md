# Markdown

Markdown rendering as a **View addon**, not a component class. Importing `md.js`
installs `View.prototype.md()`; the default export is the `md()` factory.

```js
import md from "/framework/ext/markdown/md.js";

p().md("Some **inline** markdown");    // into an existing view
md("Hi.").ac("note");                  // a real <p>, chainable — md() replaces p()
md.c("note", "Hi.");                   // classes first, like div.c() / p.c()
md("# Title");                         // a real <h1>
md("# Multi\n\nblock");                // a captured div.md
md.file(import.meta, "readme.md");     // a promise of a div.md
```

## Design decisions

- **`md()` is smart about its root: you get the element you wrote.** The content
  is parsed, and if it produces a single root block (`<p>`, `<h1>`, `<ul>`, …)
  that element is adopted via `new View({ el })` — so `md("Hi.")` behaves like
  `p()` and chains normally. Multiple blocks get wrapped in a `div.md`. Parsing
  strictly inline into a `p()` was rejected: it would render `md("# Heading")` as
  the literal text `# Heading`.
- **The factory is captured like any other** — `new View({ el })` still
  auto-appends to `View.captor`, so `md()` lands where it's called, same as `p()`.
- **`view.md()` is tag-aware**: block containers (`div`, `section`, …) get
  `marked.parse()`; phrasing elements (`p`, `h1`, `span`, `li`, …) get
  `marked.parseInline()`, so `p().md("**hi**")` doesn't nest `<p>` inside `<p>`.
- **`md.file()` resolves against `import.meta`, not the document.** With the SPA
  fallback the document url *is* the route: from `/framework/core/x` (no trailing
  slash) a document-relative `fetch("readme.md")` would hit
  `/framework/core/readme.md`. Taking `(meta, url)` matches
  `View.stylesheet(meta, url)` and `View.load(meta, url)`.
- **`md.file()` returns a promise, not a self-filling view.** A promise composes
  with machinery the framework already has — `View.append` dispatches it to
  `append_promise`, so `content(){ return md.file(...) }` works with no change to
  `Page` — and it can be awaited, so `App.load_page` can finish loading before it
  swaps the DOM. A view that fills itself later would break that no-flash
  guarantee on every router navigation.
- **`{ h1: false }` drops a leading `<h1>`.** A readme opens with its own title
  and a `Page` renders `title` as an h1, so a readme used as page content would
  otherwise show the title twice. Explicit, not automatic — `md.file()` on its
  own renders the file as written.
- **The view it resolves to is `capture: false`.** By the time the fetch
  resolves, `View.captor` is whatever is building *now* — the capture stack
  unwound long ago. Auto-appending then would drop the content in the wrong
  place; `append_promise` appends it explicitly instead.
- **`marked` is vendored** (`marked.esm.js`, v18.0.7), not loaded from a CDN.
  The site's whole thesis is files served as-is; a CDN import means every render
  blocks on a third party and breaks offline dev. ~40KB, only paid for by pages
  that import this module.
- **This module calls `html_unsafe()`, not `html()`.** *Should markdown output go
  through the Sanitizer API?* `View.html()` was changed to use `Element.setHTML()`
  with a `textContent` fallback when unsupported. Options: (a) inherit it —
  sanitized markdown; (b) `html_unsafe()` — raw; (c) vendor DOMPurify as a
  fallback in core so both hold everywhere. Safari implements `setHTML` in **no
  version, desktop or iOS** (~67% global support), so (a) means every doc page
  renders as literal `<h2>`/`**bold**` for all Apple visitors — not a safe
  degradation but an outage. The content here is repo-authored: string literals
  in `page.js` and same-origin `.md` files, whose trust boundary is commit
  access, which already permits adding malicious JS directly. Sanitizing buys
  nothing and costs correctness. **Verdict: (b).** `View.html()` stays
  fail-closed for callers that can't vouch for their input; this module opts out
  because it can. (c) stays on the table and is the right answer the moment
  markdown arrives from anywhere but the repo.
- **`md()`'s single-block path uses `template.innerHTML` deliberately.** The
  `<template>` makes parsing inert, but adopting the element into the live DOM
  re-arms any handler attributes — it is not a sanitization step and was never
  load-bearing as one. Under the verdict above it is simply consistent with the
  rest of the module. Kept as-is; do not "fix" it to `html()` without revisiting
  the entry above, or `md("Hi.")` and `md("Hi.\n\nThere.")` go back to taking
  different paths based on block count.

## A fetched file's relative links pointed at the route

**The bug.** `styles/readme.md` contains `[base](base/)`. A browser resolves that
against the **document**, and the SPA fallback makes the document url the *current
route* — so on `/framework/core/Router/` it pointed at `/framework/core/Router/base/`.
Measured by a link crawl: **40 broken routes**, all of them links that were correct in
the file and wrong on the page.

This is exactly the trap `md.file()` was already written to avoid for the *fetch*
(resolve against `import.meta`, never the document). The fetch was right and what the
fetch returned was not.

**Options.**

| | |
|---|---|
| make every readme link absolute | works, and re-breaks the moment someone writes a natural relative link. Also breaks the links on GitHub, where relative is correct |
| `<base>` on the document | global, and would move every other relative url on the page |
| **rewrite hrefs against the file's url after parsing** | ✓ |

**Verdict: `md.resolve(root, base)`, called by `md.file()`.** One pass over `a[href]`
and `img[src]`, skipping anything absolute, protocol-relative, or a fragment. The
happy consequence: **a relative link is now the right thing to write** — the same
`[base](base/)` works in the rendered page and in GitHub's readme view.

`url.pathname + search + hash`, not `url.href`: an absolute url would make
`Router.link_clicked()` treat it as external and hand it to the browser, costing a
full reload for an in-app navigation.

**Not fixed by this, on purpose:** a link to a real file (`[readme](../Page/readme.md)`)
still resolves to the file and the Router still declines it — `/\.\w+$/` means "not
ours" — so the browser fetches the raw markdown. That is the correct behaviour for a
link to a file.

## Proposed

Findings from the every-member audit. **Not applied.**

**`md.c(classes, content)` has no caller.** Zero call sites in `public/`,
sandboxes included; the only occurrences are its own definition (`md.js:46`) and
two mentions in this file. It exists for symmetry with `div.c()` / `p.c()`, and
the symmetry is real — but `md("…").ac("note")` is the same length, already
works, and is what every page actually writes.
*Options:* (a) keep for symmetry; (b) delete; (c) keep and use it somewhere, so
it is at least exercised.
*Weighing:* symmetry with the element factories is worth something — a reader
who knows `p.c()` will reach for `md.c()` — but `md()` is not an element
factory, it is a parser, and `.c()` on it promises a shape it cannot always
deliver (multi-block content is a wrapper div, so the classes land on the
wrapper rather than on anything you wrote). **Recommendation: (b)**, and say in
the page that classes go on with `.ac()`.

**`marked` is re-exported twice and imported by nobody.** `md.js:128` exports
it, `public/app.js` re-exports it again, and no file in the repo imports it.
*Options:* (a) keep — an escape hatch for a page that wants a parser option;
(b) drop it from `app.js` and keep it on `md.js`; (c) drop both.
**Recommendation: (b).** A vendored parser is worth being able to reach from
the module that vendors it; putting it on the site's own `/app.js` surface
suggests it is part of the framework's API, which it is not.

## Open questions

- Export `md` from `app.js`? Convenient, but every page load would then pull the
  parser. Pages opt in by importing this module directly — that's the `ext/` rule.
  Note the opt-in is really per-*tree*, not per-page: a `Page` imports its
  children for the sidebar, so `/framework/` pulls `ext/` pulls `md.js`. Pages
  outside that branch still pay nothing. If that ever matters, a topic can
  lazy-import an ext inside `content()` instead of at module scope.
- `md.cache` is keyed by url and never evicted. Fine for a docs site; revisit if
  a page fetches large or changing markdown.
- Sanitization: `marked` does not sanitize HTML, and this module now renders via
  `html_unsafe()` (see the decision above). Fine for authored, in-repo content.
  Do not pass user input through `md()` or `view.md()` without adding a
  sanitizer at that entry point — inheriting `View.html()` is not a fix, since
  it degrades to plain text on Safari.
