Load a CSS file and make the app wait for it. A **static** method, called at
module scope, which is the entire trick:

```js
View.stylesheet(import.meta, "Sidebar.css");
```

Because it runs at module scope, **the `import` is the loading edge.** A module
that styles classes it doesn't emit must import the module that does, or its
rules apply to nothing:

```js
/* css: .page, .page-title, .page-previews, .page-preview */
import "../Page/Page.class.js";
```

Comment it, or someone deletes it as unused. It won't detect a rename — nothing
without a build step will — but it makes the dependency greppable, which is the
win.

## `import.meta`, never the document

The SPA fallback makes the document url the *route*, not the file's location, so
a document-relative path resolves against wherever the visitor happens to be
standing. `View.url(meta, url)` resolves against the module. Same rule as
`md.file()` and `View.load()`, and it is wrong on *every* load rather than just
deep ones — which makes it easy to miss, because the one page you tested was the
one at the right depth.

## It cannot hang the app any more

The promise resolves on **error** as well as load, and warns. A 404'd stylesheet
used to leave a promise that never settled, so `inject()` never ran and you got a
blank page with a clean console. Now the page renders unstyled and the console
says which file. Check there first.
