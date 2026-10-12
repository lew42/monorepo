# Minion A — layouts get names, not numbers

Load the `minion` skill first. Your task mastermind is `task-mastermind-layout-names`.

## The owner's words (the acceptance test)

> Layouts get names, not numbers; one realm for layouts. Following your 09-08 naming rule: retire `/imagine/layouts/`'s numbered eighteen (`number.js`, `LayoutsCard`) in favour of `core/Layout`'s names. Move the shape labs from /imagine/ into /layouts/ (rail move 3). On an item page, the verdict goes above the picture.

Standing rule (2026-09-08): names not numbers; one word describes many layouts; variations are tags; clicking a tag is the feature; no new CSS classes unless one helps.

> Nothing links to a page that no longer exists: a moved page leaves a redirect or its links are updated, and you check by clicking through from the parent.

## Where you work

The worktree **`C:\Code\lew42\worktrees\layout-names`** (branch `worktree/layout-names`), served at **http://127.0.0.1:52651/**. Edit ONLY there — never `C:\Code\lew42\monorepo`. Commit in the worktree when done (one or two commits; the co-author line from your system reminder). Never push, never touch another branch.

## What is true today (checked by your mastermind)

- `/imagine/layouts/page.js` is already a "Moved → /layouts/" stub with no children, so `/imagine/layouts/1/` … `/4/` and all eighteen full-screen children (`/imagine/layouts/2/golden/` etc.) **404 right now**. `1/`–`4/page.js`, `number.js`, `LayoutsCard.js`, `system.js`, `layouts.css` are dead code still on disk.
- The eighteen are already ported into `public/framework/core/Layout/layouts.js` (each entry with `source: "imagine/layouts"`), each a named page under `/framework/core/Layout/<name>/`.
- The six shape labs (sections, shells, screens, decks, blogx, mag) already moved to `/layouts/labs/` on 2026-09-18; each old `/imagine/<lab>/` is a moved stub. Deliverable 2 below is to **verify**, not rebuild.

## Deliverables

1. **Old numbered urls answer.** Every `/imagine/layouts/<n>/` and `/imagine/layouts/<n>/<id>/` resolves to a page that sends the reader to the matching `core/Layout` name page (a `route()` on the stub that returns a small moved page linking to — or `location.replace`-ing to — the right name; your call, name it in a comment). A number page (`/imagine/layouts/2/`) goes to `/framework/core/Layout/` (or a tag/filter of it, if one exists for a column count). Build the id → name map once, from `core/Layout/layouts.js`, not by hand if you can avoid it.
2. **Retire the numbered code.** Delete `1/`–`4/`, `number.js`, `LayoutsCard.js`, `system.js`, `layouts.css` from `public/imagine/layouts/` once nothing imports them (grep first — `core/Layout/fixtures.js`, `core/Page/words.js`, `imagine/paging/blocks.js` mention the path; check whether they IMPORT or merely link). Rewrite `imagine/layouts/readme.md` to a few lines: moved, where to, why. Keep `doc/decisions.md` (history) with a line at the top saying it is retired.
3. **Update every link.** `grep -rn "imagine/layouts" public --include=*.js --include=*.md` outside `public/framework/ai/` — every href/markdown link to a numbered page points at the core/Layout name instead (e.g. `2.golden` → `/framework/core/Layout/<its name>/`). Prose that *says* "2.golden" as a name becomes the name. Don't edit `directory.json` / `links.json` by hand (generated). Don't edit files under `public/framework/ai/`.
4. **Shape labs verified.** Load each `/imagine/{sections,shells,screens,decks,blogx,mag}/` and its `/layouts/labs/<lab>/` target: the stub answers, the target loads with zero console errors. Fix only what is broken, in `/layouts/labs/`.
5. **Verdict above the picture** on `/layouts/browse/<item>/` pages (`public/layouts/browse/page.js`, `item_page()`): the verdict box (Approve / Improve and its lines) sits between the title/tags and the pictures. No new CSS class unless one helps. Update the comment that says "the pictures … then the verdict".
6. **Click through.** From `/layouts/` click into browse, one item, labs, each lab; from `/framework/core/Layout/` into three names; from an old numbered url. Zero console errors, zero failed requests (headless Playwright — never drive the owner's tabs; the `ui-test` skill has the probe). Shoot `/layouts/browse/approved-reading-column/` and `/imagine/layouts/2/golden/` (after redirect) at **1920×1000** into `C:\Code\lew42\monorepo\public\framework\ai\2026-09-24\layout-names\after-browse-item.png` and `after-imagine-layouts-2.png` (the only files you may write in the main tree).

## Fence

Write: `public/imagine/layouts/`, `public/layouts/`, `public/framework/core/Layout/`, and link-only edits (hrefs and the name in prose next to them) in any other file that links to `/imagine/layouts/`. NOT `public/imagine/paging/make/` (a sibling minion owns it). No shared CSS (`framework.css`, `styles/`).

Budget: small. Most of this is deleting and re-pointing.

## Reply

When done, end your turn with ≤ 10 lines: what changed per deliverable, the commit hash(es), anything you could not do and why.
