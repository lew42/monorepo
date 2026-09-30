# Minion brief: core/Page/dynamic/ — dynamic pages, the concept

Load the `minion` skill first, then `page`, `new-page`, `content`, `code`. Program card dir: `public/framework/ai/2026/09/29/the-page-system-layout-navigation-new-pa/`.

## The owner's words (read "Continued (about 4:20 PM)" in `public/framework/ai/2026-09-29/page-system/owner-words.md`)

> "Each path in and of itself is sort of like a page and we can have these kind of like arbitrary page, dynamic pages essentially is the name for um, pages that don't really exist. ... maybe it's just, core slash page slash dynamic. Let's maybe separate the idea of a dynamic page from the actual method. We want to mention on that page the route method, the page.route method, because that's what handles all of the dynamic paging. ... with creating dynamic pages, there's a lot of powerful things we can do, and we can lean on the file system. So even though there's no page.js or page.json in that directory, we can still put data that gets fetched when a dynamic route loads and then looks at an index and realizes there's data there to be loaded. ... it sort of kind of falls back to a templating thing where you could have a core class or a EX extension or, or whatever doing the logic on a bunch of different pages without having to actually create the files themselves to configure it all."

## Where you work

Worktree `C:\Code\lew42\worktrees\page-system-929` (server http://localhost:51061/). Edit only there. **Commit ONLY by exact path** — never `git add -A`/`commit -a` (the worktree server writes page.jsonl lines as pages load; those must never be committed).

**Fence:** `public/framework/core/Page/dynamic/**` only. Do NOT edit `core/Page/page.js` or `readme.md` (another minion adds `dynamic` to the children and the readme line). Test your page by its own url.

## Read first

`core/Page/Page.class.js` (`route()`, `child()`, `load_all_children`), `core/Router/`, `core/Page/overview/route/` and `overview/folders/` (existing small demos — link them, don't copy), `core/Page/doc/` (whatever documents `route`/`child` — link it as "the method"), and the real uses: `public/framework/ai2/` (AI 2 cards: how a card id becomes a page) and `public/framework/ai/page.js` / a day page `ai/<date>/page.js` (`route()`, `dashboard(this)`).

## Deliverables

1. **The page `/framework/core/Page/dynamic/`** (`page.js`, `readme.md`). Level 1 is one screen, shown: what a dynamic page is in one sentence (a url with no page.js or page.jsonl that still loads, because an ancestor's `route()`/`child()` answers for it), then the three ideas as linked icon tiles: **The idea** (a path is a page) · **Data on disk + a template** (the powerful part) · **Where it is used** (AI 2 cards, day pages) — each one click down (`doc/*.md` or a child page). Link the method's own doc page as "how route() works", separate from this concept.
2. **One small working example, live on the page**: a folder `dynamic/example/` holding DATA only (e.g. an `index.json` listing 3 items, plus one `.md` or `.json` per item), and NO page.js per item. The example page's `route(name)` (or `child()`) reads the index, finds the item's data, and renders it through ONE template function. Each item has its own url (`/framework/core/Page/dynamic/example/<item>/`), and reloading it lands on the same view. Show the template's code beside the live result (`demo()` from ext/demo, or a code block + the live links). Keep the example under ~60 lines of JS.
3. **Where it is used**: AI 2 cards and the `ai/<date>/` day pages, one line each saying what data they read and what template renders it, with the file linked.
4. `readme.md` — the index (what · use · watch out · more), short. Traps you hit go in "Watch out" one line each (e.g. a declared child skips `route()`).

## Proof

- Load `http://localhost:51061/framework/core/Page/dynamic/` and each example item url directly (deep reload) headless at 1920: zero console errors, zero failed requests. Shot `C:\Code\lew42\monorepo\public\framework\ai\2026-09-29\page-system\shots\dynamic-1920.png` — open it and check it.
- Every spawn sets `windowsHide: true`. Budget about $3.

Reply with the commit hash, the shot path, and a checklist of deliverables 1–4, proof beside each. Then stop.
