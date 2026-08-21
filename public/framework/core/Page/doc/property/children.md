Declared children: **which ones, and in what order.**

```js
children: "intro guide api"     // folder names, in menu order
```

**Usage** — read by `declare()` in the constructor (`Page.class.js:32`), which
turns it into a Map; from then on every reader uses the Map —
`load_all_children()` (`:194`), `child()` (`:69`), `nav_for()` (`:157`),
`previews()` (`:165`), `ext/tabs` (`framework/ext/tabs/tabs.js:18,35,45`),
`ext/Doc` (`framework/ext/Doc/Doc.js:114`). Declared on ~60 pages.

**Necessity** — yes, for the one job a filesystem cannot do: **order**. `api` before
`guide` before `intro` is alphabetical, and alphabetical is not a curriculum.

It is **not** registration. `child()` falls through `route()` to a filesystem probe,
so an undeclared folder still resolves — *forgetting to declare costs the menu entry,
not the url.* See the [Children](/framework/core/Page/old/children/) guide, which is this
property's long form.

**Simplicity** — one line, four accepted shapes: a space-separated string, an array
of names, an array of Pages or option objects, and **a plain object keyed by title**.
An option object in the array form derives its `name` from `Page.slug(title)` when
it declares no `name` of its own — `overview: [{ title: "A", … }, { title: "B", … }]`
without a `name:` on either still gets two distinct cards.

```js
children: {
    HTML(){ md("…"); },                          // a function is content
    CSS: { icon: "palette", content(){ … } },    // an object is options
    JS: null,                                    // declared only, like a bare name
}
```

The key **is** the title, and `Page.slug(key)` is the url segment — the same
derivation `naming()` makes for a standalone page, so `HTML` lands at `…/html/`.
A `title:` inside an object value wins over the key. Three warts:

> **The property changes type.** You write a string and read back a `Map`. So
> `this.children.length` is `undefined`, and `[...this.children.keys()]` is the
> idiom everywhere. Two names for the two states would be worse; this is the
> cheaper of two costs, not a free choice.

> **Integer-like keys jump to the front.** JS hoists `"1"`, `"2"`, `"10"` above
> every other key and sorts them numerically, whatever order you wrote — and this
> repo has numeric page names. A POJO that mixes them silently reorders your menu;
> use the string or array form for those.

> **A value must be deferred.** `JS: md("…")` calls `md()` at *declaration* time,
> under whatever captor was current — the synchronous-capture trap in value
> position. `declare()` throws on anything that is not a function, string, plain
> object, `Page` or `null`. Write `JS(){ md("…") }`.

Declared children are imported **at construction**, which is what lets a menu draw
once with real titles and icons. Measured: on `/framework/`, 1 → 28 `page.js`
fetches and +51ms to first paint, flat with depth.
