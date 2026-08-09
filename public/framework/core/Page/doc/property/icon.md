A Material Icons ligature name, for menus that draw icons.

```js
icon: "code"
```

**Usage** — read by `nav_for()` (`Page.class.js:159`) and rendered by `previews()`
(`Page.class.js:168`), `Sidebar` (`framework/core/Sidebar/Sidebar.js:104`) and
`styles/gallery/gallery.js:58`. Declared on most section and class pages.

**Necessity** — yes, given the site has icon menus at all. What it replaced is the
argument: an icon declared on the parent's entry was declared two to three times per
page, and drifted.

**Simplicity** — right-sized: a string, on the page, read by one method.

The cost was paid up front and is worth naming. **An icon on the page can only be
known once the page is imported** — the objection that made the parent's map win the
first two rounds. That is why declared children are imported at construction and
`Router.load()` waits for them: measured at +51ms and 27 extra fetches on
`/framework/`. Without eager loading, icons would pop in as you browsed.

It is unvalidated. A misspelled name renders the *word* rather than a blank box,
because Material Icons is a ligature font — see
`framework/styles/elements/misc/page.js:43`.

