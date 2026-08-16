What menus call this page, when that differs from its title.

```js
export default new Page({
    meta: import.meta,
    title: "Start",         // the h1 on the page
    label: "Start here",    // what every menu calls it
});
```

**Usage** — read by `nav_for()` (`Page.class.js:158`) and by `ext/tabs`'s label
resolver (`framework/ext/tabs/tabs.js:36`). Declared on five pages today:
`framework/start/page.js:6`, `framework/dev/page.js:6`, `framework/ext/page.js:6`,
`framework/util/page.js:6`, `notes/auth/page.js:6`.

**Necessity** — yes, and it replaced something worse. A parent used to carry a
`nav: { start: "Start here" }` map, which meant every icon and label on this site
was declared two or three times — once in the hand-typed sidebar, once in the
section's map, often again in a sibling menu. The first time anything moved, they
disagreed.

**Simplicity** — right-sized, and the *placement* is the whole design: **it lives on
the page it describes**, so every menu that lists it agrees by construction.

A parent that genuinely wants a different word in *its* list overrides at the call
site, where it is visible:

```js
const entry = this.nav_for(name);
{ ...entry, label: "Overview" }    // framework/page.js:92,101
```

