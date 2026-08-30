# sweep-400

The 400px sweep the program hasn't had. Yesterday's tidy pass proved 138 /imagine/ urls
clean at 1920 (`ai/2026-08-29/imagine-tidy/sweep-urls.json` — reused verbatim). Nobody has
swept them at 400.

## Ask, verbatim

> the 400px sweep the program hasn't had. Yesterday's tidy pass proved 138 /imagine/ urls
> clean at 1920 (sweep-urls.json — reuse that exact url list). Nobody has swept them at 400.
>
> Headless Playwright at 400x800:
> 1. All 138 urls: console errors, HTTP 404s, .md-error's, and horizontal overflow
>    (scrollingElement.scrollWidth > clientWidth; also flag any .page-columns-row whose
>    visible column is narrower than 200px).
> 2. Interactive spot-checks at 400: /imagine/ root (rail one-at-a-time, lands on Start?),
>    mag cover->contents->article path, one screens experiment (title), the game two rooms
>    deep, feeds/video (does the player fit?).
> 3. 12-15 keeper screenshots of the most representative states (good AND bad) into the task
>    dir; a ranked list of defects as log lines (#rank url - what - shot), owner-priority order.
>
> Two numbers that must agree: urls swept vs result lines in sweep-400-results.json.
> Report: clean/dirty counts, top 5 ranked defects, the two numbers, keeper links.

## Scope

- Read-only against the repo; only writes are inside this task dir + session scratchpad.
- Never restart :80 dev server, never drive owner tabs, never stash/commit.
- Working screenshots to session scratchpad (`m400-*`), keepers copied to task dir after.

## Steps

1. Set up: confirm url list, write probe script
2. Batch sweep all 138 urls headless at 400x800, collect per-url results
3. Save sweep-400-results.json (138 result lines)
4. Interactive spot-check: /imagine/ root rail + Start
5. Interactive spot-check: mag cover -> contents -> article
6. Interactive spot-check: screens/title, game two rooms deep, feeds/video player
7. Pick + save 12-15 keeper screenshots to task dir
8. Rank defects, write log lines, write final report
