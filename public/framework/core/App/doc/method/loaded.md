Everything the first paint waits for: stylesheets, plus whatever pages pushed onto
`loaders` during their module execution (fonts, mostly).

## A method, not a getter

This is the framework's own cautionary example. As `get loaded()` it allocated a
**fresh `Promise.all` on every access** — invisible at the call site, because
`app.loaded` reads exactly like a stored field.

The rule it produced: *a getter is fine for a cheap, stable alias of existing
state; anything that walks, allocates or fetches is a method.* The parens are the
only signal a reader gets.

It cost a downstream break to change — `edric/` called `app.loaded.then(…)` — which
is the other half of the lesson: **rename freely inside `framework/`, alias on the
way out.**

## Why there are two lists

`styles_loaded()` exists beside this one and covers stylesheets **only**, with
`allSettled` instead of `all`. The Router awaits *that* on every navigation, and
must never await this one:

`loaders` only ever grows — `tabs()` pushes a `.then()` chain with no `.catch()` —
so awaiting it per navigation means **one rejected loader kills every later
navigation.** Measured, and silently, because `click()` never awaits `go()`.
