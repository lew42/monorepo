The page's own heading, and its default name in every menu.

**Usage** — `render()` writes it as the one `h1.page-title`
(`Page.class.js:137`), `nav_for()` falls back to it (`Page.class.js:158`),
`link()` uses it as the link text (`Page.class.js:149`), and `Router` writes it to
`document.title` on every navigation.

**Necessity** — yes.

**Simplicity** — right-sized. It defaults to `this.name` — the url segment — so a
page that declares nothing still has a heading, and a page that cares writes one
word.

**A title belongs to the page; a `label` belongs to the parent's list.** They are
not two spellings of one thing: `/framework/start/` is titled *"Start"* on its own
page and labelled *"Start here"* in the menu, deliberately, because a menu entry and
a page heading are different sentences.

If `title` is falsy, `render()` emits **no** `h1` at all — which is how a layout page
takes over its own heading. That is a real feature and it looks like a bug in the
console when a title is misspelled as `Title`.

