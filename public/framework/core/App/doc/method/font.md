Wait for a typeface before first paint.

```js
config(){ this.font("Montserrat"); }
```

Called from `config()`, which runs before `render()`, so the promise is on
`loaders` well before `load()` awaits them. **Ask later and it still loads, it
just isn't waited for** — the difference is a flash of the fallback, which on a
900-weight display face is not subtle.

`Font.load(name)` memoizes by name, so two pages asking for Montserrat share one
fetch. That memo is also the only reason it is currently safe to call this from a
theme that can appear twice on a page — which is *luck*, not design, and is why a
theme's behaviour is a function the site calls once rather than something the CSS
class triggers.

## The unresolved part

Both registered faces are `fonts.gstatic.com` urls — the one place in the
framework that breaks the "vendor the dependency" rule `ext/` is held to.
Vendoring costs ~166KB in the repo for a look most sites will never load. Stated,
not settled.
