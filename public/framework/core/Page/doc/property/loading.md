A promise for "my declared subtree has been imported".

**Usage** — assigned by `load_all_children()` (`Page.class.js:179`); read by
`Router.load()` (`framework/core/Router/Router.js:59`), by `ext/tabs` to guarantee
real tab labels (`framework/ext/tabs/tabs.js:37,40`), by
`load_all_children()` itself (each child's own `loading` is awaited), and by
`add()` — where `page.loading === undefined` is the test for *"built standalone, its
url only just arrived"* (`Page.class.js:53`).

**Necessity** — yes. It is what lets `activate()` stay **synchronous**, which is the
only shape `document.startViewTransition()` accepts.

**Simplicity** — right-sized, with one property that is easy to miss: because each
child's own `loading` is awaited, this means **"my subtree is ready"**, not "my
children exist".

Two things it is *not*: it is not a loading *state* (there is no `loaded` flag, and
nothing subscribes for a redraw — that machinery was deleted when eager loading
became the default), and it is not a rejection channel. `Router.load()` uses
`allSettled`, so one broken child cannot stop the rest of the page.

`undefined` is meaningful: it means `load_all_children()` has never run, which is
how `add()` knows a page was constructed without a url.

