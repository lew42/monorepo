# `Page.class.js`

361 lines, the largest file in the shipped trio, because it carries both the
tree (`declare()`, `add()`, `child()`, `container()`) and `tabs()` — a bar of
links plus a region, with no `Pager` subclass and no per-tab directory.

## Seven declared class fields, and why

`view`, `regions`, `$pages`, `loading`, `default_tab`, `parent`, `app` are
declared with no initializer, purely so `alias()`'s `!(key in this)` guard is
complete — without the declaration, a child named `view` or `$pages`
overwrote real state and blanked the page **on a cold load only** (it worked
on a click, because the property hadn't been written yet). `content`,
`classes`, `col` are handled separately, as a `Set` of reserved names, because
an instance field of those names would shadow a subclass's own `content()`
method.

## `container()` — the one piece of black magic, made observable

Two levels: `this.parent?.regions?.get(this.name)` (a named claim — `tabs()`),
then a walk up for the nearest ancestor's `$pages` (a subtree claim), then
`this.app.$pages`. Kept deliberately after the council round — ten of the
fourteen seats' compound recipes needed it to do something non-default — but
`mounts_in()` logs which claim won, since a reader of the child's own file
cannot otherwise see where it lands.

## `tabs(names)` imports exactly one child

The first, because it has to render at the group's own url; every other tab is
labelled by its **declared name**, never its title, because a title only
exists once that page is imported and which pages are imported depends on
which url you arrived at — the "label depends on what's imported" bug found
independently in four costumes across the council round (see `1/readme.md`).

## Improvements

1. **None ranked.** Line-for-line ancestor of `core/Page/Page.js`; any real
   fix belongs there.
