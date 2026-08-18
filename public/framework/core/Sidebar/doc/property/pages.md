The list. An array of entries, in the order they appear.

```js
new Sidebar({ pages: [
    { title: "Start", url: "/framework/start/", icon: "flag" },
    { title: "Core classes", pages: [ … ] },      // an entry with pages IS a group
]});
```

## Usage

- `Sidebar.js:86` — `nav()`, the only read: group or link, per entry.
- `framework/page.js:27` — the real one: `pages: this.sections()`, built from
  `nav_for()`.

## Necessity

Essential — it is the component. Everything else is chrome around it.

**An entry is anything answering `.label ?? .title` and `.url`**, so a real `Page`
and a plain POJO both work, and a site can list sections it doesn't want to
eager-load. `Page.nav_for(name)` returns exactly that shape, which is how a parent
hands its whole navigation in:

```js
pages: [...this.children.keys()].map(name => this.nav_for(name))
```

That is `/framework/`'s entire navigation, and it means the panel, the tab bar and
the preview cards read **one** source. [entries](/framework/core/Sidebar/doc/entries/).

## Simplicity

Right-sized: one property, two shapes, no second `groups`.

**Nesting is one level deep and nothing enforces it.** A group inside a group would
reach `link()` with an entry that has no `url` and render `href="undefined"`,
silently. `(this.pages || [])` means a missing list is an empty sidebar rather than
a throw, which is the right loudness for chrome.

**Rebuilding is not a thing.** `pages` is read once, during construction. Assigning
a new array to a live Sidebar changes nothing — build a new one, which is cheap.
