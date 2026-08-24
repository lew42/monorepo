# Decisions — ux/Course, 2026-08-21

## Verdict: neither extends nor composes `Wizard`

The brief's own question, answered honestly by prototyping the extend route first
(`class Course extends Wizard`, scratch file, never landed — the evidence below is what it
produced, not an estimate).

**Two seams held.** Flattening `chapters` into a flat `steps` array before `super.render()`
runs is a clean one-method override (`initialize()`), because Wizard already addresses
everything through a single flat `this.index`. And free navigation — click any lesson, the
opposite of Wizard's "disable everything past the current step" — is a clean one-method
override of `step_button()`.

**Two did not.** Wizard's `render()` and `update()` each inline **four** responsibilities
(the rail loop, crumbs, body, controls) in one method, with no seam between them — the same
failure `ux/Auth/doc/decisions.md` names: *"a method that composes three things is a seam per
thing, not one big method three call sites happen to share."* Grouping the rail by chapter
means copying `update()` whole, focus-restore logic and all, to change one of its four inline
bodies. Adding the third region means copying `render()` whole too — there is no "add a
region" seam, only "here are the two boxes." And `advance()` calls `this.done()` on the last
step, which sets `this.complete = true` and makes `step_content()` render Wizard's terminal
`summary()` screen instead of the lesson — exactly wrong for a completed **set** with no
terminal state, so `advance()`/`done()`/`finish()`/`summary()` would all need neutering too.

**Tally:** 7 of Wizard's 11 methods would need touching, and the two that matter most for the
3440 headline — `render()`, `update()` — are full copies, not overrides. That is the fork
extension exists to avoid. `Course extends View` directly; it does not import or instantiate
`Wizard` either — there was nothing left to compose once the two regions Wizard owns
(rail-loop, body) both needed to become three.

## The layout skill's five questions

1. **Container:** a component, not a page — it answers 1 and 3 and takes whatever the
   caller gives it. The demo puts it in a `bleed` stage (`demo.stage(course, steer).ac("bleed")`),
   same as `ux/Tree`.
2. **Size:** full width of its container at every width tested (360/768/1280/3440) — three
   regions is not a fixed size, it is "as many as fit."
3. **Own layout:** `flex v gap` root (progress bar, then a row); the row is `flex wrap gap`
   holding `.rail` (chapters), a `flex: 1 1 16em` reading column, and `.basis` (next-up).
4. **Regions:** three when there's room — rail, reading column, next-up — one or two when
   there isn't. Never four; the progress bar sits above the row, not beside it.
5. **Preview:** `zoom-25` of a live instance (`preview_card`), matching `ux/Tree`'s.

## The rail: a plain list, not `ui/tree`

`ux/Tree`'s value is collapse/expand over a deep hierarchy. A 2-chapter x 3-lesson course
wants every lesson visible all the time — nothing collapses, so `Tree`'s machinery (a `rows`
Map, open/close state, keyboard roving) buys nothing and costs an import. `rail()` groups the
flattened `this.lessons` by `.chapter`, a plain heading + button list, same shape `ui.tree()`'s
own `nodes:` already uses for data, without the component.

## The third region: next-up, not a mini-TOC

The brief offered two options. A mini-TOC of the *current* lesson's own headings is usually
one entry — this content is a screen long by design (the brief's own spec), so a TOC of it is
frequently pointless. "What's next" always has something to say, whether that's the next
lesson in the chapter or the start of the next chapter, and it is one more caller of the exact
`go(lesson)` seam everything else already uses — no second navigation mechanism to keep in
sync.

## CSS: zero new classes

Every region reuses an existing utility or framework word:

- **`.rail`** (`core/Page/Page.css`) — the chapters nav. Its `:has(> .rail)` container query
  is unscoped on purpose (Page.css's own comment), so it fires for *any* element with a
  `.rail` direct child, not only a literal `.page` — exactly the "reuse the machinery, invent
  nothing" the brief asks for. Below 38em it collapses to its own full-width line, same as
  `ux/Tree`'s master-detail rail.
- **`.basis`** (`framework.css`) — the next-up card. "The fixed track beside a fluid one,"
  its own doc comment says, with `--basis` as the runtime override (`.style("--basis", "18em")`)
  — precisely this shape, already built.
- **`ui/crumbs`** — imported for its one CSS rule (`.ui-crumbs a { text-decoration: none }`);
  the breadcrumb markup itself is written at the call site, per that template's own doctrine
  ("there is no `ui.crumbs()`").
- **`ui/progress`** — there isn't one. The bare `<progress>` element is the component
  (Wizard's own comment, copied here because it's still true).

`styles/css-scopes.txt` gets no new line — nothing here minted a class.

## Two bugs, found by driving it (not by reading it)

1. **`rail()` iterated the wrong array.** It walked `this.chapters[i].lessons` (the caller's
   original objects) instead of the flattened `this.lessons` (which carry a `.chapter`
   back-reference). `go(lesson)` handed `this.current` a lesson with no `.chapter`, and
   `lesson()`'s `lesson.chapter.title` threw the instant a rail button was clicked —
   `ui-test`'s headless click caught it (`Cannot read properties of undefined (reading
   'title')`), a static read of the file did not. Fixed by grouping `this.lessons` directly.
2. **The reading column collapsed to a sliver instead of wrapping.** `flex-1`'s basis is
   `0%`, so beside `.basis`'s non-shrinking `18em` on a narrow row, the reading column never
   contributed enough hypothetical width to trigger a wrap — both items just squeezed onto
   one line, one character per line, next to a full-width card. `.flex.auto`'s per-child
   `--column` floor was the wrong tool (it would also override `.rail`'s and `.basis`'s own
   fixed widths — `@layer util` beats `@layer theme` at any specificity, `css` skill). The
   fix is a floor stated once, inline, on the one asymmetric row: `.style("flex", "1 1 16em")`.
   Screenshot evidence: `ai/2026-08-21/ux-course/ux-course-360-tall.png` before/after.

## What "centred" meant, and one more fix past that

The brief's "reading column (measure-capped, centred)" reads as *positional* (rail-left,
column-middle, next-up-right) until you actually look at 3440 fullscreen: `.measure.start`
(Wizard's own choice, "ONE LEFT EDGE") hugs the reading column against the rail and leaves the
next-up card stranded across a dead gap of blank page — exactly the "53% of a screen dead"
failure `core/Page/Page.css` warns about for unbounded tracks. Dropping `.start` lets
`.measure`'s own `margin-inline: auto` centre the column inside its `flex: 1 1 16em` wrapper,
which puts even space on both sides instead of one lump on the right — no CSS of Course's own,
just not opting out of the utility's default. Screenshot:
`ai/2026-08-21/ux-course/ux-course-3440-money.png`.

## Cut

Nothing from the required list. `Wizard`'s `validate()` gate was never available to inherit
(the verdict above), so "mark complete" is a plain manual action with no gate to skip — not a
cut, a consequence of the verdict. Keyboard roving (`Wizard.Keys`'s pattern) was never asked
for and isn't here.
