# Boot: what App stopped doing, and the unawaited constructor

## What App stopped doing

`App` used to own url resolution (`load_page`, `path_to_page_url`,
`mark_links`, `load_ancestors`, `host?.()`). All of it moved to `Router` and
`Page`.

**The line:** the moment resolving a segment can `await` an import, it stopped
being boot logic. What is left here is the six-step lifecycle and `$pages`.

```
constructor → config() → render() → await load() → initialize() → inject() → ready.resolve()
```

`config()` and `initialize()` are empty on purpose. A site overrides `render()`
for chrome and `config()` for a Router option, a theme's behaviour, or a font.

## `instantiate()` is an unawaited async call in the constructor

`new App()` returning before load is what makes `window.app = new App()` read
well, and `app.ready` covers the wait.

**The cost, fixed:** a throw anywhere outside `load()`'s own try/catch used to
become a silent unhandled rejection and leave `app.ready` pending forever.
`instantiate()` now wraps its own body in try/catch — `catch` calls `error()`
(logs, renders the error page) — with `ready.resolve()` moved after so it always
runs.
