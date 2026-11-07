# Which Page features voice can actually use

Voice drives a page with one tool, `item({path, delta})` (`core/Page/doc/ai-api.md`). Five features
the owner asked about were tried live under [/live/demos/](/live/demos/), each **twice**: once on a
**LivePage** sub-page and once on a **plain Page** (`class` set to `/framework/core/Page/Page.class.js`),
to tell "Page itself is broken" from "LivePage does not draw it".

**That split is now moot (2026-11-06, tabs round 3).** Since live-page's round 7, every `page.jsonl`
sub-page under `/live/` is built as a `LivePage` regardless of what `class` its own line 1 names
(`LivePage.child`, `LivePage.log_class`) — so the "plain Page" demos draw as LivePage too. The two
columns below now behave the same; the table keeps both links so the old data stays reachable, but
the "plain Page" titles have been retitled to say what actually shows.

| Feature | Verdict | Delta voice sends | Demo |
|---|---|---|---|
| **tabs** | works — a leaf sub-page (no children of its own) becomes a tab | `{"navigation":"tabs"}` was the old plain-Page delta; on LivePage, tabs come from real sub-page folders | [tabs-page](/live/demos/tabs-page/) · [tabs](/live/demos/tabs/) |
| **columns** | shows as plain tabs — LivePage has no column layout | `{"navigation":"columns"}` (now a no-op on LivePage) | [columns-page](/live/demos/columns-page/) · [columns](/live/demos/columns/) |
| **place** | broken — LivePage ignores the place line entirely | `{"place":"note.md"}` | [place-fresh](/live/demos/place-fresh/) · [place-page](/live/demos/place-page/) · [place](/live/demos/place/) |
| **nav** (left rail) | shows as plain tabs — LivePage has no rail layout | `{"navigation":"rail"}` (now a no-op on LivePage) | [nav-page](/live/demos/nav-page/) · [nav](/live/demos/nav/) |
| **previews** | broken | none — there is no delta for it | [previews](/live/demos/previews/) |

## Why, one cause each

- **tabs** — works. A LivePage's tab row is its own real sub-pages that have no sub-pages of their
  own (`LivePage.pages_of`); switching tabs changes `location.pathname` and the breadcrumb (`live-crumb`)
  redraws to match. [tabs-page](/live/demos/tabs-page/) (now titled "Tabs", not "Tabs (plain Page)" —
  it stopped being a useful distinction once LivePage.child started lifting every sub-page) and
  [tabs](/live/demos/tabs/) both show "Tabs · Alpha · Beta", each a real tab. The old `{"navigation":"tabs"}`
  and `{"tab":{"name":…}}` lines on `tabs-page/page.jsonl` are dead data now — they did something
  only under the plain-Page `Frame.js` renderer, which LivePage never runs.

- **columns** — the `navigation: "columns"` word still works on a genuine plain Page elsewhere on the
  site, but every `/live/` sub-page is forced to LivePage, so `columns-page` and `columns` draw exactly
  like the tabs demo: a plain tab row over the leaf sub-pages, no side-by-side columns. Retitled both
  to say so. **What LivePage lacks:** a column layout equivalent; logged for mastermind-live-page.

- **place** — `Jsonl.js`'s fallback `content()` calls `draw_folder()` → `log_draw()` → `draw_placed(entry)`
  for every `page.placed` entry, but `LivePage.Main` draws only `this.cards` (the `content` List) — it
  never calls `log_draw()`, so a placed file's markdown never appears, on any of the three demos.
  [place-page](/live/demos/place-page/) shows its own content text ("Before the place…") but never
  `readme.md`; [place](/live/demos/place/) and [place-fresh](/live/demos/place-fresh/) are the same.
  **What LivePage lacks:** a call to the page's `log_draw()` so a placed file appears among the live
  cards; logged for mastermind-live-page, not built here (`LivePage.js` is out of this task's fence).

- **nav** (rail) — same story as columns: `nav-page` and `nav` both draw as plain LivePage tabs, no
  left rail. **What LivePage lacks:** a rail layout equivalent.

- **previews** — unchanged from the last round: there is no delta for it at all (`Page.callable` lists
  only `tab` and `place`); calling `{"previews":{}}` is refused at replay time, not silently ignored.
  Smallest fix: none makes sense for voice — a preview wall is code a page's author writes once.

## What this means for voice today

Every `/live/` sub-page is a LivePage, full stop — there is no way to opt a sub-page out and get the
plain-Page renderer's tabs/columns/rail/place words to work on it. The one feature that still works
the way voice would want is **tabs**, and it works "for free": make the thing you want tabbed a set of
plain leaf sub-pages (`{"pages":{"add":{…}}}`, `/live/readme.md` "Going into a thing: sub-pages") and
the tab row and breadcrumb come from LivePage itself. `columns`, `nav` (rail) and `place` need LivePage
changes outside this task's fence (`public/live/demos/**` only) — each is logged as a finding for
mastermind-live-page to pick up. `previews` stays as described above: use `part-link` cards instead.
