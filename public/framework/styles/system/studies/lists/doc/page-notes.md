# page.js notes

## Container: layout and data structure

A plain page under `styles/system/studies/` (moved from `/imagine/design/`'s columns row 2026-09-18, `ai/sessions/2026/09/18/imagine-move-2/` — the ordinary page grid applies here now, so `wide` and `bleed` both mean something real; this page still asks for neither). Every box below is a framed thing (a row, a bar, a card), never paint, so it stays inside the column's own padding (`layout` skill, "bleed is for paint"). Size: `width: "full"` claims the whole host row — the six columns below are 2304px of content (6 × 24rem + gaps), wider than the host at every width up to 3440, so `.lists-row` is a horizontal scroller by design; at 1920 all six are one screen tall and reachable by scrolling sideways, never down. Own layout: one flex row of six fixed-24rem columns (`.lists-row`, `overflow-x: auto`); a `@container` query (not a viewport media query, so it reads the COLUMN's real width, not the raw viewport — the same trap Q1 warns about) flips it to a vertical stack under 40em, which is what "at 400 they stack" means: the outer columns host already pages one column at a time under 32em (`core/Page/doc/columns.md`), so my own 40em threshold is comfortably inside that regime. Regions: none — one `content()`, no children. Preview: the default card on /imagine/design/.

### Data structure

`PEOPLE` is copied from `/imagine/team/page.js`, not imported — that module's `PEOPLE`/`TASKS`/`LANES` are plain module-scope consts, never exported, and my fence says team/ is read-only. `GROUPS` is new: the team fixture has four lanes (a kanban status) but no notion of a "team" a person belongs to, so groups are the four values of `PEOPLE.role` — the one grouping the existing data already supports, not an invented one (task log, 2026-09-18). All six shapes below read the SAME `PEOPLE`/`GROUPS`/`group_of`, so "6 members in the data" and "6 rows drawn in shape 1" can never disagree (deliverable's own check) — there is exactly one place a person's group lives, `group_of`, mutated only by `assign_group()`.

### Press mechanics

Two levels of press are used everywhere BELOW rows: a row toggles its own state (open, selected, expanded); a chevron/handle never doubles as a drag grip on the very same element a click listener also owns, because Draggable's `grab()` calls `preventDefault()` on every `pointerdown` unconditionally (`ext/Draggable/Draggable.js`) — there is no free "it didn't move, so treat it as a click" from the browser once that fires. Shapes 1 and 3 (the drag shapes) never ALSO put a press-to-expand on the same element that is the drag handle.

## measure() function: rAF and mount timing

Read a live width off whatever element is the DEEPEST thing currently on screen in a column, and print it into that column's own note line. rAF, not a resize watcher — the column's width is a fixed `rem`, so it only changes when the DOM inside it changes shape (a press), and every press already calls this again.

The FIRST call happens inside `content()`, before this page's own built subtree has been attached to the live document — one `requestAnimationFrame` fires too early and reads `isConnected: false` every time, forever (measured: every one of the six "Deepest content" lines stuck at "—" on a cold load, no interaction). A later call (any press) always worked, because by then the page had settled — which is what hid this for a while: the mount delay outlasts a single frame, so the readout retries across frames until the element is really there, capped so a genuinely gone target still gives up.

## MemberChip drag mechanics

Copied in shape from `/imagine/team/page.js`'s `Chip` (read-only reuse, not an import — team/ is a leaf page, not a module) — grab, hit-test past the dragged row, drop, restore. A drop TARGET is `new Draggable({ view, handle: false, group_id })`; `under()` filters the hit-test down to those (`found => !!found.group_id`), so it never lands on another dragged row. `page` is the Page instance, so `drop()` writes through the one seam, `assign_group()`, that both shapes and any future shape would share.

## Shape 1: Rows

A plain list, drag only. Title level (`.h4`, the compact label size), one line under each member, a hairline between rows, indent per level via padding — and nothing to press. The only gesture is picking a row up: every member row is a `MemberChip`, every group title is a drop target, so this is the baseline "can hierarchy read from indent, weight and size alone, with no box and no toggle at all" shape.

## Shape 2: Title bar

Each group is a `.surface` bar: a bigger title (`.h3` — the contrast with Rows' `.h4` IS the point, "how big is the title" answered two different ways on the same page), a menu button that opens a real sort toggle (name / role — the member rows below actually reorder), and a settings button that shows the group's two properties inline: its id and its member count. Members list underneath, plain, no press — this shape stops at the members level on purpose (its own two presses are both about the GROUP, not the person; pairs naturally with 4 or 6 for the person-level "go deeper").

## Shape 3: Accordion stack

The exact mechanism `ui/accordion` documents: `<details>` sharing one `name`, so the browser (not JS) keeps only one open — see `ui/accordion/accordion.js`'s two rules for the hairline and the flush stack, re-declared here under this module's own prefix rather than imported (ui/ is consumed, never edited, and its CSS is scoped to its own class).

A closed panel has no visible drop surface (the UA hides everything but the summary), so the DROP TARGET is the header — always on screen, open or shut — not the panel body; otherwise "drag onto a closed group" would have nowhere to land (task log, 2026-09-18).

### toggle event bug

Setting `open` on a FRESH `<details name>` fires its own `toggle` event, same-tick, on THIS same element — not only on a real click. Without the `open_id !== g.id` guard, redrawing (which recreates this very element with `open` set again) re-fires it forever: measured 7,384 rebuilds in 300ms before this guard existed, one per animation frame budget the loop could steal (task log, 2026-09-18). The guard reads as "only a SWITCH away from the current group is a real toggle" — the programmatic one restating the group that's already open never qualifies.

## Shape 4: Drill-down

The column replaces itself, a crumb to go back. `view` is a crumb trail (`["groups"]`, `["groups","design"]`, `["groups","design","ada"]`) — the whole shape is "redraw the body from the last crumb", so open/back is one function either direction. The phone regime the owner named: one column, two presses to a person's detail, no drag (drag belongs to the flat shapes, 1 and 3 — a column that is ABOUT to throw its own DOM away on the next press is not where a pointer-capture gesture wants to live).

## Shape 5: Inbox rail

A narrow rail of groups on the left (always visible, press switches which group is loaded) and the rest of the 24rem column as the "full view" — group's members, and pressing one of THOSE swaps the view again to their detail, with its own back link. The rail and the view share the column as one `flex` row, `7rem` + the rest (`--gap` between) — narrow enough to read a group name, generous enough that the view is not the cramped side of the split.

See also: `core/Page/overview/columns/uses/inbox/`

### DOM nesting trap

`$rail`/`$view` must be built INSIDE `$body`'s own capture callback — a plain `div.c(cls)` with no callback self-appends to whatever captor is ALREADY active (here, `.lists-col`), not to the sibling view just built a line above it. Two shapes below (this one and the launcher) actually nest a box inside a box, so both use the callback form for that reason (code skill §1, the capturing trap — this is its "same tick, still wrong parent" cousin, not the after-`await` one).

## Shape 6: Launcher

A flat list identical in shape to Rows (no drag here — the launcher's own gesture is the press, not a second gesture competing for the same row) — press a member and a sheet, `position: absolute` inside a `position: relative` column body, slides up from the column's own bottom edge to cover it. The list underneath is never touched: it is not scrolled, not resized, not re-rendered — only a class toggles on the sheet.

### DOM nesting trap

Same nesting note as the inbox rail above: `$list` and `$sheet` are built INSIDE this callback so they land as children of `.lists-launcher-host` (which needs `position: relative` for the sheet's `position: absolute` to slide up against), not as its siblings.

## content() and container-type

`container-type` lives on the `.lists-row-host` wrapper, one level up from `.lists-row` — a container can't restyle itself from inside its own `@container` query (css skill; measured here too: `.lists-row`'s own `flex-direction` rule silently never applied until it moved to a real descendant). `.lists-row` only needs to be a child of the sized box, not the box itself.
