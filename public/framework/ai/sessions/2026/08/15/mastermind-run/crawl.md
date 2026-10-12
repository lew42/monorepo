# Overnight regression crawl — 2026-08-15/16

Fresh headless `chromium.launch()` (Playwright 1.62, never a connected tab).
BFS from `/framework/` and `/notes/`, deduped, capped at 150. Sandbox dirs
(`/alex/` etc.) excluded by design.

- **Crawled:** 150 pages (cap hit; queue had more unvisited links)
- **Passed** (zero console + page errors): 145
- **Failed:** 5

## Failures

| url | symptom | first-seen guess |
|---|---|---|
| `/framework/ai/` | pageerror: `m.agents?.filter is not a function` | **TONIGHT** |
| `/framework/ai/2026-08-15/mastermind-run/` | same pageerror ×2 | **TONIGHT** |
| `/framework/ai/2026-08-15/mastermind-skill/` | same pageerror ×2 | **TONIGHT** |
| `/framework/ai/2026-08-15/layout-overnight/` | same pageerror ×2 | **TONIGHT** |
| `/framework/ext/markdown/` | console 404 on `does-not-exist.md` | pre-existing, by design — page.js:44 demos the missing-file 404 branch; module untouched tonight (last edit 13:52) |

## Regression traceable to tonight — loud flag

**Yes.** `public/framework/ai/page.js` (one of the four shared nav files edited
tonight, 22:19) calls `rail(this)` → `AITask/dashboard.js` → `AITask/card.js`
to render every task, including `layout-overnight`. That task's own
`task.jsonl` (written tonight, 23:12 landing line) has:

```
{"assign": {..., "agents": 10, ...}}
```

`JSONL.assign()` does a raw `Object.assign(this, value)` (`JSONL.js:27`), so
this line clobbers `TaskJSONL.agents` — normally an array built by the
`agent` verb — with the plain number `10`. `AITask/card.js:30`
(`m.agents?.filter(x => x.outcome)`) then calls `.filter` on a number and
throws. `card.js` itself is unmodified tonight (pre-existing, no defensive
check) — the trigger is the data collision, not the shared file's code — but
the shared file is what surfaces it, and it cascades to every dashboard view
that lists this task: `/framework/ai/`, its day rail, `mastermind-run`,
`mastermind-skill`, and `layout-overnight`'s own page. 5 of 150 pages, all
one root cause.

**Not mine to fix** (read-only crawl). Next session: either stop using
`"agents"` as a plain-count key in `assign` lines, or make `card.js`/`stats.js`
defensive (`Array.isArray(m.agents) ? … : []`).

## Not a regression

`/framework/ext/markdown/`'s 404 is an intentional live demo of the
missing-file branch — unrelated to tonight's four files or two new modules.

## Two new modules

`/framework/styles/layouts/400/` and `/framework/ext/LayoutTool/widths/` both
crawled clean: 200, zero console errors, zero page errors.
