# Decisions — the persistent right tree + swapping centre

## The `$pages` clobbering bug (2026-09-04)

**The ask:** a right-hand tree that never moves, and a centre box that swaps to
whichever leaf you click — real url, real content, the tree's own rect unchanged.

**The trap:** `/imagine/` calls `columns()` once at its root, and
`Page.column_host()` finds the SHALLOWEST columnar ancestor from ANY depth
([`core/Page/doc/columns.md`](/framework/core/Page/doc/columns/)) — so this page,
several levels under it, still renders through core's `render_column()` whether it
asks to or not. That method's `stack()` runs `content()` first (which is where this
page assigns `this.$pages` to its own centre box), then — in the very next
statement, still inside the same synchronous call — overwrites it:

```js
// Page.class.js, render_column()
this.column_grab(this.column(host));                 // runs MY content(), sets this.$pages
this.$pages = div.c("page-column-pages", () => …);    // …then stomps it, unconditionally
```

Measured: clicking the "Paragraph" leaf changed the URL and the page title correctly,
but `.page--paragraph` landed inside core's `.page-column-pages`, never inside
`.paging-rightnav-centre` — the centre kept showing the original default leaf
forever, silently. No console error.

**The fix — call through, then re-assert:**

```js
centre(){
    const $centre = this.$centre = div.c("paging-rightnav-centre");   // a field of my OWN, never clobbered
    …
},

render(){
    const view = Page.prototype.render.call(this);   // `super` isn't available — this page is a
                                                       // plain config object, not a subclass
    if (this.$centre) this.$pages = this.$centre;     // put my assignment back afterward
    return view;
},
```

`container()`'s own walk-up-the-parent-chain reads `page.$pages` fresh on every call
(it is never cached), so re-asserting it once, right after `render()` returns, is
the whole fix — every leaf's `container()` call happens later, on its own
`activate()`, and finds the corrected value.

**What was rejected:** escaping the columns tree entirely (overriding `container()`
too, `imagine/shells/Shell.js`'s move) — that mounts straight into `app.$pages`,
taking over the whole screen and hiding the site nav, which is right for a
standalone lab but wrong for one card among the paging program's siblings. This
page stays an ordinary column (gets the head, the crumb, `width: "full"`) and only
patches the one field core's own default-column mechanism collides with.

**Where else this could bite:** any page under `/imagine/` that wants to hand-set
`this.$pages` for its own region (the [Panels](/framework/core/Page/doc/panels/)
pattern, or a second `catalog()`-style rail) will hit the identical clobber the
moment it sits under a columns host — which every page under `/imagine/` now does.

## The button uppercase override

`.theme-lew42 :is(button, .btn)` (`lew42.css`) is `(0,2,0)` and beats
`.paging-item`'s own `(0,1,0)` (`../paging.css`) in the same `@layer theme` — a
branch row, drawn as a real `<button>` because it only expands (no url of its own),
came back uppercase and bold while the `<a>` leaves beside it stayed sentence-case.
Fixed with one extra type selector: `.paging-rightnav-tree button.paging-item`
(`0,2,1`) — enough to win without `!important` or a new layer.

## What was kept simple on purpose

- **Flat children, grouped by a `group` field** (the same one `previews()` already
  reads), not a second level of real nested `Page`s. The arrangement contract's own
  sibling-replacement rule (an ancestor is replaced by a later sibling in the same
  box) would have made a real grandchild work too, but a flat group is one fewer
  moving part for the same "expand reveals real nested pages" proof.
- **No chip-picker abstraction** (`ext/layout/controls.js`'s `pick()`) — the
  program's own `.paging-toolbar` / `.paging-chip` / `.paging-group` / `.paging-axis`
  vocabulary (`../paging.js`, `../paging.css`) already draws exactly this shape, so
  the toolbar here is three axes of the same pattern, not a second toolbar system.
