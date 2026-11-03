Two listeners, wired once, in the constructor.

## Usage

`Router.js:5` — the constructor, and nothing else ever calls it again. There is
no `unlisten()`.

## Necessity

Essential: without it the Router is inert and every link does a full page load.

**One Router per document is assumed and nothing enforces it.** A second Router
would see the same document click and navigate twice. `App` constructs exactly
one (`App.js:56`), which is why this has never bitten.

## Simplicity

Right-sized at four lines. Two subjects — a click and a history pop — but they are
one moment (*"start listening"*), and splitting them gives two names for it.
