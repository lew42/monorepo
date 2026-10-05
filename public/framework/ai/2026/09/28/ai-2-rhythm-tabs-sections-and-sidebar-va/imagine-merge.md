# Merging /imagine/ into core: asked vs done

## The ask (verbatim, from the [prompt log](/../.claude/prompts/2026-09-28.jsonl), 2026-09-28, 23:31:03)

> By the way, I asked in a previous request to try and merge or maybe plan on merging all of the imagine stuff into our core. And so I think there was some work done on that. But here's what happens is that I ask for like this analysis or this you know, work to be done and all these files are read and all these files are written and all the stuff is done for each task. However, nothing actually comes of it.

The three `.claude/prompts/*.jsonl` log files only go back to 2026-09-25, so the original request this refers to isn't in the log verbatim — this line is the owner's own recollection of it, and the closest match found.

## What was produced

| What | Link | Changed the site? |
|---|---|---|
| **imagine-move-3** (2026-09-18): 7 `/imagine/` shape-lab realms (`shells`, `screens`, `sections`, `blogx`, `mag`, `decks`, numbered `layouts`) physically moved to `/layouts/labs/`, old addresses stubbed | [task](/framework/ai/2026-09-18/imagine-move-3/) | **Yes** — landed, merged |
| **layout-names** (2026-09-24): retired the last `/imagine/layouts/` numbered pages, redirected all 18 to `core/Layout` name pages, deleted 1,452 lines of old code | [task](/framework/ai/2026-09-24/layout-names/) | **Yes** — landed, merged |
| **organization audit 3c — "mining /imagine/"** (2026-09-28): read 7 more `/imagine/` realms (`paging`, `sections`, `shells`, `screens`, `gallery`/`vary`/`team`) and recommended **"cite, not copy"** — link to them from core docs rather than move them | [3c.md](/framework/ai/2026-09-28/organization/audit/3c.md) | No — a plan only |
| **proposal.md rewrite order** (2026-09-28): named the exact `/imagine/` pages (`paging`, `screens`, `sections`, `shells`) to cite from a new core/Page "Layout" page | [proposal.md](/framework/ai/2026-09-28/organization/proposal.md) | No — a plan only |
| **New "Choosing a layout" page** (2026-09-28, landed today): built and live, but does **not** yet contain the `/imagine/` links the plan above named | [core/Page/Layout](/framework/core/Page/layout/) | Partially — the page shipped, the `/imagine/` citations in it did not |
| **next-pass.md** (2026-09-28, queued, not started): the backlog for what's left on this page — floating-page demo, a top-down-shape page, trimming `doc/columns.md` — has **no line item** for adding the `/imagine/` links that were already promised | [next-pass.md](/framework/ai/2026-09-28/organization/rewrite/next-pass.md) | No |

**The pattern the owner is describing is real:** three separate tasks (2026-09-18, 09-24, 09-28) each read and wrote a lot of files about `/imagine/`, and two of them did land real, physical moves. But the most recent plan — "cite these four `/imagine/` realms from the new Layout page" — was written down twice and then dropped before the page that was supposed to carry it shipped. No open task currently owns finishing it.

## What's left, smallest first

1. **Add the four links.** `proposal.md` already names them: cite `/imagine/paging/`, `/imagine/screens/`, `/imagine/sections/`, `/imagine/shells/` from [`core/Page/layout/page.js`](/framework/core/Page/layout/) and `doc/words.md`/`doc/columns.md`. This is copy-and-paste from a plan that already exists — no new page, no new decision, maybe 30 minutes.
2. **Write the "top-down shape" page** (already queued as next-pass item 2) — background/padding/bleed gathered in one place, which is where `/imagine/shells/` was supposed to be cited.
3. **Decide, once, whether the *rest* of `/imagine/` ever physically moves.** Only the "shape lab" subset (`shells`, `screens`, `sections`, `blogx`, `mag`, `decks`, numbered `layouts`) has actually been merged into core/`/layouts/`. Realms like `paging`, `gallery`, `vary`, `team`, `design`, `platform`, `research`, `generated`, `cms`, `game`, `readme` are still live under `/imagine/`, heavily linked *from* core docs, but never moved. Nobody has written down whether that's the final shape (a permanent demo library, linked not merged) or a to-do. That single decision is the one thing missing — everything else in this list depends on it.
4. **If more realms are chosen to move**, follow the imagine-move-3 recipe that already worked: `git mv`, a one-line stub at the old address, fix any cross-realm relative import that breaks at the new depth, then a headless crawl of every old and new url before landing.
