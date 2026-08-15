The DOM element this view wraps. Every method on `View` is sugar over it.

**Usage** — read by every member of the class. Assigned once, in `prerender()`
(`View.js:21`): pass one in — `new View({ el: document.body })` — to wrap an
element that already exists, or omit it and
`document.createElement(this.tag || "div")` makes a fresh one.

Downstream, it is the escape hatch, and it is meant to be used:
`framework/ext/highlight/highlight.js:126` (`arg.el.remove()`),
`framework/ext/markdown/md.js:76`, `framework/ext/toc/toc.js` (heading ids),
`framework/util/markup/markup.js` (`card.el`).

**Necessity** — the class.

**Simplicity** — right-sized. It never changes for the life of the view. That is
the design — **`View` wraps the element, it does not hide it** — and it is why
there is no mirror method per DOM API worth having: for anything the class does
not wrap, reach through `el` and call the DOM.

