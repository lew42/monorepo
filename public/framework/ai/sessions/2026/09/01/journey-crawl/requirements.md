# journey-crawl

Verbatim ask (design-crawl minion "journey", part of the overnight
mastermind-design-crawl program):

> crawl the whole site headless, screenshot every reachable page, and build
> the crawl journal at /imagine/design/journey/.

Scope:
- Inventory every dir under `public/` with a `page.js`, excluding
  `framework/core/new/**`, `framework/core/legacy/**`, `framework/ai/**`
  (except `/framework/ai/` itself), and anything under `shots/` or `doc/`.
- Screenshot each at 1280x800, viewport-only, jpeg quality 55 (45 if over
  budget), to `public/imagine/design/journey/shots/<url-as-dashes>.jpg`.
- Detect and skip SPA-fallback error pages
  (`.active-page pre.error` present).
- Build `public/imagine/design/journey/page.js`: shots grouped by realm
  (top-level segment), each a small card image linking to the live url.
  Lead with two totals (shot, skipped).
- File ownership: only this task dir, `public/imagine/design/journey/**`,
  and scratchpad crawl scripts. Do not touch the hub
  (`public/imagine/design/page.js`) or `/imagine/page.js`.
