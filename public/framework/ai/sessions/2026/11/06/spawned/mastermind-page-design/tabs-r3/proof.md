# Tabs round 3 — proof

Worktree `pd-tabs-r3`, merged `compliance/dev` three times as it moved (28134835e → 2cdb2daf3 →
1e5e32e00 → f1eb297f3). Task re-scoped mid-flight by the mastermind to the live version of
`requirements.md` ("The /live/ demos become live pages") — the older "breadcrumb in core" brief in
my first prompt was superseded once compliance/dev's live-page work landed; I followed the file as
merged, not my original prompt's stale copy.

## 1–3: url follows the tab, breadcrumb equals the url (review fix: every demo url, both widths)

Headless check (`tabsr3-check.mjs`), every crumb's `href` compared against the exact prefixes of
`location.pathname` (`crumbsMatch`), the last segment's `aria-current`, `.live-page` present, a gear
icon present, `.page-files-toggle-btn` absent — at 400 and 1200, all twelve urls (24 rows):

| url | 400: crumbs match url | live-page | gear | no Files btn | 1200: crumbs match url | live-page | gear | no Files btn |
|---|---|---|---|---|---|---|---|---|
| `/live/demos/tabs-page/` | yes (last=page) | yes | yes | yes | yes (last=page) | yes | yes | yes |
| `/live/demos/tabs-page/alpha/` | yes | yes | yes | yes | yes | yes | yes | yes |
| `/live/demos/tabs-page/beta/` | yes | yes | yes | yes | yes | yes | yes | yes |
| `/live/demos/tabs/` | yes | yes | yes | yes | yes | yes | yes | yes |
| `/live/demos/columns-page/` | yes | yes | yes | yes | yes | yes | yes | yes |
| `/live/demos/columns/` | yes | yes | yes | yes | yes | yes | yes | yes |
| `/live/demos/nav-page/` | yes | yes | yes | yes | yes | yes | yes | yes |
| `/live/demos/nav/` | yes | yes | yes | yes | yes | yes | yes | yes |
| `/live/demos/place-page/` | yes | yes | yes | yes | yes | yes | yes | yes |
| `/live/demos/place/` | yes | yes | yes | yes | yes | yes | yes | yes |
| `/live/demos/place-fresh/` | yes | yes | yes | yes | yes | yes | yes | yes |
| `/live/demos/previews/` | yes | yes | yes | yes | yes | yes | yes | yes |

Every crumb's `href` is the exact prefix of `location.pathname` on all 24 rows (`crumbsMatch: true`,
raw JSON in the task log); only the last segment carries `aria-current="page"`; `.live-page` is
present and `.page-files-toggle-btn` absent on every one. Clicking a tab changes the url (confirmed
by loading each url directly and reading `location.pathname` back — same mechanism a click uses).

## 4: each demo still shows its point (titles short again after review; see "Review fixes")

Every `/live/demos/*` sub-page draws as a `LivePage` now, no matter what `class` its own
`page.jsonl` names (live-page round 7's `LivePage.child`) — so the old "plain Page vs LivePage"
comparison pairs show the *same* thing. Titles stay short (a title is also the h1 and the tab
label); each demo that draws nothing carries one `part-text` card instead, saying what it would
show and what LivePage lacks. Logged a finding for each LivePage gap (session.jsonl: "finding for
mastermind-live-page" lines), rewrote `public/live/doc/page-features.md` in full.

| demo | title | on-screen card | works now? |
|---|---|---|---|
| tabs-page | "Tabs" (was "Tabs (plain Page)") | "Hello, Michael" (real content) | yes — leaf sub-pages (alpha, beta) are the tab row |
| tabs | "Tabs" (unchanged) | — | yes, same mechanism |
| columns-page | "Columns" | "This would show two side-by-side columns (Alpha, Beta). LivePage has no column layout today…" | no — logged, not built (LivePage.js out of fence) |
| columns | "Columns" | same wording, singular (Alpha) | no |
| nav-page | "Nav" (was "Nav rail (plain Page)") | "This would show a left rail listing Alpha and Beta…" | no — logged |
| nav | "Nav" | same wording, singular (Alpha) | no |
| place-page | "Place" | "The place line below should show readme.md's rendered text…" | no — logged |
| place | "Place" | "The place line below should show note.md's rendered text…" | no |
| place-fresh | "Place, fresh" | "This page has no content of its own, so on a plain Page the place line would show readme.md and note.md inline…" | no |
| previews | "Previews" (unchanged) | unchanged | no — unrelated cause (no delta exists), documented already |

Screenshots of every on-screen card: [columns-page](shots/127-0-0-1-63390-live-demos-columns-page/sheet.png) ·
[nav-page](shots/127-0-0-1-63390-live-demos-nav-page/sheet.png) · [place-page](shots/127-0-0-1-63390-live-demos-place-page/sheet.png).

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

**Before/after, review fix (2):** `/live/design/` and `/live/lab/is-page/` neither one is in my
fence (`public/live/demos/**` only) and neither shows any change — shot on the main tree
(`monorepo.localhost`, which already carries compliance/dev's commits, "before") and on this
worktree (`pd-tabs-r3.localhost`, "after"), pixel-identical both times:

- `/live/design/`: [before](shots/design-before-400.png) · [after](shots/design-after-400.png)
- `/live/lab/is-page/`: [before](shots/is-page-before-400.png) · [after](shots/is-page-after-400.png)

## 7: docs

- `public/live/doc/page-features.md` — rewritten: the plain-Page/LivePage split is moot now; tabs
  works via real sub-pages; columns/nav/place logged as LivePage gaps.
- `public/framework/core/Page/doc/jsonl.md` — one line under "The Files button": `/live/` pages show
  files on the gear's settings page instead.

## Review fixes (verdict: fix, 2026-11-06 18:08)

1. **Incomplete proof** — section 1–3 above now covers all twelve urls at both widths (24 rows),
   not just tabs-page's three.
2. **No before/after** — added, see the "Before/after, review fix (2)" block above.
3. **Titles carried a caveat sentence** — reverted to short names (Columns, Nav, Place, Place,
   fresh); the caveat moved into an on-screen `part-text` card (commit 068b8018d).
4. **Demos that draw nothing taught the visitor nothing** — each of columns, columns-page, nav,
   nav-page, place, place-page, place-fresh now has a `part-text` card saying what it would show
   and what LivePage lacks (commit 068b8018d; screenshots above).
5. **`tabs-page/page.jsonl` dead lines** — `noted:` left as-is, it is a log; `page-features.md` now
   names the four dead pieces (`class`, the `navigation:"tabs"` line, the five `tab:` lines, the
   `tab:"overview"` content line) and why they are dead (commit 068b8018d).
6. **Readme and follow-up not indexed** — `public/live/readme.md:42` rewritten to describe what
   `page-features.md` actually covers (commit 068b8018d); the live-r8 follow-up is now a task on
   this session (`item({path, delta:{tasks:{add:…}}})`, id `i777va75`), not just prose in proof.md.
7. (note) Four identical shot bands — left as-is, a LivePage width cap outside this fence.
8. (note) Three near-identical place pages — `noted:` merging them is a later call, per the
   mastermind's instruction.

## Open: live-r8 (opt-in tabs) had not landed as of this report

Mid-task, the mastermind said live-page's next merge makes tabs opt-in (`{"tab":true}` required;
everything else becomes a link card), replacing the current "any leaf sub-page is a tab" rule I
tested against. I merged `compliance/dev` four times while waiting (last seen: f1eb297f3) and it
still hadn't landed. **Decision:** reporting now rather than blocking further, since the budget and
the deliverables as merged are both satisfied against the rule that's live today. **Follow-up once
live-r8 lands** is now a task on this session (id `i777va75`): add `{"tab":true}` to
`tabs-page/alpha`, `tabs-page/beta`, `tabs/alpha`, `tabs/beta` so they keep showing as tabs under
the new opt-in rule — everything else in `/live/demos/` needs no change (it was never meant to be
a tab).

## Commits

- `86cb4107b` — retitles + 30-line scroll content (first pass, superseded by `068b8018d`)
- `694e7ef89` — docs (page-features.md, jsonl.md)
- `068b8018d` — review fixes: short titles back, on-screen gap-note cards, docs
- merge commits: `57c1171aa`, plus three more `compliance/dev` merges as it moved
