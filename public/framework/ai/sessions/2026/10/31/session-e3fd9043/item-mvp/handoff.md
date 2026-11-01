# Handoff: the OOP streaming research and the Item MVP (cloud session e3fd9043, 2026-10-29 → 11-01)

**One line:** research into whether to build or buy the save, sync and streaming layer said *keep the Item / List / Page core and fix it*; this branch builds that, tested, and is ready to merge into `michael/dev` once the preview is checked.

## Where everything is

| What | Where |
|---|---|
| The code | branch **`claude/oop-streaming-research`** (renamed from `claude/replay-tests` on 2026-11-01; same commits). It starts at `integration/data-shapes-2` `9ba46ee87` (2026-10-28), so it contains that whole branch. Preview: `claude-oop-streaming-research-monorepo.lew42.workers.dev` |
| The research | [`/framework/research/2026-10-29-persistence-sync/`](/framework/research/2026-10-29-persistence-sync/) (copied from GitHub `mikelew42/research`, which can be archived; branch `research/persistence-sync` is superseded) |
| The plan, progress and the owner's open calls | [plan.md](plan.md) in this folder; the owner's words: [requirements.md](requirements.md) |
| The two independent reviews and their fixes | [review.md](review.md), [review-2.md](review-2.md) |
| Artifacts (outside the repo) | research app https://claude.ai/artifact/JwAL71fvKRDUTHYyz1LJLx · Replay Lab mock https://claude.ai/artifact/1Tj59c1Bz6Y8iq89CiDCT5 (both also in the research folder as files) |

## What was built (every behavior change has its failing test first)

- **Replay Lab on the real classes:** [/framework/core/Item/replay/](/framework/core/Item/replay/).
- **Visual tests:** `test("name", fn)` renders each test as a block, objects drawn with `DefaultView`; click-through list in `core/Item/readme.md`.
- **Item core:** save no longer depends on view listeners; `act()` mutes only its own tree; `set()` refuses unsavable values; a running task keeps its time (`ran_since`); `name()` / `#id` lines read everywhere (writing behind `Store.marked_lines`, off); `set_<key>` hooks; `as_call`; `view.bind`.
- **Transport:** numbered, acked, resent lines (outbox in `localStorage`, heartbeat); record files go to Servex first (so Approve starts agents), the socket is the fallback.
- **Snapshots:** `<file>.snapshot.json` beside the log, `Server/Snapshots.mjs` (dry run by default) proves snapshot + tail = full replay.
- **Files:** a live `files/` tab on every page; on the dev server create, upload or drop, rename, move (picker or drag, dry-run plan, undo), set aside. Design: `core/Page/doc/files.md`.
- **Docs:** the core API as pseudo-classes, `core/doc/overview.md`.
- **The framework page** lists its sections first; stats moved below; Research is a section.
- **Deploy safety:** `Server/deploy-imports.test.mjs` (no uploaded module may import a file `.assetsignore` leaves out, matched as Cloudflare does) and `Server/PreviewCheck.mjs <url>` (real browser on a deployed preview).

## Why every preview page was blank, and the fix (also affects `data-shapes-2` and `michael/dev`, not `main`)

Cloudflare answers a missing file with `index.html`; a module that comes back as HTML stops the whole app. Three causes, all fixed here: `ext/Chat/md.js` imported `ext/Markdown` (folder is `ext/markdown`); `ai/rail/inbox.js` and `ai/v/3/Prompts.js` imported `fold.js` from a session record folder that `.assetsignore` drops (moved to `ai/log/fold.js`); and `.assetsignore`'s `shots/` line dropped the code folder `ext/Shots/`, because Cloudflare matches case-blind (put back with `!framework/ext/Shots/`).

## Verified

- Core tests 39 of 41 (the other 2 need the live site); Files 70 + move 110 checks; item tool 116; deploy test passes.
- Real browser on the real preview (owner's PC, 2026-11-01): the home page, `/framework/`, the Replay Lab, `/framework/ai/`, a test page, `ext/Shots`, a Files tab all render.
- Not yet: `node Server/PreviewCheck.mjs <preview> --all` over every page (the long run timed out through the remote tunnel; run it locally before merging).

## How to merge (owner: into `michael/dev`, not `main` yet)

1. Check the preview: `node Server/PreviewCheck.mjs https://claude-oop-streaming-research-monorepo.lew42.workers.dev --all` (exit 0 = every page renders).
2. `git fetch origin claude/oop-streaming-research`, then merge it into your local `michael/dev`. A dry run (`git merge-tree`, 2026-11-01) showed **one conflict**: `public/framework/core/Session/tasks/data-shapes/plan.md`, a plan doc; keep both sides.
3. Your local `michael/dev` has about 134 commits GitHub doesn't; push it after the merge.

## Asked for or planned, not done (nothing here was started)

- **The owner's 10 small calls** (end of [plan.md](plan.md)): when to switch `Store.marked_lines` on; `children: [...]` arrays block moving a child page (rewrite them, with undo?); Servex's live copy vs the socket; dedupe memory is server-only; and the rest.
- **Not built:** per-person UI state (D18: tabs, column widths); an Item variant that replays calls by default (experiment); running `Snapshots.mjs` automatically; a `children` array rewrite on moves; rebuilding the research app and the Replay Lab mock with the framework's own classes (the real Replay Lab exists; the research app is copied as-is).
- **Untested corners:** a line written but its ack lost, then the tab reloads; the crash-recovery undo of a move (`status: "moving"`); Windows-only file behavior (simulated here).
- **Owner's wider asks, recorded, not started:** a better branch strategy for the many loose `worktree/*` and `integration/*` branches; a whole-system review of where each agent finds the docs it needs (context bloat vs discoverability); a minion audit that every folder's readme indexes its contents (the rule is in `core/Page/doc/navigation.md`).
- **Known noise:** running the dev server in a Linux clone rewrites many `files.jsonl` lists (catch-up differences from the owner's PC); never commit them blindly.

## Rules the owner set this session (where they live now)

- Index every new page twice (links to it, links to its contents, at the top) and load it in a real browser before sending a link or proposing a merge: `core/Page/doc/navigation.md`.
- Simplest system that works for most cases; keep every caveat and alternative written down: research `design/decisions-log.md` (2026-10-31).
- Test-first: the failing test is its own commit, then the fix.
