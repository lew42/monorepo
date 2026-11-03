# App architecture — an element with a lifecycle, not a coordinator

`App` is the one container pages mount into, and the boot sequence of a site: `new App()` → `config()` → `render()` → `await load()` → `initialize()` → `inject()` → `ready` settles. A site constructs it once, in `/app.js`. Files: [`App.js`](../App.js) (the class), [`Font.js`](../Font.js) (font registry), [`mode.js`](../mode.js) (light/dark toggle).

## Boot is a short fixed sequence
**Decided:** `instantiate()` runs config, render, load, initialize, inject in order; `config()` and `initialize()` are empty seams a site overrides.
**Why:** a literal, readable lifecycle is easy to defend and to override; App does no coordinating.
**Instead:** App resolving URLs or segments itself. That moved to `Router` and `Page`, because resolving a segment can `await` an import and so is not boot logic.
**Detail:** [boot.md](./boot.md)

## The constructor does not await boot
**Decided:** the constructor calls `instantiate()` unawaited; `app.ready` is the thing to await.
**Why:** `window.app = new App()` reads well. `instantiate()` wraps its body in try/catch, calls `error()`, and resolves `ready` outside the catch, so `await app.ready` always settles.
**Instead:** an async factory (`await App.create()`), which makes the one-line boot clumsy.
**Detail:** [constructor.md](./constructor.md)

## Pages mount into `$pages`, never `$app`
**Decided:** `render()` builds `$app` containing `$pages` and sets `$pages` as the View captor; the error page also renders into `$pages`.
**Why:** element factories auto-append to the captor, so it must be where pages live; emptying `$app` would delete the navigation chrome.
**Instead:** captor on `$app` (pages land beside the chrome, silently wrong).
**Detail:** [error-page.md](./error-page.md)

## App is handed to the root page only
**Decided:** `load()` loads `/`, assigns `{ app }` to it, and builds the `Router`; every other page gets `app` from its parent during the walk.
**Why:** one explicit hand-off, then adoption; `window.app` is not defined inside `framework/` during boot.
**Instead:** a global lookup (undefined at boot) or passing `app` to each page.
**Detail:** [adoption.md](./adoption.md)

## Navigation waits for stylesheets only
**Decided:** `styles_loaded()` is `Promise.allSettled(View.stylesheets)`; only first paint (`loaded()`) also awaits `loaders`.
**Why:** `loaders` only grows, so one rejected loader would silently kill every later route.
**Instead:** awaiting `loaders` on each navigation.
**Detail:** [loaders.md](./loaders.md)

## Compat aliases stay empty
**Decided:** `app.stylesheet()` and `App.path_to_page_url()` stay one-line shims for sandboxes outside `framework/`; neither grows an implementation.
**Why:** the real work lives in `View` and `Router`; a second copy would drift.
**Instead:** removing them (breaks the sandboxes).
**Detail:** [aliases.md](./aliases.md)

## `mode.js` lives here
**Decided:** the light/dark/auto toggle sits beside App, not under `styles/layers/theme/`.
**Why:** importing it from the theme layer once took the site down (an import cycle on deep reload).
**Instead:** the theme layer.
**Detail:** [mode.md](./mode.md)

The record of verdicts, callers and open costs is [decisions.md](./decisions.md).
