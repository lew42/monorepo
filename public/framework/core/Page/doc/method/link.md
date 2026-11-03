An `<a>` to this page, from its own title and url.

**Usage** — no caller in `framework/` itself; ~15 in the sandboxes
(`castin/root/page.js:14`, `alex/page.js:32`, `edric/framework/page.js:16`, …), and
it is the shape every page-ends-with-a-link paragraph would use if those paragraphs
were not written as markdown links.

```js
p("see also ", child.link());
```

**Necessity** — yes, and for a reason the call count hides: **it works while the
page is dormant.** A Page renders nothing until placed, so `link()` on an imported
child is a live link to a page that has never run, and a rename cannot leave a
stale url behind.

**Simplicity** — right-sized: one line, and `text ?? this.title` covers the "same
link, different words" case without an options object.

`Sidebar` deliberately does **not** use it (`framework/core/Sidebar/Sidebar.js:100`)
— borrowing it handed every row a `.page-link`'s prose styling. That is the honest
boundary: this builds a link *in a sentence*; a navigation component builds its own.

