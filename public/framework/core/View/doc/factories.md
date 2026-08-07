# Why factories are a `const` destructure and not a Proxy

```js
export const { el, div, p, h1, … } = View.elements();
```

A `Proxy` would give every tag for free, including future ones. It was rejected:
a named export is greppable, tree-shakeable by a reader (not a bundler — there
isn't one), and it fails **loudly** on a typo. `dvi("x")` is a `ReferenceError` at
import; through a Proxy it is a silent `<dvi>` element.

The list is long and boring, and boring is the point.
