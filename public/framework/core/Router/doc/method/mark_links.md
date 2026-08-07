One pass that sets `.active` (this exact url) and `.in-path` (an ancestor of it).
**No view should compare `window.location` itself** — sidebars, breadcrumbs and
preview cards all get their state from here, and CSS decides what each kind of
link does with the class.

Two bugs live in this method's five lines, and both presented as *"active is
broken"*:

**1. `here` is the active page's url, not `location.pathname`.** `go()` pushes
history only *after* the load succeeds, so mid-navigation the browser still shows
the url you are leaving. The page knows where it is; ask it.

**2. Ask the attribute, not the resolved url.**

```js
if (link.getAttribute("href")?.startsWith("#")) return;
```

An in-page anchor resolves its `.pathname` to the page you are *on*, so every
`href="#section"` matched `here` and got `.active` — measured 9 of 9. A fragment
link is a scroll, never a destination.

**Callable with no argument** so anything rendering links late can re-run the
pass. `tabs()` fills its bar after an import, by which time `mark()` has long
since run.
