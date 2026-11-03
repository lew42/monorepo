The module index: `new Doc({ subject: ui, ... })`, with the nineteen components
as declared `children:` and the Overview built from a prose intro plus a live
preview wall of all nineteen.

## Why `Doc` instead of the old `Page` + `catalog()`

The previous shape was `new Page({ children: [...], initialize(){
this.catalog(); } })` — nineteen children turned into a persistent rail with a
region beside it. `Doc` gives the module an API tab (`ui.table`, `ui.timeline`,
`ui.keys`, the three real exports), a Docs tab (`doc/record.md`, the long
design record) and a Files tab (the whole module's source, browsable in one
tree) for the cost of the split-view rail — `content()` now draws a plain
preview *wall*, not a rail-plus-region, so clicking a card leaves this page for
the component's own url rather than filling a region beside the rail.

## ⚠ `content()` runs bound to the Overview section, not this Doc

`Doc.overview_section()` builds a child page that calls `this.content()` on
*itself* — the section instance, whose own `children` come from `overview:`
(unset here, so empty) rather than this module's real nineteen. `this.previews()`
inside `content()` would therefore draw an empty wall. The fix in this file is
`this.parent.previews()` — `this.parent` is the section's adopting parent, which
*is* this Doc, and owns the real children. Commented at the call site; flagged
in the audit as a trap worth recording in `ext/Doc`'s own docs.

## The 19-tab question

`Doc.bar()` spreads every declared child into the top tab strip between
Overview and API — nineteen tabs, all real urls. Whether that beats the old
rail-plus-region is a genuine judgment call, argued in the audit's
Recommendations rather than settled here.

## Improvements

1. **The `this.parent` trap belongs in `ext/Doc/readme.md`'s Traps section,**
   not just this file's comment — the next module to reach for `this.previews()`
   inside `content()` will hit it fresh. *(simple, important)*
2. **Whether nineteen top tabs is the right shape for this module** — full
   case in the audit report's Recommendations. *(medium, important)*
