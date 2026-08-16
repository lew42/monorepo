Everything the first paint waits for: stylesheets, plus whatever pages pushed onto
`loaders` during their module execution — fonts, mostly.

## Usage

- `App.js:68` — `load()`, once, at boot.
- `edric/page.js:83`, `edric/framework/app/page.js:43` — a sandbox awaiting the app.

## Necessity

Keep. It is the boot half of a deliberate pair, and the pair is the point:

|  | covers | when | on failure |
|---|---|---|---|
| `loaded()` | stylesheets **and** loaders | once, at boot | `all` — a rejection propagates |
| `styles_loaded()` | stylesheets only | every navigation | `allSettled` |

The Router must never await this one. `loaders` only ever grows — `tabs()` pushes a
`.then()` chain with no `.catch()` — so awaiting it per navigation means **one
rejected loader kills every later navigation.** Measured, and silently, because
`click()` never awaits `go()`. [loaders](/framework/core/App/docs/loaders/).

## Simplicity

Right-sized, and **a method, not a getter** — this is the framework's own
cautionary example. As `get loaded()` it allocated a fresh `Promise.all` on every
access, invisible at the call site because `app.loaded` reads exactly like a stored
field. The rule it produced: *a getter is fine for a cheap, stable alias of existing
state; anything that walks, allocates or fetches is a method.*

It cost a downstream break to change — `edric/` called `app.loaded.then(…)` — which
is the other half of the lesson: rename freely inside `framework/`, alias on the way
out.
