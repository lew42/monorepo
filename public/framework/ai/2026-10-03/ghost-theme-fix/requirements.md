# Sortable: the drag ghost loses its font/theme

The owner's ask (dictated to `vscode-mastermind`):

> ext/Draggable/Sortable: while a row is being dragged its font changes; the drag ghost
> is apparently moved out of its page (to body?) and loses the page's inherited
> font/theme. The ghost must keep the look it had (stay inside its own parent, or copy
> the inherited font/colour vars). Repro: put `{"sortable": true}` on a page with a
> content list (content-list drag is now opt-in, commit 9f6bf7ec) and drag a row. Then
> decide which card types are sortable by default: rankings the owner can override.

## What changed

- `Sortable.start()` (`ext/Draggable/Sortable.js`) appended the ghost to
  `document.body`. Fixed: `this.view.el.after(this.ghost)` — the ghost stays a sibling
  of the row it was cloned from, inside every themed/scoped ancestor the row was
  inside, instead of jumping out to the page's default font/colour.
- Chose "stay inside its own parent" over "copy the inherited vars" (the owner's two
  named options) — one mechanism (the DOM itself) beats a growing list of hand-copied
  properties. Reasoning + the live probe's numbers: `ext/Draggable/doc/decisions.md`,
  "the ghost lost its font and colour mid-drag".
- Decided the second ask (default sortable by card type): no type gets an automatic
  default — stays opt-in via `{"sortable": true}` for every page, because the data
  model has no `role`/`kind` field to tell a ranking from a read list, and the owner's
  own "override" language already names the real mechanism (the explicit flag).
  Reasoning: same file, "default sortable stays opt-in for every page/card type".

## Verified

A standalone probe page (two fonts: a themed `Georgia`/blue wrapper around a `Courier`/
red body) loaded headless, dragged via simulated pointer events — the ghost now reads
`Georgia, serif` / `rgb(0, 0, 255)`, matching its row, not the body default. Probe file
was scratch, not committed.

## Scope fence

`ext/Draggable/Sortable.js` (one line changed) + `ext/Draggable/doc/decisions.md` (two
new entries). No other file touched.
