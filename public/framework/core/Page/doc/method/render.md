Build the view, once. Memoised in `this.view`.

**Usage** — one caller in core: `activate()` (`Page.class.js:119`). Also
`ext/tabs`, which renders the default tab into its panel
(`framework/ext/tabs/tabs.js:52`). **Overridden** by every page that is a layout —
`framework/page.js:19`, `michael/page.js:34`, `ext/doc`'s class page
(`framework/ext/doc/Doc.js:133`), and each `styles/layouts/*` variant.

**Necessity** — the class. It is where `content` becomes DOM.

**Simplicity** — right-sized at ten lines, and every one of them is a contract:

- `div.c("page flow", …)` — **`.page` is the visibility contract** and `flow` is the
  vertical rhythm a page opts into by wearing the class. A layout override simply
  never writes `flow`.
- `h1.c("page-title", this.title)` if there is a title, so a page has exactly one h1.
- `is.fn(this.content) ? this.content() : this.content` — content may be a function
  (captured) or a value (appended). A returned promise works too, because `append`
  handles it.
- `.ac("page-" + this.name)` gives every page a hook of its own with no declaration.

**An override owes three things, all silent when missed** — assign `this.view`,
carry `.page`, and never nest a second `.page`. See `activate()`.

The `console.groupCollapsed` is not decoration: a page builds **once**, so this is
the only place the build order of a whole subtree is visible.

