# Markdown — `md()` for prose and `md.file()` for a whole `.md`, as a View addon; already re-exported from `/app.js` for every page

## Use
```js
import { md } from "/app.js";           // md.js directly only for .file / .details / .resolve
md("Hi.").ac("note");                   // one block in → a real <p>, chains like p()
md("# Multi\n\nblock");                 // several blocks → a captured div.md
p().md("Some **inline** markdown");     // into an existing view; p gets parseInline, div gets parse
md.file(import.meta, "readme.md");      // a promise of a div.md — View.append places it
```

## Watch out
- `md.file` / `md.details` resolve against `import.meta`, never the document — the SPA fallback makes the document url a route, so a document-relative fetch misses. [`doc/method/file.md`](./doc/method/file.md)
- A relative link in a fetched `.md` is rewritten against **the file**; but a link between two of this module's own `doc/*.md` must be absolute — a `doc/`-shaped url is not a route. [`doc/relative-links.md`](./doc/relative-links.md)
- Renders via `html_unsafe()` on purpose — Safari has no `setHTML()`, and the content is repo-authored. [`doc/sanitization.md`](./doc/sanitization.md)
- `md.c()` has no caller and `marked` is re-exported to nobody — recorded, not acted on. [`doc/proposed.md`](./doc/proposed.md)

## More
- Page: [/framework/ext/markdown/](/framework/ext/markdown/) · record: [`doc/decisions.md`](./doc/decisions.md) — two ways in, why `marked` is vendored, why `file()` is a promise, who calls this
- [`doc/file-labels.md`](./doc/file-labels.md) — `` ```js /app.js `` becomes `<pre data-file>`, drawn by `ext/highlight`
- [`doc/relative-links.md`](./doc/relative-links.md) — the 40-broken-routes crawl and `md.resolve`
- [`doc/sanitization.md`](./doc/sanitization.md) — `html_unsafe()` over the Sanitizer API, weighed
- [`doc/proposed.md`](./doc/proposed.md) — two unacted findings
- Files: `md.js` (the whole addon), `marked.esm.js` (vendored v18), `md.css` (two classes only)
