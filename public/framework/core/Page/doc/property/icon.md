A Material Icons ligature name, for menus that draw icons.

```js
icon: "code"
```

**Usage** — read by `nav()` (`Page.class.js:152`), carried by `nav_for()`, and rendered
by `preview_link()` (`Page.class.js:187`) and `Sidebar`
(`framework/core/Sidebar/Sidebar.js:104`). Declared on most section and class pages.

**Necessity** — yes, given the site has icon menus at all. What it replaced is the
argument: an icon declared on the parent's entry was declared two to three times per
page, and drifted.

**Simplicity** — right-sized: a string, on the page, read by one method.

The cost was paid up front and is worth naming. **An icon on the page can only be
known once the page is imported** — the objection that made the parent's map win the
first two rounds. That is why the children a page *draws* are imported before it
draws and `Router.load()` waits for them. Without that, icons would pop in as you
browsed; `depth` is what keeps the bill to the levels actually on screen
(`../declaring.md`).

It is unvalidated. A misspelled name renders the *word* rather than a blank box,
because Material Icons is a ligature font — see
`framework/styles/elements/misc/page.js:43`.

