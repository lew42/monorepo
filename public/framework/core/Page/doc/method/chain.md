`[root … me]`, oldest ancestor first.

**Usage** — four call sites, all in the Router:
`framework/core/Router/Router.js:59` (await the entering chain's `loading`),
`:82-83` (diff the leaving and entering chains), `:102` (the Router's own
`chain()`), `:124` (`mark_links()`, via `mark()`). One documented reader outside:
`core/Page/nav/page.js`, as the by-hand way to build breadcrumbs.

**Necessity** — yes. Navigation is a diff of two chains; without this the Router
would climb `parent` itself in four places.

**Simplicity** — right-sized. Four lines, no allocation beyond the array, and the
`unshift` is what makes it read root-first at the call site — which is the order
both `activate()` and a breadcrumb want.

It is the reason `parent` links exist at all. **Imports flow down; `.parent` points
up**, and a mutual import would break only on deep reloads.

