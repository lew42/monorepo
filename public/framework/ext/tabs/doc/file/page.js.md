This module's own page, and the closest thing on the site to a self-test: `subject:
Page, methods: "tabs"` means the API tab reads `Page.prototype.tabs` **live** —
whatever `tabs.js` actually assigned, patch banner included — rather than a copy
pasted into this file. Rename the method and don't update `methods:` here, and the
page prints a console warning instead of quietly going stale.

## The two live demos are real child pages, not screenshots

Each `demo()` in the Overview builds a tiny `sample()` tree and calls
`this.tabs(...)` inside it for real, so "click a tab, reload the url, get the same
thing" is provable in the page itself, not just asserted in prose. That is why the
demos are `demo.app(sample({...}))` rather than a hand-built `.tab` markup — the
latter is what [`web/nav/tabs/page.js`](/web/nav/tabs/) does instead, and it exists
precisely because *that* demo has no Router for the real method to talk to.

## `subject: Page` documents one method on a much bigger class

Everything else `Page` owns — `render`, `child`, `container`, `regions`,
`default_tab`, `loading`, `label` — belongs to `core/Page/page.js`, not here. This
page's `methods:` list stays at one name on purpose: a second entry would be
documenting a class this module doesn't own.

## Improvements

1. **No `overview:` rail** — both demos live directly in `content()`. Right for two
   demos; if a `.steps` or a third skin is added later, revisit before it becomes a
   wall. *(simple to change later, not important now.)*
