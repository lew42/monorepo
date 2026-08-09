Logo and wordmark. **Also the name of the property that replaces it.**

## Usage

- `Sidebar.js:39` — `bar()`, the only internal caller.
- `framework/page.js:24` — replaced:
  `header: () => this.app.brand(this.title, this.url)`.

That second line is how the site's own brand gets into core's component without
core knowing the site exists.

## Necessity

Keep as a default, and the default is doing real work: with neither `brand` nor
`logo` set it emits an empty `.brand` box, so the bar keeps its height and the
toggle stays where it is.

**Named `header()`, not `brand()`, so it cannot collide with the `brand`
property** — the assign-based constructor would have one shadow the other.

## Simplicity

Right-sized, and **replaced rather than configured**. Passing `header` shadows the
method; there is no `header_class`, no `brand_render` option. An option is API
surface forever, and the override lever already covers it.

**Pass a function, never a View.** A View built to be handed in is constructed
*before* the Sidebar captures, so it lands wherever the captor happened to be and
then gets moved — the async-capture failure in synchronous clothing. A function
runs *while* the Sidebar is capturing. Use an arrow, so `this` stays the page that
knows the brand.

**`.brand` has two owners** — this method emits it, and so does the site's
`app.brand()`. It works only because a site that passes `header` never runs this
one, and because `Sidebar.css` scopes to `.sidebar .brand`. One class name short of
a collision; in the readme.
