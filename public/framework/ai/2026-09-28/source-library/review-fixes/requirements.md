# Close the review findings on the source-library task

Load the `minion` skill first. A fresh reviewer just read the whole diff with no context
from the building of it and wrote `public/framework/ai/2026-09-28/source-library/review.md`
(verdict: fix, 11 findings). Read that file in full before touching anything — it's your
brief. Also skim the parent task's `public/framework/ai/2026-09-28/source-library/requirements.md`
for the original asks these findings are checking against.

**Work in the shared worktree:** `C:\Code\lew42\worktrees\source-library` (branch
`worktree/source-library`, its own dev server — check `.worktrees.json` or ask if you need
the port; the proxy is `http://source-library.localhost/`). Commit there.

## Your fence

Only the files review.md's findings actually name:
- `public/framework/page.js` (finding 1 — one line, add `sources` to `children:`)
- `public/framework/ext/DesignTool/doc/file/{mirror,probe,report,live}.js.md` (finding 2)
- `public/framework/sources/page.js` (findings 3, 7)
- `public/framework/ai/2026/09/page.jsonl`, `public/framework/core/Page/jsonl/page.jsonl` (finding 4)
- `public/framework/ext/Doc/Doc.js` (finding 6, optional — see below)
- `public/framework/sources/readme.md` (finding 9)
- `public/framework/styles/css-scopes.txt` (finding 10)

Nothing else — this is a fix pass, not a rewrite.

## Findings 1, 2, 4 — do exactly what they say

1. `sources` isn't in `public/framework/page.js`'s `children:` list, so `/framework/sources/`
   404s — "nothing crawls" (root `CLAUDE.md`). Add it.
2. Four `.md` files under `ext/DesignTool/doc/file/` still link `../../docs/…` instead of
   `../../doc/…` — the module's OWN convention, from before this task. Fix all four.
3. Two `.jsonl` watcher files (`ai/2026/09/page.jsonl`, `core/Page/jsonl/page.jsonl`) picked
   up lines that don't belong to this task's diff — most likely the dev server's own
   file-watcher catching up on pre-existing, previously-untracked state the moment
   something nearby changed, not anything this task's code wrote on purpose. Check: do
   `public/framework/ai/2026/09/25/` and `public/framework/core/Page/jsonl/readme.md`
   already exist independently of this task? If yes, these two lines are the watcher
   correctly catching up, not a stray write — say so in your log and revert them anyway
   (a task's diff should only carry what it meant to change, watcher catch-up included).
   If either file looks like something THIS task's code created, that's a real bug — find
   what wrote it and fix that instead of just reverting the log line.

## Finding 3 — the sources library "uses the same browser" as the Docs tab

The task's own requirements.md (piece 4) says the sources library should use the same
`ext/files`-style browser as the nested doc tree, not its own thing. Right now
`sources/page.js`'s `topic_page()` draws a wall of preview cards instead. Bring it in line:
import `files` from `../ext/files/files.js` (same import ext/Doc's `browser()` uses) and
give the topic page a `render()` that calls it, `about: path => …` showing the badge row
(authority/kind/url) plus the converted body (reuse or export `strip_frontmatter` for this).
The path list `files()` needs is a space-separated string — build it from the topic's
`index.jsonl` rows' own `path` field (already relative like `opencode/opencode-cli-...md`).
Keep the topic WALL (the library's front page listing topics) as cards — that one is a
directory of topics, not a directory of files, and cards are the right read there; only the
per-topic view changes. Screenshot the result at 1920 and compare it by eye to
`ext/Doc`'s own Files tab — same shape, same panels.

## Finding 6 (optional, your judgment) — `child()` firing on more than a real navigation

`Doc.js`'s `docs` → `doc` redirect (`history.replaceState`) runs inside `child()`, which the
Router also calls to walk a chain during things that are not a full navigation (a preview, a
prefetch — check `core/Page/Page.class.js` for anywhere `child()` gets called outside
`Router.load_segments`). If you find a real path where this fires without the address bar
actually being `/docs/...`, guard it with a check against `location.pathname` before calling
`replaceState`. If you don't find one, say so in your log and leave it — don't guess at a
fix for a bug you can't reproduce.

## Finding 7 — `res.ok` check missing

`sources/page.js`'s source-page fetch (was line ~695) doesn't check `res.ok` before reading
`.text()`, unlike `read_jsonl()` right above it which already does. Match that pattern: a
missing `.md` should show a plain "not found" message, never the site's 404 HTML rendered
as if it were markdown.

## Finding 9 — dead link

`sources/readme.md` links `/Server/sources.mjs`, which the static site never serves (it's a
dev-only Node script, not a page). Point it at the file in the repo on GitHub if this repo
has a remote worth linking, or just drop the leading slash and say "at `Server/sources.mjs`
in the repo" instead of a link.

## Finding 10 — the css-scopes reservation

Add the `sources-` prefix line to `public/framework/styles/css-scopes.txt` yourself — it's
one line in a file outside your original fence, but you're the one who can write it now,
and `sources/doc/decisions.md` already recorded the exact line to add.

## What NOT to do

- Finding 5 (missing proof shots) and finding 8 (the fan-out saves the searcher's summary,
  not a literal page conversion) are for your mastermind to handle — finding 5 because the
  proof already exists from manual verification and just needs writing up, finding 8
  because it's a judgment call about the tool's design, not a bug. Leave both alone.
- Don't re-run the fan-out. The three topics are seeded and clean (deduped already);
  spending more money re-fetching is not useful right now.

## When you're done

Answer every finding in `public/framework/ai/2026-09-28/source-library/task.jsonl`
(`{"review":{"answer":{"n":1,"reply":"fixed"}}}` etc. — one line per finding, 1 through
10; skip 5 and 8, they're not yours). Take one fresh screenshot at 1920 of
`/framework/sources/` (the library front page) and one of a topic page in its new
files-browser shape, and say where you saved them. Report back to your mastermind
(`task-mastermind-source-library`) rather than merging yourself.
