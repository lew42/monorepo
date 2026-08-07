# Marking: two classes, and a link pass

## `mark()` writes two classes, and that is the entire appearance API

```
.active-page       the leaf
.active-ancestor   everything above it
```

Wipe across `$app`, then reapply down the new chain. **A page that left needs
nothing undone, only its classes gone** — which is a query, not a lifecycle call,
and that is why there is no teardown protocol to get wrong.

Every arrangement on the site is these two classes plus one a page opted into by
name (`paper`, `papers`, `full`). The Router does not know any of those names.

**Scoped to `$app`, never `document`.** On a cold load `$app` is still detached,
so a document-wide query finds zero links and nothing lights up.

## `mark_links` — two bugs that both looked like "active is broken"

**`here` is the active page's url, not `location.pathname`.** `go()` pushes
history only *after* the load succeeds, so mid-navigation the browser still shows
the url you are leaving. The page knows where it is; ask it.

**Ask the attribute, not the resolved url.** An in-page anchor resolves its
`.pathname` to the page you are on, so every `href="#section"` matched `here` and
got `.active` — measured 9 of 9. A fragment link is a scroll, never a
destination:

```js
if (link.getAttribute("href")?.startsWith("#")) return;
```

**Callable with no argument**, so anything rendering links late can re-run the
pass. `tabs()` fills its bar after an import and had already missed `mark()`.

Cost: 89µs over 49 anchors. At 5000 anchors, 11ms — and 45% of that is
re-parsing `link.origin` / `link.pathname`, not the two `querySelectorAll`
sweeps. Not worth optimising until a page has thousands of links.
