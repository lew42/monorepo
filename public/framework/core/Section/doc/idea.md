# The idea

**A Section is a page you put inside a page.** That is the whole sentence, and every
other decision in this module falls out of it.

The owner asked for it in those words: *"we need a Section core module. this should be
like a sub page, could extend Page, so it gets all the features, like individual
storage, etc."* So `Section extends Page`, and the features arrive rather than being
written:

| what it gets | where it comes from |
|---|---|
| an address, a name, a title | `Page.naming()` |
| its own storage, keyed on that address | `Page.store()` — `lew42:<url>` |
| children, declared any of the four ways | `Page.declare()` / `Page.add()` |
| regions a child can mount in | `Page.container()` reads `parent.regions` |
| the six page words | `Page.words()` |
| a preview card, `nearest()`, `chain()`, `link()` | `Page` |

Nothing in `Section.js` re-implements any of that. What it adds is **one prop** —
`layout` — and the small amount of drawing that prop needs.

## What it is not

**It is not `Page.Frame`.** The frame draws the chrome around a *whole page* — the bar,
the rail, the panel, the aside — and there is one per page. A Section is one band
*inside* a page, it has no chrome at all, and a page can hold as many as it likes.
A section that wants a rail beside it is not a section with a new feature: it is a
**page with `arrangement: "rail-left"`**, a word that already exists. Writing a second
copy of that word inside Section is the exact defect the paging realm re-found in eight
audits.

**It is not a layout.** A layout is the arrangement of boxes and owns no content (the
owner, addendum 2); a section owns content and no arrangement. It borrows one arrangement
by name from [core/Layout](/framework/core/Layout/) and gives it nothing back.

**It is not a padding control.** The first sketch had one — a button that turned on
default padding, then became a select of padding schemes. The owner replaced it outright:
*"maybe having padding schemes isn't the way. maybe we just have pre-approved layout
schemes. yes, this is It."* There is no padding UI in this module and there should not be
one; padding follows the box already, through the three spacing ramps in `framework.css`.

## Why the class is called Section and the parts are not

`Section` as a **Page** subclass is safe: `Page` is not a `View`, so `View.classify()`
never sees the name and mints no CSS class from it. Every **View** part, though, is
`PageSection*`, minting `.page-section-*`.

That is not caution for its own sake. `.section` is a live rule elsewhere in this repo,
`/blog/Section.js` and `ext/editor/blocks.js` each export a `Section` of their own, and
`/imagine/sections` renamed its whole component to `SectionsBand` specifically to dodge
the collision — *"that is also why nothing here is called Section."* Three modules, three
different Sections. `core/Layout` made the same call one file over, and `styles/css-scopes.txt`
records both.

## Editing is turned on by code

`editing` is `false` on the prototype. A demo page or a doc page calls `section.edit()`
or passes `editing: true`; a visitor has no path to it at all. That is the owner's own
split: *"for demo pages, docs, we turn editing on via code."*

And **a demo does not persist**. Picking a layout writes nothing to `store()` — the
choice lives on the instance and a reload is the page again. Storage works and is
inherited; it is for an editor to call, and an editor has to make saving visible.
