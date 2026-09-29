# How a url becomes a page

Every url is resolved one folder name at a time — never all at once. A url like
`/framework/core/Page/doc/` asks for `framework`, then `core`, then `Page`, then `doc`, each
as its own step, each one handed to the page found in the step before it.

## The order, in one glance

1. <a id="step-1"></a>**Memory** — if this name is already in `this.children` (even set to `null`, meaning
   "not loaded yet"), that answer wins and nothing below runs.
   `Page.class.js:203`, inside [`child()`](/framework/core/Page/doc/method/child.md).
2. <a id="step-2"></a>**A declared `page.jsonl`** — if something already told this page that the name is a
   `page.jsonl` child (a `children:` string, or a `file` line), it is loaded from that file.
   `Page.class.js:208-211`.
3. <a id="step-3"></a>**`md/` and `fs/`** — every page has these two built-in children: its markdown files as
   pages, and its raw files, full screen. Checked before anything dynamic, so they always exist.
   `Page.class.js:215` and `Page.class.js:220`.
4. <a id="step-4"></a>**`route(name)`** — if the page defines a `route()` method, it gets first refusal on any
   name nobody has declared. `Page.class.js:222-223`; the mechanism in full:
   [`core/Page/dynamic/`](/framework/core/Page/dynamic/).
5. <a id="step-5"></a>**`page.js`** — try importing `page.js` from that folder. `Page.class.js:225-226`, which
   calls [`Page.load()`](/framework/core/Page/doc/method/load.md) at `Page.class.js:396-398`.
6. <a id="step-6"></a>**A bare `.md` file** — last try: a markdown file with that name, wrapped as a page.
   `Page.class.js:228-229`, via `Page.file()` at `Page.class.js:373-388`.
7. <a id="step-7"></a>**Not found** — nothing matched, so `child()` returns `null`. The url's own walk
   ([`Router.load_segments()`](/framework/core/Router/), `Router.js:79-88`) stops there and
   falls back to `location.assign(url)` — a real navigation, which the site's own 404 or SPA
   fallback answers.

<!-- The Overview's seven-tile strip (core/Page/page.js, finding 2, 2026-09-29 fix round
     2) links to these anchors. Today a cross-page click still lands at the TOP of this
     page — Router.js's activate() always resets scroll on navigation — so the tile's
     own id is exact even though the landing spot isn't yet; fixing that is a Router
     change, out of this task's fence. -->

**The walk IS the loader.** The Router doesn't resolve a url in one shot; it calls
`page = await page.child(name)` once per path segment, and each call runs the seven steps
above for that one name.

## Two traps

- **A declared child skips `route()` entirely.** Step 4 only runs for a name nobody has
  declared. If a name is already in `children:` — even pointing at nothing yet — `route()`
  never sees it, so a page can't override a name it already listed.
- **`page.jsonl` is never looked for blind.** Step 2 only fires when something already said
  "this name is a jsonl child" — a `children:` string in a `page.js`, or a `file` line a
  page.jsonl itself wrote. Walk up to an *undeclared* folder that only has a `page.jsonl`
  sitting in it, and step 2 never triggers; only a real `page.js` (step 5) or a bare `.md`
  file (step 6) is ever found by probing.

## page.js or page.jsonl?

Two different ways to make the same kind of page. Neither is going away — this table says
which one to reach for.

| | `page.js` | `page.jsonl` |
|---|---|---|
| Real layout (columns, grids, widgets, live data) | yes | no — always reading-width |
| `route()` for dynamic children | yes | no |
| Custom `child()` / `open_link()` / `bar()` / `tabs()` overrides | yes | no |
| Title, icon, any plain property | yes | yes |
| A file that exists on disk (`file`) or has vanished (`gone`) | by hand | yes, written by the file watcher |
| Content placed on the page, in order (`place`) | by hand | yes |
| Accumulating data (`weight`, a count, anything a subclass adds a method for) | by hand | yes |

## What goes where

- **Use `page.jsonl`** for a page's title, icon, placed content, the files it lists, and any
  accumulating data — anything that is really just a growing log of facts about the page.
- **Use `page.js`** for a real layout, a `route()`, or any logic beyond "call this method with
  this value" — anything the page has to *decide*, not just *record*.

A `page.js` folder that also wants log-style state (settings, weight, tabs) keeps that data in
its **own** file next to `page.js` — `weight.jsonl` in [`core/Page/weight/`](/framework/core/Page/weight/)
is the working example — never in a `page.jsonl` of its own. The file watcher that writes
`file`/`gone` lines explicitly skips any folder that has a `page.js`
(`Server/plugins/PageFiles.js:95`, dev-only — not a page, no url), so a `page.jsonl` sitting
next to a `page.js` would get no writes and just go stale — one file, one writer, is the rule
either way.
