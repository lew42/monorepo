# /web/ — the guide tier

`/framework/` is the **reference**: one page per class, method and property, and an
honest note on whether each should exist. `/web/` is the **guide**: how to build a
thing on the web, shown live. A guide page teaches one decision, demos it in a
real clickable site, and links to the reference for API detail.

```
/web/            this landing
/web/nav/        navigation patterns — nine, plus two studies
/web/layout/     layout principles — seven, each one live
```

## Decisions

**Why a second tier at all.** Every page under `/framework/` answers *what is
this*. Nothing answered *which of these should I use, and what happens when I
pick wrong*. Those are different documents with different failure modes: a
reference page goes stale when an API is renamed, a guide page goes stale when the
advice turns out to be wrong, and mixing them means neither gets reviewed.

| option | weighing |
|---|---|
| more prose under `/framework/` | a reference page that opens with advice stops being scannable, and the advice hides in a section nobody links to |
| a `guide/` inside `/framework/` | urls say the guide is *about the framework*; it is about the web |
| **a sibling `/web/` tier** | ✓ one url says which kind of document you are reading, and either side can link to the other |

**A guide page is demos, then one caption.** Same shape as a `demo.tree()` page:
the render first, its own `page.js` open beneath it, the sentence last. Prose that
leads is prose nobody reads — and a caption cannot detach from the example it
captions.

**The demos are real sites, not screenshots.** Every pattern here is a live `Page`
tree inside `ext/demo`'s `demo.app`, so a claim about navigation is testable by
clicking it. The cost is real: inside a demo app there is no `Router`, so
`aria-current` is the only selection mark — which each component now reads as
selected itself, rather than this directory restating six rules to fix it.

**No new components.** Everything on `/web/nav/` is built from the five blocks:
a `Page`, `card()`/`wall()`, the `ext/demo` stage, the `ext/Layout` panel, and the
utility vocabulary. Where a pattern needed a shell — a bar, a rail, a drawer — the
demo's own root overrides `render()`, which is exactly what `/framework/page.js`
and `/page.js` do for real. The shell *is* the lesson, so it is written out in
each file rather than factored into a helper nobody can see.
