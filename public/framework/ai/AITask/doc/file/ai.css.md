Layout only — every look (`surface`, `wash`, `muted`, the tone colors) comes
from `framework.css`. Covers the asks wall, the conversation, the dashboard's usage
meters and pace gauge, the step checklist and segmented bars, the screenshot
wall, the compose box, and the card list used by both the day dashboard and
the index rail.

## The task page is `wide`, and its prose is not

A task page is a wall of ask cards, a conversation with a rail beside it and
four tables of figures — none of which fit the 602px reading column it used to
live in at 1280. `.ai-task` claims the `wide` track (890px at 1280, 1419 at
1920) and one rule caps paragraphs, headings and lists at `--measure`, the same
shape `core/Page/Page.css` uses for column prose.

⚠ **The measure has to be handed back first.** `ext/tabs` sets
`.tab-panel { --measure: none }` — a tab's content is meant to fill its panel —
and this page borrows those classes for its tab bar, so a cap read from the
token inside a panel resolved to `none` and silently did nothing: paragraphs
measured 858px at 1280 with the rule matching and the browser reporting
`max-width: none` (2026-09-17). `.ai-task .tab-panel { --measure: 40em }` is the
one line that fixes it, scoped so `ext/tabs` keeps its own behaviour elsewhere.

## The list is a column, and the card spends the width

`.ai-list` was `.ai-cards`, a `repeat(auto-fill, minmax(min(44em,100%),1fr))`
grid that became three columns at 3440. It is now a flex column: one card per
row (the owner, 2026-08-16), and the width goes into the card's own three regions
instead of a second track — at 3440 a card's outcome line stops clamping and
reads whole. **`container-type: inline-size` had to come with it**: the card's
own `@container (width < 44em)` stacking query measures this box, and dropping
it would leave every card three-columned inside a 34em rail.

## The card list earns its comments

`.ai-card` and the `.page-catalog > .ai-index-rail` block each carry a
`⚠`-tagged comment recording a specific regression: a ragged row from an
unclamped pill (`.ai-link`), a bleed inset that fell through because the rail
used a different class than `catalog.css` expected, and a rail that read as
its own scrollport to `DesignTool` when it shouldn't have. Each is the kind of
thing that would silently reappear on the next refactor without the note.

## The dot nudge is a `translate`, and that is not a style choice

`.ai-who .ai-dot` centres the state dot on the title's **first line** —
`calc((1lh - 100%) / 2)`, half the line box less half the dot, so it needs no
magic number and survives a type-scale change. It cannot be a margin:
`framework.css`'s `.flex > * { margin: 0 }` lives in `@layer util`, which
outranks every rule in this file no matter how specific. The first attempt was
`margin-block-start: .45em` and it computed to `0px` with nothing in the
console.

## The intro region must be told to stretch

The "nothing selected yet" block turns the catalog into a column, which
silently reinterprets `catalog.css`'s `align-items: flex-start` from the main
axis to the cross one — so `.page-catalog-pages` shrink-wrapped. It went
unnoticed while the intro held a paragraph; the moment that prose was removed
the region measured 52px and broke the word "AI" across two lines.
`align-self: stretch` is the fix, and the comment says why.

## Two states worth knowing about

`.page-catalog:has(> .ai-index-rail):not(:has(...active-page...))` — the
"nothing selected yet" state — inverts catalog's own "is anything showing?"
check to give the rail the whole region (with the intro above it) rather
than a 34em column beside empty space. The util-layer rule right after it
hides a day's own catalog region while one of its tasks is the active page,
so the day doesn't render twice.

## Improvements

1. ~~**`.ai-compose-effort`/`.ai-compose-model`/`.ai-compose-name` each restate
   `width: auto`**~~ — resolved. `framework.css` gained a real `select.auto {
   width: auto }` utility (2026-08-28), so the two `<select>`s
   (`.ai-compose-effort`, `.ai-compose-model`) wear `auto` and need no rule
   here at all; only `.ai-compose-name`, an `<input>` and so not a `<select>`,
   still restates `width: auto` on its own line — one override, not three,
   and the shared class the old note asked for already exists (2026-09-18).
2. **The file is over 200 lines**, well past the module's own "most files
   under 100" guideline — but it's one `@layer theme` block covering seven
   fairly distinct UI pieces (log, dashboard, checklist, compose, cards, rail,
   catalog states) rather than one bloated rule. Splitting it by piece (e.g.
   `card.css` beside `card.js`, matching `feed.css`/`feed.js`) would shrink
   each file and make the file-to-file pairing consistent across the module —
   right now `feed.js` and `message.js` both draw from `ai.css` *and*
   `feed.css`, which is already a little tangled. `board.js` arriving without
   a `board.css` makes the case slightly stronger. *(medium, useful)*
3. **`.ai-link` and `.ai-tag` share one pill declaration but differ by three
   properties** the tag restates below it. Two pills is fine; a third caller
   wanting the shape should get a real `.ai-pill` rather than a longer
   selector list. *(simple, speculative)*
