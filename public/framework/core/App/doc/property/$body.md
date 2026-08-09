`View.body()` — the document body, wrapped so `inject()` can `append()` a View to
it.

## Usage

- `App.js:40` — assigned in `render()`; `app.js:51` — reassigned by this site's
  override, identically.
- `App.js:73` — `inject()`, the only read.

One write, one read, both inside this class.

## Necessity

**Weakest property on the class.** It exists so `inject()` can be
`this.$body.append(this.$app)` instead of
`document.body.append(this.$app.el)` — one wrapper for one call.

The argument for keeping it is that a site's `render()` override already has to
spell it (every override in the repo does, copied from the default), so it is
public whether or not anything reads it — and a site that wants to put a class or
an attribute on `<body>` has the handle.

The argument against: nothing in five sandboxes has ever used it that way, and
`View.body()` is one call away for anything that wants to.

## Simplicity

Right-sized as code. As API it is a property that exists mostly because the
override template shows it — which is how a line survives without ever being
needed. Proposal in the readme: keep, but stop showing it in the `render()`
example, and let `inject()` call `View.body()` itself.
