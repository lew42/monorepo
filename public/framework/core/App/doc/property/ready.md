A promise with its own `resolve` bolted on, settled at the end of `instantiate()`.

```js
const { promise, resolve } = Promise.withResolvers();
this.ready = Object.assign(promise, { resolve });   // App.js:11-12
```

## Usage

- `App.js:30` — `this.ready.resolve()`, the last line of `instantiate()`.
- Nothing in `framework/` awaits it.
- Documented as the way to wait in four sandbox pages (`alex/framework/app/`,
  `arya/framework/app/`, `castin/framework/`, `edric/framework/app/`); `edric/`
  shows `app.ready.then(…)` in a code sample.

## Necessity

Keep. It is the answer to the cost of an unawaited async constructor: `new App()`
returns before the app exists, which is what makes `window.app = new App()` read
well, and this is how anyone who needs the wait gets it.

It is also the only way to measure anything. Nothing is in the document until
`inject()`, so `offsetWidth` and `getBoundingClientRect()` return zero for the whole
of boot.

## Simplicity

**The `Object.assign(promise, { resolve })` is the questionable part.** It makes one
object that is both the promise and its own control, so `app.ready` awaits and
`app.ready.resolve()` fires — convenient, and a promise carrying a method is a
shape nothing else in this framework uses.

The alternative is two properties (`ready` and a private resolver), which is more
honest and one line longer. Weighed in the readme.

**It never rejects, and it can hang.** A failure `load()` catches resolves it just
the same — the error page renders and `ready` fires — so `await app.ready` means
*"boot finished"*, not *"boot succeeded"*. A throw **outside** that try (in
`config()` or `render()`) skips `ready.resolve()` entirely and leaves it pending
forever, alongside the silent unhandled rejection from
[`instantiate`](/framework/core/App/api/instantiate/). Both are the same missing
`.catch()`.
