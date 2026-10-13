# Markdown architecture — markdown is a View addon, parsed by one vendored library

`ext/markdown` turns markdown into Views. It is not a class tree: it patches `View.prototype.md` and exports a `md()` factory, so any page can write prose without learning a new API. Main file: [`md.js`](../md.js). The vendored parser is [`marked.esm.js`](../marked.esm.js). Styles are in [`md.css`](../md.css).

## Markdown is a View addon, not a class
**Decided:** importing `md.js` adds `.md()` to every View, and `md()` returns an ordinary View.
**Why:** every page already builds Views, so one addon keeps a single way to build content.
**Instead:** a `Markdown` class that wraps a View. It would add a second object to every page and nothing the addon does not already do.
**Detail:** [`decisions.md`](./decisions.md#two-ways-in)

## Two ways in, one parse rule
**Decided:** `view.md(text)` picks the parser by tag. Block containers (`div`, `section`, `td`, …) get `marked.parse`; phrasing tags (`p`, `h1`, `li`, …) get `marked.parseInline`.
**Why:** `p().md("**hi**")` must not nest a `<p>` inside a `<p>`, which the browser would split apart.
**Instead:** always block parsing, which breaks inside phrasing tags.
**Detail:** [`decisions.md`](./decisions.md#two-ways-in)

## The parser is vendored, not loaded from a CDN or npm
**Decided:** `marked` v18.0.7 lives in `marked.esm.js` (about 41 KB) and is imported as a file.
**Why:** the framework ships files as they are, with no build step, and must run offline in dev. A CDN import would block every render on a third party.
**Instead:** a CDN `import` (fast to adopt, but a third-party block on every page) or an npm dependency (needs a build step, which the framework forbids).
**Detail:** [`decisions.md`](./decisions.md#decisions)

## Rendering uses `html_unsafe`, not the Sanitizer
**Decided:** parsed markdown goes through `html_unsafe()`, because the content is repo-authored.
**Why:** Safari has no `Element.setHTML()`, so the safe `html()` path would show every doc as literal `**markup**` on Apple devices. The trust boundary is commit access.
**Instead:** the Sanitizer API, which breaks Safari. **If markdown ever arrives from a user, this must be revisited.**
**Detail:** [`doc/sanitization.md`](./doc/sanitization.md)

## A fence may name its file
**Decided:** a fence's second info word (```` ```js /app.js ````) is kept as `data-file` on the `<pre>`.
**Why:** an `import App` snippet means nothing until the reader knows it is `/app.js`.
**Instead:** a bespoke renderer. The module instead calls marked's default `code` renderer and adds one attribute, so escaping stays marked's job.
**Detail:** [`doc/file-labels.md`](./doc/file-labels.md)

## Files are fetched as promises, resolved against the module
**Decided:** `md.file(import.meta, url)` returns a promise of a `div.md` with `capture: false`, and `md.details()` wraps it in a closed `<details>`.
**Why:** `View.append` already places promises, and the fetch must resolve against the module's URL. The SPA fallback makes the document URL a route, so a document-relative fetch misses.
**Instead:** a self-filling view. By the time the fetch resolves, the capture has unwound and the view would land in the wrong place.
**Detail:** [`doc/method/file.md`](./doc/method/file.md)

## Relative links point at the file they came from
**Decided:** `md.resolve` rewrites links and images in a fetched file against that file's path, not the document's.
**Why:** a crawl found 40 broken routes when links resolved against whichever route rendered them. The same relative link also works on GitHub.
**Instead:** leaving links as the browser resolves them, which breaks under the SPA fallback.
**Detail:** [`doc/relative-links.md`](./doc/relative-links.md)

## A link to a `.md` opens its rendered page
**Decided:** `md.route` rewrites every same-origin `.md` link to its `md/` page. A `?raw` query keeps the file.
**Why:** a reader should see a rendered doc, not raw markdown, and the page holding the link decides where it opens.
**Instead:** linking straight to the raw file, which shows source text to readers.
**Detail:** [`/framework/core/Page/doc/markdown.md`](/framework/core/Page/doc/markdown.md)

## Open items
Two small findings are recorded but not acted on: `md.c()` has no caller, and `marked` is re-exported by [`public/app.js`](/app.js) to nobody. See [`doc/proposed.md`](./doc/proposed.md).
