# View — design record

A chainable wrapper over one DOM element. `new View()` → `div`, and every HTML tag
is a function that makes one. The only idea in the file is **capturing** —
everything else is a method.

Each verdict below is the short form. The full reasoning — options weighed, the
bugs that forced it — lives in `./doc/`, one file per question, and the same files
render as note pages under `/framework/core/View/`.

## Decisions

**Can capture survive an `await`?** No, and don't try — `append_fn` restores the
captor the instant your function returns, which for an async function is its
first `await`. Capture synchronously, fill in a callback, or return a promise.
See ./doc/capturing.md.

**How does `append()` know what you meant?** By type — a View, a function, a
pojo, an array, a promise, anything else. An `append(x, { mode })` option was
rejected: the type already says it. See ./doc/append-dispatch.md.

**Why a `const` destructure of factories, not a Proxy?** A named export is
greppable and fails loudly on a typo; through a Proxy, `dvi("x")` is a silent
`<dvi>` element. See ./doc/factories.md.

**Why doesn't `classes = "docs"` work on a subclass?** `classify()` runs inside
`super()`, before class fields initialize — name the subclass instead. See
./doc/classify.md.

**Why must a stylesheet's promise always settle, and why does importing View load
framework.css?** A 404'd `<link>` fires `error`, not `load`, and an unsettled
promise was a permanently blank page; and the import is the loading edge, so
View's own `<link>` is always first and fixes the layer order for the document.
See ./doc/stylesheet-loading.md.

**Why does `style()` special-case `--x`?** `el.style["--x"] = v` silently does
nothing — custom properties only respond to `setProperty`. See
./doc/style-custom-props.md.

**Why is `this` the view inside `on()` handlers, and where is the listener
registry?** Bound on purpose — use `function`, not an arrow, when you want it.
No registry, deliberately: a registry is memory that must be invalidated. See
./doc/on-binding.md.

**Why do `html`/`text`/`attr` switch on whether a value was passed, never on
whether it differs from what's there?** They used to test both, so setting a
value equal to the current one fell into the getter branch and returned a STRING
mid-chain — `field().text("").attr(…)` on an empty `<textarea>` threw "attr is
not a function". The skip-the-write optimization wanted the comparison; the
return never did.

## Open

- **`html_unsafe` is patched by `ext/highlight`.** Two exts patching one method
  would silently compose in import order. Fine at one; there is no registry and no
  plan for two.
- **No `View` readme existed until mid-2026**, while `new/1/readme.md` held 26KB
  of record for exactly this design. See `framework/readme.md` on why that
  happened.
