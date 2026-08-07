# `stylesheet()` — the import is the loading edge

Static, called at module scope. Because of that, **a module that styles classes it
doesn't emit must import the module that does**, or its rules apply to nothing:

```js
/* css: .page, .page-title, .page-previews, .page-preview */
import "../Page/Page.class.js";
```

Comment it or someone deletes it as unused. It does not detect renames — nothing
without a build step will — it makes the dependency greppable, which is the win.

**It resolves the promise on `error` as well as `load`.** A 404'd stylesheet used
to leave a promise that never settled, so `inject()` never ran and you got a blank
page with a clean console. Now the page renders unstyled and the console names the
file.

**Resolve module-relative urls against `import.meta`, never the document.** The SPA
fallback makes the document url the *route*, not the file's location — so a
document-relative path is wrong on *every* load, not just deep ones. That's what
makes it easy to miss: the one page you tested was the one at the right depth.

## Why View loads framework.css, dead last in its own file

The layer order and the base look are loaded by View, not App — so nothing can
beat `framework.css` into `<head>`. Every other stylesheet on the site is injected
by a module that imports View, so View's `<link>` is always the first one, and the
`@layer` statement in it is the one that fixes the order for the whole document.

It was App's, and `Page.css` got there first (App imports Page at module scope,
and imports hoist) — which meant the order was decided by a file that isn't about
the order. Importing View now means importing the framework's CSS; the two were
never separable in practice.

The call sits **dead last in `View.js`**, and it has to: `stylesheet()` builds a
View, which runs `append_fn`, which pushes onto `View.previous_captors` — declared
two lines up. Higher in the file it throws "Cannot read properties of undefined".
