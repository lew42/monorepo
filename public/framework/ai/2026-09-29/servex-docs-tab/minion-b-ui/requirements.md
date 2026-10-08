# Servex Docs tab — the UI (minion B)

Load the `minion` skill first. Your card/task directory (read the whole thread there, not
just this file): `public/framework/ai/2026-09-29/servex-docs-tab/` — parent card
`2026/09/29/openrouter-brain-a-knowledge-base-that-o`.

**Owner's ask (verbatim, from requirements.md one level up):** "the Servex dashboard
(Servex/public/, served on localhost / servex.localhost) gets a **Docs** tab. It lists every
module under `Servex/` and `Server/` that has a `readme.md`... Clicking one renders its
readme, its `doc/*.md`, and a `demo.js` if one exists, the way the site renders a module's
page. Every view has its own URL (`/docs/<path>`), so reload and back land in the same place."

Your slice is steps 2-3: **the tab itself**, in `Servex/public/**`. A sibling minion is
building the read-only API you fetch from, in parallel, in `Servex/pages.js` /
`Servex.js` — same worktree, different files, don't wait for them; build against the contract
below and test with your own dev instance either way.

## Work in this worktree only

`C:/Code/lew42/worktrees/servex-docs-tab` (branch `worktree/servex-docs-tab`, `node_modules`
junction already wired). Do not touch the main tree.

## Fence

`Servex/public/**` only. Read (don't touch) `Servex/public/servex.js` and `index.html` first
— that's the whole current dashboard, a single hand-built View page, no App, no Router, no
framework.css (see the big comment at the top of `servex.js` for why — Servex is not part of
the site).

## The API you fetch from (built by a sibling minion, same shapes either way)

`GET /api/docs` → `[{ path: "Servex/ext/openrouter", readme: true, docs: ["decisions.md"],
demo: false }, ...]`, sorted by `path`.

`GET /api/docs/file?path=<path>&file=readme.md|demo.js|doc/<name>.md` → raw text of that
file, plain text response body. 400 `{error}` if refused, 404 `{error}` if missing.

If the sibling's routes aren't landed yet when you start, write your fetch code against this
contract and test against a stub — or just start your own private Servex on the worktree
(instructions below) and check `curl http://127.0.0.1:<port>/api/docs` for real once they
commit; the branch is shared, so `git pull` isn't even needed, you're both in the same
worktree files.

## What to build

**Reuse the site's markdown renderer — don't add a dependency.** The dashboard's own server
(`Servex.Dashboard` in `Servex.js`) already serves `Servex/public/` first and the monorepo's
`public/` behind it, so `import md from "/framework/ext/markdown/md.js"` works exactly like it
does on the real site. Read `public/framework/ext/markdown/md.js` in the main tree (or this
worktree) first: `md(text)` takes a markdown STRING and returns a View (`div.md` or similar) —
that's the one you want, since your content arrives from a fetch, not a same-origin file
(`md.file()` resolves relative to `import.meta.url`, which is wrong here — don't use it).

**A new file, `Servex/public/docs.js`**, exporting one thing the dashboard mounts, e.g.
`export function Docs(){ ... }` returning a View — keep `servex.js` itself to the small glue
that imports it and switches between "the dashboard" and "the docs tab". Follow `servex.js`'s
existing house style: `View`/`div`/`a`/etc. from `/framework/core/View/View.js`, a `style(...)`
block at the top with your own `servex-docs-*` prefixed classes (never bare tag selectors —
`servex.js`'s own `style()` call is the pattern), plain functions, no class.

**Two views, switched by URL, not by deciding "there's only one page so ignore this":**

- `/` (and anything not starting with `/docs`) → what `servex.js` already draws (agents,
  projects, logs) — unchanged.
- `/docs` and `/docs/<module path>` → the Docs tab: a list of every module on the left
  (fetch `/api/docs` once on load), the selected module's rendered content on the right.

Put a small nav at the very top of the page (above `.servex-head` or inside it — your call,
keep it to two links) so a person can get from one to the other: "Dashboard" / "Docs". Use
real `<a href="/docs/">`/`<a href="/">` elements (so open-in-new-tab, ctrl-click, etc. all
keep working) and intercept the plain click yourself to `history.pushState` instead of a full
reload — the standard SPA pattern: on click, `event.preventDefault()`, `history.pushState(...)`,
then call your own `route()` function; also listen for the browser's `popstate` event and call
`route()` there too, so Back/Forward work. On first load, call `route()` once from whatever the
URL already is — that's what makes a reload land in the same place.

Clicking a module in the left list is the same pattern: `pushState` to `/docs/<path>/`, render.

**Rendering a module**, once picked:
1. Fetch `/api/docs/file?path=<path>&file=readme.md`, `md(text)` it into the right pane.
2. For each name in that module's `docs` array (from the `/api/docs` listing), fetch
   `/api/docs/file?path=<path>&file=doc/<name>` and render it too, under a small heading (the
   filename, minus `.md`, is fine — don't overbuild a tab strip, this is one screen, show
   everything stacked).
3. If `demo: true`, fetch `/api/docs/file?path=<path>&file=demo.js` as text and show it as a
   labeled `<pre><code>` block ("Demo source" heading is enough) rather than executing it —
   Servex has no App/Router to host a live demo in, and inventing one is bigger than this
   task. Say as much in a one-line code comment so the next agent doesn't wonder why it's just
   text.

A 400/404 from any fetch renders as one plain sentence in place of that section ("Not written
yet" style, same tone as `md.file`'s own fallback in `md.js` — read it, copy the tone, not the
code, since your fetch shape differs).

**Nothing crawls, no loading spinner theatre** — this is a tiny local tool, a fetch takes a
few ms. Empty state (module list still loading, or `/docs` with nothing selected) is one plain
sentence, not a blank box.

## Proving it — a PRIVATE Servex, never the live one

```bash
cd C:/Code/lew42/worktrees/servex-docs-tab
SERVEX_PORT=18191 SERVEX_PROXY_PORT=18181 SERVEX_NO_GATE=1 SERVEX_NO_ASSISTANT=1 \
SERVEX_NO_LAYERS=1 SERVEX_NO_POOL=1 SERVEX_NO_MONITOR=1 SERVEX_NO_USAGE=1 \
node Servex/index.js &
```
(pick a free port in 18100-18299 if a sibling's is already using one — `curl` it first to
check). Then open `http://127.0.0.1:18191/docs/` — since this is headless proof, not a tab the
owner or another agent is driving, use the `site` MCP tool's `shot` action
(`mcp__site__shot`) pointed at that URL to get a PNG, or drive it yourself with a short
Playwright script from your own scratchpad if `shot` won't reach a raw `127.0.0.1:<port>` url
— check both before assuming neither works. You need at least one screenshot showing the
Docs tab with `Servex/ext/openrouter` picked and its readme rendered, before you hand off.

Prove the URL contract too: load `/docs/Servex/ext/openrouter/` directly (not by clicking) and
confirm it renders the same thing a click would — that's the "reload lands in the same place"
requirement, and it's cheap to get wrong (state kept only in a JS variable, never read back out
of the URL on load).

If demo.js support needs a real file to prove against and none exists yet in the repo, create
a **throwaway** `demo.js` (one line, e.g. `export default () => "demo";`) under
`Servex/ext/openrouter/demo.js` in your worktree ONLY to screenshot the demo-source rendering,
then delete it (`git status` must show it gone) before you finish — it's outside your fence
and must never be committed.

## Land

Commit only `Servex/public/**` changes, plain message, on the worktree's existing branch
(`worktree/servex-docs-tab`). Put your screenshot(s) under
`public/framework/ai/2026-09-29/servex-docs-tab/minion-b-ui/` (a `.png`, committed in the MAIN
tree via your own task dir is fine — that's docs, not the fenced code). Append a `log` line to
`.../minion-b-ui/task.jsonl` with what you built and a link to the screenshot. Then send me
(your parent) one short message: done, the file paths, the screenshot path. Do not restart or
touch the live Servex. Do not merge — I merge once both minions land.

