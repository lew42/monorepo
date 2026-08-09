Empty on purpose. The seam between *"the page has loaded"* and *"the app is on
screen"*.

## Usage

`App.js:28` — `instantiate()`, step four. **Nothing in this repository overrides
it.** `config()` has one override (`app.js:48`); this one has zero, in five
sandboxes and the whole framework.

## Necessity

**Weakest member on the class.** It costs one line and buys a hook nobody has
wanted in the year it has existed — and its moment is genuinely narrow: after the
first page rendered, before the app is in the document, so you can measure nothing
and see nothing.

Anything that wants *"after the app is up"* has `app.ready`, which is a promise and
composes. Anything that wants *"before anything is built"* has `config()`.

## Simplicity

Right-sized as code; questionable as API. **An option is API surface forever, and
so is a hook.** The readme carries the proposal — the standing test was *"if a year
passes with only `config()` ever overridden, `initialize()` should go"*, and that
year has passed.
