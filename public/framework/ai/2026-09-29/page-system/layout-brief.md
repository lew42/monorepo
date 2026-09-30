# Minion brief (Opus): core/Page/layout/ becomes THE layout system, and the core/Page readme lists its sub-systems

Load the `minion` skill first, then `page`, `layout`, `content`, `documentation`, `code`. Card dir (the owner's raw words): `public/framework/ai/2026/09/29/the-page-system-layout-navigation-new-pa/`.

## The owner's words (acceptance test — read all of `public/framework/ai/2026-09-29/page-system/owner-words.md`)

> "maybe the page core slash page slash layout directory, which is a layout system, and we should probably be, you know, I, I, I write this down, I think we should move all the layout information into that directory. It's, it's not really a class, it's not really a script ... it's essentially a system. It's a it's a, a system of layouts, particularly for pages, but also within pages. ... talking about page layouts, you know, we should start with kind of the navigation, the parent structures, and then the internal structures."

> "I don't know if we have, you know, references we can link to to past work about, you know, layout audits and how to make layout decisions. And, you know, that's padding, that's spacing, that's gap..."

> "The page README should identify the layout system and pretty much anything else"

## Starting point

module-experts has merged its curated `core/Page/readme.md` (v1 kept at `core/Page/old/readme-v1.md`) and a Layout hub (v1 kept at `core/Page/layout/v1/`) into michael/dev. **Build on those; never delete a v1.** If you restructure `layout/page.js`, keep the current one reachable (a class the new one extends, or a `v2`/`v1` sibling) — the sub-mastermind skill's first rule.

## Where you work

Worktree `C:\Code\lew42\worktrees\page-system-929` (server http://localhost:51061/). Edit only there, commit by exact path. Two other minions' files in the same worktree: `core/Page/navigation/**`, `Servex/pages.js`, `Server/page-size.mjs`, `core/Page/doc/page-jsonl.md`, `.claude/skills/*` — don't touch them.

**Other minions still running in this worktree:** minion-nav-page (navigation/, and it has an uncommitted `children:` edit in core/Page/page.js — edit page.js only AFTER `git status` shows it clean), minion-page-ai (`core/Page/ai/`), minion-page-dynamic (`core/Page/dynamic/`), minion-page-jsonl (`core/Page/jsonl/`, `core/Page/doc/page-jsonl.md`). **Commit ONLY by exact path**, never `git add -A` / `commit -a` (the worktree server writes page.jsonl lines as pages load).

**Fence:** `public/framework/core/Page/layout/**`, `public/framework/core/Page/readme.md`, and `public/framework/core/Page/page.js` only for its `children:` line and the Index/concept tiles if the readme lists something the page does not. NOT `core/Page/make/**` (module-experts keeps it).

## Deliverables

1. **`core/Page/layout/readme.md` — THE layout system's index.** Core concepts (one line each, top-down in the owner's order: navigation and parent structure → the page's own division of its room → the layout inside a page: sections, cards, padding, spacing, gap); an **index of layout types** linking the live registries (`core/Layout` = named arrangements, `/layouts/` = the encyclopedia, `/layouts/doc/studies/approved/` = the approved five, `core/Page/overview/columns/` = columns, the width words); **the decision process** (link `/layouts/decide/` — its 5 questions — plus the `layout` skill's questions; one short list, not both copied); **research worth keeping** (a short list of links, the best 8–12 rows from the inventory, each with its decided rule in one line: spacing is a clamp, bleed is for paint, gutter is padding, open columns freeze width, names not numbers, ramps are space between not the size of a control…).
2. **Name the look-alikes apart**, one line each: the four things called "layout" (`core/Layout`, `core/Page/layout`, `ext/layout`, `/layouts/`) and the two called "sections" (`framework/styles/sections` = content bands inside one page; `/layouts/labs/sections/` = page-division bands). Decide and say where each belongs in this system (reference, not move, unless moving is safe: a move needs every importer updated and a redirect stub, so prefer links).
3. **The rendered `/framework/core/Page/layout/` page, designed FROM the readme**: level 1 is one screen — the core concepts as linked icon tiles (`ux/Content/Concepts`), then the index of types as a wall of previews or icon links. Detail one click down in `layout/doc/*.md` (e.g. `doc/decide.md`, `doc/research.md`, `doc/names.md`). Link `../navigation/` as the first concept ("start with navigation and the parent structure") — it is being built right now by another minion.
4. **`layout/doc/prior-work.md`** — the combined inventory: merge `public/framework/ai/2026-09-29/page-system/inventory/{A-imagine-layouts,B-framework,C-task-logs}.md` into ONE table (what · where · state · keep/reference/drop · why), de-duplicated, sorted keep-first. Where A and B disagree, check the file: e.g. `/imagine/shells/` is a 1-line stub to `/layouts/labs/shells/` (A is right). Keep it under 120 rows.
5. **`core/Page/readme.md`: every sub-system in one line each, no explanation of the self-evident:** layout (`./layout/`), navigation (`./navigation/`), making a page (`./make/` + the `create_page` tool), storage (`page.jsonl` → `./jsonl/`, the page.jsonl system page), AI and sessions (`./ai/` — the page-based AI system: dictation, fast assistant, manager per page, sessions and the SDK; built by minion-page-ai in this worktree — plus whatever module-experts' readme names for the Page expert). Also dynamic pages (`./dynamic/` — a url with no page.js/page.jsonl that loads through an ancestor's `route()`; data on disk + one template). Add `ai` and `dynamic` to `core/Page/page.js` `children:` (`navigation` is already there). When item-ui's `core/Page/object.js` (`page_object(page)`) is on michael/dev, add one call to it on the core/Page overview; if it is not there yet, skip it and say so. Keep module-experts' structure; add, don't rewrite. It must stay a quick scan.
6. **README vs page** — one line in `core/Page/readme.md` (or its doc) saying the readme is the text version and the page is designed from it, linking `./make/readme-page/`.

## Proof

- Load `/framework/core/Page/layout/` and `/framework/core/Page/` on http://localhost:51061/ headless at 1920 and 3440: zero console errors, zero failed requests; every link on the layout page returns 200 (follow them). Save `layout-1920.png`, `layout-3440.png`, `page-1920.png` into `C:\Code\lew42\monorepo\public\framework\ai\2026-09-29\page-system\shots\`.
- `a[href="/framework/core/Page/layout/v1/"]` (or wherever v1 lives) still exists somewhere on the layout page.
- Every spawn sets `windowsHide: true`. Budget about $5.

Reply with the commit hash and a checklist of deliverables 1–6, proof beside each. Then stop.

## Connect the dots (the owner, via the content skill)

Document where the CODE lives: a method on its class's method page, a Servex mechanism on /framework/servex/. State each fact here in one line and LINK to where it lives; never re-explain. Link a familiar concept wherever it is mentioned, not redundantly. Tip of the iceberg first: the subtopics as linked items. Familiar structure: icon, name, one-line meaning; the file system as reinforcement; an instance looks like an instance.
