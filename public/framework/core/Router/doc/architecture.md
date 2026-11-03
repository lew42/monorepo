# Router architecture — walk the declared children, nothing else

The Router turns a url into a Page by walking each page's declared `children:`, one segment at a time, then swaps only the part of the page chain that changed. For anyone building a page or a link. Entry: [`Router.js`](../Router.js) (one class, `class Router`), constructed once by [`core/App`](/framework/core/App/).

## Optimistic interception — load first, push second

**Decided:** a click is intercepted and the walk runs first; `history.pushState` happens only if the walk resolves, otherwise `location.assign(url)` hands the url to the browser.
**Why:** a registry can't know every real url (`route()` mints urls from data, `child()` probes names nobody declared), so "is this a page?" can't be answered before navigating.
**Instead:** a synchronous registry gate. It needed every page imported up front, so it was removed.
**Detail:** [doc/registry-gate.md](./registry-gate.md)

## The walk is the loader

**Decided:** `load_segments()` awaits `page.child(name)` for each segment; a miss returns `null`. When it returns, the whole chain exists.
**Why:** a segment's children are unknown until its module has run, so the walk must be serial.
**Instead:** a parallel walk, which can't be done blindly for the same reason.
**Detail:** [doc/measured.md](./measured.md)

## Only the difference between two chains changes

**Decided:** `activate()` finds the shared leading pages with `shared_depth()`, deactivates the old tail deepest-first, and activates the new tail shallowest-first. Shared pages are never touched.
**Why:** an ancestor's sidebar must not be rebuilt (or flicker) on every navigation inside it.
**Instead:** tearing down and rebuilding the whole chain on every navigation.
**Detail:** [doc/chain-diff.md](./chain-diff.md)

## The page that holds the link decides where it opens

**Decided:** `click()` asks `Page.of(link) ?? this.active` for `page.open_link(link)`. A returned url is navigated; nothing returned means the page showed the link itself.
**Why:** a card can swap a doc in place, so the Router can't assume every link is a navigation.
**Instead:** a `target` on the link, which would put routing data into markup.
**Detail:** [/framework/core/Page/doc/open.md](/framework/core/Page/doc/open.md)

## Styles and titles load before the swap, `activate()` stays synchronous

**Decided:** `load()` awaits `page.chain()`'s `loading` promises, then `app.styles_loaded()`, both with `allSettled`, and only then calls `activate()`.
**Why:** `activate()` must stay synchronous so a site can wrap it in `document.startViewTransition()`. A child's stylesheet is registered only when its module imports, so the order matters: chain first, styles second. A broken child or 404'd stylesheet costs a warning, not every later navigation.
**Instead:** awaiting styles inside `activate()` (breaks the view-transition guarantee) or awaiting styles before the chain (flash of unstyled content).
**Detail:** [doc/styles-loaded.md](./styles-loaded.md)

## The Router writes four classes, scoped to `$app`

**Decided:** `mark()` sets `.active-page` / `.active-ancestor` on the chain and `mark_links()` sets `.active` / `.in-path` on anchors. Queries run under `this.root()` (`$app.el`), never `document`, and `mark()` unmarks only the views it marked last time.
**Why:** on a cold load `$app` is still detached, so a `document` query finds nothing. Unmarking by query would also strip marks that widgets wrote on their own pages.
**Instead:** a `window.location` check inside each view, which would spread the routing rule across every page.
**Detail:** [doc/marking.md](./marking.md)

## Post-navigation hook is a duck-typed `navigated?.()`, not a page hook

**Decided:** `activate()` ends with `this.app.navigated?.(page, from)`. A site that defines it gets the call; no site means no cost.
**Why:** one subject per hook. A page is `display: none` until `mark()` runs, so a per-page `entered()` would fire too early.
**Instead:** `page.entered?.()`, refused for that reason.
**Detail:** [doc/navigated.md](./navigated.md)

## Scroll resets the region, not the page

**Decided:** `activate()` calls `page.view.el.closest(".pages")?.scrollTo(0, 0)`. There is no per-url scroll memory; Back also lands at the top.
**Why:** the region scrolls, not the page, and short pages would hide a missing reset because the browser clamps `scrollTop`.
**Instead:** removing the reset (looks safe, isn't) or remembering scroll per url (not built).
**Detail:** [doc/scroll-reset.md](./scroll-reset.md)

## A `#fragment` on another page is kept, but lands at the top

**Decided:** `go()` keeps the whole url (`pathname + search + hash`), while the walk resolves only the path.
**Why:** the url must stay right for the address bar and for `?q=` state.
**⚠ Code mismatch:** the fragment does not scroll to its target. `activate()` ends with `scrollTo(0, 0)` and the target element does not exist yet when it runs. Not fixed here.
**Detail:** [doc/fragment.md](./fragment.md)

## Back and Forward ignore query and hash changes on the same page

**Decided:** `popped()` returns early when `location.pathname` equals the path already showing.
**Why:** a `?query` or `#hash` step on the same page must not reload it, scroll it to the top, or re-fire `navigated()`.
**Instead:** always reloading on `popstate`, which caused the scroll and repeat-hook bugs.

## Not built — redirect and alias

**Decided:** there is no `redirect()` or `Router.enter()`. A need for one means "redirect, not alias": one url per state.
**Why:** two live urls for one state break the url-to-state encoding.
**Instead:** both were built and backed out; they existed to pay for one layout's convenience.
**Detail:** [doc/backed-out.md](./backed-out.md)

## One Router per document, by convention

**Decided:** only `App` constructs a Router, and constructing one starts it (`listen()` in the constructor, no `start()`).
**Why:** `app` injection exists so a Router never needs global state.
**⚠ Code mismatch:** nothing enforces one per document. A second Router navigates every click twice. Written down, not guarded.
**Instead:** a singleton (breaks testability) or a warning (global state for a mistake only `App` could make).
**Detail:** [doc/constructor.md](./constructor.md)
