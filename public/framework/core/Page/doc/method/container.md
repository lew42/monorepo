Where do I mount? **Most specific claim first.**

```js
const mine = this.parent?.regions?.get(this.name);   // my parent placed ME (a tab)
if (mine) return mine;

for (let page = this.parent; page; page = page.parent)
    if (page.$pages) return page.$pages;             // an ancestor claimed the subtree

return this.app.$pages;                              // the default, flat
```

`$pages` claims **everything below you**; `regions` claims **one named child**.
Two levels, because `tabs()` needs the second — two tab sets on one page cannot
share a single `$pages`, and that is exactly what forced the split.

This is what makes "columns inside a full page" need no mechanism: a page can be
`position: fixed` *and* claim a region, because covering the window and arranging
a subtree are answers to different questions on different elements.

## It is the one piece of black magic left

A parent claims a container and a descendant lands in it without either file
naming the other — you cannot see it from the child. It was **kept, deliberately**,
after ten compound layouts were tried against it: 5 needed it to do something
non-default, 10 were expressible only because it does, 0 wanted a third level.

The alternative — a child declaring where it lands — means moving a parent edits
every descendant, and a page reused in two arrangements becomes impossible.

It logs which claim it took, so it is at least **observable** rather than merely
declarative.
