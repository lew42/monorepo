`!!value && value.nodeType > 0` — any node: an element, a text node, a document
fragment. Browser-only, deliberately — there is no server-side fallback.

## Used by

`View.append_to()` — the branch that accepts a raw DOM node in place of a
`View`.
