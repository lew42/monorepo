# decisions — /framework/styles/system/studies/lists/

## Open — a line for `css-scopes.txt` that this task could not write

`public/framework/styles/css-scopes.txt` is outside this task's fence, so the reservation is
recorded here instead. The next agent who can write that file adds one line to the
`# imagine` block:

```
lists-       /framework/styles/system/studies/lists (the six list-shape lab: rows, bar, accordion, drill-down,
             inbox rail, launcher)
```

Checked first, as `new-css-class` asks: `grep -rhoE "\.lists[a-z0-9-]*" public --include=*.css
--include=*.js` returned nothing on 2026-09-18, so the prefix was free. View classes minted by
`classify()` were checked the same way (`MemberChip` wears `.member-chip` from `Draggable`'s
own chain, nothing of this module's — the two views this page defines by name, `MemberChip`
extends `Draggable`, never registers a bare class of its own beyond what `Draggable`/`View`
already mint).

## Decided — the data: role is the group, not an invented one

`/imagine/team/page.js`'s `PEOPLE`/`TASKS`/`LANES` are plain module-scope `const`s, never
exported, and that module is read-only for this task — so `PEOPLE`'s six rows are copied
into `page.js` verbatim rather than imported. `TASKS`/`LANES` (the kanban board) are not
needed here. The fixture has no notion of a "team" a person belongs to, only a `role`; rather
than invent a second grouping, **the four groups are the four values of `PEOPLE.role`**
(design engineer ×2, systems ×2, research ×1, writing ×1) — the one grouping the existing
data already supports, and it gives every group a different size for free (a 1-member and a
2-member group both need to read right).

## Decided — which shapes reach a member's DETAIL, and why not all six

The brief's own per-shape lines only ask shapes 4 (drill-down) and 6 (launcher) to reach a
member's detail — matching the owner's three named outcomes exactly ("does it go deeper,
does it launch something, does it switch to a new column"). Shapes 1, 2, 3 and 5 stop at the
members level on purpose:

- **1 (Rows)** is the deliberate baseline — no press at all beyond the drag, testing whether
  indent, weight and size alone read as hierarchy with zero interaction.
- **2 (Title bar)**'s two presses are both about the GROUP (sort, properties), not the person.
- **3 (Accordion)**'s one described press is "open a header"; adding a second, unrelated press
  (open a member) on the same rows as the drag source risked the exact click-vs-drag ambiguity
  the next decision is about.
- **5 (Inbox rail)**'s rail is groups, and its "full view" is that group's members — a third
  level would need to be its OWN thing (a third pane, or a swap inside the view, which shape 4
  already demonstrates); the shape's job here is proving the rail never moves.

## Decided — a drag handle never doubles as a click-to-expand target

`ext/Draggable`'s `grab()` calls `e.preventDefault()` on every `pointerdown` unconditionally,
so there is no free "it didn't move, treat it as a click" the way a plain DOM click works.
Rather than add movement-threshold logic to distinguish a press from a drag on the same
element, shapes 1 and 3 (the two drag shapes) never put a second, click-to-expand gesture on
the row that is also the drag handle — the row IS the drag. Shapes 4, 5 and 6, which have no
drag, use the row's whole area as a plain press.

## Bug, fixed — the accordion's own `toggle` handler looped on itself

Setting `open` on a freshly-created `<details name="lists-accordion">` fires a `toggle` event
on that SAME element, same tick — not only on a real user click. The first version's handler
was `if (e.target.open) { open_id = g.id; redraw(); }`, and `redraw()` recreates all four
`<details>` fresh, including the one that just got `open` set again — which fires its own
`toggle` again. Measured with an instrumented build: **7,384 rebuilds in the first 300ms** of
a cold load, before any user ever touched the page. Minimal reproductions using plain
`document.createElement` + `appendChild` (both attach-then-set and set-then-attach ordering)
did NOT reproduce it — the loop is specific to the real page's actual construction, not the
`name`-grouped `<details>` mechanism in isolation. The fix does not depend on knowing the
exact browser mechanism: the handler now only redraws when the toggle represents an actual
group *change* (`open_id !== g.id`), never a restatement of the group already recorded open —
which is true both for the programmatic "just built this one, mark it open" case and for the
loop's own repeats of it.

## Bug, fixed — one `requestAnimationFrame` is too early for a measurement taken during `content()`

The "deepest content" px readout (`measure()`) scheduled a single `requestAnimationFrame` at
construction time. On a cold load with no interaction, EVERY one of the six readouts stayed
at "—" forever — not a timing fluke: instrumented and reproduced on every run before the fix.
The cause: `content()` runs before this page's own built subtree is attached to the live
document, so the first frame after that synchronous build still finds the target
disconnected, and nothing schedules a second attempt. (The accordion's runaway loop above was
what hid this for a while — with thousands of extra chances, ONE of its measure calls
eventually landed after the page had settled, so shape 3 alone looked "measured" while the
other five sat at "—"; fixing the loop first made the real bug visible on all six.) The fix
retries across up to 30 animation frames (about half a second) before giving up, so the
number is only ever real, never a lucky accident of a later, unrelated redraw.

## Bug, fixed — a container cannot restyle itself from inside its own `@container` query

The layout skill's own warning ("a `@container` rule whose subject IS the box that declares
the container never fires") was read, and the first build still did exactly that:
`container-type` lived on `.lists-row`, and the query's own `.lists-row { flex-direction:
column }` rule (for the "stack at 400" behaviour) silently never applied — measured directly:
`getComputedStyle('.lists-row').flexDirection` never changed at any width, while a sibling
rule targeting `.lists-col` (a genuine descendant) DID apply. `container-type` moved one level
up, to a new `.lists-row-host` wrapper with no other job, making `.lists-row` a real
descendant of the box it's queried against. Fixed and reshot at 400: all six columns stack to
full width, in one column, as intended.
