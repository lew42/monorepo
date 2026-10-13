# Layout architecture — a layout is a shape, never content

`core/Layout` is the catalogue of thirty page arrangements, each proven at seven widths. A `Layout` is a `Page` subclass (in [`Layout.js`](../Layout.js)); the thirty are data in [`layouts.js`](../layouts.js), and `page.js` turns each entry into a child page. Checks and proof live in [`rules.js`](../rules.js); the eight test fixtures in [`fixtures.js`](../fixtures.js).

## A layout owns no content

**Decided:** a layout is only its boxes, slots and rules. What fills it is a fixture, poured in at render time.
**Why:** a shape that only looks right with particular text or images is a draft page, not a reusable layout.
**Instead:** a layout with its own sample text baked in. Rejected: the same shape then gets judged by its sample, not by its structure.
**Detail:** [fixtures and approval](/framework/core/Layout/doc/fixtures/)

## Layouts are data, not files

**Decided:** each entry in `layouts.js` becomes a child `Layout` at `/framework/core/Layout/<name>/`. There is no `page.js` per layout.
**Why:** thirty layouts would be thirty near-identical files. Props are all a layout needs to say.
**Instead:** one `page.js` per layout, which duplicates the wrapper thirty times.
**Detail:** [props](/framework/core/Layout/doc/props/)

## Props are plain page props

**Decided:** `columns`, `tags`, `approved` and the rest are ordinary page properties, read directly by `browse()` facets in `page.js`.
**Why:** no schema and no registry means a new filter is one line.
**Instead:** a typed schema with a registry. Rejected: a second system to keep in step with the props.
**Detail:** [props](/framework/core/Layout/doc/props/)

## `room` means a framework word, not a page width

**Decided:** `Layout.words()` is overridden to do nothing, so `room` never stamps a `page-w-*` class.
**Why:** core's `words()` aliases `room` onto `width`, which would stamp `page-w-page` on every layout page.
**Instead:** keep the alias and rename `room`. Rejected: the prop name is what the layouts already say.
**Detail:** [Layout-notes.md](/framework/core/Layout/doc/Layout-notes.md)

## Checks warn, they never block, and run only in dev

**Decided:** `check()` returns warnings for width, contrast and nesting. It runs only on `localhost` and `*.localhost`, and draws a badge, never a refusal.
**Why:** the badge helps the author while building; production stays a plain static page.
**Instead:** a build-time linter. Rejected: there is no build step.
**Detail:** [the rules](/framework/core/Layout/doc/rules/)

## A bounded box must say what happens to overflow

**Decided:** a layout with `grows: false` must declare `overflow`; `prove()` fails it otherwise.
**Why:** a fixed-height box with silent overflow is the most common way a layout breaks on real content.
**Instead:** trust the author's word. Rejected: a declaration nobody checks is the thing this rule exists to catch; `prove()` also confirms some element really scrolls or clips.
**Detail:** [fixtures and approval](/framework/core/Layout/doc/fixtures/)

## Proof is eight fixtures at seven widths

**Decided:** `prove(layout, width)` renders the eight fixtures in a hidden audit host, and runs the 1 · 2 · 3 · 5 · 7 item checks for `wraps: true`.
**Why:** content extremes (shortest, longest, huge image, dark) break different things, and a hidden host measures without flashing the page.
**Instead:** one fixture per layout. Rejected: it passes the easy case and hides the rest.
**Detail:** [fixtures and approval](/framework/core/Layout/doc/fixtures/)

## ⚠ Code mismatches

- ⚠ **`approved` is set by hand in `layouts.js`.** The "Run the fixtures" button only reports findings; nothing writes the date. The readme's `prove()` line and `doc/fixtures.md` say the button writes it. Fix: the owner or an agent sets the date after a passing run.
- ⚠ **`denies` and `accepts`/`allowed_in` are displayed, not enforced.** `check()` runs only the width, contrast and nesting rules; it never reads `layout.denies`. Fix: either enforce them in `check()` or say they are documentation.
