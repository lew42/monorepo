# Router — design record

Everything between *"a url changed"* and *"the DOM reflects it"*. 199 lines.

Format as everywhere: **question → options → weighing → verdict.** A verdict of
*keep* is as valuable as a change — it stops the same idea being re-litigated.

The measurements below were taken against this design in `core/new/1/`, whose
`Router.js` is line-for-line the one that shipped. That directory is where this
design was proved; its readme is the long form of this one.

---

## 1. Why a Router at all, when `App` used to do this

`new/0`'s App had `resolve()` and `mark()`. Both moved here.

**The line that decided it:** the moment resolving a segment can `await` an
import, it stopped being boot logic. App keeps boot and the one container; Router
keeps the url. That is the whole split, and it is why `App` no longer has a
`load_page`.

---

## 2. The registry gate — removed, and it cannot come back

**The question.** How does a click know whether a url is a real page *before*
navigating? The old Router asked `Page.registry`.

**Why that's unanswerable.** A registry can only contain pages that have been
imported. The pages it would need to answer for are precisely the ones laziness
exists to avoid importing. The gate was structurally incapable of doing its job,
and it worked only because the old tier eagerly imported everything.

**Verdict: optimistic interception.** Try the walk; hand the url to the browser
only if it genuinely doesn't resolve.

```js
if (await this.load(url)) history.pushState({}, "", url);
else                      location.assign(url);
```

**Load first, push second**, so a failed navigation leaves no history entry. The
cost is honest: an unresolvable in-app link does a full page load instead of
being ignored, which is the correct fallback anyway.

---

## 3. Only what changed

```js
const shared = this.shared_depth(from, to);
from.slice(shared).reverse().forEach(p => p.deactivate());   // deepest first
to.slice(shared).forEach(p => p.activate());                 // shallowest first
```

Shared leading pages are **never touched** — navigating `/a/b/c/` → `/a/x/` leaves
`root` and `a` completely alone, so a sidebar built by `a` is not rebuilt, does
not lose scroll position, and does not flicker.

Reversed on the way out and forward on the way in, because a container must exist
before its child mounts into it and must not be torn down before its child leaves.

**`order` is gone.** `mark()` used to write `style="order: i"` from the chain
index. Unnecessary: pages are appended root-to-leaf and never moved, so DOM order
is already chain order — and same-depth siblings are never visible together, so
their relative order cannot be observed.

---

## 4. `mark()` writes two classes, and that is the entire appearance API

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

---

## 5. `mark_links` — two bugs that both looked like "active is broken"

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

---

## 6. Where `styles_loaded()` is awaited, and why not one line later

A page imported on *this* navigation has just called `View.stylesheet()` at module
scope, and its `<link>` is not in `document.styleSheets` yet — so without the
await its first render paints unstyled and then snaps.

It is awaited in `load()`, **not** inside `activate()`, which must stay
synchronous. That "no awaits past this point" guarantee is what lets a site wrap
the whole swap in `document.startViewTransition()`. Found by a seat whose missing
animation was simply louder than a missing margin would have been.

It uses `allSettled`, not `all`: a 404'd stylesheet must cost a warning, not every
subsequent navigation.

---

## 7. `app.navigated?.()` — built. `page.entered?.()` — refused.

Six independent seats asked for "something that runs after a navigation." Three
wrote the line, and the three lines were **not compatible**:

```
this.app.navigated?.(page)   on Router — the SITE reacts
this.entered?.()             on Page   — the PAGE reacts
explicitly NOT on Page       because a page is display:none until mark() runs
```

**Verdict: build the App one, refuse to merge the Page one into it.** Crumbs,
prev/next, closing a drawer and moving focus all need this moment and none can be
written without it. The Page version is a *different subject* with a correct
objection against it, and merging them would produce one method with a flag
inside a year. **Two requests wearing one name is exactly the shape that produces
an option, and an option is API surface forever.**

`from` is passed as well as `page`, because the hook fires on first paint too and
two seats independently re-derived "is this the first navigation" — one from
`from.length`, one by counting. It was already computed on line one of
`activate()` and was being thrown away.

---

## 8. Backed out: `redirect()` and `Router.enter()`

Both existed only to make `/tabs/` forward to a default tab, and both put a
routing concept into `Router` to pay for one layout's convenience — `load()` had
to return a page instead of a boolean, and a second entry point existed purely to
distinguish "the browser is already here" from "we're navigating."

Removed. `go()` pushes the url that was asked for, `load()` returns a boolean, and
a tab group is just a url that renders a bar.

**If a default tab is wanted later, reconsider from scratch rather than restoring
this** — the version that existed was built for one demo. What *does* survive as a
real need is different: a renamed page whose old url is in a bookmark. `route()`
cannot serve that, because an alias is two live urls for one state and that breaks
the injective url→state encoding the whole design rests on. **Support redirect,
not alias.**

---

## 9. Measured

```
warm navigation     0.2ms median over 500 navigations
mark()              89µs / 49 anchors · 11ms projected at 5000
:has() recalc       ~300x a plain recalc, still 146µs at 1600 pages —
                    you would need ~183,000 pages on screen to spend one frame
serial walk         RTT + 16ms per SEGMENT, linear. A 5-deep cold link is
                    1.7s of walking at 150ms RTT
```

**Laziness, re-measured on the live site after the eager-`children` fix:** every
cold route fetches **exactly its chain length** and nothing more. Inline pages
(`add()`, `route()`, `classdoc`) cost **zero** modules — `/framework/core/View/append/`
is five segments and four fetches.

The serial walk is the honest cost and it **cannot be parallelised blindly**: a
segment's children are unknown until its module has run. Prefetching would need a
manifest, which is the build step this framework doesn't have.

---

## 10. Open

- **No in-flight guard.** Two fast clicks start two walks; the slower one can win.
  Asked for by three seats. Unfixed because the correct behaviour isn't obvious —
  cancel the first, ignore the second, or let the last win.
- **The query string is dropped on a click.** `go()` pushes `link.pathname`.
  Asked for by three seats.
- **First paint waits for the whole walk.** Nothing paints until every loader
  resolves; the chrome could have painted 1765ms earlier on a measured deep link.
  Kept deliberately — an empty tab bar is the bug `tabs()` was changed to avoid —
  but it is not free and should stop being described as if it were.
