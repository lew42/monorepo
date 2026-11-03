# Section architecture — a page inside a page, with an approved layout

`Section` is a box inside a page. It `extends Page`, so storage, children, naming and the six page words are inherited. Its one idea of its own is an approved layout from [core/Layout](/framework/core/Layout/), whose named boxes become the section's slots. Main class: [`Section.js`](../Section.js) (`class Section`, plus `Section.Picker`). JSON form: [`example/page.json`](../example/page.json).

## Section extends Page, and adds one prop

**Decided:** `class Section extends Page`. The only new prop is `layout`; storage, naming, children and words are never re-implemented.
**Why:** a sub page should get every page feature, such as individual storage. Inheriting them keeps one copy of each.
**Instead:** a standalone box class, which would copy Page's storage and children and drift.
**Detail:** [doc/idea.md](./doc/idea.md)

## No chrome, no padding control

**Decided:** a Section draws no chrome and has no padding UI. It borrows one arrangement by name from Layout.
**Why:** `Page.Frame` is per whole page; a rail is `arrangement: "rail-left"`, a word that already exists.
**Instead:** a padding-scheme picker, replaced by approved layouts.
**Detail:** [doc/idea.md](./doc/idea.md)

## Editing is off by default, and demos never persist a pick

**Decided:** `editing` is `false` on the prototype; demo and doc pages call `section.edit()`. `pick()` sets `this.layout` and redraws, and writes nothing to storage.
**Why:** visitors never see the control, and a reload of a demo is the page again. Storage works and is inherited, but an editor must call it and make saving visible.
**Instead:** editing on by default, or saving every pick, which leaves state a reader cannot see.
**Detail:** [doc/idea.md](./doc/idea.md)

## The picker is `ext/Dropdown`, subclassed

**Decided:** `Section.Picker` extends `Dropdown` and overrides `chosen()`, `open()`, `option()` and `list()`. The list is a `popover`, in the top layer.
**Why:** a section sits inside `overflow: hidden` boxes, and a top-layer list is not clipped by them. `open()` rebuilds the options each time, because the box may have been resized.
**Instead:** a plain absolute list, clipped by every parent; a list built once, which ignores resizes.
**Detail:** [doc/picker.md](./doc/picker.md)

## A layout below its floor is a row that says why

**Decided:** a layout whose `widths[0]` is above the box is drawn as a `div.page-section-unfit` row with its note. It is not a button and not focusable.
**Why:** a disabled button reads as something the user failed to reach. The row states the need.
**Instead:** a greyed-out button, which teaches nothing.
**Detail:** [doc/picker.md](./doc/picker.md)

## The width rule is `fits()` in core/Layout

**Decided:** `fits(layout, room)` is exported from [`core/Layout/rules.js`](../../Layout/rules.js). Section and the rule both call it.
**Why:** a second copy of the floor check disagrees after one edit. An unmeasured box (`room` 0) fits everything, so the picker is not greyed out before layout.
**Instead:** a second copy inside Section.
**Detail:** [doc/picker.md](./doc/picker.md)

## Layout names the boxes, the page names the children, and they meet by name

**Decided:** `slot(box)` slugs each label (`Main` → `main`), mounts `children.get(name)` there, and registers it in `this.regions`.
**Why:** `Page.container()` already reads `parent.regions.get(this.name)`, so this uses the seam core reads.
**Instead:** a registration or subscription step between layout and page.
**Detail:** [doc/slots.md](./doc/slots.md)

## Unclaimed children still render, and below the floor a section stacks

**Decided:** children not in `regions` mount in declaration order after the arrangement. When `drawn()` returns `null`, `draw()` skips `arrange()` entirely, so the children simply follow each other.
**Why:** content is never silently dropped. A fallback's boxes have other slot names, so content would land where it was not written for.
**Instead:** drawing the fallback's boxes, which puts content in the wrong slots.
**Detail:** [doc/slots.md](./doc/slots.md)

## The box is re-asked by a ResizeObserver, redrawn only on change

**Decided:** `watch()` observes the view; the callback calls `redraw()` only when `drawn()?.name` differs from `drawn_name`.
**Why:** the box has no size on first draw. An unguarded redraw changes the DOM, which fires the observer again: an infinite loop.
**Detail:** [doc/slots.md](./doc/slots.md)

## A child is appended to its slot, never built inside a captor

**Decided:** `mount()` appends `child.render()` and marks it `default`.
**Why:** a Page memoizes its view. On a second draw a captured `render()` appends nothing and the slot comes up empty with no error. `default` is needed because `Page.css` hides an unmarked `.page`.
**Instead:** building inside the captor, which fails silently after one redraw.
**Detail:** [doc/slots.md](./doc/slots.md)

## Every View part is `PageSection*`

**Decided:** the class is `Section` (Page is not a View, so no CSS class is minted from it). Every View part is `.page-section-*`.
**Why:** `.section` is a live rule elsewhere, and `/blog` and `ext/editor` each export their own `Section`.
**Detail:** [doc/idea.md](./doc/idea.md)
