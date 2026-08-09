Whether this browser has the Sanitizer API (`Element.prototype.setHTML`).

**Usage** — read once, by `html()` (`View.js:187`). Computed once at module load
(`View.js:507`).

**Necessity** — only because `html()` exists. Nothing else in `public/` asks the
question, and the three modules that actually set markup use `html_unsafe()`.

**Simplicity** — the feature detection is right; what it *does* with the answer is
not. On a browser without the API, `html()` warns and writes the string as **text**
— so the same call renders markup on one browser and prints angle brackets on
another. See `html()` for the proposal; if that method is fixed or deleted, this
property goes with it.
