**Usage** — one caller: `Router.activate()` (`framework/core/Router/Router.js:99`),
over the leaving slice, **deepest-first**. Nothing in `public/` defines a
`deactivated()` hook for it to call.

**Necessity** — as the symmetric half of `activate()`, yes; on evidence, it is one
optional-call wrapper with no users.

**Simplicity** — right-sized, and note what it deliberately does **not** do: it does
not remove the view from the DOM. Visibility is decided in CSS from the classes
`Router.mark()` writes, so a page that leaves the chain simply stops matching
`.active-page` / `.active-ancestor`. That is why re-entering a page is free and why
this method has nothing to undo.

If it ever grows a body, the pairing rule is the trap: navigating **up** deactivates
nothing, because the page you land on never left the chain.

