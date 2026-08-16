Enumeration and loading over the same underlying rows: `dashboard(page)` for
one day (grouped by state), `rail(page)` for the index across every day
(`active_strip()` first, then every dormant task down one time spine),
`effort_board(page, slug)` for the board filtered to one effort, and
`glance(page)` for a day's own inert thumb on `/framework/ai/`'s tile. The
*shape* of every listing comes from `board.js`; this file decides which rows
go in it.

## Where the rows come from

`tasks(page)` reads `/framework/directory.json` (generated, gitignored) to
find the real subdirectories of one day, falling back to
`page.children.keys()` if the manifest crawl comes back empty — so a day
still shows *something* even when `directory.json` is stale or absent.
`all_tasks()` does the same walk across every date-named child of `ai/` for
the index rail and for `effort_board()`.

## `live` is a callback, threaded down

`dashboard()` passes a redraw down through `tasks()` → `load()` → `manifest()`,
which is what turns a `load()` into a
[`live()`](/framework/ext/JSONL/api/live/). The callback redraws the **whole
group section** (`$d.empty(() => groups(list))`), not one card: a task that lands
has to move from Active to Landed, and re-sorting one card in place is more
machinery than rebuilding a dozen rows of DOM.

`glance()`, `all_tasks()` and `effort_board()` pass nothing, so the index's
dormant spine and the filtered board fetch once — deliberate, since they hold
every task of every day and only the running few change while you watch.

⚠ `list` is assigned with `let` before the `await`, and the callback checks it:
a second batch for one task can arrive while another row is still loading, and
a `const list = await tasks(page, () => …list…)` would be a TDZ error inside a
socket message.

## `active_strip()` re-loads, it does not re-live

The strip is the exception to "the rail fetches": the few tasks that are
running are worth a subscription each. It cannot reuse the instances
`all_tasks()` already fetched — a `live()` on a loaded instance subscribes from
`offset 0` and the server replays the whole file into an object that has
already read it, doubling `logs`/`actions`. So the strip calls `load()` a
second time for those rows only, with a redraw callback, and holds its own
`TaskJSONL` per running task.

Both filters ask `running(t)`: the first picks which rows to subscribe, the
second runs on every redraw — which is how a task that lands while the board is
open falls out of the strip on its own next append. `rail()` asks the negative
of the same question for the list below, so the two sets never overlap.

## Active is the listing, not a pin over a second one

The strip used to sit above effort groups that *also* held the running tasks,
so a live task rendered twice — accepted at the time because dropping it from
its effort would have skewed that group's counts. The dated list has no
groups and no counts to skew, so `rail()` simply subtracts the running rows
from the spine below and each task appears exactly once. (2026-08-16.)

## `effort_board()` is the tag's other half

A card's category tag links to `/framework/ai/effort/<slug>/`; the ai index's
`route()` claims that segment and hands the slug back here. The filter is a
plain `filter(t => t.m?.group === slug)` over `all_tasks()` — the same rows the
board draws, minus everything else — and an unmatched slug says so rather
than rendering an empty page, since a typo and a not-yet-used effort look
identical from here.

## The synchronous-capture pattern, four times

`dashboard()`, `rail()`, `active_strip()` and `effort_board()` all return their
container element immediately and fill it inside `$d.append(() => …)` after an
`await` — the same pattern `AITask.content()` uses, necessary here because
`catalog()`'s `previews()` has no time to await a promise before painting.
`rail()`'s own comment calls out the second-order bug this avoided: cards
built before catalog's mark pass ran would miss it, so `rail()` and
`effort_board()` both call `page?.app?.router?.mark_links()` after filling.

## Improvements

1. **A task that *starts* while the board is open is missing from the strip
   until a reload.** Enumeration is `directory.json`; only logs already on the
   board stream. The day dashboard has the same hole, so the fix belongs to
   both — a `dirs` frame over the socket, or a re-walk on the compose box's
   own success. *(medium, important — it is the one case where the board is
   quietly wrong about what is running)*
2. **`tasks()`/`dashboard()`/`all_tasks()` all assume exactly two levels
   below `ai/`** (`ai/<date>/<slug>/`) — recorded as Open in the readme, and
   `board.js`'s `day_of()` now assumes it too. A sub-tier task would need a
   generalized walk, not a fixed-depth one. *(large, important — only once a
   sub-tier is actually wanted)*
3. **`json()`'s SPA-fallback guard is a fourth copy** of the same check in
   `AITask.js`, `feed.js`, `replay.js` — see that file's Improvements #1.
   *(simple, important)*
4. **`effort_board()` re-walks every task of every day** to show a handful.
   Nothing caches `all_tasks()`, so opening three tags in a row is three full
   walks of `directory.json` plus every manifest. Cheap today (75 tasks, all
   local); a memoized `all_tasks()` is the obvious fix when it isn't.
   *(simple, later)*
5. **`manifest(base, files, live)` silently returns `null`** for a directory whose
   listing includes neither `task.jsonl` nor `session.json` — correct
   behavior, but worth a one-line comment, since the function's shape (two
   conditionals, no else) makes the "neither exists" case easy to miss on a
   skim. *(simple, useful)*
