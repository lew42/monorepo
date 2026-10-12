# Minion brief: page WEIGHT — design it and build the smallest version

Load the `minion` skill first, then `code`, `page`, `new-page`, `content`. Program card dir: `public/framework/ai/2026/09/29/the-page-system-layout-navigation-new-pa/`.

## The owner's words (the last third of `public/framework/ai/2026-09-29/file-system/owner-words.md`, read it all)

> "maybe we need a familiarity score for different ... pages ... Or maybe it's just a weight. ... the familiarity slash confidence slash stability slash all the things ... let's create a weight system for pages ... create a minion to design a uh, weight per page. Let's just call it weight. ... it might be a multi-use thing ... depending on what type of page it is ... one is the default ... it's a multiplier or it could be a multiplier. I mean, they could be added up ... increase that if it becomes heavier and decrease it if you want it to diminish its effect ... The weight could be computed dynamically from the number of ... references. So the way that would work is that whenever you reference a page, you add a log item to that page that says, you know, referenced by, and then a link to the other page. And so each page knows where it's being referenced from. And then you can just total up the number of references and boom, you have a ... first rough dynamic. Now we might want to like manually adjust weights where we add 10 to, you know, important things. And ... if something becomes ultra important, it becomes 20 or 50 ... let's get that going."

## Where you work

Worktree `C:\Code\lew42\worktrees\page-system-929` (server http://localhost:51061/). Edit only there. **Commit ONLY by exact path**, never `git add -A`/`commit -a` (the worktree server appends page.jsonl lines as pages load).

**Fence:** `public/framework/core/Page/weight/**` (new: page.js, readme.md, doc/, `weight.js`), `Server/page-refs.mjs` (new, if you need a writer), and appended lines (never rewrites) to the `page.jsonl` of pages you use as the live example. Do NOT edit `core/Page/Page.class.js` (item-ui owns a line there), `core/Page/page.js`, `core/Page/readme.md` or `core/Page/jsonl/**` — other minions add the readme line and the jsonl line kind; tell me in your reply exactly what line kind to document.

## Check what exists first (read, don't guess; write what you found in `doc/prior.md`, one row each)

- `public/framework/ai/audits/paging/types.json` `uses` and `bump(id)` in `types.js` (a use counter for page types).
- The importance graph: `/imagine/importance/` (JSONL typed graph, pairwise judgments).
- `ux/Content/structure/doc/weight.md` (a page-weight proposal already written) and the `page` skill's "Weight" bullet.
- How page.jsonl lines are applied (`core/Page/doc/jsonl.md`; `set()` stores a key as data unless it names a method; latest line wins — so `referenced_by` must ACCUMULATE, not overwrite: check how `{"file": …}` lines accumulate and follow that pattern, or read the raw lines in `weight.js`).

## Deliverables — the smallest version

1. **The design, one screen, `doc/design.md`:** weight = (1 + number of distinct `referenced_by` pages) × or + the manual adjustment — pick one (multiply or add), say why in one line, name the alternative. Line kinds: `{"referenced_by": "/path/"}` and a manual `{"weight": N}` (+10 important, 20 or 50 ultra). One line on "meaning varies by page type" (familiarity, confidence, stability) without building it.
2. **`weight.js`**: `weight(page_url)` → reads that page's page.jsonl (fetch, fail soft), returns `{ weight, refs: [...], manual }`. Under ~40 lines, no dependency. Works for a page.js page with no page.jsonl (weight 1, no refs).
3. **A writer:** the one way a `referenced_by` line gets appended. Smallest honest version: `node Server/page-refs.mjs <from-url> <to-url> [--root <tree>]` appends one line to the target's page.jsonl (creating it only if the target is a page.jsonl page; for a page.js page, say what you did). Dedupe: don't append a second line for the same pair. `windowsHide: true` on any spawn.
4. **One sort that uses it, live:** the `/framework/core/Page/weight/` page shows a handful (5–8) of real core/Page sub-pages (layout, navigation, make, ai, dynamic, jsonl, generator…) as icon cards SORTED heaviest first, each card showing its weight and "referenced by N". Seed real references with your writer where one page really links another (e.g. the readme links → each sub-page), and state on the page that they were seeded from real links. Bigger weight → a visibly bigger card is a bonus, not required.
5. **`readme.md`** — the index (what · use · watch out · more), short.

## Proof

- Load `http://localhost:51061/framework/core/Page/weight/` headless at 1920: zero console errors, zero failed requests; shot `C:\Code\lew42\monorepo\public\framework\ai\2026-09-29\page-system\shots\weight-1920.png` — open it and check the order matches the weights.
- Run the writer twice for the same pair: one line, not two (paste output).
- Budget about $3.

Reply with the commit hash, the shot path, the exact line kinds for the jsonl page, and a checklist of deliverables 1–5 with proof. Then stop.

## Connect the dots (the owner, via the content skill)

Document where the code lives, link rather than re-explain, tip of the iceberg first. Familiar structure: icon, name, one-line meaning; an instance looks like an instance.
