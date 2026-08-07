The whole boot sequence, in six lines you can read at once. That is deliberate:
if boot has an order you must memorise, it belongs in one method where you can
see it.

```
config()      a Router option, a theme's behaviour, a font
render()      chrome + $pages — still detached from the document
await load()  import /page.js, then walk to this url
initialize()
inject()      $app into <body> — first paint
ready.resolve()
```

## It is an unawaited async call in the constructor

`new App()` returns before loading finishes, which is what makes
`window.app = new App()` read well, and `app.ready` covers anyone who needs the
wait.

**The cost, unfixed:** a throw anywhere outside `load()`'s own try/catch becomes a
silent unhandled rejection. One `.catch(e => this.error(e))` here would fix it.
Recorded rather than done because the try in `load()` covers the case that
actually happens — a page module throwing.

## Nothing paints until the walk finishes

`inject()` is last, so a 5-deep cold link shows nothing for the whole walk —
measured at 1765ms on a slow connection, where the chrome could have painted
immediately.

Kept, because the alternative is worse: an empty tab bar and a jumping layout.
But it is **not free**, and it is often described as if it were.
