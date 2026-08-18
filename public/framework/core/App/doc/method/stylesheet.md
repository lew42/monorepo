Two members, one line each, both forwarding to `View.stylesheet()`:

```js
static stylesheet(meta, url){ return View.stylesheet(meta, url); }
       stylesheet(meta, url){ return View.stylesheet(meta, url); }
```

(The panel above shows the instance one — `Doc` reads the prototype first.)

## Usage

- `app.js:7` — `App.stylesheet("/styles.css")`, the static form, the site's own
  sheet.
- `alex/styles/html/page.js:4`, `alex/ui/docs.js:5`, `arya/lib/Page.js:7`,
  `castin/navigation.js:3`, `edric/style/css/page.js:4` — the instance form, all
  five outside `framework/`.

**Nothing inside `framework/` calls the instance method.** Core code calls
`View.stylesheet(import.meta, "…")` directly.

## Necessity

**The instance method is compatibility, not API.** The rewrite dropped it and
`alex/`, `arya/` and `castin/` all 404'd, because they call it at module scope. The
rule *"rename freely inside `framework/`, alias on the way out"* was already written
down and was not followed. [aliases](/framework/core/App/doc/aliases/).

The static one is a genuine convenience: `app.js` needs a sheet before an App
exists to own one.

## Simplicity

**Neither may grow an implementation.** The moment one of them does something
`View.stylesheet()` doesn't, there are two ways to load a stylesheet and they will
disagree.

Both take `(meta, url)` and pass it straight through, so the `import.meta`-first
rule is the same everywhere: resolve module-relative urls against `import.meta`,
never the document — the SPA fallback makes the document url the *route*.
