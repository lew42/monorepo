# persistence-rethink — judge + build brief (Opus)

Read first: the repo's `CLAUDE.md` (law 2; no server at runtime in production — the dev server's socket is dev-only), `../mastermind-night/requirements.md` (the night's rules + the owner's brief verbatim — your parts are persistence, page CRUD with fs default, pages as pure JSON), `../../2026-09-04/mastermind-platform/minion-rules.md`. Skills: `new-task` (this dir, group `paging`), `code`, `documentation`, `ui-test`, `finish-task`.

## The owner's words

> let's create a CRUD ui/ux for pages. maybe sub pages could be stored: in local storage, or on fs (using socket)? i think fs should be default.
> rethink the whole persistence thing, it seems a lot of the imagine pages are persistent in a way they probably shouldn't be (you'll get desync'd from the base example as you play around with it, and then not realize it's not what the original example was...)
> if we want to move pages to pure .json, how can the ui go from "new page" to any of the pages we have.

## Read before judging

`public/framework/core/Page/doc/method/store.md` (`store()`), `rg -n "store\(" public/imagine --glob '*.js'` (every realm that persists — list them), `public/imagine/paging/make/` + `doc/persistence.md` (the store contract and RESET), `public/imagine/cms/` + `Server/plugins/SocketServer/Append.js` + `public/framework/dev/Socket/doc/wire.md` (`rpc:write` / `rpc:append` — the fs write path over the dev socket, loopback-only), `public/imagine/cms/thinking.md` (git files as the default; json snapshot + jsonl deltas), `public/framework/core/Page/Page.class.js` (`declare` — the page.json seam), `public/framework/core/Page/generator/export.js` (a tree becomes page.js files), `public/imagine/generated/` (exported trees on disk).

## Deliverables (numbered)

1. **The audit.** A table in `public/imagine/paging/doc/persistence.md` (rewrite it — it is the record now): every realm that persists, what it persists, whether a reader can tell the page is modified, whether there is a reset, and the verdict: **keep** (a real user artifact — the team board, a game save), **demote** (a demo that should not persist, or should show "modified" + reset), **remove**.
2. **The rule, decided and written** in the same file (§33 shape, compact): *demos never persist silently.* The three states a page can be in (baseline · modified · saved), how each is shown (a small mark by the title, a reset control), and the one namespace rule. Then APPLY it: build the shared piece (the smallest — a `Page` seam or a paging part; propose, do not edit, `core/` — you may add it to `paging.js` and offer it to realms by import) and apply it to every "demote" realm you can reach inside `public/imagine/` (edit those realms' `page.js` only where the change is the mark + reset; log each).
3. **fs as the default store for made pages.** In dev (loopback dev socket present), Make writes real files: a made page becomes `page.json` (pure JSON — the declaration the page is: title, words, children) under `public/imagine/paging/made/<slug>/` via `rpc:write`, and core's `declare`/page.json seam renders it; localStorage stays the fallback when there is no socket (production, or the server down), with the page saying which store it is on. Read how `cms/` and `generated/` already write files; reuse, do not add a second writer. Prove: create a page in Make → the file exists on disk → reload → it is there; delete → the file is gone; kill the socket → localStorage takes over and the page says so.
4. **Pure JSON pages, the seam.** Write down (in `doc/persistence.md`) what a page as pure JSON can and cannot express today (title, description, icon, width, children, surface words, the template family — vs `content()` code), and the smallest path from "new page" to each existing kind of page (a column page, a tabs page, a takeover page, a mag front, a blog section): which are one JSON line and which need code. This feeds the page-builder minion; be concrete.
5. **RESET, site-wide.** One reset control convention (the paging hub has one for its namespace); say where a site-wide "reset every demo" lives and build it if it is under 40 lines.

## Prove it

`ui-test`: a demoted realm shows the mark after a change and clears it on reset; Make writes and deletes a file (check on disk); the fallback message without the socket. Zero console errors at 1280 and 3440 on every page you touched.

## Fences and budget

Write: `public/imagine/paging/doc/persistence.md`, `public/imagine/paging/paging.js` (the shared piece + Make's store backend), `public/imagine/paging/make/`, `public/imagine/paging/made/` (new), the `page.js` of realms you demote (the mark + reset only), this task dir. Coordinate by fence with `paging-mechanisms-v2` (it owns the rest of `paging/`, and reads your `doc/persistence.md` when it lands — write it EARLY, before the build). Never `core/`, `ext/`, `Server/` — proposals with the diff. Budget ~400k tokens. Report in ≤ 15 lines: the audit counts (keep/demote/remove), the rule in one sentence, the fs proof, the JSON-page table's headline, tokens, what you left open and why.
