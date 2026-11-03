The whole boot sequence, in six lines you can read at once.

```
config()      a Router option, a theme's behaviour, a font
render()      chrome + $pages — still detached from the document
await load()  import /page.js, then walk to this url
initialize()
inject()      $app into <body> — first paint
ready.resolve()
```

## Usage

`App.js:15` — the constructor, the only caller. Never called by hand.

## Necessity

Essential, and deliberately one method: if boot has an order you must memorise, it
belongs somewhere you can see all of it at once.

## Simplicity

Right-sized, with two costs that are real and are not the method's fault:

**It is an unawaited async call in the constructor.** That is what makes
`window.app = new App()` read well, and `app.ready` covers anyone who needs the
wait. The price used to be real: a throw anywhere outside `load()`'s own try/catch
became a silent unhandled rejection and left `app.ready` pending forever. Fixed by
wrapping the method's own body in try/catch — `catch` calls `error()`, which logs
and renders the error page — with `ready.resolve()` moved to run unconditionally
after, so `await app.ready` always settles.

**`inject()` is last, so nothing paints until the walk finishes** — measured at
1765ms on a 5-deep cold link, where the chrome could have painted immediately.
Kept, because an empty tab bar and a jumping layout are worse. But it is not free,
and it is often described as if it were. [boot](/framework/core/App/doc/boot/).
