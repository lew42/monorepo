# App — boot, and the one container pages mount into; a site constructs it once, in `/app.js`

`new App()` → `config()` → `render()` → `await load()` → `initialize()` → `inject()` → `app.ready` settles. An element with a lifecycle attached, not a coordinator.

## Use
```js /app.js
import App, { View, div } from "/framework/core/App/App.js";
window.app = new App({
    config(){ this.font("Montserrat"); },
    render(){
        this.$app = div.c("app", () => { this.$pages = div.c("pages"); });
        View.set_captor(this.$pages);
    },
});
```

## Watch out
- Pages — and the error page — mount into `$pages`, never `$app`, and the captor must end up there; silent when broken. [`doc/method/render.md`](./doc/method/render.md) · [`doc/error-page.md`](./doc/error-page.md)
- `.app` arrives by adoption on the walk; `window.app` is `undefined` inside `framework/` during boot. [`doc/adoption.md`](./doc/adoption.md)
- Navigation awaits `styles_loaded()`, never `loaders` — one rejected loader would kill every later route, silently. [`doc/loaders.md`](./doc/loaders.md)
- Nothing paints until the whole walk finishes; a deep cold link waits for all of it. [`doc/boot.md`](./doc/boot.md)
- `app.stylesheet()` and `App.path_to_page_url()` are compat aliases for the sandboxes, not API. [`doc/aliases.md`](./doc/aliases.md)
- `mode.js` lives here, not under `styles/layers/theme/` — that import once took the site down. [`doc/mode.md`](./doc/mode.md)

## More
- [Overview](/framework/core/App/) · [`doc/decisions.md`](./doc/decisions.md) the record: callers, verdicts, proposals, open costs · [`doc/constructor.md`](./doc/constructor.md) why `instantiate()` is unawaited · [`doc/fonts.md`](./doc/fonts.md) `Font.js`, the CDN registry (the one unvendored dependency)
- Every member has `doc/method/<name>.md` and `doc/property/<name>.md`; every file `doc/file/<path>.md`.
- Files that matter: `App.js` (the class), `Font.js` (font registry), `mode.js` + `mode.css` (light/dark/auto toggle).
