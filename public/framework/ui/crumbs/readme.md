# Crumbs — a trail of links above a page, CSS only

One rule (`.ui-crumbs a { text-decoration: none }`) dresses the trail template drawn in
`page.js`. **There is no `ui.crumbs()` function** — a hand-typed loop over `[text, url]`
pairs can be *wrong*, which is the one thing a breadcrumb may not be.

## Use

```js
div.c("ui-crumbs flex wrap v-center gap", () => {
	a.c("page-link", "Framework").href("/framework/");
	span.c("muted", "/");
	a.c("page-link", "UI").href("/framework/ui/");
});
```

When the trail must be **derived** from the page tree rather than typed by hand, use
[`page.crumbs(from)`](/framework/core/Page/doc/columns/) instead — it walks `Page.chain()`
and cannot disagree with where you are.

## Watch out

- The urls must be real anchors — `Router.mark_links()` marks them `.in-path` and
  `.page-link` reads that for the accent colour; nothing here compares `window.location`.

## More

- [Overview](/framework/ui/crumbs/) — both variants, and why there is no function
- Files: `crumbs.js` (the one CSS rule), `page.js` (the demo and its own explanation)
