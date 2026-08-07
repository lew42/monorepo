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

**The cost, unfixed:** a throw anywhere outside `load()`'s own try/catch becomes
a silent unhandled rejection. One `.catch(e => this.error(e))` in the constructor
would fix it. Recorded rather than done because the try in `load()` covers the
case that actually happens (a page module throwing).
