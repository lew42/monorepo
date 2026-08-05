# App — design record

Boot, and the one container pages mount into. 150 lines, and most of them are
comments.

```
new App()  →  div.app
```

That is the whole mental model, and it is worth defending as literally as it
reads: `App` is an element with a lifecycle attached, not a coordinator.

---

## 1. What App stopped doing

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

---

## 2. `instantiate()` is an unawaited async call in the constructor

`new App()` returning before load is what makes `window.app = new App()` read
well, and `app.ready` covers the wait.

**The cost, unfixed:** a throw anywhere outside `load()`'s own try/catch becomes
a silent unhandled rejection. One `.catch(e => this.error(e))` in the constructor
would fix it. Recorded rather than done because the try in `load()` covers the
case that actually happens (a page module throwing).

---

## 3. The error page renders into `$pages`, never `$app`

```js
error(error){ this.$pages.empty(() => { … }); }
```

Emptying `$app` would delete the chrome, so **the one page that most needs
navigation would be the one page without it.** The try also covers the first
navigation, not just the import: `activate()` renders every page in the chain,
which runs every `content()` there is, and a throw in any of them would otherwise
skip `inject()` and paint nothing at all.

---

## 4. `loaders` vs `View.stylesheets` — two lists, and mixing them broke navigation

- **`loaded()`** — `Promise.all` over both. Awaited **once**, at boot.
- **`styles_loaded()`** — `allSettled` over stylesheets only. Awaited by the
  Router on **every** navigation.

The Router must not await `loaders`. That list only grows — `tabs()` pushes a
`.then()` chain with no `.catch()` — so awaiting it per navigation means one
rejected loader kills **every** later navigation. Measured, and silently, because
`click()` never awaits `go()`.

`allSettled` for the same reason at smaller scale: a 404'd stylesheet costs a
warning, not the router.

**`loaded()` is a method, not a getter.** It allocates a fresh `Promise.all` on
every call, and as `get loaded()` that was invisible at the call site. This is the
cautionary example the no-magic-getters rule points at.

---

## 5. Adoption: `app` arrives on the walk, not at boot

A `Page` is constructed in userland at module scope (`export default new Page(…)`),
so there is no constructor for App to inject into.

- **`add(name, child)`** — the one place `parent` is assigned.
- **`.app`** — assigned in `child()`, on the walk, to the page about to need it.
  Nothing recurses it over the tree at boot.

A Page reads `.app` in exactly two places: `activate()` (for `container()`) and
`go()`. Everything else — `link()`, `preview()`, `previews()`, `render()`,
`chain()`, `naming()` — never touches it.

**The cost:** an eager child you have never navigated to has no `.app`, so
`unvisited.go()` would throw. `link()` is a plain `<a href>` and covers that case,
which is why it is the one used everywhere.

**Never read `window.app` inside `framework/`.** It is a console convenience, it
hard-codes one App per document, and it is `undefined` during boot — `app.js` runs
`window.app = new App()`, so the global is unset while `config()` executes.

---

## 6. Fonts live in `Font.js`, next to the only class that constructs one

`app.font(name)` pushes onto `loaders`, so a font asked for in `config()` is
applied *before* first paint. Ask later and it still loads, it just isn't waited
for.

**Not moved to `util/`**, though an earlier note said it should be: `util/`'s own
pitch is *"plain functions, no classes, no state"* and `Font` is a class with a
registry.

**The unresolved part is the CDN.** Both registered faces are `fonts.gstatic.com`
urls — the one place in the framework that breaks the "vendor the dependency" rule
`ext/` is held to. Vendoring costs ~166KB in the repo for a look most sites will
never load. Stated, not settled.

---

## 7. Two aliases exist only for consumers outside `framework/`

`app.stylesheet()` and `App.path_to_page_url()` are not API — they are
compatibility.

**This is a bug report about process, recorded so it isn't repeated.** The rewrite
dropped both, and `alex/`, `arya/` and `castin/` all 404'd because they call
`app.stylesheet()` at module scope. The rule *"rename freely inside `framework/`,
alias on the way out"* was already written down in `framework/readme.md` and was
not followed.

**A dev's `lib/` is a downstream package that happens to share a repo.** `grep
public/` before a merge does not see the branches about to land.

`path_to_page_url` cannot delegate to anything — the url convention it encodes
(`/a/b` → `/a/b.page.js`) no longer exists. It is the old rule, frozen. Do not
build on it.

---

## 8. Open

- **Nothing paints until the whole walk finishes.** The chrome could paint
  immediately and fill in. Kept because an empty tab bar is worse, but it is a
  real cost (1765ms on a measured 5-deep cold link) and is often described as if
  it were free.
- **`config()` and `initialize()` are two empty hooks.** If a year passes with
  only `config()` ever overridden, `initialize()` should go.
