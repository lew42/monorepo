The DOM element this view wraps. Every method on `View` is sugar over `this.el`.

Assigned in `prerender()`: pass one in — `new View({ el: document.body })` — to
wrap an element that already exists, or omit it and
`document.createElement(this.tag || "div")` makes a fresh one. It never changes
for the life of the view: `clone()` and `buffer()` build new elements on new
views rather than swapping this one out.

Reach for it whenever the chainable API runs out — `view.el.focus()`,
`view.el.getBoundingClientRect()`. That is the design: `View` wraps the element,
it does not hide it.
