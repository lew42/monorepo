# Inventory audit — did the fan-out find everything, and what's broken?

Read-only. Checked every page `prior-work.md` links (92 rows) plus four items it misses,
headless, at 1920 and 400, one browser (`monorepo.localhost`). All 97 checked; none left over.

**Checked: 97 pages · Broken (confirmed): 2 · Broken (flaky, unconfirmed): 5 · Missed: 3**

## The owner's question, answered first

No. Neither confirmed break is the owner's "over-explicit sizing rule" — one is a routing
null-reference, the other a stale import left behind by a directory move. A separate sweep
(`heights.md`, this same task) already checked every fixed height on the site and found zero
guesses. The sizing rules are not what's broken.

## Broken (confirmed — reproduced at both widths, real console error)

| item | url | symptom | cause | the rule behind it |
|---|---|---|---|---|
| Paging templates | [/imagine/paging/templates/](/imagine/paging/templates/) | red console error on load, both widths (page still renders) | `Page.class.js:874`, a column's close button does `.href(this.parent.url)` — `this.parent` is `undefined` for one of these template pages | a routing/columns bug, not a sizing rule |
| Design → Navigation study | [/imagine/design/navigation/](/imagine/design/navigation/) | 404 on `lab.js`, both widths; the study's own component (`DnStudy`) fails to import | `page.js` still does `import { DnStudy } from "./lab.js"`, but `lab.js` isn't in the folder any more — a leftover from the 2026-09-18 move to `/web/nav/doc/study/` | a dead import, not a sizing rule |

## Broken (flaky — one width only, or an environment error; worth a human look, not proven)

| item | url | symptom |
|---|---|---|
| mastermind-layout-browser (task log) | [/framework/ai/2026-09-17/mastermind-layout-browser/](/framework/ai/2026-09-17/mastermind-layout-browser/) | 1920 timed out, 400 fine |
| paging-audit-8b (task log) | [/framework/ai/2026-09-05/paging-audit-8b/](/framework/ai/2026-09-05/paging-audit-8b/) | 400 timed out, 1920 fine |
| dead-nav (task log) | [/framework/ai/2026-09-18/dead-nav/](/framework/ai/2026-09-18/dead-nav/) | 400 timed out, 1920 fine |
| site-sidebar-tree (task log) | [/framework/ai/2026-09-18/site-sidebar-tree/](/framework/ai/2026-09-18/site-sidebar-tree/) | 400: the page's own request reported "failed" then loaded blank-titled; 1920 fine |
| paging-core (task log) | [/framework/ai/2026-09-04/paging-core/](/framework/ai/2026-09-04/paging-core/) | 1920: a Google-fonts icon failed with `ERR_NO_BUFFER_SPACE` — looks like this crawl's own network exhaustion, not the page |

All five are `framework/ai/**` task-log pages, single-width only, not reproduced twice — most likely
this crawl's own resource pressure (several Chromium runs today after two Servex restarts), not a
site bug. Worth a quick re-check, not a fix.

## Missed — real layout system-design work `prior-work.md` doesn't list

| what | where | when | why it matters |
|---|---|---|---|
| **ext/Panel** — a whole page-region arranging system: per-axis fill/hug/fixed sizing, split/close, a rail of layout words, templates | [/framework/ext/Panel/](/framework/ext/Panel/) | built 2026-08-15 → 09-18, still live | the brief's own search list names it; none of the three surveys covered it — it's the site's other layout system, for arranging *inside* a page rather than choosing a page's shape |
| **The switcher** — a routed list that switches the content beside it (vertical tabs / file tree / left nav), collapsing to a one-row mobile dropdown with no rewritten active-class logic | [/framework/core/Page/layout/switcher/](/framework/core/Page/layout/switcher/) | built today, 2026-09-29, after 5:25pm | this is *exactly* the "file tree + code, cram it on mobile" idea the owner dictated today (`owner-words.md`, 5:25pm entry) — already answered, already shipped, already linked from `core/Page/layout`'s own readme, but not yet in the merged table |
| **An open proposal, not yet decided** — every layout control needs to say how far its visible effect lands, and a growing readout needs a reserved height so it can't reflow its neighbours | `.claude/skills/layout/improvements.md` (polish-critic, 2026-09-17) | written 2026-09-17, still pending | a real rule change waiting on the owner's yes/no, the same kind of thing `prior-work.md`'s "decided" rows record — this one just never got promoted or surfaced |

## The pattern, in five lines

1. The owner's fixed-height worry didn't pan out: `heights.md` found 364 legitimate fixed values and zero guesses, and this crawl's two confirmed breaks are unrelated to sizing.
2. Both confirmed breaks are **leftovers from a move or a refactor** — a stale import after files relocated, a routing call built for one page shape reused on another — not bad numbers.
3. The biggest miss (**the switcher**) exists because it was built *during* today's fan-out, after the survey already ran — a timing gap, not a blind spot in where the surveys looked.
4. The second-biggest miss (**ext/Panel**) is a genuine blind spot: it's a second, parallel layout system (page-*internal* arranging) that none of the three surveys' scopes named, even though the brief did.
5. The layout skill's own `improvements.md` already holds a written, dated proposal awaiting a decision — that file is worth a read before the next layout ruling, not just before writing code.

## For the cards-and-logs task

Inventory C already flagged an open item this feeds directly: 480 `page.jsonl` files site-wide,
no size cap, no rotation, no monitor (`prior-work.md` row "page.jsonl"). The owner has since ruled
(20:40) that a card is a tiny page with **no folder of its own by default** — its data is one line
in the nearest `page.jsonl` that already exists, reached by a virtual URL through the parent's
`route()`, and a folder is made only once a card actually grows. Nothing in this audit's Broken or
Missed tables needs a folder per card, and nothing here should be read as recommending one.
