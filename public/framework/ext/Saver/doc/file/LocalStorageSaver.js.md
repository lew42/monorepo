The backend every real page falls back to off localhost, and the only one
guarded against an environment that doesn't have the API it needs at all.

## `store()` is the whole guard

```js
const store = () => { try { return localStorage ?? null; } catch { return null; } };
const item = key => { try { return store()?.getItem(key) ?? null; } catch { return null; } };
```

Module-level, called fresh on every `load()`/`write()`/`delete()` rather than
cached once — cheap enough that re-checking costs nothing, and it means this
file is safe to `import` in Node or a sandboxed iframe (neither has
`localStorage`) without throwing at import time. Every method degrades to a
no-op returning `false`/`null` instead.

⚠ **It used to be `typeof localStorage === "undefined"`, and that is not enough.**
A private-mode browser *has* a `localStorage`: the name resolves and the very next
access throws `SecurityError`. So the `typeof` check passed and the read rejected —
which is how `DevBar`'s `restore()` left an unhandled rejection on every page in
that mode. The **access** is what has to be guarded, not the name. Proved 2026-08-31
with a probe that redefines `window.localStorage` to throw on every get: the old
guard threw, the new one answers `null` / `false` / `false` and `restore()` resolves.

## `write()` and `delete()` are synchronous work wrapped in a resolved promise

Unlike `FileSaver`, there is no real async boundary here — `setItem` and
`removeItem` are synchronous browser calls. The `Promise.resolve(...)` wrapper
exists only so this file satisfies the same `load()`/`write()`/`delete()`
contract as the other two, not because anything here actually waits.

## `write()` guards `setItem`

`localStorage.setItem` throws `QuotaExceededError` when storage is full — a
real condition for a tab that has been open a while, not a theoretical one. A
`try/catch` around it warns once and resolves `false`, the same shape as every
other failure path in this module, so the write queue in `Saver.js` never
even sees the exception.

## Improvements

1. **`delete()` on a key that was never set still resolves `true`.**
   `removeItem` on a missing key is a no-op in the spec, so "delete succeeded"
   and "there was nothing to delete" are indistinguishable from the return
   value. Only matters if a caller ever needs to tell those apart; none does
   today. *(simple, speculative.)*
