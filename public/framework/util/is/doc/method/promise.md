`!!value && typeof value.then === "function"` — duck-typed, so a polyfill or
any thenable counts, not only a real `Promise` instance.

## Used by

`View.append()` — a promise child is appended once it resolves.
