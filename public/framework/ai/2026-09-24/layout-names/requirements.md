# Layout names + Make's leftovers — task mastermind

**The ask, verbatim (from the master mastermind, 2026-09-24):**

> You own two loose ends from public/framework/ai/2026-09-24/loose-ends/report.md (read the page and its links first). The loose-ends sweep already decided both; build them.
> - Brief 3, layouts get names, not numbers: retire /imagine/layouts/'s numbered eighteen in favour of core/Layout's names, move the shape labs into /layouts/, and put the verdict above the picture on item pages. The owner's standing rule (feedback 2026-09-08): names not numbers; one word describes many layouts; variations are tags; clicking a tag is the feature; no new CSS classes unless one helps.
> - Brief 7, Make's leftovers: give the Description field a place on screen, and add keyboard reordering to the tree.
> Separate modules, same worktree; a minion each is fine (Servex spawn_agent, parent = task-mastermind-layout-names).
> Nothing links to a page that no longer exists: a moved page leaves a redirect or its links are updated, and you check by clicking through from the parent. Take before-and-after screenshots at 1920. Follow the sub-mastermind skill's "Merge carefully, never clobber" and merge into michael/dev yourself. Use the `documentation` skill, then `finish-task`. Report on card "live" when you land.

**The loose-ends report's own words:**

> 3. **Layouts get names, not numbers; one realm for layouts.** Following your 09-08 naming rule: retire `/imagine/layouts/`'s numbered eighteen (`number.js`, `LayoutsCard`) in favour of `core/Layout`'s names. Move the shape labs from /imagine/ into /layouts/ (rail move 3). On an item page, the verdict goes above the picture.
>
> 7. **Make's leftovers.** The Description field shows nowhere on screen, and drag has no keyboard path. Give the description a place under the title, and add arrow-key reordering to the tree.

## Deliverables

1. The numbered eighteen are retired: `/imagine/layouts/1/`–`4/` and their full-screen children each redirect to the matching `core/Layout` name page; `number.js`, `LayoutsCard.js`, `system.js` stop being live code; every link to them in the site is updated.
2. The shape labs live in /layouts/ — already moved 2026-09-18 (`ai/2026-09-18/imagine-move-3/`); verified: every old /imagine/<lab>/ address answers with a moved page, and nothing links to the old addresses.
3. On a /layouts/browse/ item page, the verdict sits above the picture.
4. Make: the Description field has a place on screen, under the title.
5. Make: the tree reorders from the keyboard with arrow keys.
6. Before/after shots at 1920; click-through from each parent; documentation; merge; card reply.

## Fence

Worktree `worktree/layout-names`. Minion A (layouts): `public/imagine/layouts/`, `public/layouts/`, `public/framework/core/Layout/`, plus link-only edits in the files that link to `/imagine/layouts/`. Minion B (make): `public/imagine/paging/make/` only.
