The page above me in the tree.

**Usage** — assigned in exactly one place, `add()` (`Page.class.js:47`). Read by
`naming()` (`Page.class.js:23`), `chain()` (`:63`) and `container()` (`:99,102`),
and by layout pages reaching up for a sibling list
(`framework/styles/layouts/sidebar/page.js:27`).

**Necessity** — yes. It is the up-link the whole navigation model is built on.

**Simplicity** — right-sized, and the rule around it is the one that fails only on
deep reloads:

> **Imports flow DOWN; `.parent` links point UP. Never both ways.** `import` is
> hoisted regardless of textual position, so a circular partner reads an
> uninitialized binding — `/a/` throws while `/a/b/` works. The backref arrives by
> **adoption**, which is why a `page.js` never mentions its parent.

`View` also has a `parent`, set by `append()`, meaning DOM containment. A Page's
`view` is a View, so `page.parent` and `page.view.parent` sit one dot apart and
answer different questions. See `core/View/doc/property/parent.md`.

