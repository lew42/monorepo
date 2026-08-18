The last-resort page: a title and the message, rendered where a page would have
been.

## Usage

`App.js:66` — `load()`'s `catch`, the only caller.

## Necessity

Essential, and the reason is the placement: **into `$pages`, never `$app`.**
Emptying `$app` deletes the chrome, so the one page that most needs navigation
would be the one page without it.
[error-page](/framework/core/App/doc/error-page/).

It covers two failures that look identical from the outside — no `/page.js`, and a
`content()` that threw — and both would otherwise skip `inject()` and paint a blank
document with a clean console.

## Simplicity

Right-sized, and deliberately unstyled: `div.c("page active-page")` with an `h1`
and a `pre`, so it inherits whatever the site already looks like and adds no CSS.

It carries `active-page` by hand because the Router never ran — the one place in
the framework that writes that class without `mark()`. Worth knowing, not worth
fixing.

**It is not a hook.** A site wanting its own error page overrides the method; there
is no `error_page` option, and there should not be one.
