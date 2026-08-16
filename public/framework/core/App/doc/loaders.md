# `loaders` — the property, and why there are two lists

`this.loaders = []` (`App.js:9`) — promises the first paint waits for, and nothing
else ever waits for.

## Usage

- `App.js:9` — created, before `assign()`, so a passed `loaders` is discarded.
- `App.js:76` — `font()` pushes.
- `App.js:93` — `loaded()` reads it, once, at boot.
- `ext/tabs/tabs.js` — `this.app?.loaders?.push(filling)`, so a cold load waits
  for a tab bar rather than painting an empty one. ⚠ Both `?.`: a stand-in app
  (`ext/demo`'s `DemoApp`) has no first-paint queue, and only the App need have one.

Written by two files, read by one method. Never spliced, never cleared.

## Necessity

Essential, and its shape is the whole story: **it only grows.** That is fine for
one boot-time `Promise.all` and fatal for anything per-navigation.

|  | covers | when | on failure |
|---|---|---|---|
| `loaded()` | `View.stylesheets` **+** `loaders` | once, at boot | `all` |
| `styles_loaded()` | `View.stylesheets` only | every navigation | `allSettled` |

The Router awaits the second and **must never await the first**. `tabs()` pushes a
`.then()` chain with no `.catch()`, so awaiting `loaders` per navigation means one
rejected loader kills **every** later navigation. Measured, and silently, because
`click()` never awaits `go()`.

`allSettled` for the same reason at smaller scale: a 404'd stylesheet costs a
warning, not the router.

## Simplicity

Right-sized as a list; loose as an interface. **Anything can push anything**, from
any tier — `ext/tabs` reaches across into `app.loaders` with no method to go
through, which is the one place the framework's "no black magic" rule is bent by
core's own API surface. A `app.loading(promise)` method would make it greppable and
would be the place to attach the missing `.catch()`.

`loaded()` is **a method, not a getter** — it allocates a fresh `Promise.all` on
every call, and as `get loaded()` that was invisible at the call site. This is the
cautionary example the no-magic-getters rule points at, and it cost a downstream
break to fix: `edric/` called `app.loaded.then(…)`.
