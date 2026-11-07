# Which Page features voice can actually use

Voice drives a page with one tool, `item({path, delta})` (`core/Page/doc/ai-api.md`). Five features
the owner asked about were tried live under [/live/demos/](/live/demos/), each **twice**: once on a
**LivePage** sub-page and once on a **plain Page** (`class` set to `/framework/core/Page/Page.class.js`),
to tell "Page itself is broken" from "LivePage does not draw it".

**That split is now moot (2026-11-06, tabs round 3).** Since live-page's round 7, every `page.jsonl`
sub-page under `/live/` is built as a `LivePage` regardless of what `class` its own line 1 names
(`LivePage.child`, `LivePage.log_class`) — so the "plain Page" demos draw as LivePage too. The two
columns below now behave the same; the table keeps both links so the old data stays reachable. Titles
stay short (they are also the h1 and the tab label, `readme.md` "One title everywhere") — each demo
that draws nothing now carries a one-line `part-text` card instead, saying what it would show and
what LivePage lacks; the detail is in this doc.

| Feature | Verdict | Delta voice sends | Demo |
|---|---|---|---|
| **tabs** | works — a leaf sub-page (no children of its own) becomes a tab | `{"navigation":"tabs"}` was the old plain-Page delta; on LivePage, tabs come from real sub-page folders | [tabs-page](/live/demos/tabs-page/) · [tabs](/live/demos/tabs/) |
| **columns** | shows as plain tabs — LivePage has no column layout | `{"navigation":"columns"}` (now a no-op on LivePage) | [columns-page](/live/demos/columns-page/) · [columns](/live/demos/columns/) |
| **place** | broken — LivePage ignores the place line entirely | `{"place":"note.md"}` | [place-fresh](/live/demos/place-fresh/) · [place-page](/live/demos/place-page/) · [place](/live/demos/place/) |
| **nav** (left rail) | shows as plain tabs — LivePage has no rail layout | `{"navigation":"rail"}` (now a no-op on LivePage) | [nav-page](/live/demos/nav-page/) · [nav](/live/demos/nav/) |
| **previews** | works since 2026-11-07 — a card shows its `preview` list | `{"content":{"<card>":{"preview":{"add":{…}}}}}` · `{"preview":{"add":{…}}}` on a page | [previews](/live/demos/previews/) · [/live/plan/](/live/plan/) |

## Why, one cause each

- **tabs** — works. A LivePage's tab row is its own real sub-pages that have no sub-pages of their
  own (`LivePage.pages_of`); switching tabs changes `location.pathname` and the breadcrumb (`live-crumb`)
  redraws to match. [tabs-page](/live/demos/tabs-page/) (retitled "Tabs", was "Tabs (plain Page)" — it
  stopped being a useful distinction once LivePage.child started lifting every sub-page) and
  [tabs](/live/demos/tabs/) both show "Tabs · Alpha · Beta", each a real tab.
  **`tabs-page/page.jsonl` is a log, not rewritten:** it still carries its `class` line
  (`Page.class.js`, now ignored — `LivePage.child` lifts it regardless), one `{"navigation":"tabs"}`
  line, five `{"tab":{"name":…}}` lines (gamma through eta) and a `hello-michael` content line tagged
  `tab:"overview"` — all dead, because they only did something under the plain-Page `Frame.js`
  renderer, which LivePage never runs. They stay in the file as history; the live tab row you see
  today comes only from the `alpha/` and `beta/` sub-page folders.

- **columns** — the `navigation: "columns"` word still works on a genuine plain Page elsewhere on the
  site, but every `/live/` sub-page is forced to LivePage, so [columns-page](/live/demos/columns-page/)
  and [columns](/live/demos/columns/) draw the same tab row as the tabs demo (their own `alpha`/`beta`
  children, tabbed) with no side-by-side columns — the `navigation` word is a no-op under LivePage.
  Each now carries a `part-text` card saying what it would show and that LivePage has no column layout.
  **What LivePage lacks:** a column layout equivalent; logged for mastermind-live-page.

- **place** — `Jsonl.js`'s fallback `content()` calls `draw_folder()` → `log_draw()` → `draw_placed(entry)`
  for every `page.placed` entry, but `LivePage.Main` draws only `this.cards` (the `content` List) — it
  never calls `log_draw()`, so a placed file's markdown never appears, on any of the three demos.
  [place-page](/live/demos/place-page/) shows its own content text ("Before the place…") but never
  `readme.md`; [place](/live/demos/place/) and [place-fresh](/live/demos/place-fresh/) are the same.
  **What LivePage lacks:** a call to the page's `log_draw()` so a placed file appears among the live
  cards; logged for mastermind-live-page, not built here (`LivePage.js` is out of this task's fence).

- **nav** (rail) — same story as columns: [nav-page](/live/demos/nav-page/) and [nav](/live/demos/nav/)
  both draw their own `alpha`/`beta` children as a plain tab row, no left rail. Each now carries a
  `part-text` card saying so. **What LivePage lacks:** a rail layout equivalent.

- **previews** — built 2026-11-07: every LivePage card and page has a `preview` List (LivePage.Preview); a card on its parent shows title + preview, its own page shows the preview first ([readme](../readme.md), "Showing things"). `{"previews":{}}` (the core wall) is still not a delta.

## What this means for voice today

Every `/live/` sub-page is a LivePage, full stop — there is no way to opt a sub-page out and get the
plain-Page renderer's tabs/columns/rail/place words to work on it. The one feature that still works
the way voice would want is **tabs**, and it works "for free": make the thing you want tabbed a set of
plain leaf sub-pages (`{"pages":{"add":{…}}}`, `/live/readme.md` "Going into a thing: sub-pages") and
the tab row and breadcrumb come from LivePage itself. `columns`, `nav` (rail) and `place` need LivePage
changes outside this task's fence (`public/live/demos/**` only) — each is logged as a finding for
mastermind-live-page to pick up. `previews` now works: give each card a `preview` list.
