A bar of links and the panel those children mount into. No `TabPager`, no `Page`
subclass, no directory per tab — `/tabs/what/` is a real url with nothing on disk
behind it.

```js
this.$tabs = this.tabs("what why");       // one set
this.$more = this.tabs("state notes");    // …and another
```

**Which children are tabs is decided HERE, at placement — not marked on the
child.** So a page can have several sets, and a child in none of them is an
ordinary child that renders wherever it would have anyway. Nothing on a Page says
*"I am a tab."*

## Only the first tab is imported

It has to be, so the group's own url shows something. **The rest stay names** —
and that is deliberate, not lazy-by-accident:

> A label taken from `title` only exists once that page is imported, and *which*
> pages are imported depends on the url you arrived at. The bar would read
> differently per entry point.

That was reported as *"the first tab's label changes depending on which tab
renders."* `load_all_children()` in `initialize()` is the opt-in that buys real
titles for all of them, at the price of the imports.

## The panel rule is about the panel, not the group

```css
.tab-panel:not(:has(> .page.active-page)) > .page.default { display: block; }
```

A url selects one tab, so every *other* set has nothing of its own in the chain
and falls back to its first — no panel is ever blank. **State is read entirely off
the url, so clicking produces byte-identical output to reloading.**

## Three ways to misuse it, none of which warn

- **No overflow handling at all.** Right for ~5 children, unusable at twenty, and
  nothing tells you which side of the line you're on.
- **The first tab owns the parent's url**, so a second `tabs()` on one page can't
  also be default. Only the first set can.
- **Two sets sharing a child name** silently collide in `regions`; the second
  call's panel wins.
