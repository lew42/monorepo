A promise with its own `resolve` bolted on, settled at the end of `instantiate()`.

```js
const { promise, resolve } = Promise.withResolvers();
this.ready = Object.assign(promise, { resolve });   // App.js:11-12
```

## Usage

- The last line of `instantiate()`, `this.ready.resolve()`, runs unconditionally
  after that method's own try/catch — reached whether or not `config()`,
  `render()`, `initialize()` or `inject()` threw.
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

**It never rejects.** A failure `load()` catches resolves it just the same — the
error page renders and `ready` fires — so `await app.ready` means *"boot
finished"*, not *"boot succeeded"*. A throw in `config()`, `render()`,
`initialize()` or `inject()` used to skip `ready.resolve()` entirely and hang it
forever; [`instantiate()`](/framework/core/App/api/instantiate/) now wraps its own
body in try/catch, so every one of those throws also logs, renders the error
page, and still resolves `ready`.
