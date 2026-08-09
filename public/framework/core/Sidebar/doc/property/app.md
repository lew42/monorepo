The `App`, passed in so the footer can render the colour-scheme toggle. Optional.

## Usage

One read, in `footer()`:

```js
if (this.app) this.$mode = mode(this.app);   // Sidebar.js:113
```

Set by `framework/page.js:23` (`app: this.app`) and by the Sidebar demo pages.
Nothing else in the class touches it.

## Necessity

Keep, and keep it optional. `mode()` writes `color-scheme` to `app.$app`, so
without an app there is nothing to write to and the toggle would be a button that
silently does nothing — absent is the honest state.

**It is the one dependency this component has on the framework**, and it buys one
button. That is a fair trade only because the alternative — a `mode` toggle mounted
somewhere global — was tried and was a `position: fixed` pill floating over every
page.

## Simplicity

Right-sized as a property; **its failure mode is the quiet part.** A sidebar built
without `app` renders a footer with no toggle and logs nothing — fine when you
meant it, invisible when you didn't.

It has happened by accident once, and the shape is worth remembering: a page
rendered *without being routed to* — a default tab — used to be adopted before
`app` existed, so `new Sidebar({ app: this.app })` inside a `classdoc` overview
silently lost its toggle and worked when you opened the child's own url.
`ext/tabs` now hands `app` down itself. `core/App/doc/adoption.md`.

A `console.warn` here would be noise for the common case — every demo on this page
omits `app` deliberately. The fix belongs upstream, in adoption, and is there.
