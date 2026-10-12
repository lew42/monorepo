# imagine-integration — how the 27 imagine realms fold into the core framework: complexity, renames, restructuring

Load the `minion` skill first. Then this brief. A STUDY: you edit nothing outside your task dir (`new-task` first, `finish-task` at the end).

**Three laws.** Less is more (a proposal that deletes beats one that adds). Clear beats brief by far. Prioritize (the three moves with the most benefit for the least work come first).
**Length budget:** `proposal.md` is one screen: the three moves, each with a complexity (S / M / L and a sentence), then the rest as a table. `inventory.md` is the table of all 27. Your final message is the three moves.

## The owner's words (2026-09-17, 22:40)

> Ask a minion to look into how to integrate all our imagine things with the core framework. Estimate the complexity, recommend renaming or restructuring to simplify architecture, UI, etc.

Standing complaint (2026-09-04, of `/imagine/`): "I'm sort of lost… it's not clear at all." And the newcomer rule: level 1 one screen, shown not told.

## What to do

1. **Inventory** every realm under `public/imagine/` (27 dirs: read each `readme.md` first line and `page.js` head; skim `/imagine/review/` — eighteen were reviewed on 2026-09-04). One row each: what it is · what it proved or built · what already graduated to core/ext/ui (e.g. `page.store()` came from `/imagine/team/`; columns from the Finder work; the size standard from `/imagine/design/size/`; `/layouts/` from `/imagine/layouts/`) · what still lives only here and is used by something else · dead or superseded (say by what) · lines of JS + CSS (count them).
2. **The architecture question.** `/imagine/` is a columns host with 27 children, which is the "I'm lost" page; `/framework/` is the real thing; `/layouts/` and `/websites/` are top-level realms that grew out of it. Recommend, with reasons: which realms become an `ext/` or `ui/` module (they are used by real pages), which become `doc/` pages of the module they proved (a lab whose lesson is in core now), which merge (e.g. the design studies under `/imagine/design/` beside the new `/framework/styles/system/`), which are deleted (their `ai/` task log keeps the record), and what `/imagine/` itself becomes — a short front of the few live labs, or nothing. Name the renames (old → new url) in a table; count how many urls move and how many links would break (`rg -l "/imagine/<realm>/" public --glob "*.js" --glob "*.md"` per realm — a number, not a guess).
3. **Complexity** per move: S (an hour, one agent, no core), M (an evening, fences across two modules), L (core surgery or a dozen callers — a proposal for the owner). Say which moves are fail-safe (nothing else links there) and which need a redirect.
4. **UI**: the front page a newcomer should see after the restructure — one screen, described in five sentences, not built.

## Rules

- Never kill or restart the dev server, never drive the owner's tabs, never `git stash`, never `find /`; rg scoped to the repo. No server needed. Findings as `log` lines; timestamps from the clock.
- Two numbers that must agree: realms in `inventory.md` and dirs under `public/imagine/` (excluding `imagine.css`, `page.js`, `readme.md`).
