Empty on purpose. The first seam a site overrides, and the only one that runs
before anything is built.

## Usage

- `App.js:25` — `instantiate()`, step one.
- `app.js:48` — this site's override: `config(){ lew42(this); }`, which loads two
  fonts and the theme's behaviour.

## Necessity

Essential, and it is essential *because it is empty*. It runs before `render()`,
which is what makes it the only place a `font()` call is still early enough to be
awaited before first paint. Delete it and a site has to override `instantiate()`
and re-spell the six steps.

## Simplicity

Right-sized — the body is `{}` and the name is the whole documentation.

Overriding, not configuring, is the house shape: the assign-based constructor means
`new App({ config(){ … } })` also works, and does the same thing without a
subclass. Both spellings are in the repo.
