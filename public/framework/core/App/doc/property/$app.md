`div.app` — the app element. Everything the site draws lives inside it, and it is
detached from the document until `inject()`.

## Usage

Built at `App.js:43` (or by a site's own `render()`, `app.js:57`), then read by
three different tiers:

- `App.js:71` — `inject()` appends it to `<body>`.
- `Router.js:113` — `root()`, the element **every** Router query is scoped to.
- `App/mode.js:41` — `apply()` sets `color-scheme` on it.

## Necessity

Essential, and the scoping is the part that bites. `Router.root()` queries `$app`
and **never `document`**: on a cold load `$app` is still detached, so a
document-wide query finds zero links and nothing lights up.

`mode.js` writes to it rather than `<html>` for the theme reason: the tokens live
on `.app`, and two themed apps can render side by side on one page — a mode forced
at the root would take both.

## Simplicity

Right-sized. One property, three readers, no getter.

**A site's `render()` must assign it**, and nothing checks. Forget it and
`inject()` appends `undefined` — the failure is loud, which is the one mercy here.
The `$`-prefix convention is doing real work: `$app` holds `div.c("app")`, kebab
class read back as the property name, so you can get from CSS to JS without opening
the other file.
