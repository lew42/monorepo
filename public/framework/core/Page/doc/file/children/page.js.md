The "how a tree is defined" guide — one of the five declared-child tabs, and the
one that carries the heaviest load: discovery, presentation and the four
`children` shapes, in that order, ending with a live click-through demo built from
`ext/demo/sample.js`.

## It teaches by contrast, not just by example

Each `code.js` block is paired with a `md()` that names the *cost* of the shape it
just showed — the synchronous-capture trap in `JS: md("…")`, integer-key hoisting,
mutual-import breakage on deep reload — rather than stopping at "here is the
syntax". That is what makes it a guide and not a reference; the reference is
`doc/property/children.md`.

## The demo is the Router's walk, at 1:1 scale

`demo.app(sample(), { nav: true })` is not a simplified illustration — `click()`,
`load_segments()`, `activate()`, `container()`, `mark()` are the same five steps
`Router.js` runs, narrated in the five `md()` bullets underneath. Reading this page
is reading the Router's algorithm without opening `Router.js`.

## Improvements

1. **No `doc/file/children/page.js.md` existed.** *(simple, important — done in
   this pass.)*
2. **The five-step Router walk (`click`, `load_segments`, `activate`,
   `container`, `mark`) is documented here, in a guide about `children`, rather
   than in `core/Router/`'s own module.** A reader looking for how navigation
   works has to already be on this page to find it. *(medium, useful — a link
   from `core/Router/readme.md` back here would close the loop; out of this
   audit's fence.)*
