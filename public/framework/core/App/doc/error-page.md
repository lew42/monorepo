# The error page renders into `$pages`, never `$app`

```js
error(error){ this.$pages.empty(() => { … }); }
```

Emptying `$app` would delete the chrome, so **the one page that most needs
navigation would be the one page without it.** The try also covers the first
navigation, not just the import: `activate()` renders every page in the chain,
which runs every `content()` there is, and a throw in any of them would otherwise
skip `inject()` and paint nothing at all.

## `app-error`, the mobile duplicate button (2026-11-06)

`error()` also marks `.app` with the class `app-error`. Chrome kept outside
`$pages` (the fixed ✦ `.drawer-menu`, `ext/drawer/menu.js`) is untouched by the
empty-`$pages` above, and `ext/drawer/drawer.css`'s mobile rule that steps that
button aside only fires `.app:has(.sidebar)` — a routed page's own sidebar. The
error screen never routes a page, so it never gets a `.sidebar`, and below 52em
the fixed button stayed on screen duplicating the mobile Sheet rail's own ✦
(`ext/drawer/Sheet.js`). `drawer.css` now hides `.drawer-menu` for `.app-error`
too. The class is never removed — a thrown route stays thrown until reload, so
nothing currently un-sets it; if `error()` ever becomes recoverable without a
reload, clearing `app-error` the moment a page routes successfully is the thing
to add.
