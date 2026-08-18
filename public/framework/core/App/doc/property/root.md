The root `Page` — whatever `/page.js` exports. The origin of every walk.

## Usage

- `App.js:58` — assigned in `load()`, and it is **the only page handed `app`
  directly**: `(await Page.load("/"))?.assign({ app: this })`.
- `Router.js:70` — `load_segments()` starts here, on every navigation.

Two lines, two files, and that is the entire life of this property.

## Necessity

Essential. `/page.js` is the one file that must exist — `load()` throws
*"no /page.js — the root is the one page that must exist"* if it is missing — and
this is the handle to it.

Everything below it is a **name** until the Router walks there. Nothing recurses
the tree at boot, so `app.root` is not a registry and cannot be used as one.
[adoption](/framework/core/App/doc/adoption/).

## Simplicity

Right-sized, with one naming friction worth knowing: `app.root` is a **Page**, and
`Router.root()` is the app's root **element**. Same word, two things, one class
apart — and `Router.load_segments()` reads `this.app.root` eleven lines above its
own `root()`. The Router readme carries the rename proposal (`scope()`); the
property here is the one with the prior claim on the word.
