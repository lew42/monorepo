One entry for a menu: `{ url, label, icon, card }`.

**Usage** — the single source every navigation component reads.
`previews()` (`Page.class.js:166`), `Sidebar`'s `pages` array
(`framework/page.js:59,69`) and `framework/styles/layouts/page.js:46,80`.

```js
pages: [...this.children.keys()].map(name => this.nav_for(name))
```

**Necessity** — yes, and it is the reason a child cannot be named three different
ways. One method resolves it, so a topic's sidebar, its tab bar and its preview
cards structurally agree.

**Simplicity** — right-sized, and *simpler than it used to be*. It spreads the child's
own `nav()` and overrides the two things a **list** decides — the url the entry appears
at, and the label when the child is not there to say. There is no `nav:` relabeling map
on the parent any more: the label falls back weakest-last —

```
child.label  →  child.title  →  the url segment
```

— and `icon` and `card` come straight off the child. **Everything is declared on the
page it describes.** A parent that genuinely wants a different word in its own list
spreads over the entry at the call site, which is visible where it happens:

```js
const entry = this.nav_for(name);
{ ...entry, label: "Overview" }    // framework/page.js:92,101
```

The one asymmetry left: it takes a **name** rather than a child, and reads
`this.children` itself, so it cannot answer for a page that is not a child. That is
correct — an entry belongs to the list it appears in — but it means a caller holding
a `Page` must know its name to ask. A page that only wants to describe *itself* asks
`nav()`, which is the half of this that needs no list.

See the `labels` note for where each of title, label, icon and card lives, and why
that was reversed three times.
