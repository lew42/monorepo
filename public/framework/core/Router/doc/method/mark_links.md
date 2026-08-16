One pass that sets `.active` (this exact url) and `.in-path` (an ancestor of it) on
every in-app anchor.

## Usage

- `Router.js:124` — `mark()`, after every navigation.
- [`ext/tabs/tabs.js:55`](/framework/ext/tabs/) — a tab bar filled after an import, by which time `mark()`
  has been and gone.
- [`ext/catalog/catalog.js:62`](/framework/ext/catalog/) — the Overview rail's first card, built the same way.
- [`ext/AITask/dashboard.js:115`](/framework/ai/) — the day/task dashboard's usage
  and effort cards, built after `catalog()`'s own pass.

Same reason all three times: links rendered after `mark()` already ran need their
own re-run, and the bare-callable default (`here = this.active?.url`) is what
makes each of those call sites one word.

## Necessity

Essential, and it is the rule the whole framework runs on: **no view compares
`window.location` itself.** Sidebars, breadcrumbs, tab bars and preview cards all
take their state from this one pass, and CSS decides what each kind of link does
with the class. Remove it and every navigation component grows its own copy of
*"where am I"*, and they start to disagree.

Two bugs live in its five lines, and both presented as *"active is broken"*:

**`here` is the active page's url, not `location.pathname`.** `go()` pushes history
only *after* the load succeeds, so mid-navigation the browser still shows the url
you are leaving. The page knows where it is; ask it.

**Ask the attribute, not the resolved url.**

```js
if (link.getAttribute("href")?.startsWith("#")) return;
```

An in-page anchor resolves its `.pathname` to the page you are *on*, so every
`href="#section"` matched and got `.active` — measured 9 of 9.

## Simplicity

Right-sized, with one open shape question: of the four callers, three are saying
*"I rendered links after you ran."* The alternatives are a mutation observer on
`$app` and a post-render hook; both are weighed in the readme, and neither is
obviously better than one honest re-run.

**Callable bare** (`here = this.active?.url`) precisely so those three calls are
one word. That default is the API.
