# Decisions — /imagine/feeds/

2026-08-29, the build that answered the owner's embeds/API ask.

## The picker is the page, not a wrapper around it

`uses/inbox/` splits the rail into an `Inbox` (state) plus a `Mail` child (the rail). Here
`video/page.js` is both: its own `content()` is the intro line, and its overridden
`column()` draws the picker rows. One file, one page, because nothing here needs a
cross-column ref — the picker and the player are direct parent/child, one hop, so
`this.parent`/`this.nav_for()` is enough and `is: "topic"` would be ceremony for nothing.

## `data/`'s filter lives on the ancestor column, read by three children

Considered: a filter component duplicated on `Cards`, `Tree` and `Table`. Rejected —
three copies of the same text box and chip row, which is the thing "controls over files"
exists to avoid. Shipped: `data/page.js` owns `rows`/`q`/`facet`, fetches `data.json`
once in `initialize()`, and exposes `filtered()` + a `watch(fn)` pair (the same shape
`uses/inbox`'s `topic.watch()` uses, one hop instead of many). Each view is
`this.parent.watch(() => redraw())` and nothing else.

## `data.json` is fetched, not imported as a JS module

Considered a JSON module import (`import data from "./data.json" with { type: "json" }`).
Rejected for consistency: every other fetch in this codebase
(`framework/audit/browsable/page.js`, `ext/DesignTool/audit/page.js`, `AITask/dashboard.js`)
uses `fetch(url).then(r => r.json())`, and `data/`, `live/` sit side by side making the
same point about the DOM-after-await trap — a JSON import would make one of the two feeds
look like it needs no such care, which is the wrong lesson for a page whose whole point is
showing the trap and its fix.

## The columns tree (`data/tree/`) is hand-built, not real sub-pages

A literal `group → item → detail` built from real `Page` children would need children
generated from `data.json` at construction time — but the data arrives async, after the
page tree is already built. Shipped: one page, local state (`treeGroup`/`treeItem`,
deliberately not `group`/`item` — see below), three panes drawn by hand and re-drawn on
every click or filter change. No url per selection, which is correct here: nobody needs to
bookmark "bridge → Golden Gate Bridge".

**Named away from `group`.** Core's `previews()` reads `page.group` as a category label
for a heading row. Nothing here ever calls `previews()` on `Tree`'s children, so there is
no live collision — but `treeGroup`/`treeItem` cost nothing and remove the question.

## `live/` picks Open-Meteo over restcountries.com

Both are keyless and CORS-friendly. Open-Meteo's numbers change (temperature, wind),
which makes "this is live" visible on a reload; a country's population does not. The five
cities are one request — Open-Meteo accepts comma-separated `latitude`/`longitude` lists —
so the dashboard is one `fetch()`, not five.

## `live/` polls only while it is being looked at (2026-08-31)

The rpc:append seam `stream/`'s lab adopted (one delta over the wire instead of a
whole-file write) does not transplant here — `live/` never writes anything, it is a
GET against a public API. What it lacked instead was the "live" half of its own
name: one fetch, ever. Now `activated()` starts a 60s poll plus a 1s status ticker,
`deactivated()` clears both — a tab nobody is viewing never fetches — and a toggle
flips one flag the poll checks, so `load()` stays the one fetch function either way.
Proved headless: `poll()` while paused leaves `updated_at` untouched, `poll()` while
live advances it, and navigating away calls `clearInterval` exactly twice.

## Verified headless (2026-08-29), all three widths (400 / 1920 / 3440)

- **video/**: 0 iframes on load and on a talk's own page before clicking; 1 iframe with
  the correct `youtube-nocookie.com` `src` after.
- **data/**: 20 rows total. Search `"Paris"` → 3 (Eiffel Tower, Notre-Dame, Louvre
  Pyramid). Facet `skyscraper` → 5. Facet `bridge` on the table view → 2. All three views
  read the same `filtered()` call and agree.
- **live/**: 5 rows on a live network. With `**/api.open-meteo.com/**` aborted via route
  interception: the `.feeds-offline` note renders, 0 weather rows, page never blank.
- **Console**: zero errors on every page except the one tab with the network deliberately
  blocked, where the only two entries are that fetch's own `net::ERR_FAILED`.
