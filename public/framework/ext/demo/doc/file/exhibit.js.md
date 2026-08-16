The detail-page assembly: `demo.exhibit()` itself, plus the two sugars built
directly over it, `demo.page()` and `demo.tree()`. `demo.layout()` is a third
sugar over the same assembly but lives in its own file (`layout.js`) because it
also needs `ext/layout`'s panel-registration helper and `twin.js`'s card.

## Imports `app.js` for its side effect

`import "./app.js"` patches `demo.app` onto the `demo` function — this file
never calls `demo.app` directly, but `demo.tree()`'s bare stage builds one
(`demo.app(this.tree(), …)`), so the patch has to have landed before this module
is used. No exported binding names the dependency; the import line is the whole
contract.

## `variants()` is one function, called conditionally

`if (page?.children.size) variants(page)` — the only place in this file that
touches `page` rather than the render/definition trio. It's deliberately a
plain function rather than a method, called with `page` as an explicit
argument, because `demo.exhibit()` is a bare function call with no `this` to
read it off of.

## Improvements

1. **`overrides()` and `variants()` are both unexported, private helpers with
   real logic** (a regex-based source scan, a conditional render) that nothing
   else in the module can reuse or test in isolation. Fine at the current size;
   worth naming if either grows past its current few lines. *(simple,
   speculative.)*
2. **The file mixes one primitive (`demo.exhibit`) with two sugars over it**
   (`demo.page`, `demo.tree`) rather than splitting sugar into its own file the
   way `demo.layout` got one. Consistent with keeping related things adjacent,
   inconsistent with `layout.js`'s precedent — worth a line in the readme
   saying which rule wins. *(simple, speculative.)*
