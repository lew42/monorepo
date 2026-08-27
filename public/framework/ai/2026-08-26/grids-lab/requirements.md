# GRIDS lab — grid-column pairings (task S6b)

## The ask (verbatim)

> TASK S6b — the GRIDS lab: grid-column pairings for column pages, at
> core/Page/overview/columns/examples/grids/.
>
> Read: the owner's ask public/framework/ai/2026-08-26/column-pages/requirements.md (the "large
> column with a grid of small items... small grid column that opens a large column... --measure at
> 3440" paragraph is YOUR spec), core/Page/doc/columns.md (the shipped system), and
> core/Page/overview/columns/finder/page.js (the model consumer).
>
> YOUR DIR: core/Page/overview/columns/examples/grids/ — a stub page.js exists; replace it and
> build child pages under it. You own this dir ONLY.
>
> WHAT YOU BUILD — one child page per pairing, each a small live columns tree, one-line verdict on
> each:
> 1. Large grid -> small item column: a width:"large" column holding a grid of small items where
>    clicking an item opens a width:"small" detail column to the right.
> 2. Small list -> large column: a width:"small" picker column opening a width:"large" content
>    column (the Finder pattern inverted in weight).
> 3. Measure at 3440: a DEFAULT-width column holding ordinary 2-column content — what does it look
>    like at 3440? Show it, measure it. One page, real numbers in the prose.
> 4. Flush wall in a column: a 0-gap 0-pad grid (flush) filling its column edge-to-edge vs the
>    padded version — when does flush read better?
>
> Grid backgrounds: use only --wash/--tint/--surface, never --well. Keep content short — no
> accidental scrollbars. Every new class: your prefix via new-css-class.
>
> VERIFY: headless at 1280/1920/3440, zero console errors; screenshot each pairing at 1920 AND
> pairing 3 also at 3440; link all in task links. Append one log line per pairing to task.jsonl
> with the verdict.

## Scope

1. Read requirements/doc/model consumer.
2. Run code, css, layout skills.
3. Build 4 child pages under examples/grids/ (one per pairing), each a live columns() tree.
4. new-css-class for every new class.
5. Headless-verify at 1280/1920/3440, zero console errors.
6. Screenshot each pairing at 1920, pairing 3 also at 3440.
7. Log one verdict line per pairing to task.jsonl.
8. documentation + finish-task.

## Fences

- Own core/Page/overview/columns/examples/grids/ ONLY. Do not touch examples/page.js,
  examples/looks/**, or anything else — siblings are editing other parts of core/Page concurrently.
- Never kill/restart the dev server; never drive the owner's live tabs (headless only); never git
  stash; never commit.
