Extra classes for the page's own element.

```js
classes: "standard",          // the default — declared only to add to it, see below
classes: "hides-nav",         // framework/page.js:10
classes: "pad fill flex v gap"
```

**Usage** — read once, by `render()`'s `.ac(this.classes ?? "standard")`
(`Page.class.js`), and again by any layout page that overrides `render()` and
keeps that line. Declared by every `styles/layouts/*` page.

**The default is `"standard"`** — the standard page shape, a left-anchored measure
with `.wide` and `.bleed` tracks. A declared `classes:` replaces it **whole**:
`classes: "pad"` is a pad page and not a standard one, and a standard page that
wants an extra word writes `classes: "standard extra"`.

**Why not `"grid"`, which this was until Aug 2026?** The template is an opinion —
three named tracks and a measure — and it was squatting on the utility word.
`page.ac("grid")` now means `display: grid`, the same thing it means on any other
box on the site.

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
