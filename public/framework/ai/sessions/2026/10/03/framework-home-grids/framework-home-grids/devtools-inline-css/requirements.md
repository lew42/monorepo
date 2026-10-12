# Why does DevTools show two rules as an inline &lt;style&gt;, not framework/page.css?

You are a minion. Load the `minion` skill first. Work in the worktree at
`C:\Code\lew42\worktrees\framework-home-grids` (branch `worktree/framework-home-grids`, its
own dev server already running — ask your parent for the port if you need it).

Parent task dir: `public/framework/ai/2026-10-03/framework-home-grids/requirements.md`. Log
your steps in
`public/framework/ai/2026-10-03/framework-home-grids/devtools-inline-css/task.jsonl` (create
it).

## The owner's words

> DevTools: most selectors link to framework/framework.css, but these two show an inline
> style element, and clicking it goes to the link in the head for page/page.css. Why?

"These two" is almost certainly the `.wall, .page-previews:where(:not(.page))` rule and the
`.page-previews:where(:not(.page)) { --column: 14em; … }` rule right after it, in
`public/framework/core/Page/Page.css` (~line 1138 and ~1217) — the ones a sibling task
(`../grid-fill/`) is editing right now, which is why the owner was looking at them in
DevTools in the first place. Confirm this is actually the pair before you dig further — open
`http://localhost:<your-worktree-port>/framework/`, inspect a `.page-preview` card's parent
(a `.page-previews` div), and look at its Styles pane yourself (headless Playwright —
`page.evaluate`/CDP, or just read the rendered HTML/CSS by hand; NEVER drive the owner's own
open browser tabs — no `mcp__site__eval`/`claim`/`pages` on a connected tab, that's live and
not yours to touch).

## What to actually check (cheapest first)

1. **Is there really a `<style>` tag in `<head>` or `<body>` that ALSO defines
   `.page-previews` or `.wall`?** `document.querySelectorAll("style")` and look at each
   one's `textContent` — `public/framework/dev/Socket/Socket.js`'s `inject_style()` adds a
   couple (`dev-reconnect-strip`, `dev-stale-pill`) but those are unrelated selectors; if
   there's a THIRD one you don't recognise, that's your answer — find what injected it
   (grep the repo for `document.createElement("style")` and for the `style(...)` factory
   from `core/View/View.js`'s `View.elements()`, which builds `<style>` tags appended to
   `document.head`).
2. **Is `Page.css` loaded through more than one `<link>`, or has it been swapped by live
   reload?** `public/framework/dev/Socket/Socket.js`'s `restyle(path)` (~line 413) says it
   only bumps `?t=` on the SAME existing `<link>` element — read it and confirm that's really
   what happens (not a `<style>` fallback anywhere in that file or in
   `Server/plugins/SocketServer/LiveReload.js`). If `restyle()` ever returns `false` for
   `Page.css` (its `links.length` check fails), `changed()` falls through to a full
   `reload()`, which would NOT produce an inline style either — so if live reload really is
   the cause, find the exact code path that creates a `<style>` tag instead of touching the
   `<link>`. If you can't find one, say so plainly rather than guessing.
3. **Chrome DevTools itself.** It's possible this is a DevTools display quirk rather than
   anything this codebase did — e.g. Chrome sometimes attributes a rule inside `@layer` to
   the wrong source when a stylesheet was inserted after first paint via `appendChild`
   (exactly how `View.stylesheet()` inserts every `<link>` on this site — see
   `core/View/View.js` ~line 379). If you reproduce this reliably and it reproduces on OTHER
   `@layer`-wrapped rules loaded the same way (not just these two), that points at a
   browser/insertion-order quirk rather than a bug of ours, and the right answer is "this is
   how Chrome shows any dynamically-inserted `<link>`'s `@layer` rules the first time you
   inspect them before a reload" (or whatever you actually find) — not a fix you invent to
   make a DevTools display issue go away.

## Do

- Find the real cause. Favor reproducing it yourself (headless) over reasoning from the
  code alone — the owner described a specific, repeatable DevTools interaction.
- If the cause is something this codebase controls and the fix is small and safe (e.g. a
  live-reload path that really does fall back to an inline `<style>` for CSS instead of
  swapping the `<link>` href), fix it — have it swap the `<link>` href (cache-busted)
  instead, so DevTools keeps the real filename.
- If the cause is a DevTools/browser quirk with no safe code fix (or the fix would be
  invasive — e.g. a core/View change with many callers), do NOT force a workaround. Say so.
- Either way: write the answer as ONE line, plain language, no jargon dump — this goes
  straight onto the task's owner-facing card. Put it in your task.jsonl as
  `{"log":{"at":"…","msg":"ANSWER: <one line>"}}` so your parent can copy it verbatim.

## Fence

If a fix is warranted, write only: `public/framework/dev/Socket/Socket.js` and/or
`Server/plugins/SocketServer/LiveReload.js`. Do NOT touch `core/View/View.js` without
checking with your parent first (a dozen-plus callers — "ask before" territory, CLAUDE.md).
Don't touch `page.js` or `Page.css` — a sibling minion owns those. Commit in the worktree
only if you changed something; a pure investigation with no code change still gets a
task.jsonl with its answer.
