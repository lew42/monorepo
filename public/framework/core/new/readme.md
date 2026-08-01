# new/ — MVP sketch

Rough code, not wired up, not tested. Three files. Read `Page.js` first.

## Vocabulary — every word, defined

| word | is | not |
|---|---|---|
| `router.active` | **the current Page.** the router's only state | |
| `router.pages()` | a **method** — `active.chain()`, walked from `.parent` | not stored, cannot desync |
| `page.chain()` | `[root … this]`, walked from `.parent` | not a getter — it does work |
| `page.child(name)` | resolve **one** path segment → a Page or null | |
| `page.add(name, page)` | attach a child | (the only one — no `adopt`) |
| `page.show(child)` | **how I display a child.** the extension point | |
| `page.hide(child)` | undo it | |
| `activate` / `deactivate` | Router telling a page it entered/left the url | |

Gone: `host`, `layout`, `commit`, `adopt`, `$main`, `Page.registry`,
`load_ancestors`, `parent_url`, `module_url`, `body()`.

## The router stores one thing

`active` is the current Page. `pages()` walks `.parent` links, so there is no
array to keep in sync and no way for it to drift from the tree:

```js
pages(){ return this.active ? this.active.chain() : []; }
```

Both are methods, not getters — they walk a tree, and the parens are what tells
you so. See "No magic getters" in CLAUDE.md.

The walk in `load()` builds the `.parent` links as it goes (`add()` sets them),
so by the time it finishes, the last page already knows its whole path.

## In-flight navigations: a flag, not a counter

```js
async load(url){
    this.loading = url;
    …await…
    if (this.loading !== url) return true;   // a newer navigation started
    this.show(page);
}
```

A `setTimeout(0)` flag collapses calls **within one tick** — good for debouncing
saves. This race spans many ticks (each `import()` is a network round-trip), so
the flag has to survive the awaits. Holding the *url* rather than a counter says
what it means: *am I still the navigation anyone wants?*

## `children` is a plain object

Not a Map — no non-string keys are ever used, and `children[name]` reads better
than `children.get(name)`. Lookups go through `Object.hasOwn` so a segment named
`constructor` or `toString` can't resolve to something off the prototype.

`add()` also sets `this[name]` for convenience (`pg.comments.preview()`), but
**only if the name is free** — so a page named `title` or `url` can never clobber
the page it attaches to. The object is the store; `this[name]` is an alias.

## Who calls what

```
click / popstate / boot
        │
        ▼
router.go(url) ──► router.load(url) ──► page.child(name)   ← one per segment
                          │
                          ▼
                   router.update(pages)
                          │
                          ├── deactivate removed  (deepest first)
                          └── activate added      (shallowest first)
                                     │
                                     ▼
                          (page.parent ?? app).show(page)
```

`App` and `Page` have the **same two methods** — `show(page)` / `hide(page)`.
That's why there's no special case for the root: App is just the container above
the root page.

## Nothing is emptied

`render()` builds once (`this.view ??= …`). `show()`/`hide()` append and remove.
Shared leading pages are never touched at all:

```
/a/b/c/d/  →  /a/b/x/y/

pages    [root, a, b, c, d]
new      [root, a, b, x, y]
shared    ─────────┘  keep = 3

deactivate  d, c        (deepest first)
activate    x, y        (shallowest first)
root, a, b  untouched — DOM intact, scroll intact
```

## Default: the child replaces my content

```js
show(child){ this.$content.hide(); this.view.append(child.render()); }
hide(child){ child.view.remove(); this.$content.show(); }
```

So on `/a/b/` the DOM is `.page > .page > .page`, with the outer two's
`$content` hidden — you see `b` only, which is today's behaviour. Ancestors keep
their DOM, so going back to `/a/` just unhides.

## Columns are an override, not a class

A page that wants its children beside it instead of replacing it:

```js
export default new Page({
    meta: import.meta,
    title: "Docs",
    show(child){ this.view.append(child.render().ac("column")); },
    hide(child){ child.view.remove(); }
});
```

That's the whole drill-down. `$content` is never hidden, so the parent stays
visible as the left column. **No `Pager` class is required** — which is why
there's no `Pager.js` here. A real `ColumnPager` would add a sidebar and
breadcrumbs, and that's a View this page builds, not a routing concept.

## Dynamic pages

`child()` tries memory, then the filesystem, then `route(name)`:

```js
export default new Page({
    meta: import.meta,
    title: "Comments",
    route(name){
        return this.add(name, new Page({
            url: this.url + name + "/",
            title: `Comment ${name}`,
            content(){ … }
        }));
    }
});
```

`/post/comments/42/` resolves with **no 404** — `comments/page.js` loads, then
`route("42")` claims the rest. Waterfall is what makes that possible: you have to
load a page to know it can claim.

## Open questions

1. **`show()` recursion for columns.** In the override above, `a.show(b)` puts `b`
   in a column, but then `b.show(x)` uses `b`'s default (replace). For a real
   drill-down every page in the subtree needs the column behaviour — inherited
   how? A Page subclass the topic's children are built from, or a `show` that
   walks up to the nearest ancestor that defines one. **Not solved here.**
2. **`children` is both "declared" and "resolved".** `add()` is called by
   `child()` on resolution, so a page someone merely visited joins `children`.
   If `previews()` renders `children`, visited pages start appearing. Separate
   object, or a flag. **Still open.**
3. **`activate()` currently only shows.** Title/meta are the Router's. If a page
   wants a hook (fetch, timer, animation), it overrides `activate()` and calls
   the default — no mechanism for that yet.
4. **Root always loads `/page.js`.** Needed as the walk's origin. Its content is
   hidden on every deeper url by the default `show()`, so it costs one small
   cached module and renders nothing.
