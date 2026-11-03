# What was built from this research (the handoff)

Cloud session `e3fd9043`, 2026-10-29 → 11-01. The task record (the owner's words, plan, progress log, the two reviews) is in the session store: `public/framework/ai/sessions/2026/10/31/session-e3fd9043/item-mvp/` (dev server only; session records are not deployed).

**One line:** research into whether to build or buy the save, sync and streaming layer said *keep the Item / List / Page core and fix it*; this branch builds that, tested, and is ready to merge into `michael/dev` once the preview is checked.

## Where everything is

| What | Where |
|---|---|
| The code | branch **`claude/oop-streaming-research`** (renamed from `claude/replay-tests` on 2026-11-01; the old name is still on GitHub, every one of its commits is in the new branch, delete it when you like). It starts at `integration/data-shapes-2` `9ba46ee87` (2026-10-28), so it contains that whole branch. Preview: `claude-oop-streaming-research-monorepo.lew42.workers.dev` |
| The research | this folder, [`/framework/research/2026/10/29/persistence-sync/`](./) (copied from GitHub `mikelew42/research`, which can be archived; branch `research/persistence-sync` is superseded) |
| The plan, progress and the owner's open calls | `plan.md` in the task record (above); the owner's words: `requirements.md` there |
| The two independent reviews and their fixes | `review.md` and `review-2.md` in the task record |
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

## Against the research's phases

Moved to [core/doc/status.md](/framework/core/doc/status.md) (2026-11-01), with the check that sessions and tasks still replay the same: Phase 0 not done, Phase 1 about half, snapshots from Phase 2.

## Why every preview page was blank, and the fix (also affects `data-shapes-2` and `michael/dev`, not `main`)

Cloudflare answers a missing file with `index.html`; a module that comes back as HTML stops the whole app. Three causes, all fixed here: `ext/Chat/md.js` imported `ext/Markdown` (folder is `ext/markdown`); `ai/rail/inbox.js` and `ai/v/3/Prompts.js` imported `fold.js` from a session record folder that `.assetsignore` drops (moved to `ai/log/fold.js`); and `.assetsignore`'s `shots/` line dropped the code folder `ext/Shots/`, because Cloudflare matches case-blind (put back with `!framework/ext/Shots/`).

## Verified

- Core tests 39 of 41 (the other 2 need the live site); Files 70 + move 110 checks; item tool 116; deploy test passes.
- Real browser on the real preview of `claude/oop-streaming-research` (owner's PC, 2026-11-01, commit b2dfcdcce): 11 pages render with no module errors: `/`, `/framework/`, `/framework/research/`, the new research page and its app, the Replay Lab, a click-through test page, `/framework/ai/`, `ext/Shots`, `core/Item` and its Files tab. The only console error is the dev-server socket, which a static host doesn't have.
- A Cloudflare-faithful local copy (only committed files, `.assetsignore` matched case-blind) is how to check before pushing; it caught that a new `page.jsonl` page needs its parent's `files.jsonl` line committed.
- **No regressions in a 309-page random sample** (2026-11-01, Cloudflare-faithful local copy): served as Cloudflare would, the original `data-shapes-2` is blank on all 309 (the `ext/Shots` fault) and this branch renders 279 of them. The 56 pages with any problem on the branch were then compared with the original served without `.assetsignore` (so it renders): same outcome on all 56. Their problems were already there before this branch (below).
- Not run: `node Server/PreviewCheck.mjs <preview> --all` over every page on the real preview (the long run timed out through the remote tunnel). Optional; the sample above covers the risk.

## How the branches and repos flowed (2026-10-29 → 11-01)

1. **The research** started in its own GitHub repo, `mikelew42/research` (2026-10-29 → 31). It was copied into this monorepo on 2026-11-01, filed at `public/framework/research/2026/10/29/persistence-sync/`; the old repo's README points here and can be archived.
2. **`integration/data-shapes-2`** was built by the VS Code tab's integration mastermind (all nine data-shapes builds on one branch, `9ba46ee87`, 2026-10-28), ready to merge but never merged.
3. **This session branched from it** as `claude/replay-tests` and built the Item MVP there. **Renamed `claude/oop-streaming-research`** on 2026-11-01 (the owner's better name). The old remote name `claude/replay-tests` still exists on GitHub, for the owner to delete.
4. **Merged into `michael/dev` on 2026-11-01** (merge commit `9e849d788`, on top of `9bc81edc4`), which brought `integration/data-shapes-2` into `michael/dev` with it. Not merged into `main` (production): that waits for the owner.

## How to merge (owner: into `michael/dev`, not `main` yet)

**Done 2026-11-01:** merged on GitHub into `michael/dev` (merge commit `9e849d788`, from the cloud session); the one conflict was resolved by keeping both sides. The PC pulls `michael/dev`, then restarts Servex and the dev server ([handover](/framework/ai/handover.md)). The steps below are what was planned.

1. Open the preview and click around: https://claude-oop-streaming-research-monorepo.lew42.workers.dev/framework/. If you can't open it yourself, `node Server/PreviewCheck.mjs <that url> --all` does it headless (exit 0 = every page renders).
2. `git fetch origin claude/oop-streaming-research`, then merge it into your local `michael/dev`. A dry run (`git merge-tree`, 2026-11-01) showed **one conflict**: `public/framework/core/Session/tasks/data-shapes/plan.md`, a plan doc; keep both sides.
3. Your local `michael/dev` has about 134 commits GitHub doesn't; push it after the merge.

## Asked for or planned, not done (nothing here was started)

- **The owner's 10 small calls** (end of `plan.md` in the task record): when to switch `Store.marked_lines` on; `children: [...]` arrays block moving a child page (rewrite them, with undo?); Servex's live copy vs the socket; dedupe memory is server-only; and the rest.
- **Not built:** per-person UI state (D18: tabs, column widths); an Item variant that replays calls by default (experiment); running `Snapshots.mjs` automatically; a `children` array rewrite on moves; rebuilding the research app and the Replay Lab mock with the framework's own classes (the real Replay Lab exists; the research app is copied as-is).
- **Untested corners:** a line written but its ack lost, then the tab reloads; the crash-recovery undo of a move (`status: "moving"`); Windows-only file behavior (simulated here).
- **Owner's wider asks, recorded, not started:** a better branch strategy for the many loose `worktree/*` and `integration/*` branches; a whole-system review of where each agent finds the docs it needs (context bloat vs discoverability); a minion audit that every folder's readme indexes its contents (the rule is in `core/Page/doc/navigation.md`).
- **Broken before this branch (found by the page sample, not fixed):** the experimental site under `core/new/1/` imports `/ui.js`, `/budget/budget.js`, `/perf/ui.js` and `/content/show.js`, which exist nowhere in the repo (about 30 pages); a live demo in `ux/Content/catalog/catalog.json` (entry 65) imports `{ composer }` from `ai/cards/compose.js`, but the file is now `Compose.js` exporting `Compose` (broken on Windows too; the stale `compose.js` line in `ai/cards/files.jsonl` was marked gone on this branch); the `audio/` mic pages need `navigator.mediaDevices`, which a plain-http test host lacks (fine on https).
- **Known noise:** running the dev server in a Linux clone rewrites many `files.jsonl` lists (catch-up differences from the owner's PC); never commit them blindly.

## Rules the owner set this session (where they live now)

- Index every new page twice (links to it, links to its contents, at the top) and load it in a real browser before sending a link or proposing a merge: `core/Page/doc/navigation.md`.
- Simplest system that works for most cases; keep every caveat and alternative written down: research `design/decisions-log.md` (2026-10-31).
- Test-first: the failing test is its own commit, then the fix.
