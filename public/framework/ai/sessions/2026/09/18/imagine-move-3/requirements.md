# imagine-move-3 — the seven shape labs join `/layouts/`

Load the `minion` skill first. Then this brief.

Full context: [`ai/2026-09-17/imagine-integration/proposal.md`](../../2026-09-17/imagine-integration/proposal.md)
(section "3 · The shape labs join `/layouts/`") and
[`inventory.md`](../../2026-09-17/imagine-integration/inventory.md) (the per-url rename table
with a break count) — read both before editing.

## The brief, as given by the coordinator

**The move:** Move 3 of `public/framework/ai/2026-09-17/imagine-integration/proposal.md` (read it
and `inventory.md` first — the rename table with a break count per url is there): the seven shape
labs under `/imagine/` (the proposal names them, `/imagine/layouts/` first) join `/layouts/`, and
every old address keeps a six-line stub `page.js` that renders one line and a link to the new home
(production is static; core has no redirect; `/layouts/` already serves an alias id as a working
url — copy that pattern). The owner's words (2026-09-17): "recommend renaming or restructuring to
simplify architecture, UI"; the mastermind's decision (2026-09-17, `imagine-moves`): do it. The
owner's naming rule: `/layouts/` ids are `N-name`; the lab's `N.name` numbers become that or become
tags — the proposal says which.

**Do, in this order, with a count at each step in your log:**

1. `git status --porcelain public/imagine public/layouts` must be clean for the dirs you move — if
   a sibling minion is editing any of them, stop and report.
2. Count the live links to each old url with
   `rg -c "imagine/<realm>/" public --glob "*.js" --glob "*.md" --glob "*.json"` (a pattern
   starting with `/` returns nothing through this Bash tool — drop the slash).
3. Move each dir with `git mv` (never a copy), add it to `/layouts/page.js` `children:` and one
   visible line in its `content()`, one line in `/layouts/readme.md`.
4. Rewrite the links (`rg -l` then a careful replace per url, never a blanket sed on `imagine/`),
   and re-count: the number rewritten must equal the number counted.
5. The stubs.
6. Crawl on your private server (`PORT=8124 node server.js` — corrected from 8123, which is the
   mastermind's own private server and already listening — background, killed by its real Windows
   PID): every new url answers with its own h1 (span-titled under a columns host: check
   `document.title`), every old url answers with its stub, zero console errors, zero 404s across
   the moved pages and `/layouts/` and `/imagine/`, at 1280; then `rg` for any remaining old url
   across `public/` (excluding `public/framework/ai/**` — task logs are history and stay): zero.
7. The `/imagine/` rail (sorted into groups last night in `public/imagine/page.js`) loses the moved
   realms from its Shapes group — edit only those entries.

**Fence:** the seven realm dirs (moved), `public/layouts/page.js`, `public/layouts/readme.md`, the
files whose links you rewrite (each named in your log), `public/imagine/page.js` (the group
entries), the stubs, your task dir. Nothing else — not `/imagine/design/` (two minions are in it),
not core. The owner's dev server on port 80 is running: never touch it; LiveReload will push your
moves to the owner's tabs, so do the moves in one sitting and the link rewrites right after. Never
`git stash`, never `find /`, never drive the owner's tabs.

Two numbers that must agree: links counted and links rewritten; new urls and old stubs.

Final message: one screen — realms moved, links rewritten, stubs, the crawl verdict, what was left
and why.

## Mid-task correction from the coordinator

Port 8123 is the mastermind's own private server and already listening. Use `PORT=8124 node
server.js` instead. Everything else in the brief stands. (Folded into step 6 above already.)

## What the rename table (inventory.md) actually says for these seven

| Old url | New url | Live links |
| --- | --- | --- |
| `/imagine/layouts/` | **deleted outright** — stub points at `/layouts/` (not a subdir — this realm's own readme already conceded `/layouts/` owns the names; its `N.name` numbering is superseded by the standard's `N-name`) | 73 |
| `/imagine/shells/` | `/layouts/labs/shells/` | 36 |
| `/imagine/screens/` | `/layouts/labs/screens/` | 32 |
| `/imagine/sections/` | `/layouts/labs/sections/` | 28 |
| `/imagine/blogx/` | `/layouts/labs/blogx/` | 10 |
| `/imagine/mag/` | `/layouts/labs/mag/` | 5 |
| `/imagine/decks/` | `/layouts/labs/decks/` | 4 |

Total live links: 188 (the proposal's "68 files hold 402 links" figure for move 3 as a whole
includes internal links between pages inside these realms and links already pointing correctly
after the move — 188 is what `inventory.md`'s own per-row column counts as *live links from
outside the realm*, which is the number this brief's step 2/4 check is built around).
