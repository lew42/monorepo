One call, and my whole subtree lays out as **full-height columns** — every child
opening to the right of its parent, Finder-style.

```js
export default new Page({
    meta: import.meta,
    width: "small",                    // this page's own column
    initialize(){ this.columns(); },   // the whole opt-in
    children: { Guides: { width: "small", children: { … } } },
});
```

**Usage** — 12 call sites, all opting a host in: the page generator
(`core/Page/generator/page.js:33`), the [Finder](/framework/core/Page/overview/columns/finder/)
(`overview/columns/finder/page.js:14`), the boxed demo (`overview/columns/page.js:54`)
and nine example pages under `overview/columns/examples/`.

**Necessity** — yes, and it is why the shape is *core* rather than a component: the
arrangement is CSS on classes core already stamps, so the only thing a host needs is
a flag. The method sets one — `this.columnar = true` — and the two readers are
`column_host()` (walks `chain()` at **render** time, so a child that only loads when
you navigate to it is a column too) and Page.css.

**Simplicity** — one line. The temptation is an options object (gap, snap, a
`max-columns`); every one of those is already a token on `.page.columns`, so a host
that wants a different row retunes `--page-column-max` and no API grows.

⚠ **Columns are their own screen.** A full-height row under a `.block` tab bar cuts
through the open tab's bottom edge and loses the flush tab-to-content effect. And the
host says `padding: 0` — `--page-pad` inherits from the region, or the row sits inside
its own box.

The four width words, the measurements at 400/1280/1920/3440, and everything that has
bitten: [`doc/columns.md`](/framework/core/Page/doc/columns/).
