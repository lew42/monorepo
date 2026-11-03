Nav over footer, in one box — so the narrow menu is a single thing to show and
hide.

## Usage

`Sidebar.js:26` — `render()`, the only caller. Assigns `this.$menu`, which nothing
reads. [views](/framework/core/Sidebar/doc/views/).

## Necessity

Keep, and the grouping is the design. Wide, `.sidebar-menu` is a plain flex column
and does nothing visible. Narrow, it is the *entire* drop-down: `position: absolute;
top: 100%` against the sticky bar, so opening it moves nothing else — **and the
footer rides along**, which is what keeps the mode toggle reachable on a phone.

Without this box the media query would have to show and hide two siblings and keep
them adjacent, for no gain.

It also owns the delegated close:

```js
.on("click", e => e.target.closest("a") && this.open(false))
```

One listener on the box rather than one per link, so links rendered later are
covered by construction.

## Simplicity

Right-sized. `this.footer?.()` is the notable call — optional so `footer: null`
means *no footer*, which is the assign-based constructor giving a removal spelling
for free.
