# What an entry is

Anything answering `.label ?? .title` and `.url`. So a real `Page` and a plain POJO
both work, and a site can list sections it doesn't want to eager-load.

```js
{ title: "Core", url: "/framework/core/", icon: "dashboard" }   // a POJO
new Page({ title: "Core", meta: import.meta })                  // a real Page
{ title: "Core classes", pages: [ … ] }                         // a GROUP
```

Duck-typed, never `instanceof` — the same rule as `page.activate?.()`.

## The three fields, and where each comes from

| field | read by | from |
|---|---|---|
| `label ?? title` | `link()` | the child page's own `title`, or a `label` set on it |
| `url` | `link()` | `parent.url + name + "/"` |
| `icon` | `link()` | the child page's own `icon` |

**A label belongs to the list it appears in; a title belongs to the page.** They
are not two spellings of one thing, which is why `link()` prefers `label` and why
`Page` carries both.

## `nav_for()` is the supported source

```js
pages: [...this.children.keys()].map(name => this.nav_for(name))
```

That one line is `/framework/`'s entire navigation. `Page.nav_for(name)` returns
`{ url, label, icon, card }` — exactly an entry — so **the panel, the tab bar and
the preview cards read one source and cannot name a child three ways.** Before it,
`/framework/` and `/michael/` hand-rolled two menus over the same tree and already
disagreed.

**A menu name that differs from the page title is set on the child**, not mapped by
the parent:

```js
// in the child's own page.js
export default new Page({ meta: import.meta, title: "Extensions", label: "Ext" });
```

There is no relabelling map on the parent. That was tried and removed: it put a
child's name in two files, and the copy in the parent won silently when they drifted.

## A group is an entry with `pages`

No second `groups` property. A flat sidebar, a grouped one and a mix are the same
call. The cost is that **a group heading can never also be a link** — correct
anyway, since a heading that navigates is a link pretending to be a heading — and
the convention that pays for it is a first entry called "Overview" pointing at the
section's own url (`framework/page.js:100`).

**Nesting is one level and nothing enforces it.** A group inside a group reaches
`link()` with an entry that has no `url`, and renders `href="undefined"` silently.
