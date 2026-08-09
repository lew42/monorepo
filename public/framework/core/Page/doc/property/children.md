Declared children: **which ones, and in what order.**

```js
children: "intro guide api"     // folder names, in menu order
```

**Usage** — read by `declare()` in the constructor (`Page.class.js:32`), which
turns it into a Map; from then on every reader uses the Map —
`load_all_children()` (`:179`), `child()` (`:70`), `nav_for()` (`:153`),
`previews()` (`:164`), `ext/tabs` (`framework/ext/tabs/tabs.js:18,35,45`),
`ext/classdoc` (`framework/ext/classdoc/classdoc.js:114`). Declared on ~60 pages.

**Necessity** — yes, for the one job a filesystem cannot do: **order**. `api` before
`guide` before `intro` is alphabetical, and alphabetical is not a curriculum.

It is **not** registration. `child()` falls through `route()` to a filesystem probe,
so an undeclared folder still resolves — *forgetting to declare costs the menu entry,
not the url.* See the [Children](/framework/core/Page/children/) guide, which is this
property's long form.

**Simplicity** — one line, three accepted shapes (a space-separated string, an array
of names, an array of Pages or option objects), and one wart:

> **The property changes type.** You write a string and read back a `Map`. So
> `this.children.length` is `undefined`, and `[...this.children.keys()]` is the
> idiom everywhere. Two names for the two states would be worse; this is the
> cheaper of two costs, not a free choice.

Declared children are imported **at construction**, which is what lets a menu draw
once with real titles and icons. Measured: on `/framework/`, 1 → 28 `page.js`
fetches and +51ms to first paint, flat with depth.
