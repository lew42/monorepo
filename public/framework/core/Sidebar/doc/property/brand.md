The wordmark text. `new Sidebar({ brand: "LEW42" })`.

## Usage

`Sidebar.js:53` — `header()`, guarded: no `brand`, no `.brand-title` anchor at all.

Every demo on this site sets it; `framework/page.js` does not, because it replaces
`header` outright with `app.brand(this.title, this.url)`.

## Necessity

Keep. It is the one-word answer to *"whose sidebar is this"*, and it costs nothing
when absent — the `.brand` box still renders, so the bar keeps its height and the
toggle does not move.

## Simplicity

Right-sized as data. The friction is in the naming: **`brand` the property and
`header()` the method both mean the top of the panel**, and the method is called
`header()` precisely so the assign-based constructor doesn't have one shadow the
other. That is a rule you cannot see from either name.

**`.brand` also has two owners** — this component emits it and so does the site's
`app.brand()`. Same class, two components, which the naming rule forbids. It works
because a site that passes `header` never runs `header()`, and because `Sidebar.css`
scopes every rule to `.sidebar .brand`. One class name short of a collision; the
readme carries it.

Text only. A brand that needs markup is a `header` function.
