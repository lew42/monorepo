`!!value && value.nodeType === 1` — an **element** specifically, narrower than
`is.dom` (which also accepts text nodes and fragments).

## Used by

Nothing today — every call site that needs "is this a node" reaches for the
more permissive `is.dom` instead.
