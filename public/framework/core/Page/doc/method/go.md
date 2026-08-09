Navigate to this page.

**Usage** — **no caller in `public/`.** Not the framework, not an ext, not a
sandbox. (`arya/lib/Router.js:66` calls a `go()` of its own, on its own class.)

**Necessity** — no, on evidence. Every navigation on this site is a real `<a href>`
that `Router.click()` upgrades, which is the whole point of the design: no component
holds navigation state, and Back works for free.

**Simplicity** — one line, and it reads well. The problem is that it offers a second
way to do the thing the framework deliberately has one way to do — and it is the
imperative way, which produces no link for a reader to hover, middle-click or share.

**Recommendation: delete**, and let `link()` be the answer. If a programmatic
navigation is ever genuinely needed, `app.router.go(url)` is one property longer and
says which object is doing the work. Proposed in `readme.md`.

