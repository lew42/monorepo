One pass that sets `.active` (this exact url) and `.in-path` (an ancestor of it) on
every in-app anchor.

## Usage

- `Router.js:141` — `mark()`, after every navigation.
- `ext/tabs/tabs.js:53` — a tab bar filled after an import, by which time `mark()`
  has been and gone.
- `framework/ui/page.js:29` — same reason: links rendered late.

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

Right-sized, with one open shape question: of three callers, two are saying *"I
rendered links after you ran."* The alternatives are a mutation observer on `$app`
and a post-render hook; both are weighed in the readme, and neither is obviously
better than one honest re-run.

**Callable bare** (`here = this.active?.url`) precisely so those two calls are one
word. That default is the API.
