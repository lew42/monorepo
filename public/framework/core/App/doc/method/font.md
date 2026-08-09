Wait for a typeface before first paint.

```js
config(){ this.font("Montserrat"); }
```

## Usage

- `styles/layers/theme/lew42/lew42.js:15-16` — the site's theme, two faces.
- Documented as the entry point on four sandbox pages; no other framework caller.

## Necessity

Keep. It is three lines and it buys the ordering: called from `config()`, the
promise is on `loaders` well before `load()` awaits them. **Ask later and it still
loads, it just isn't waited for** — the difference is a flash of the fallback,
which on a 900-weight display face is not subtle.

Thin, but not one-caller sugar: it is the only thing that connects `Font` to the
boot sequence, and `Font.load(name)` on its own would leave the site to remember to
push onto `loaders`.

## Simplicity

Right-sized. `Font.load(name)` memoizes by name, so two pages asking for Montserrat
share one fetch — which is also the only reason it is currently safe to call from a
theme that can appear twice on a page. That is **luck, not design**, and is why a
theme's behaviour is a function the site calls once rather than something the CSS
class triggers.

The unresolved part is not this method: both registered faces are
`fonts.gstatic.com` urls, the one place in the framework that breaks the "vendor
the dependency" rule. [fonts](/framework/core/App/docs/fonts/).
