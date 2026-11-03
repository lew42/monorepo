> ⚠ The declaration above says `name = "Page"`. That is `Function.name`, not this
> property — `Doc` falls back to a static descriptor and finds the class's own
> name. A real `name` is an **instance** property and leaves nothing on the
> prototype to show. Fix recorded in `readme.md` §Open.

The last segment of the url. `/framework/core/Page/` → `"Page"`.

**Usage** — derived in `naming()` (`Page.class.js:25`) from the url, or supplied by
`add()`, which is where an inline page gets one (`Page.class.js:47`). Read by
`render()` for the `.page-<name>` class (`:140`), by `container()` to find the
region a parent set aside for it (`:99`), and by every `children` Map key — the Map
*is* keyed by name.

**Necessity** — yes. It is the identity a parent knows a child by, and the reason a
menu entry, a region and a url segment all agree without anything correlating them.

**Simplicity** — right-sized, and the derivation direction is the design: **the url
is the source, the name is derived** for a page with a `meta`, and the other way
round for an inline page. Both land in the same place, which is what `naming()`
being idempotent buys.

The free CSS hook is worth knowing: `render()` writes `.page-<name>` on every page,
so a one-off rule for one page needs nothing declared. Two pages with the same
folder name in different branches share that class — `.page-page` is on both this
page and `styles/` variants — so it is a hook, not a selector to build on.

