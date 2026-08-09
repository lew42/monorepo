One entry for a menu: `{ url, label, icon, card }`.

**Usage** — the single source every navigation component reads.
`previews()` (`Page.class.js:165`), `Sidebar`'s `pages` array
(`framework/page.js:59,69`), `styles/gallery/gallery.js:58` and
`framework/styles/layouts/page.js:46,80`.

```js
pages: [...this.children.keys()].map(name => this.nav_for(name))
```

**Necessity** — yes, and it is the reason a child cannot be named three different
ways. One method resolves it, so a topic's sidebar, its tab bar and its preview
cards structurally agree.

**Simplicity** — right-sized, and *simpler than it used to be*. There is no `nav:`
relabeling map on the parent any more: the label falls back weakest-last —

```
child.label  →  child.title  →  the url segment
```

— and `icon` and `card` come straight off the child. **Everything is declared on the
page it describes.** A parent that genuinely wants a different word in its own list
spreads over the entry at the call site, which is visible where it happens:

```js
{ ...this.nav_for(name), label: "Overview" }    // framework/page.js:68
```

The one asymmetry left: it takes a **name** rather than a child, and reads
`this.children` itself, so it cannot answer for a page that is not a child. That is
correct — an entry belongs to the list it appears in — but it means a caller holding
a `Page` must know its name to ask.

See the `labels` note for where each of title, label, icon and card lives, and why
that was reversed three times.
