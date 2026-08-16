One top tab. It is an ordinary `Page` added as a child, whose own `render()` is a
**vertical** tab set over its children — so the sub sections are real pages at real
urls (`/View/api/append/`), not a view mode.

That nesting has to follow the page chain, and it is not optional.
`Page.container()` mounts a child in `parent.regions`, and a page outside the active
chain is `display: none` — rail and all. One page rendering two navs over one flat
set of children cannot work. The long version is in
[`doc/rail.md`](/framework/ext/doc/docs/rail/).

`config` is spread **last**, so any section can replace `render()` — which is
exactly what `overview_section()` and `files_section()` do, neither of them being a
rail.
