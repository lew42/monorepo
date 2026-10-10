# Doc module: a nested tree of notes, and /docs/ resolving to /doc/

Load the `minion` skill first. Your parent task (read it, and its links, before
touching anything): `public/framework/ai/2026-09-28/source-library/requirements.md`
— piece 4 of that brief is yours. Background: `.../agent-work-on-every-page-sanity-checks-c/design.md`
("Added" section, row "Docs") and `owner-words-2.md` (the raw dictation — search
for "docs system" and "multi-level documentation").

**Work in the shared worktree, not the main tree:** `C:\Code\lew42\worktrees\source-library`
(branch `worktree/source-library`, its own dev server at `http://source-library.localhost/`
via the proxy, or directly at the port `worktree-up.mjs` printed). Commit there. Do not
touch anything outside your fence below — a sibling minion owns `public/framework/sources/`
and `Server/sources.mjs` in the same worktree.

## Your fence

- `public/framework/ext/Doc/Doc.js` (and its `doc/*.md`, `readme.md` if behavior changed)
- `public/framework/ext/files/files.js` — READ ONLY unless you find you must export one
  more helper from it; if so, keep the change additive (a new named export), never alter
  `files()`'s existing signature or behavior — 75 modules use it via `ext/Doc`'s Files tab
  and it must render exactly as it does today.

Nothing else. No routing change in `core/Router/Router.js` — that file has a dozen callers
and the owner's `redirect()`/`Router.enter()` backout (`core/Router/doc/backed-out.md`)
already ruled out adding a Router-level redirect concept; do the fix locally in Doc instead
(below). If you think Router.js truly needs to change, stop and post a question on the task
card instead of touching it.

## Deliverable A — nested notes render as a tree, any depth

Today `notes:` is a flat, space-separated list (`Doc.names`), and each note becomes exactly
one routed page at `doc/<name>/`. That is staying — zero behavior change for the ~75
modules that pass a flat list.

**What's new:** a note NAME may contain `/`, e.g. `notes: "intro guide/setup guide/config"`.
That should:

1. Still resolve to a real, bookmarkable page per leaf — `doc/guide/setup/`,
   `doc/guide/config/` — each backed by `doc/guide/setup.md`, `doc/guide/config.md`
   (same file-naming rule as today: `doc/${name}.md`, slashes and all). Building the
   intermediate `guide` page is on you — it can be a plain pass-through page whose only
   job is to hold the next segment's children (look at how `member_group()` already does
   a similar one-level indirection for `method`/`property`, `Doc.js:121-126`).
2. Render as a TREE in the Docs tab, not a flat vertical tab bar — reuse
   `ext/files/files.js`'s `nest()` and the row-drawing shape in `rows()` (`files.js:76-107`)
   for the look (folder icon, indent, `.file-tree` / `.file-dir` / `.file-name` classes —
   check `files.css` and reuse those classes so you inherit the styling, not fork it).
   The difference from `ext/files`: each leaf is a real link (`a()` with `href`) to the
   note's own page url, not a click-handler that swaps a query param — this is real
   routing, not the Files tab's single-view browser. Write this as a small new function in
   `Doc.js` (e.g. `note_tree(names)`), not a change to `files.js`'s own `rows()`.
3. A flat list (no `/` in any name) must render EXACTLY as it does today — same classes,
   same vertical tab bar. Only a nested list switches to the tree view. Check this by eye
   against an existing module (e.g. `/framework/core/Page/` Docs tab) before and after.

Pick one real module to prove this on — don't invent a demo. Good candidate:
`public/framework/ext/Doc/page.js` itself (Doc documenting itself) or
`public/framework/core/Page/page.js`. Add 3 short real notes, at least 3 levels deep
(`notes: "a b/c b/d/e"` is 3 deep: `b/d/e` → `doc/b/d/e/`). The content of each `.md` can
be a couple of honest sentences — this is proving the tree, not writing documentation.

## Deliverable B — `/docs/` resolves to `/doc/`

Nobody has hit this live (checked: no real page currently links `.../docs/...` meaning a
doc folder — the two real pages literally named "docs" today,
`public/framework/styles/layouts/docs/` and `public/framework/core/Page/overview/docs/`
and `.../overview/columns/uses/docs/`, are unrelated routed demo pages, not doc folders,
and must keep working exactly as they do — don't touch them). This is resilience for the
next time someone types `docs/` out of habit (the owner hit this once already, per
`owner-words-2.md`: *"I've already ran into the problem where we're linking from to either
doc or docs... I saw some inconsistency there"*).

Fix it **inside `Doc.js` only**, no Router change: override `child(name)` (not `route()`)
on the `Doc` class so that when `name === "docs"` and there is no real child already using
that name, it resolves exactly as `child("doc")` would (same page, same subtree, so any
number of segments after it — `docs/method/foo/` — still resolve correctly), and then
corrects the address bar with `history.replaceState` (swap the `/docs/` segment for `/doc/`
in `location.pathname`, keep search and hash). Call `super.child(name, levels)` for every
other name, unchanged. Test: visit `.../doc/` on your module, confirm it works; visit the
same page with `docs` substituted for `doc` in the url bar, confirm it loads AND the address
bar corrects itself to `doc/`; confirm Back from there returns you to where you came from
(one history entry, not two).

## Proof (paste into your report; the mastermind will screenshot at 1920 before landing)

- [ ] a 3-deep note tree, real module, real content
- [ ] flat-notes module renders unchanged (byte-for-byte same classes/markup shape)
- [ ] `.../docs/` loads the right content and the bar corrects to `.../doc/`
- [ ] the two real "docs"-named demo pages still load (they are not doc folders — don't
      let your `child()` override intercept them; they live under different parents so the
      override on `Doc` only ever fires when the PARENT is a `Doc` instance, but double-check)
- [ ] zero console errors on the pages you touched (`node Server/health-supervisor.mjs`
      from the worktree root, against `HEALTH_BASE=http://127.0.0.1:<worktree port>`, or
      just open devtools)

## Length budget

This whole job is two features in one file plus a bit of CSS reuse. If your diff to
`Doc.js` exceeds ~150 lines, stop and ask on the task card
(`2026/09/28/agent-work-on-every-page-sanity-checks-c`) before continuing — that's a sign
the design drifted.

When done, log your decisions and the proof checklist above (ticked, with what you actually
looked at) to `task.jsonl` beside this file, and tell your mastermind
(`task-mastermind-source-library`) you're done rather than merging yourself.
