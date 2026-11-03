**Usage** — **no live caller in `public/`.** Documented by
`alex/framework/view/page.js:46`, `arya/framework/view/page.js:104` and
`edric/framework/view/page.js:108`.

**Necessity** — no. `load()` is parallel; this exists so several loads keep their
written order. Nothing has needed that.

**Simplicity** — it carries two real hazards for a member with no users:

- It sets the captor **inside an async callback** and restores it after the
  `await`. That is exactly the pattern the whole framework warns against — it
  happens to work only because `View.lazy` is a serialised chain, so no other
  capture can interleave.
- **`View.lazy` (the static promise chain) and `View.prototype.lazy` (this) share
  a name.** One word, two unrelated things, in one file.

Delete with `load()`, or keep both and give the chain a different name. Proposed
in `readme.md`.
