**Usage** — one caller: `View.url()` (`View.js:413`). Nothing else in `public/`.

**Necessity** — no, as a separate name. It is the `else` branch of `url()`,
extracted.

**Simplicity** — the extraction is the *right* instinct applied one level too far:
`url()` reads perfectly with `new URL(path, meta.url).href` inline, and the two
names are close enough (`url` / `meta_path`) that a reader has to open both to
learn which one to call. Fold it into `url()`. Proposed in `readme.md`.
