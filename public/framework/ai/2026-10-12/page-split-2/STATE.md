# page-split-2: STATE (steps 5-6 done)

Columns and Links are out of `Page.class.js`, one commit each on `worktree/page-split-2`. Step 7 (jsonl) is out of scope here and stays open in [split-plan.md](/framework/core/Page/doc/split-plan.md). Follows [page-split-1](/framework/ai/2026-10-12/page-split-1/STATE.md).

## Measure (`node public/framework/core/Page/doc/split-measure.mjs`)

| After | Page.class.js lines | code | comment | blank | methods | New file |
|---|---|---|---|---|---|---|
| before (end of page-split-1) | 1315 | 830 | 235 | 250 | 114 | |
| 5 Columns | 1173 | n/a | n/a | n/a | n/a | `Columns.js` (`PageColumns`, 162 lines) |
| 6 Links | 1086 | 690 | 191 | 205 | 114 | `Links.js` (`PageLinks`) |

Net this task: 1315 to 1086 lines (-17%), code 830 to 690. Whole split so far: 2270 to 1086 (-52%). Method count stays 114 because every moved method keeps a facade on Page.

## Proof per step

- **Columns (5):** old (`monorepo.localhost`) against new (worktree server) in headless Chromium at 400/1200/1920/3440 on about 20 pages, including `/imagine/paging/`, `core/Page/overview/columns`, a markdown page, `/framework/ai/` and a session page. Column count, widths and `.page-column-body` structure were identical (0 diffs), and so was click first item, back button, reload on the deep link.
- **Links (6):** same old-vs-new comparison on `/framework/ext/markdown/open/` and `.../open/columns/` (400/1200/1920), the Finder demo and `/framework/ai/` (400/1920): click an `.md` link, back, forward, reload; URL, column count, `.page-swap` count and link count matched every time. `check_page` on both markdown demos, the columns demo and `/imagine/paging/`: 0 page errors, 0 JS errors; the only errors are 404s for missing gitignored data files.
- **Smoke:** `node Server/smoke.mjs <worktree> --port 57899` after each step: 0 JS errors. The only FAIL lines (`/framework/`, `/framework/ai2/` and the page linked from them) are 404s for the worktree's own gitignored data files (`directory.json`, `settings.jsonl`, `weight.jsonl`, `page.jsonl`); they fail the same way before the change.

## Decisions (alternative in brackets)

- `PageColumns` and `PageLinks` follow the part shape of page-split-1: `new this.constructor.Columns({ page: this })`, attached as `Page.Columns` / `Page.Links`, so a subclass can swap one. They call back through `this.page.*`, so a page that overrides `column(host)` or `open_link` still wins.
- Facades stay for every moved method, not only the three the brief names (`columns`, `column`, `column_host`; `open_link`, `swap_link`): `swap_url`, `md_files` and the statics `md_page`, `md_file`, `md_url` too, because docs and pages call them. [Removing the extras would break those callers for under 10 lines saved.]
- `child_md`, `md_folder`, `fs_folder`, `md_dir` stay on Page: they are about the page's folder and are used outside the link path. [Moving them into `Links.js` was the alternative; the plan did not require it.]
- `Links.files()` still loads `Markdown.js` lazily with `import()`, as before, so there is no new import cycle.

## Pre-existing, not caused by this task

- `/imagine/paging/templates/` and `/framework/ai/cards/` show an error page on old and new alike.
- The headless browser sometimes reports "Page crashed" late in a long probe at 3440 or 1920 (about 3 times in ~60 runs, on both old and new). It does not reproduce when the same page is loaded alone (5 runs, no crash, same timings old vs new), so it is browser memory, not the code.
- `check_page` once returned a blank screenshot for the columns demo; the DOM probe showed the columns present, so it is a screenshot timing artifact.

## Open

Step 7, Jsonl (470 lines, the core path of every page, replay order matters): later task, see [split-plan.md](/framework/core/Page/doc/split-plan.md).
