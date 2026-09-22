# lists — six ways to show one group → member → detail list, side by side

The study page is [`/framework/styles/system/studies/lists/`](/framework/styles/system/studies/lists/): six 24rem columns —
Rows, Title bar, Accordion, Drill-down, Inbox rail, Launcher — all reading the SAME six
people in the SAME four groups, so a difference between columns is the shape, never the data.
Drag reassigns a person in Rows and Accordion; every column watches the same data and
redraws when it changes, so a drag in one column can move a name that another column shows.

## What is here

- `page.js` — the six shapes, the shared `PEOPLE`/`GROUPS` fixture (copied from
  `/imagine/team/`, grouped by role — that fixture has no notion of a "team", so role is the
  one grouping it already supports), the drag (`MemberChip`, one class shared by Rows and
  Accordion), and the notes fold at the bottom.
- `lists.css` — `.lists-*`. The fixed-24rem row and its container-query stack at ≤40em, and
  each shape's own small mechanism (the flush accordion, the sliding sheet, the split rail).
- [`doc/decisions.md`](./doc/decisions.md) — the `lists-` prefix reservation (css-scopes.txt
  is outside this module's fence) and what was decided.

## Use

Open the page and press something in every column — each one's own line says what a press
does and prints the deepest level's content width, measured live off the real DOM. The fold
at the bottom, "Notes", has one line per shape (where it wins, where it fails) and the
sentence on which shape fits the site's own sidebar.

## Watch out

- **A container can't restyle itself from inside its own `@container` query.** `.lists-row`'s
  own `flex-direction` rule silently never applied while `container-type` lived on `.lists-row`
  itself; moving the container one level up, to `.lists-row-host`, made `.lists-row` a real
  descendant and the rule started working. [`doc/decisions.md`](./doc/decisions.md).
- **Setting `open` on a fresh `<details name>` fires its own `toggle` event, same tick** — the
  accordion's naive handler re-triggered its own redraw forever (7,384 rebuilds measured in
  300ms) until it only redraws on an actual group *change*, never a same-group restate.
  [`doc/decisions.md`](./doc/decisions.md).
- **One `requestAnimationFrame` is not enough for a measurement taken during `content()`.** The
  page's own subtree isn't attached to the live document yet when that first frame fires, so a
  single-shot rAF measures a disconnected node forever on a cold load with no interaction — it
  only ever "worked" by accident, once, when something else redrew later. The fix retries
  across frames until the target is actually connected. [`doc/decisions.md`](./doc/decisions.md).
- **A closed accordion panel has no drop surface.** The drag's drop target is the always-visible
  `<summary>` header, not the panel body — a closed group can still be dragged onto.

## More

- [`doc/decisions.md`](./doc/decisions.md) — the prefix reservation, the three bugs above in
  full, and the shapes' own scope choices (which ones reach a member's detail and why).
- [`/imagine/team/`](/imagine/team/) — the six-person, four-role fixture this page reuses.
- [`ui/accordion/`](/framework/ui/accordion/) — the `name`-grouped `<details>` mechanism this
  page's shape 3 borrows.
