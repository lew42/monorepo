Extra classes for the page's own element.

```js
classes: "grid",              // framework/styles/layouts/fit/page.js:27
classes: "hides-nav",         // framework/page.js:10
classes: "pad fill flex v gap"
```

**Usage** — read once, by `render()`'s `.ac(this.classes)` (`Page.class.js:141`),
and again by any layout page that overrides `render()` and keeps that line.
Declared by every `styles/layouts/*` page and by `ext/classdoc`'s member pages
(`framework/ext/classdoc/classdoc.js:39,65,101`).

**Necessity** — yes. It is how a page becomes a layout without a subclass — the
arrangement tier is a stylesheet reading classes, so there is no `Pager` to learn.

**Simplicity** — right-sized. One caution, which is a cascade rule rather than a
Page rule:

> **`.page` visibility is decided in `@layer util`**, so it out-ranks the `.grid` /
> `.flex` a page is allowed to wear. That is deliberate — before the move, a `.grid`
> in `util` beat `display: none` in `theme` and every inactive page rendered on
> every route. `./doc/layout.md`.

An overriding `render()` that forgets `.ac(this.classes)` silently drops it —
`framework/page.js:51` carries a comment saying exactly that.

