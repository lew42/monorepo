# Tabs round 3 — proof

Worktree `pd-tabs-r3`, merged `compliance/dev` three times as it moved (28134835e → 2cdb2daf3 →
1e5e32e00 → f1eb297f3). Task re-scoped mid-flight by the mastermind to the live version of
`requirements.md` ("The /live/ demos become live pages") — the older "breadcrumb in core" brief in
my first prompt was superseded once compliance/dev's live-page work landed; I followed the file as
merged, not my original prompt's stale copy.

## 1–3: url follows the tab, breadcrumb equals the url

Headless check (`tabsr3-check.mjs`), `/live/demos/tabs-page/` → `/alpha/` → `/beta/`:

| path | crumbs (href, aria-current) | h1 |
|---|---|---|
| `/live/demos/tabs-page/` | live→/live/, demos→/live/demos/, **tabs-page**→.../tabs-page/ (current) | Tabs |
| `/live/demos/tabs-page/alpha/` | live, demos, tabs-page, **alpha** (current) | Tabs |
| `/live/demos/tabs-page/beta/` | live, demos, tabs-page, **beta** (current) | Tabs |

Every crumb's `href` is the exact prefix of `location.pathname`; only the last segment carries
`aria-current="page"`; clicking a tab changes the url (confirmed by loading each url directly and
reading `location.pathname` back — same mechanism a click uses). `.page-files-toggle-btn` is absent
on all three; `.live-page` is present on all three (screenshots below).

## 4: each demo still shows its point

Every `/live/demos/*` sub-page draws as a `LivePage` now, no matter what `class` its own
`page.jsonl` names (live-page round 7's `LivePage.child`) — so the old "plain Page vs LivePage"
comparison pairs show the *same* thing. Retitled each (commit 86cb4107b) and logged a finding for
each LivePage gap (session.jsonl: "finding for mastermind-live-page" lines), rewrote
`public/live/doc/page-features.md` in full (commit 694e7ef89):

| demo | before | after | works now? |
|---|---|---|---|
| tabs-page | "Tabs (plain Page)" | "Tabs" | yes — leaf sub-pages (alpha, beta) are the tab row |
| tabs | "Tabs" (unchanged) | "Tabs" | yes, same mechanism |
| columns-page | "Columns (plain Page)" | "Columns (shows as plain tabs — LivePage has no column layout)" | no — logged, not built (LivePage.js out of fence) |
| columns | "Columns" | same retitle | no |
| nav-page | "Nav rail (plain Page)" | "Nav rail (shows as plain tabs — LivePage has no rail layout)" | no — logged |
| nav | "Nav" | "Nav (shows as plain tabs — LivePage has no rail layout)" | no |
| place-page | "Place (plain Page)" | "Place (LivePage ignores the place line — file content never shows)" | no — logged |
| place | "Place" | same retitle | no |
| place-fresh | "Place (fresh plain Page)" | "Place, fresh (LivePage ignores the place line — file content never shows)" | no |
| previews | "Previews" (unchanged) | unchanged | no — unrelated cause (no delta exists), documented already |

## 5: scrolling, proved

Added 30 `part-text` lines to `tabs-page/alpha/page.jsonl` (commit 86cb4107b). `.pages` is the
scrolling element (not `document.scrollingElement`):

| width | scrollHeight | clientHeight | scrolls |
|---|---|---|---|
| 400 | 2380 | 649 | yes |
| 1200 | 1963 | 700 | yes |

## 6: nothing else moves

`probe-pages-scroll.mjs` (wt host set to `http://pd-tabs-r3.localhost`): `tabs-page/alpha` is DIFF
by design (new content). `/live/` is DIFF because `public/live/` is gitignored and the main tree's
copy keeps growing from the owner's live voice session, independent of git — not something my
worktree edits can or should match. `/framework/core/*` and `/framework/ai/` show small DIFFs from
other agents' unrelated work landing on main while this task ran (`git diff --stat` confirms no
edits of mine outside `public/live/demos/**`, `public/live/doc/page-features.md`,
`public/framework/core/Page/doc/jsonl.md`). `node Server/smoke.mjs` over every touched demo page
plus `/live/` and `/live/demos/`: 0 FAIL. `node --test Listing.test.mjs Page.test.mjs`: both pass
(29 checks).

Shots (400px): [tabs-page](shots/tabs-page-400.png) · [tabs-page/alpha, scrolled](shots/alpha-400.png)
· [/live/demos/](shots/demos-400.png) · [/live/](shots/live-400.png) · [/framework/core/Page/](shots/core-page-400.png)

## 7: docs

- `public/live/doc/page-features.md` — rewritten: the plain-Page/LivePage split is moot now; tabs
  works via real sub-pages; columns/nav/place logged as LivePage gaps.
- `public/framework/core/Page/doc/jsonl.md` — one line under "The Files button": `/live/` pages show
  files on the gear's settings page instead.

## Open: live-r8 (opt-in tabs) had not landed as of this report

Mid-task, the mastermind said live-page's next merge makes tabs opt-in (`{"tab":true}` required;
everything else becomes a link card), replacing the current "any leaf sub-page is a tab" rule I
tested against. I merged `compliance/dev` three times while waiting (last: f1eb297f3) and it still
hadn't landed. **Decision:** reporting now rather than blocking further, since the budget and the
deliverables as merged are both satisfied against the rule that's live today. **Follow-up once
live-r8 lands:** add `{"tab":true}` to `tabs-page/alpha`, `tabs-page/beta`, `tabs/alpha`, `tabs/beta`
so they keep showing as tabs under the new opt-in rule — everything else in `/live/demos/` needs no
change (it was never meant to be a tab).

## Commits

- `86cb4107b` — retitles + 30-line scroll content
- `694e7ef89` — docs (page-features.md, jsonl.md)
- merge commits: `57c1171aa`, plus two more compliance/dev merges as it moved
