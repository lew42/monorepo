# App — design record

Boot, and the one container pages mount into.

```
new App()  →  div.app
constructor → config() → render() → await load() → initialize() → inject() → ready.resolve()
```

That is the whole mental model, and it is worth defending as literally as it
reads: `App` is an element with a lifecycle attached, not a coordinator.

Each verdict below is the short form. The full reasoning lives in `./doc/`, one
file per question, and the same files render as note pages under
`/framework/core/App/`.

## Decisions

**What did App stop doing?** Url resolution — all of it moved to `Router` and
`Page`. The line: the moment resolving a segment can `await` an import, it
stopped being boot logic. `config()` and `initialize()` are empty on purpose.
See ./doc/boot.md.

**Why is `instantiate()` an unawaited async call in the constructor?** So
`window.app = new App()` reads well; `app.ready` covers the wait. The cost — a
throw outside `load()`'s try becomes a silent unhandled rejection — is recorded,
not fixed. See ./doc/boot.md.

**Where does the error page render?** Into `$pages`, never `$app` — emptying
`$app` deletes the chrome, and the one page that most needs navigation would be
the one page without it. See ./doc/error-page.md.

**Why two loader lists?** `loaded()` (both, once, at boot) vs `styles_loaded()`
(stylesheets only, `allSettled`, every navigation). The Router must never await
`loaders`: that list only grows, so one rejected loader would kill every later
navigation — measured, and silently. And `loaded()` is a method, not a getter:
it allocates a fresh `Promise.all` per call. See ./doc/loaders.md.

**How does a page get `.app`?** Adoption, on the walk — a Page is built in
userland at module scope, so there is no constructor to inject into. Never read
`window.app` inside `framework/`; it is `undefined` during boot. See
./doc/adoption.md.

**Why do fonts live in `Font.js`, and why isn't it in `util/`?** `Font` is a
class with a registry, and `util/`'s pitch is plain functions. The CDN urls are
the one unvendored dependency — stated, not settled. See ./doc/fonts.md.

**Why do `app.stylesheet()` and `App.path_to_page_url()` exist?** Compatibility,
not API — the rewrite dropped them and took four sandbox sections down. Rename
freely inside `framework/`, alias on the way out. See ./doc/aliases.md.

## Open

- **Nothing paints until the whole walk finishes.** The chrome could paint
  immediately and fill in. Kept because an empty tab bar is worse, but it is a
  real cost (1765ms on a measured 5-deep cold link) and is often described as if
  it were free.
- **`config()` and `initialize()` are two empty hooks.** If a year passes with
  only `config()` ever overridden, `initialize()` should go.
