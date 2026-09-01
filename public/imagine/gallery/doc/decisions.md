# Decisions — /imagine/gallery/

2026-08-29, the run that answered the cross-page preview questions.

## Lists are separate pages, and lazy

Six lists, one column page each, because a list only imports when you open its column.
The alternative — one page with four bands, the way `core/Page/`'s Overview does it —
would import all 42 paths (and their subtrees, and their stylesheets) the moment you
opened the gallery. The palette can afford that because those pages are its own subtree
and already loaded; a gallery of foreign pages cannot.

## `width: "large"`, not `"full"`

`full` was the first try: a wall of cards is the widest thing here and a 40em default
column gives it two tracks. But `.page-column-full` collapses every column to its left,
so opening a list threw away the trail you were browsing with — the gallery stopped
being browsable at the moment you used it. `large` caps at 64em, which is four tracks of
cards at 1920 **and** leaves three rails on screen. `cards/` keeps `full`, because a
before-and-after of two walls genuinely needs the row.

## No `classes: "default"` on `lists/`

Tried, measured, reverted. The gallery opens on its own rail otherwise, so marking the
first child `default` is the obvious fix — but a default column that is also navigated to
**hides itself**: `Page.css`'s

```css
.page-column-pages:has(> .page:is(.active-page, .active-ancestor)) > .page.default { display: none; }
```

matches the default page against itself the moment the Router marks it, and the whole
branch went blank. `default` is only safe on a column nothing routes to.

## The card restyle is scoped, not shipped

The owner asked for previews on the wash instead of on a white card, with a shadow. The
rule that paints the surface is `core/Page/Page.css`'s `EVERY card wears the surface,
2026-08-17` block, which another effort owns today — so `gallery.css` carries the whole
change under `.gal-flat` and `cards/page.js` shows it beside the current look. Lifting
those four rules into `Page.css` unscoped is the entire site-wide change; the exact text
is on that page and in the task log.

Not in `ext/catalog`, which was the first guess: nothing there paints a card. It only
arranges them.

## The filter reads the DOM, not the data

`lists/page.js`'s title filter (2026-08-31) queries `.page-preview-title` at each
keystroke rather than keeping a copy of the titles or a `predicate()` over row objects
(`ux/Filter` does that, for data the caller already owns as rows — a wall's cards arrive
as foreign `Page` objects behind a promise, so there is no row array to hand it without
building one solely to throw away). Toggling `style.display` on `.page-preview` is
cheaper than re-running `wall()`, and the wall never sees the query at all.

`getWall` is a closure, not the wall itself: the filter box has to exist (and render)
**before** the wall so it sits above the cards, but the wall doesn't exist as a value
yet at that point in `content()`. A `let $wall` assigned one line later, read lazily
inside the input handler, breaks the ordering deadlock without reaching for a promise.

Shown only past 8 paths — the three six-card lists (Building blocks, Navigation, The
box) never earn the row.

## Rejected: overriding `preview()`

`preview(nav)` already takes the nav as an argument, so re-addressing a card is one
spread and needs no subclass, no second card shape and no new method on `Page`. Every
option that started with "add a hook to Page" was worse than the one field that was
already there.
