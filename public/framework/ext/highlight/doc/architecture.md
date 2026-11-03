# highlight architecture — highlight.js behind the `code` factory, not a new API

highlight adds syntax colouring to the shared `code` element factory from `core/View`. It is an ext: after `import "/framework/ext/highlight/highlight.js"` (done once in `app.js`), `code.js`, `code.css`, `code.html`, `code.md`, `code.json`, `code.lang`, `code.fn` and `code.file` exist, and every markdown fence on the site is coloured. Main file: [`highlight.js`](../highlight.js). Tokens are coloured by [`highlight.css`](../highlight.css). The grammars are vendored under `hljs/`.

## One highlighter: highlight.js, vendored, synchronous
**Decided:** highlight.js 11.11.1, its `es/` build, one file per language, copied into `hljs/`.
**Why:** the repo has no bundler and no runtime CDN. Each vendored file is standalone ESM with no imports, and `highlight()` runs synchronously.
**Instead:** Shiki (best output, but it cannot be vendored without a bundler), Prism v1 (global, not ESM), speed-highlight (async), sugar-high (JS-first).
**Detail:** [doc/choice.md](./choice.md)

## Five languages, and an explicit accessor map
**Decided:** only javascript, css, xml, markdown and json are registered, and `code.*` names are written out by hand in `highlight.js`.
**Why:** hljs ships a language called `c`. Generating accessors from `hljs.listLanguages()` would overwrite `code.c()`, which every page uses.
**Instead:** generated accessors (rejected, see above); more languages (one file plus one line each, added when wanted).
**Detail:** [doc/decisions.md](./decisions.md)

## Hook the write, not the page
**Decided:** highlighting runs inside the same synchronous turn as the write. `View.prototype.html_unsafe` and `View.prototype.prerender` are patched; each scans the new subtree for `language-*` fences.
**Why:** a later task (rAF, MutationObserver, load event) lets the browser paint plain code for one frame. A synchronous hook cannot be interrupted by a paint.
**Instead:** a post-pass (flashes plain code), or a manual `highlight()` call on every page (nothing automatic).
**Detail:** [doc/hooks.md](./hooks.md)

## The captor decides block or inline, and append corrects the guess
**Decided:** `code.lang()` reads `View.captor`. Under a block parent it builds `<pre class="code-block">`; under a phrasing parent a bare `<code class="code-inline">`; under a `<pre>` a bare `<code>`. `View.prototype.append` unwraps a `<pre>` that lands in a phrasing parent.
**Why:** the snippet string is identical in both cases, so the content cannot tell the two apart. Arguments are evaluated before their parent is built, so the captor is sometimes wrong, and append corrects it.
**Instead:** always building a `<code>` and wrapping at append (breaks `.ac("wide")` on block code); building in one shape only.
**Detail:** [doc/hooks.md](./hooks.md) · [doc/chaining.md](./chaining.md)

## A correction discards what was chained onto it
**Decided:** a `code.js()` in argument position inside a sentence is discarded and rebuilt at append, so classes, attributes and `.on()` handlers chained onto it are lost.
**Why:** the captor is the grandparent in argument position, so the first guess is often wrong. This is a known trade-off, not a bug to fix here.
**Instead:** correct by construction with `p.c("wide", "…", code.js(…))` or the capture form `p(() => code.js(…).ac("wide"))`.
**Detail:** [doc/chaining.md](./chaining.md)

## Token colours only, never a highlight.js theme
**Decided:** `highlight.css` colours tokens by meaning, inside `@layer theme`, and sets no background or text colour on `.hljs`.
**Why:** every official hljs theme sets `.hljs { background; color }`, which fights `framework.css`'s `pre, code` and `demo.css`'s `.demo-code` by load order.
**Instead:** vendoring an hljs theme (rejected for the reason above).
**Detail:** [doc/decisions.md](./decisions.md)

## `code.fn()` takes a function and never calls it
**Decided:** `code.fn(fn)` is `code.lang("javascript", source(fn))`. It stringifies the function and never runs it.
**Why:** a string is dead text to the editor, with no syntax check and no formatting. A function is live code the IDE checks, and `demo()` is the one that calls it.
**Instead:** `code.js(string)` for pseudo-code, ASCII diagrams or anything that does not parse.
**Detail:** [doc/decisions.md](./decisions.md)

## Its API is `code.*`, never a new top-level `syntax()`
**Decided:** highlighting is a namespace on the existing `code` factory, and it adds no `View.prototype` method.
**Why:** code is always a new element, which is what a factory is for. A second word for "a bit of code" would confuse readers, and `code("js", src)` already means "append two strings".
**Instead:** a top-level `syntax()` (rejected: two words for one idea).
**Detail:** [doc/decisions.md](./decisions.md)

## The FILENAME label is one attribute, drawn by one rule
**Decided:** a trailing filename (`code.js(src, "/app.js")`, or a fence's second info word) sets `data-file` on the `<pre>`. `highlight.css` draws the label from it.
**Why:** ext/markdown and code.lang emit the same attribute, so one CSS rule styles both. Inline code has no room for a label, so it ignores the argument.
**Instead:** a separate caption element (a second DOM shape to keep in step).
**Detail:** [doc/decisions.md](./decisions.md)

## CRLF is normalised before highlighting
**Decided:** `dedent()` in `util/source/source.js` converts `\r\n` to `\n` before it splits lines.
**Why:** on Windows `fn.toString()` returns the file's CRLF line endings, while the same text through `innerHTML` comes back as `\n`. Without the normalisation, `code.fn` output would differ from what the page shows.
**Instead:** normalising in each caller (rejected, the one shared helper is simpler).
**Detail:** [doc/decisions.md](./decisions.md)

## Consumers are soft, not imported
**Decided:** `demo()` and `files()` check whether `code.js` / `code.file` exist and fall back to plain `code()` or `fetch` when they do not. Neither imports this ext.
**Why:** an ext that is missing must not break its neighbours. This is the pattern every ext here follows.
**Instead:** a hard import (rejected: it makes the highlighter a dependency of every demo).
**Detail:** [doc/decisions.md](./decisions.md)

---

Open items (more languages, auto-detection, line numbers, `code.file` with one caller) are listed in [doc/decisions.md](./decisions.md#open). The module's page is [its overview](/framework/ext/highlight/).
