# Redesign the ai board as a dated list

## The ask, verbatim (Mike, 2026-08-16)

> the framework/ai/ dashboard should remove the paragraph at the top
>
> all cards should be listed by date, one card per row, remove the grid. add a
> little h4 styled time declaration for current time, put active cards above,
> finished cards below. cards from past days should have a TUESDAY heading to
> it, instead of time of day.
>
> , maybe add a little category tag to each, when clicked, use a dynamic
> route() to filter the list by that category?
>
> the status dot is misaligned, make it align top.

## Reading

The board is one list on a time spine, not a wall of groups. A heading is
emitted only when the label **changes**, so today reads as a run of times
("11:54 AM") and every past day collapses into one weekday ("SATURDAY").
Active above, everything dormant below.

The **effort** (`group` in the manifest) is the category — it already exists,
already names the thread, and needs no registry. The tag is a link; the route
is the filter.

## Files owned by this task

- `public/framework/ai/page.js` — drop the intro prose, add the effort route
- `public/framework/ext/AITask/dashboard.js` — the dated list replaces the effort groups
- `public/framework/ext/AITask/effort.js` — `efforts()` stays (compose reads it), `effort_groups()` goes
- `public/framework/ext/AITask/card.js` — the tag, the dot's row
- `public/framework/ext/AITask/ai.css` — one card per row, dot alignment, heading + tag styles
- `public/framework/ext/AITask/readme.md`, `doc/file/*.md` — the record

## Outline

1. Read the board end to end
2. Drop the intro paragraph
3. One card per row — the grid becomes a column
4. The dated list: active above, finished below, headings on change
5. The category tag on the card
6. `route()` filters the list by category
7. Align the status dot to the top
8. Verify at laptop and 3440 width, and update the docs

## Deferred to phase 2

- Filtering the rail **in place** (a tag click currently opens a filtered page
  beside the rail, which is how a task opens too).
- A category index at `/framework/ai/effort/` listing every effort with counts.
