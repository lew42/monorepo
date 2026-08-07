# `loaders` vs `View.stylesheets` — two lists, and mixing them broke navigation

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
