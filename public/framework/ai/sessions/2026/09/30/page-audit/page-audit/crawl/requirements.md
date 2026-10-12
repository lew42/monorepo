# Crawl every page, record its layout signature (minion brief)

Parent: mastermind-page. Read-only on the site; you write only inside this folder and the scratchpad named below.

## The job
Write one node script, `crawl.mjs` (in THIS folder), that loads every page reachable on the running site and records what its layout looks like. Run it. Return a 10-line summary.

- Site: `http://monorepo.localhost/` (Servex serves it; never `http://localhost/`).
- Browser: `import { browser } from "../../../../../../Server/browser.mjs"` (resolve it from the repo root: `Server/browser.mjs`). Headless, never the owner's tabs. Viewport 1440x900.
- Start from `/`, `/framework/`, `/layouts/`, `/imagine/`, `/web/`, `/notes/`, `/framework/ai/`, `/framework/ai2/`. Follow same-origin `<a href>` found in the rendered DOM (after the page settles: wait for network idle, then 600 ms). Strip hash and query. Only paths that end in `/` or have no extension (skip `.md`, `.js`, `.png`...).
- Cap: `/framework/ai/<date>/<task>/...` task pages are hundreds alike. Crawl at most 15 task pages per day folder, and count the rest as `skipped_similar` under their day. Hard stop at 1500 pages. Concurrency 3 (the machine is shared).
- Per page, record one JSON line in `pages.jsonl`:
  - `url`, `status` (`ok`, `404` if the page shows the framework's not-found, `error` + first console error), `title` (document.title and the first h1 text), `ms` load time
  - `links_out`: the list of same-origin page urls it links to (so inbound counts can be computed)
  - `html_class`, `body_class`, and the class of the app's page container
  - `structure`: every element whose box is ≥ 4% of the viewport area OR is `position: fixed/sticky`, down to depth 8 from `body`: `{tag, cls, id, x, y, w, h, pos}` (rounded ints, cls truncated to 120 chars). Cap 60 entries.
  - `tabs`: any tab strip — elements with `role=tablist`, or a nav/row whose children are 2+ links/buttons with a class containing `tab`: its class, its x/right edge, its `justify-content`, and the x/right of the page's first h1 (so we can tell "tabs sit beside the title" from "tabs pushed right").
  - `nav`: sidebars/rails — left-edge elements taller than 50% of viewport and narrower than 35% of its width: class, x, w.
  - `columns`: count of elements whose class contains `column` or `col-` at the top level of the page container.
- Screenshot each ok page, viewport only, JPEG quality 55, to `C:/Users/mike/AppData/Local/Temp/claude/C--Code-lew42-monorepo-public-framework-core-Page/50d33995-1653-44ed-b51e-fc7c4e478eb5/scratchpad/shots/<slug>.jpg` where slug = the path with `/` → `_` (root = `_root`). Record `shot` in the line.
- After the crawl, write `summary.json`: page count, 404/error counts, `links_in` per url (how many distinct pages link to it), the top 60 urls by `links_in`, and `skipped_similar` per day.

## Never
- Never edit anything outside this folder and the scratchpad `shots/` dir.
- Never drive the owner's open browser tabs; never `git stash/checkout/reset`.
- Don't classify layouts — only record. The mastermind classifies.

## Return
A summary of 10 lines at most: page count, error count, the time it took, the 10 urls with the most links in, and anything odd. Don't paste the data.
