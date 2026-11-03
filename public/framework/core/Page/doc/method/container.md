Where do I mount? **Most specific claim first.**

**Usage** — one caller: `activate()` (`Page.class.js:117`). One writer of each
thing it reads: `$pages` is assigned by `App.render()` and by any page that claims
a subtree (`framework/page.js:30`, `michael/page.js:34`); `regions` is filled by
`ext/tabs` (`framework/ext/tabs/tabs.js:29`).

```
this.parent.regions.get(this.name)   // my parent placed ME (a tab)
nearest ancestor with a $pages       // an ancestor claimed the subtree
this.app.$pages                      // the default, flat
```

**Necessity** — yes. `$pages` claims **everything below you**; `regions` claims
**one named child**. Two levels, because `tabs()` needs the second — two tab sets on
one page cannot share a single `$pages`, and that is what forced the split.

This is what makes "columns inside a full page" need no mechanism: a page can be
`position: fixed` *and* claim a region, because covering the window and arranging a
subtree are answers to different questions on different elements.

**Simplicity** — right-sized, and it is **the one piece of black magic left**. A
parent claims a container and a descendant lands in it without either file naming
the other; you cannot see it from the child. Kept deliberately after ten compound
layouts were tried against it: 5 needed it to do something non-default, 10 were
expressible only because it does, 0 wanted a third level. The alternative — a child
declaring where it lands — means moving a parent edits every descendant, and a page
reused in two arrangements becomes impossible.

It logs which claim it took (`mounts_in`), so it is at least **observable** rather
than merely declarative.

