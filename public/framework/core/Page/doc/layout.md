# Nested or full — and why alternating between them is tricky

**Open. We need a strong, simple strategy for robust page layouts and we do not
have one yet.** (the owner, 2026-08-17.) This note states the problem and the evidence;
the answer is not written.

## The two modes

**Nested.** The default. A page renders inside whatever region its parent gives
it. Under a `catalog()` parent that region is what is left after the rail —
`var(--rail, 19em)` by default, and `min(34em, 45%)` for everything under
`/framework/ai/` (`ext/AITask/ai.css`). Below `64em` `catalog.css` turns the split
into a **column**, so the rail stops being a rail and becomes a full-width block
above the content.

**Full.** The page replaces the view and takes the screen:

```js
render(){
    return this.view ??= div.c("page full", () => this.content())
        .ac(this.name && "page-" + this.name);
}
```

`styles/layouts/page.js` and `ai/2026-08-17/report/page.js` both do this.

## Why alternating is tricky

- **`full` moves the title.** `Page.render()` emits the `h1` *outside* `content()`,
  and `full` zeroes the gutter that would sit it anywhere sane — so a full page
  must draw its own title inside `content()`. Forget, and the heading either
  vanishes or lands flush against the viewport edge.
- **`full` changes the box model for children.** `.page.full` sets
  `display: flex; flex-direction: column`, so every direct child becomes a flex
  item and a child written for normal flow re-sizes without warning.
- **`fill` is not `full`.** `fill` is `overflow: hidden` plus a region height; it
  clips anything taller than the window. A wall that scrolls needs `full` **and
  not** `fill`.
- **A page cannot tell which mode it is in.** It has no handle on the width it was
  actually given, so it cannot size itself. Same `page.js`, two very different
  boxes, and nothing throws in either.
- **The mode is decided in two places at once** — the page (`full` or not) and the
  parent (rail width, column collapse) — and neither knows about the other.

## What we measured, 2026-08-17

Three independent agents hit the same wall on the same day, none looking for it:

| page | lost to chrome |
|---|---|
| ranking page at 3440 | **1012px** (sidebar 274 + rail 738) |
| report page at 1280 | content read in **506px** |
| report page, wide | rail took **45%** — a 50/50 split |

The report was fixed by taking over. That is a per-page escape, not a strategy.

## What a strategy has to answer

1. **Who decides the mode** — the page, or the parent that mounts it? Today both
   do, which is why the outcome is hard to predict.
2. **How does a page learn its available width**, so it can size honestly instead
   of assuming a viewport it may not have?
3. **When is a rail worth its width?** At 3440 a 34em rail is cheap; at 1280 the
   same rail is 45% of everything.
4. **What should the column collapse do?** A full-width rail above the content is
   rarely what anyone wanted; it is the flex column falling back, not a decision.

Until this is settled, prefer the default: **nested, and let the region size you.**
Reach for `full` when the page *is* the screen — a wall, a browser, a report — and
when you do, draw your own title and check the result at 390, 1280 and 3440.

## One data point, 2026-08-18

The [columns](/framework/core/Page/overview/columns/) demo answers question 1 for one arrangement: **the root
decides**, and its children need no mode of their own — nested pages lay out as equal peers because `display:
contents` flattens the layout while the DOM stays a tree, so the visibility contract is untouched. The record,
the measurements and what the first sketch got wrong: [`columns.md`](/framework/core/Page/doc/columns/).

Related: [`css.md`](./css.md) for how `.page` visibility is layered, and
[Layouts](/framework/styles/layouts/) for whole-page shapes.
