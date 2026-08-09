**Usage** — every stylesheet on the site loads through it, at module scope. Core:
`View.js:524` (`framework.css`), `Page.class.js:3`, `Sidebar.js`, `App.js`. Exts:
`tabs`, `demo`, `files`, `markdown`, `highlight`, `classdoc`. Plus
`App.stylesheet("/styles.css")` in `app.js:6`.

```js
View.stylesheet(import.meta, "Sidebar.css");
```

**Necessity** — yes, and its being *static and called at module scope* is the whole
design: **the `import` is the loading edge.** A module that styles classes it does
not emit must import the module that does, or its rules apply to nothing:

```js
/* css: .page, .page-title, .page-previews, .page-preview */
import "../Page/Page.class.js";
```

Comment it, or someone deletes it as unused. It will not detect a rename — nothing
without a build step will — but it makes the dependency greppable.

**Simplicity** — right-sized. Two properties that are not optional:

- **It resolves on `error` as well as `load`.** `App` awaits every promise in
  `View.stylesheets`, and a `<link>` that 404s fires `error`, not `load` — an
  unsettled promise there was a permanently blank page with a clean console. Now
  the page renders unstyled and the console names the file.
- **`capture: false` on the `<link>`**, so importing a module mid-capture cannot
  drop a stylesheet into the page.

## Why View loads framework.css, dead last in its own file

The layer order and the base look are loaded by View, not App — so nothing can beat
`framework.css` into `<head>`. Every other stylesheet is injected by a module that
imports View, so View's `<link>` is always first, and its `@layer` statement is the
one that fixes the order for the document.

It was App's, and `Page.css` got there first (App imports Page at module scope, and
imports hoist) — which meant the order was decided by a file that is not about the
order.

The call sits **dead last in `View.js`**, and it has to: `stylesheet()` builds a
View, which runs `append_fn`, which pushes onto `View.previous_captors` — declared
two lines up. Higher in the file it throws "Cannot read properties of undefined".

