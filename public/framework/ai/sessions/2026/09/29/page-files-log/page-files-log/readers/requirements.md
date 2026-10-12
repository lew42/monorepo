# Readers: every page reads its own page.jsonl, not directory.json (minion-pf-readers)

Load the `minion` skill first, then `code`. Read the owner's words: `../owner-words.md` and the
parent brief `../requirements.md` (the card's whole conversation is at
`public/framework/ai/2026/09/29/the-page-system-layout-navigation-new-pa/`).

> "when we load any page and we fetch the page's JSONL, we get all the file listings for free …
> It'll keep them much lighter and be able to load on demand" (the owner, 09-29)

Today every page fetches `/directory.json` (4 MB) or `/framework/directory.json` (3.3 MB) to learn
what files a folder holds. On the phone that costs seconds.

**Work ONLY in the worktree `C:\Code\lew42\worktrees\page-files-log`** (branch
`worktree/page-files-log`, its server at http://localhost:53780/). Never edit the main tree.
Commit by exact path. minion-pf-writer works in the same worktree on `Server/` and is writing
every folder's page.jsonl (a backfill); until it lands, test on folders that already have one
(e.g. `/framework/core/Page/jsonl/`) or append a few lines by hand in a scratch folder.

## The format (already live)
Each folder's `page.jsonl` holds lines about the entries DIRECTLY inside it:
`{"file":"readme.md"}`, `{"file":"doc/"}` (a plain folder), `{"file":"kid/page.js"}` /
`{"file":"kid/page.jsonl"}` (a child page), `{"file":"x.md","gone":true}` (removed). Keyed by the
first path segment; the latest line wins. Other lines (title, place, message…) are the page's
own and are ignored by a listing. `core/Page/Log.js` already replays these lines (`listed`).
Doc: `core/Page/doc/jsonl.md`.

## Deliverables
1. **One helper, in core/Page (Log.js is the natural home):** `Page.listing(url)` fetches
   `url + "page.jsonl"` once (memoised per url), replays the file lines, and returns
   `{ files: [...names], dirs: [...names], pages: Map(name -> "js"|"jsonl") }`, or `null` when
   there is no page.jsonl (SPA fallback: html content-type is a miss). A tail/live update is
   welcome but not required.
2. **Switch each reader to it, falling back to directory.json when `listing()` returns null:**
   - `core/Page/Markdown.js` (`files(dir)`: the .md files under a page; recurse into plain
     sub-folders by their own page.jsonl; stop at a folder that is a page, as today),
   - `ai2/groups.js` (`read_tasks`: the day folder's page.jsonl names its task folders; each
     task folder's page.jsonl names its files. Fetch only the days it shows),
   - `ext/files/fs.js` (`list(dir)`: first level at once; deeper levels loaded per folder,
     in parallel, or on demand if ext/files allows it),
   - `ext/drawer/tabs/sessions.js` `threads()` and its twin in `dev/DevBar/ask.js`,
   - the Router's children lookup: `Page.child()` in `core/Page/Page.class.js`. When the parent's
     listing is loaded, use it to skip the probes it can answer (a listed `kid/page.jsonl` is
     read with `Page.jsonl`, a listed `kid/page.js` with `Page.load`); when the name is not
     listed, keep today's probe order: a stale listing must never 404 a real page.
   Keep `directory.json` itself; just stop needing it for rendering.
3. **No DOM after an await** (CLAUDE.md traps): capture the box synchronously, fill it later.
4. **Prove it:** on the worktree server, load a card page
   (`/framework/ai2/2026/09/29/experiment-3-models-read-the-dictate-spa/`), `/framework/ai2/`,
   a page's `md/` and `fs/` (e.g. `/framework/ext/files/fs/`), and the drawer's sessions tab,
   headless (Playwright, a probe named `pfl-readers-probe.mjs` in the session scratchpad): zero
   console errors, and the network log shows NO directory.json request on the card page and on
   `/framework/ai2/` once the backfill is in. Screenshot each at 1920; look at them.

## Fence
`public/framework/core/Page/Log.js`, `core/Page/Page.class.js` (child lookup only),
`core/Page/Markdown.js`, `ai2/groups.js`, `ext/files/fs.js`, `ext/drawer/tabs/sessions.js`,
`dev/DevBar/ask.js`. Other readers of directory.json (Search, Omnibox, AITask dashboard,
Research) stay as they are: list them in your summary with one line each on whether they could
switch. Every Node spawn sets `windowsHide: true`; never drive the owner's tabs.

## Log and land
Your task.jsonl is already open for you. Log decisions as they happen. End your turn with a
5-line summary: what changed, which requests disappeared, screenshots' paths, anything left.
Budget: about $4.

