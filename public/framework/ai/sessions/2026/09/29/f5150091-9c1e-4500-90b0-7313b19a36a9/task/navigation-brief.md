# Minion brief: core/Page/navigation/ — a new page and system

Load the `minion` skill first, then `page`, `new-page`, `content`, `code`. Card dir (the owner's raw words): `public/framework/ai/2026/09/29/the-page-system-layout-navigation-new-pa/`.

## The owner's words (acceptance test — read all of `public/framework/ai/2026-09-29/page-system/owner-words.md`)

> "let's create a core page slash navigation page and system. It's like a README with, uh, you know, let's identify the core concepts of navigation. One of the things is persistent navigation. ... It's either is it persistent or not. You don't want janky navigation. You don't want things jumping around, things disappearing or shifting when they shouldn't be. ... the navigation I've decided should stay fixed uh, so it doesn't move. And, you know, having multiple levels of navigation gets tricky. You know, a header, a left sidebar, uh, you know, top tabs, and then an inner left sidebar. And, you know, it gets, it gets pretty ridiculous pretty quick. ... It's like the class doc system with the top tabs. You know, it works pretty well ... that probably should be documented as the go-to until we get a better one. And so, and then creating alternatives. ... The imagine paging system ... with all the column Miller column type things ... creating more workspace type areas where a left and right sidebar are very contextual and just kind of swap out based on what you're looking at"

## Where you work

Worktree `C:\Code\lew42\worktrees\page-system-929` (branch `worktree/page-system-929`, server http://localhost:51061/). Edit ONLY there, never the main tree. Commit there, by exact path, when it works.

**Fence (the only files you may create or edit):**
- `public/framework/core/Page/navigation/**` (new: `page.js`, `readme.md`, `doc/*.md`, child demo pages if needed)
- `public/framework/core/Page/page.js` — ONLY to add `navigation` to the `children:` string (line ~40). Nothing else in that file.
- `public/imagine/paging/page.js` — ONLY to add `rightnav` to its `children:` if it is missing (it exists at `/imagine/paging/rightnav/` but is unreachable by click).

Never touch `core/Page/readme.md`, `core/Page/layout/`, or `core/Page/make/` (other agents own them).

## Read first (the inventory already found everything)

`public/framework/ai/2026-09-29/page-system/inventory/A-imagine-layouts.md`, `B-framework.md`, `C-task-logs.md` — rows marked **nav**. Then the sources they point at, especially: `/imagine/paging/navigation/` readme + `doc/measurements.md` (the measured 0px study), `/web/nav/doc/study/`, `ext/Doc/Doc.js` (~line 81, the top-tab = a page whose children are a left rail), `core/Sidebar/`, `ext/drawer/`, `ext/tabs/readme.md`, `/imagine/paging/rightnav/`, `core/Page/overview/columns/`, `/layouts/explorer/`, `/layouts/labs/screens/`, `/imagine/decks/persist/` vs `/imagine/decks/swap/`.

## Deliverables (numbered; each ticked against the owner's sentence)

1. **The page `/framework/core/Page/navigation/`** (a `page.js` Page; model it on a sibling like `core/Page/layout/page.js`). Level 1 is one screen, SHOWN: the core concepts as linked icon tiles (`ux/Content/Concepts` — see the page skill 5a), most important first.
2. **Concept 1, first and biggest: PERSISTENT vs SWITCHING.** Persistent navigation stays fixed and never moves (the owner decided this); switching swaps everything on a click, which is acceptable; smooth transitions are a future goal. Show it: link or embed the measured demos (0px drift) and state the rule in one sentence. Name the existing vocabulary ("stable" vs "dynamic" in /imagine/paging/navigation/) so the two word sets map onto each other.
3. **The levels of navigation**: header → left sidebar → top tabs → inner left sidebar. Show the stack (a small diagram built from divs, or a screenshot of a real page that has all four — ext/Doc module pages do). One line on when stacking gets absurd, and the rule: at most N levels visible (pick N, say why).
4. **The go-to: class-doc top tabs (ext/Doc).** Documented as the default for multi-level navigation until something better exists: what it is, one live example link (e.g. `/framework/core/Page/` itself or `/framework/ext/Doc/`), how to use it (the Doc words), in a few lines.
5. **The alternatives, each with a demo link and one line on when to pick it:** Miller columns (`/imagine/paging/` columns + `core/Page/overview/columns/`), the workspace with contextual left and right sidebars that swap (`/imagine/paging/rightnav/`, `ext/drawer/`, `/layouts/explorer/`), plus the others the inventory lists (screens lab, decks persist/swap). A demo URL you link must return 200 AND render (load it).
6. **`readme.md`** — the text index (what · use · watch out · more), short. **`doc/`** — one topic per file for any detail you cut from the page (e.g. `doc/levels.md`, `doc/alternatives.md`, `doc/prior-work.md` listing the inventory's nav rows with links).
7. Add `navigation` to `core/Page/page.js` `children:`; add `rightnav` to `/imagine/paging/` children if missing (check its content() shows a link to it too — new-page skill step 3).

## Proof before you report

- Load `http://localhost:51061/framework/core/Page/navigation/` headless (Playwright; see `browser-testing` notes: never the owner's tabs) at 1920 and 3440: zero console errors, zero failed requests. Save `shots/nav-1920.png`, `shots/nav-3440.png` into `public/framework/ai/2026-09-29/page-system/shots/` in the MAIN tree (that dir is mine; you may write shots there).
- From `http://localhost:51061/framework/core/Page/`, count `a[href="/framework/core/Page/navigation/"]` ≥ 1.
- Every Node spawn sets `windowsHide: true`. No servers started by you (the worktree server is already up).
- Budget: about $3. Keep the page's words few: show, then words.

Reply with: the url, the two shot paths, the commit hash, and a checklist of deliverables 1–7 with proof beside each. Then stop.
