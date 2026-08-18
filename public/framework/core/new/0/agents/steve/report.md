# Steve's report — phase 3

## 1. What I'd change first

Not a new method — an unrequested one. `App.mark()` (`App.js:90-112`) now does two
jobs: mark the chain (decided, mine) and `mark_links()` (`App.js:121-128`, highlight
every `<a>` in `$app` that points at the current page). Nobody proposed
`mark_links()`; the readme says it was "added after the build." That's the tell —
it skipped the same question every other method here had to answer: does this
need to exist, and if so, on App?

It doesn't need to be on App. `App` owes a page exactly one thing — a place to
mount (`$pages`) and now, since `mark()`, a record of which page is current
(`this.page`, see §2). Sidebar-highlighting is chrome, and chrome is the site's
job — `site/app.js` already builds the whole sidebar by hand. A `site/app.js`
method that re-walks its own `nav` array after each `activate()` would do the
same job in the file that already owns the nav, instead of `App` reaching into
`$app` and pattern-matching every anchor in the document, including ones it
never built. I'd cut `mark_links()` from `App` and let the site call it on
itself. If a second site wants the same behavior, that's the moment to promote
it back up — not before.

## 2. Divergence from what was decided

Everything on the owner's list matches the code — I checked each of the nine
lines against `App.js`/`Page.class.js` line by line and none of them are wrong.
Two things not on that list, and not in my proposal either, slipped in:

- **`App.js:91`, `mark(page)`** — `this.page = page;`. My proposal's `mark()`
  took a page and marked it; it never gave `App` a `page` property. This is new
  state, added silently, presumably for a future Router to read — but nobody
  decided that, and nothing reads it yet. Same complaint as `mark_links()`: it
  wasn't asked whether it needs to exist.
- **`Page.class.js:29`, `naming()`** — my proposal kept a fallback for a page
  built without `meta` (`this.parent && this.name ? this.parent.url + this.name
  + "/" : undefined`), left over from starter even though I'd already cut
  `add()`. The built version drops it: `this.url ??= this.meta && new URL(...)`.
  Correct call — nothing in `new/0` constructs a page without `meta`, so the
  branch was dead — but see §3 for what it costs.

## 3. A failure that won't throw

`Page.naming()` (`Page.class.js:28-33`) only derives `url` from `this.meta`.
Nothing stops anyone from writing `new Page({ title: "Orphan" })` directly
inside a `children: [...]` array — there's no `add()` to funnel through and
no constructor check. That page gets `url: undefined`, `name: undefined`,
constructs without complaint, and logs `new page{…} — "Orphan"` same as
everything else. It simply can never be found: `child(name)` does
`children.find(c => c.name === name)`, and `undefined === "orphan"` is always
false. No error anywhere, not on construction, not on lookup — the page is
just permanently unreachable. Today nothing does this, because every child in
`site/` is an import with its own `meta`. But nothing in the code says that's
required, and the day someone reaches for an inline child the way `starter`
allowed, it fails silently instead of on the line that caused it.

## 4. Dissent

I lost `link()`. My proposal kept both a real `href` *and* a click handler
straight to `activate()`, so a click worked identically whether a Router
existed or not, and the method's shape would never have to change later. The
arbitration went with `href` only, on the logic that click-interception is
always a single delegated listener the Router will own, so writing a per-link
handler today is work the Router deletes tomorrow. I still think that's
backwards for an MVP whose whole point is "usable before the Router exists" —
right now every link is a full page reload, which is a worse demo of `activate()`
than the demo buttons sitting three lines below it doing the thing `link()`
could have done itself. Recorded, not re-argued.

## 5. What the readme claims that isn't true

> "Two classes, **~165 lines**, and it runs."

`App.js` is 148 lines, `Page.class.js` is 107 — 255 combined, not 165. Even my
own phase-1 estimate said ~190 with comments (~90 + ~100), and that undercounted
too. Nobody re-measured after the actual build; the number in the readme is a
guess that was never checked against `wc -l`.
