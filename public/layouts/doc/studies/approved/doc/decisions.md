# Approved — decisions and record

*Conclusive, not current guidance — the page itself (`../page.js`) is the
current guidance.*

## This page moved out from under you (2026-09-18)

While this task was in progress, a sibling minion (`ai/2026-09-18/imagine-move-2/`)
moved the whole `/imagine/design/layout/` realm to `/layouts/doc/studies/` —
`git status` showed the rename as `R` (staged, not yet committed) partway
through this task, with this file's own path changed from
`public/imagine/design/layout/approved/page.js` to
`public/layouts/doc/studies/approved/page.js` and its internal links already
repointed by that same minion. This decisions file and the live library below
were built at the page's new, real address rather than the old one the task's
own brief named, because the old directory no longer exists on disk — there
was nothing left to edit there. If a reader followed a link to
`/imagine/design/layout/approved/` and found nothing, this is why; the
current address is `/layouts/doc/studies/approved/`.

## The library reads two files it does not own, and writes neither

`library_data()` (`../page.js`) reads `/layouts/browse/items.json` (to borrow
a picture, when one exists) and `/layouts/verdicts.jsonl` through
`/layouts/browse/verdicts.js`'s exported `verdicts` singleton (to know what
has been approved). Both are `/layouts/browse/`'s own files — this page never
writes to either, and never will: **the owner is the only writer of a
verdict** (`verdicts.js`'s own opening comment), and `items.json` is built by
a script from each realm's manifest, not hand-edited.

**Why one shared file instead of a verdicts file just for this page's own
library**, in full: [`ext/Ask/doc/decisions.md`](/framework/ext/Ask/doc/decisions/)
has the complete argument (this page's version is the short one). In short —
a second file would mean the owner's "approve or improve" verdict on
`/layouts/practice/workbench/` could disagree with itself depending on which
page asked, which is exactly the fragmentation the owner's own sentence
("it goes into **an** approved layout library") asks not to have. A file per
realm wins only when a realm's verdicts must be invisible to every other
realm — nothing here needs that.

## Only a url is "in the library" — a browse id is a different question

A verdict's `item` field is either a short catalogue id (`shell-left`, cast
from `/layouts/browse/`'s own wall) or a page's own url
(`/layouts/labs/shells/left/`, cast from that page's own `?` control) — never
both, because the two keyspaces cannot collide (ids never contain `/`; a
page's own url always does — the full argument, with the count that proves
it, is in `ext/Ask/doc/decisions.md`). `library_data()` keeps only rows whose
`item` starts with `/`, so **this section shows pages judged directly, not
every catalogue entry `/layouts/browse/` has ever approved.** A shell judged
only from the wall (its browse card, not its own `?`) does not appear here
yet — pressing Approve on that page's own control is what adds it, which is
the point: the owner's sentence was about clicking through to "a specific
page," not about a wall of thumbnails.

## The picture is borrowed, never generated here

`library_card()` matches an approved url against `browse/items.json`'s own
`url` field and reuses its jpeg when the matched entry is a real screenshot
rather than a wireframe (`entry.wire`). A wireframe is drawn LIVE by browse's
own `Layout` class reading `layouts.json`'s wire spec — reproducing that
renderer here for one card would be the second store this page's other
decision already rejected, in miniature. An approved url with no matching
browse entry at all (true for most of the ten pages this task mounted the `?`
control on, since only three of them were already catalogued) gets a plain
title link — still a real link to the real page, just without a picture until
`/layouts/browse/`'s own inventory grows to include it.

**Fixed 2026-09-18 (`ai/2026-09-18/cleanup-2/`): the jpeg is `entry.shot`
first, the `<id>-1920.jpg` guess second.** The line above used to assume
every matched entry's picture lives at `/layouts/browse/shots/<id>-1920.jpg`
— true for the 97 entries `browse/`'s own screenshot pass took, but the five
`approved-*` entries (this page's own taxonomy, described to `items.json` by
the sibling `browse-on-browse` task the same day) carry their OWN `shot`
field instead, pointing at a jpeg that already lived in THIS module's
`doc/studies/shots/` before `/layouts/browse/` existed. Approving one of them
404'd its thumbnail the moment a verdict landed. `library_card()` now reads
`entry.shot ?? "/layouts/browse/shots/" + entry.id + "-1920.jpg"` — the exact
same fallback `/layouts/browse/page.js`'s own `shot_url` already uses for the
same reason, so a reader never sees two different rules for "where is this
item's picture." Verified live: an Approve pressed for real on
`/layouts/browse/approved-rail-content/` (all five `approved-*` entries share
this page's own url as their verdict key, so any one of the five proves the
fix) rendered a working thumbnail, zero failed image requests on the whole
page.
