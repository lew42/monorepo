# Why tabs left `core/Page`

**Asked as:** *"we have too much in Page.css that could be useful outside a .page…
shouldn't tabs be a component, not defined in Page.css?"*

Measured before moving anything: `.tabs` / `.tab-bar` / `.tab` / `.tab-panel` (plus
`.vertical` and its narrow-screen query) was **~100 lines, 30% of `Page.css`**, and
`Page.tabs()` was 47 lines of `Page.class.js` — for a component with **one live caller
on the whole site**, and that caller (`ext/classdoc`) is itself an ext. A newcomer
reading `Page` top to bottom had no reason to learn a tab bar's url-ownership rules
before reaching `render()`.

**Verdict: extract to `ext/tabs/`, as a `Page.prototype` patch.**

| shape | call site | cost |
|---|---|---|
| a plain function, `tabs(page, names)` | every existing call site rewritten | an API break for one directory's worth of readability |
| a `core/Tabs/` class beside `Page` | unchanged, via a delegator | keeps 47 lines in core just to forward them — half a cut |
| **`ext/tabs/`, prototype-patched** | **unchanged** | ✓ |

The patch was chosen because it is the only option that costs a site *nothing extra to
keep working* — every `page.js` already writing `this.tabs(…)` needed zero edits. It is
also not a new pattern: `ext/highlight` already patches `code`.

## The CSS had to move whole, not just the JS

The harder question was the two `@layer util` rules that named `.tab-panel` and
`.tabs.vertical` — the tab-panel default-page fallback (part of the arrangement
contract) and `.page:has(> .tabs.vertical) { --measure: 78em }`. Leaving either behind
in `Page.css` would have made **core** style a class only an **ext** emits: the exact
undeclarable dependency `styles/readme.md` §8 exists to prevent, since core may never
import an ext to legitimize the reference.

Both rules moved to `tabs.css` in full. Verified: no rule in `Page.css` today names
`.tab-panel` or `.tabs`.

`.tab-panel` also resets `--measure` / `--page-pad`, which are Page's **public
tokens** — reading a token is the declared kind of cross-module dependency, not the
forbidden kind.

## Physics, checked before shipping

- `View.stylesheet()` runs at module scope in `tabs.js`, so the `import` **is** the
  loading edge. `ext/classdoc/classdoc.js` imports it, and `app.js` imports it a
  second time (a side-effect import, same shape as `highlight`) so any `page.js` can
  call `this.tabs(…)` without importing `classdoc` for it.
- Both import sites are ext → ext or site → ext. **Core never imports this module** —
  `Page.class.js` has no reference to `ext/tabs/` anywhere.
- Deep reload and click agree: the patch runs at module-evaluation time, before any
  page constructs, so `this.tabs` exists on the prototype either way.

## The `64em` breakpoint

The vertical rail used to stack at `45em` — a number chosen for the rail's own width,
not the box it sits inside. Measured: `/framework/core/View/api/append/` puts the rail
inside `/framework/`'s topic region (viewport minus a 19em sidebar), so at `45em` the
rail was still vertical inside a 657px region and left 377px for the source panel —
not one full line readable. `64em` (1024px) clears both boxes.

One number, and the fix moved with the file it lives in.
