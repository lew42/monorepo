`this.children.forEach(fn); return this;` — a thin wrapper, chainable where
`Array.prototype.forEach` (which returns `undefined`) is not. The main reason
to reach for this over `for (const kid of list)` (which also works, via
[`Symbol.iterator`](/framework/core/List/)) is exactly that chaining:
`list.each(fn).each(otherFn)`.
