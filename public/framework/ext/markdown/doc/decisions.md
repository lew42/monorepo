# Markdown — decisions and record

*moved from readme.md 2026-08-17; conclusive, not current guidance.*

## Two ways in

`view.md(content)` sets an existing view's markup — block containers
(`div`, `section`, …) get the full `marked.parse()`, phrasing elements (`p`,
`h1`, `li`, …) get `parseInline()`, so `p().md("**hi**")` never nests a `<p>`
inside a `<p>`. The standalone `md(content)` factory is smarter about its
root: one parsed block is *adopted* (`new View({ el })`), so `md("Hi.")`
really is a `<p>` and chains like one; multiple blocks wrap in a `div.md`.
Both are captured like any other factory, so they land wherever they're
called, same as `p()`.

## From a file

`md.file(import.meta, url, { h1: false })` fetches, parses and returns a
**promise** of a `div.md` — `View.append` already knows how to place a
promise, so `content(){ return md.file(...) }` works with no change to
`Page`, and `App.load_page` can await it before swapping the DOM.
`md.details(import.meta, url, text)` is the same thing, collapsed under a
`<summary>` — the batteries-included form almost every readme uses at its own
bottom. Both resolve against **`import.meta`**, never the document — the SPA
fallback makes the document url a route, so a document-relative fetch would
miss. Detail: [`file`](/framework/ext/markdown/api/file/).

## A fence can name its file

`` ```js /app.js `` on a fenced code block becomes `<pre data-file="/app.js">`,
drawn as a sticky label by `ext/highlight`'s stylesheet — the same look
`code.js(src, file)` produces from a `page.js`. Added 2026-08-15,
implemented by *calling* `marked`'s default fence renderer and splicing one
attribute onto its output, never reimplementing escaping.
[Full record](/framework/ext/markdown/doc/file-labels/).

## A fetched file's relative links point where the author meant

A link inside a fetched `.md` is rewritten (`md.resolve`) to resolve against
**the file**, not the document — without it, the SPA fallback makes a
relative link's target depend on whichever route happened to render it; a
crawl once found 40 broken routes this way. The happy side effect: a
relative link is now the right thing to write, and the same one works on
GitHub. [Full record](/framework/ext/markdown/doc/relative-links/).

## Why raw HTML, not the Sanitizer API

This module renders via `html_unsafe()`, not `html()` — Safari implements no
version of `Element.setHTML()`, so inheriting the framework's sanitize-by-
default would render every doc page as literal `**markup**` for every Apple
visitor. The content here is repo-authored, whose trust boundary is commit
access. [Full record](/framework/ext/markdown/doc/sanitization/).

## Who uses this

`md` is re-exported from `/app.js` alongside `Page`, so **the overwhelming
majority of `page.js` files in the framework** call `md("…")` for prose —
this is close to the single most-imported piece of the framework, not a
module anyone needs to opt into by name.

Direct imports of `md.js` itself (reaching `.file` / `.details` / `.resolve`,
not just the prose factory) are far fewer:

| caller | page | for |
|---|---|---|
| `ext/Doc/Doc.js` | every module built on `Doc` | `md.file()` renders every member page's `doc/*.md`, the Files tab's per-file "about" pane, and note pages |
| `ext/Ask/chat.js` | [/framework/ext/Ask/](/framework/ext/Ask/) | chat bubbles — the user's prompt and the streamed reply, rendered live |
| `ext/AITask/{AITask,message,feed,replay}.js` | [/framework/ext/AITask/](/framework/ext/AITask/) | task prose, chat replay, thinking blocks, feed summaries |
| `core/new/1/**` (27 files) | not part of the live site tree | the earlier "new/1" design-proof sketch; historical, not linked from current navigation |

A module with **no** callers would be a finding on its own; this one sits at
the opposite extreme, which is itself worth recording — see the audit
report's Skill feedback for what that meant for Step 2's per-caller table.

## Decisions

- **`marked` is vendored, not CDN-loaded or an npm dependency** (v18.0.7,
  `marked.esm.js`, ~41KB). The site's thesis is files served as-is, no build
  step; a CDN import would block every render on a third party and break
  offline dev. Paid only by pages that import this module.
- **`md.file()` returns a promise, not a self-filling view.** By the time a
  fetch resolves, `View.captor` has long since unwound — a self-filling view
  would append in the wrong place. The returned view is `{ capture: false }`;
  `append_promise` places it explicitly.

## Traps

- **⚠ Resolve against `import.meta`, never the document** — `md.file(meta, url)`.
- **⚠ A backtick inside a `` css(`…`) `` template literal kills the file** —
  not specific to this module, but every doc `.md` in this directory is
  itself full of backticked code, and CSS files are the one place that trap
  actually bites.
- **⚠ A relative link inside one of *this module's own* `doc/*.md` files must
  be absolute if it targets another member's page.** `md.resolve` rewrites
  against the *fetched file's* path (which mirrors the `doc/` folder), not
  the route a section actually renders at (`/api/`, `/docs/`) — a relative
  link between two files in `doc/` silently points at a `doc/`-shaped url
  that isn't a route. Detail: [Relative links](/framework/ext/markdown/doc/relative-links/).
- **⚠ Every method this module documents shows a false "Replaced at runtime"
  banner on its API page.** Root cause is `ext/Doc`'s `patched()` check, not
  this file — see the audit report.

## Open

[Proposed](/framework/ext/markdown/doc/proposed/) carries two small,
re-verified findings not yet acted on: `md.c()` has no caller, and `marked`
is re-exported by `/app.js` to nobody.
