# patterns — what emerged from the corpus

The page that answers "so what?". [`/websites/`](/websites/) is 47 real sites with their
layouts written down one by one; this is all of them counted at once, so a reader can say
what the web mostly does without opening a single record.

**Every number on the page is counted at render, from `site/index.json`.** No digit is typed
into prose anywhere in `page.js` — add a site, re-run `tools/index.mjs`, and the headline,
the bars and the transition table all change by themselves.

## Use

- [`/websites/patterns/`](/websites/patterns/) — the counts: the headline sentence, three
  panels of bars (a whole page, a part inside a page, the shared tags), and the table of
  what each layout becomes at 400.
- [`/websites/patterns/best/`](/websites/patterns/best/) — the judgments, in prose: the one
  site per category that handles its layout best, then three layouts to copy and three to
  avoid. It is the file `best.md` beside `page.js`, served by the page's own `route()` —
  which is a deliberate choice, see below.

## Watch out

- **Never type a number here.** A count in prose is stale the moment a site is added — if
  you need one in a sentence, compute it in `headline()` and interpolate.
- **An id is shown as the record writes it**, then linked through `layout_url()`. No record
  spells an alias today, but the arrow stays for the next rename: the encyclopedia may rename
  an id whenever it likes and the corpus follows by alias. Only a real layout id gets that arrow — the standard's
  alias table also folds trait words like `measure` onto layouts, and showing
  `measure → 1-centered` would claim they are the same thing.
- **The two bars share one scale**, the largest count at either width. That is deliberate:
  it is what makes `1-flow`'s short bar at 1920 and long bar at 400 tell the story.
- **The page counts what the records say, never what they ought to say.** The category
  field was spelled three ways (`documentation`, `docs`, `reference`) until the records were
  fixed on 2026-09-08. If a count here looks wrong, the record is wrong — fix the record and
  re-run `index.mjs`: [`doc/tags.md`](/websites/doc/tags.md)
- **`best.md` is served by `route()`, not by the `.md`-beside-me fallback.** Core will render
  a `.md` file as a page at its own name, but only after a probe for `best/page.js` 404s, and
  that 404 lands in every reader's console. `/websites/doc/` moved to `route()` for the same
  reason. Measured: one 404 before the switch, none after.
- **A verdict in `best.md` is wrapped in `<div class="site-best-verdict">`, and the picture
  comes straight after the heading.** That wrapper is what lets the page put the words and the
  screenshot side by side above 76em (`patterns.css`) — without it every verdict was a 40em
  column with 2,700px of empty screen beside it at 3440 and a 700px-wide, unreadable
  screenshot. Marked-down text inside a raw `<div>` still parses as markdown as long as there
  is a blank line after the opening tag and before the closing one. Keep the wrapper when you
  add a category.
- **Neutral shades are not visible on this page's ground.** The no-change rows in the
  collapse table were painted `--tint` (3.5% black) and then `--wash` (8%), and both
  composited to within a couple of values of the page background — the caption promising a
  shaded row was a lie. They wear the accent at 14% now.

## More

- [The corpus](/websites/) — the wall · [the standard](/layouts/) — what each id means
- [The record, field by field](/websites/doc/schema/) — where `layout`, `sections` and `tags` come from
- Files that matter: `page.js` (the counting and the three panels), `patterns.css` (bars,
  legend, table), `best.md` (the judgments)
