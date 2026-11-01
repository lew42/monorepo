# Branch assessment: integration/data-shapes-2 vs michael/dev

Checked 2026-10-30. Merge base `3f18c92c` (2026-10-28). Tips: integration `9ba46ee8` (2026-10-28), michael/dev `ecd14599` (2026-10-29).

## 1. Verdict
- **Upgrade: yes.** It fixes bugs that fail on michael/dev today (a streamed line lost between two sockets; `by`/`ts` stored as data) and adds 7 core test files that pass here.
- **Ready to merge: nearly.** It merges with one doc conflict and no code conflicts. Not "press the button" ready: two of its own owner checks are marked "no", and its tests were only partly reproducible here (no browser, no real Servex).
- **Biggest risk:** one change of 86 commits and 222 files that rewires how every record line is written (one writer, new ids, dotted paths). It lands while the owner's 2026-10-29 forks F6 and F7 (on michael/dev) lean away from two of its design points.

## 2. What changed
- **Size:** 86 commits ahead of the base, 222 files, +19.8k/-1.2k. About 14.7k of the added lines are review and proof records committed under `core/Session/tasks/data-shapes/build/integration-2`. The rest is about 5k added lines, 4.3k of them JS/CSS (tests included).
- **Streaming fix:** `Server/plugins/SocketServer/Tail.js` keeps one offset per socket. Before, one offset per file meant a second socket subscribing could swallow a line the first never got. `ext/JSONL/live.js` also skips lines a reader already holds.
- **One writer:** new `core/Item/RecordWriter.js`. Hooks, the browser Store and `on-landing` post record lines to Servex `/api/item`, which applies them to a live root and appends. The dev server's `Append.js` skips lines already written. If Servex is down they append directly.
- **Item:** dotted paths (`a.b.c`) are walked level by level. `set(prop, item)` now adopts the child, so its later changes are saved. `by`/`ts` become a clock, not data. `find()` uses an id index. `Item.open(url)` gives one root per file.
- **New `Ref` + `RefView`:** a pointer that re-paths on move and follows a `{moved_to}` forward. `item.move_to(dest)` is the one move verb.
- **Ids:** new ids are 8 random characters, not slugs of the title. Old explicit ids still replay.
- **List:** id-to-member Map; a list registers itself on its owner, so `{"pages":{"add":...}}` replays into `pages`.
- **Page:** small. `children` is marked deprecated for `pages`; a page keeps its `by`/`ts` stamp on the line.
- **Item tool (`Servex/agents/page_tools.js`, +264/-73):** generic over every class, one live root per file (capped at 1000, least recently used go cold).
- **Removed or slimmed:** the old `post_to_tool` path, the `/` move path, Ref's unused node resolver. `ux/Content/Object/Inspect.js` and `Object.js` shrink to 17-line wrappers over one `DefaultView`. Nothing deleted outright; 13 code marks and 42 docs say DEPRECATED. A test view, class docs and a worktree preview feature ride along.

## 3. Tests
I exported each branch with `git archive` into the scratchpad and ran every `*.test.mjs` with `node` (Node 22, `npm ci` for deps). No browser and no live site, so smoke tests could not run.

| Set | michael/dev | integration |
|---|---|---|
| core (all `core/**`) | 19 of 21 files pass | 26 of 28 files pass |
| Server + Servex | 110 of 121 pass | 115 of 127 pass, plus 1 flaky |

- **Core failures (same on both):** `Template.test` and `TasksPage.test` need a site at `monorepo.localhost`.
- **Server/Servex failures (same 11 on both):** OutPath, TaskMigrate, Worktrees, review, session-summary, PromptLines, Sessions, landing-check, log-tool, RemoteMCP, whisper-detach. They need a real git checkout, Windows paths or external services. No test fails only on integration, apart from the flaky one below.
- **Test counts that grew:** Item.test 16 to 28 assertions, List.test 17 to 19. New: persistence matrix 82 checks, Ref 28, delta-flow 10, RecordWriter 9, Item/List/Task steps 6/7/7, Tail 9.
- **Branch's own tests run against michael/dev code** (copied into a third scratch copy):
  - `Tail.test.mjs` fails: "A still gets line 2 when the watcher fires (got [1], wanted [1,2])". The lost-line bug is real on dev.
  - `persistence.test.mjs` shows 25 mismatches, then crashes. Many are `by`/`ts` leaking into data, which is real. The crash is probably a missing new API, so don't count it as proof.
  - `delta-flow.test.mjs` fails on dev, passes on integration.
- **Flaky new test:** `Servex/agents/one-writer.test.mjs` failed in 4 of 7 runs here ("every line's by|ts is unique (got 3040, wanted 3041)"), and passed 19/19 otherwise. Cause: the item tool stamps with plain `new Date().toISOString()` (`page_tools.js` line 225), which can repeat within a millisecond. `RecordWriter.fresh` treats a matching `by|ts` as a twin and drops the line. Narrow case (only the fallback path), but it is a possible silent drop. Code: https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/Servex/agents/page_tools.js#L225 and https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/RecordWriter.js#L71-L75
- **Branch's own report** (not rerun): full suite 172 of 174 versus 158 of 161 on the base; 60 pages smoke-tested ok; merge dry run clean.

## 4. Merge risk
- michael/dev has 44 commits since the base: 40 are "servex: log sweep", 4 are real (heartbeat fix, F6/F7 forks, ready-to-merge note, merge.mjs pushes to GitHub). 36 files changed, +363/-176.
- A trial `git merge-tree` of the two tips gives **1 conflict**: `core/Session/tasks/data-shapes/plan.md`, the "Integration 2" status row (both sides edited it). Docs only. Everything else merges cleanly.
- Hot files: only `plan.md` is touched by both. Dev's code changes (`Servex/Heartbeat.js`, `Server/merge.mjs`, `CLAUDE.md`) are files the branch does not touch.
- **Semantic overlap, not textual:** dev's F6 (owner 2026-10-29: "just call this.store and then a method on it... more direct and programmatic rather than evented") would replace the `emit("delta")` bubbling that integration builds on. F7 leans toward `add` making a `Ref` instead of silently re-parenting; integration still re-parents silently (`List.adopt` sets `child.parent` unconditionally). Merging does not block either, but it enlarges the surface to change later.
- Hooks (`append.mjs`, `ledger.mjs`, `naming-guard.mjs`) change for every agent session. With Servex down, a hook stalls about 3 s (the branch measured 3,064 ms) before falling back.

## 5. Check before merging
- Resolve the `plan.md` row, then rerun the suite on the merged result, in a real checkout with a running site so the two browser tests and the smoke pass actually run.
- Do the branch's own two-tab check after landing (add, edit, move on `/framework/core/Page/tool/`: exactly one line per change). Its report says the edit shows only after the next move, and the voice session redraws about 94 ms per streamed line (up to 376 ms long tasks). Decide that both are acceptable.
- Plan the restarts: Servex (`page_tools.js`, `Servex.js` changed) and the dev server (`Append.js` changed), never during a voice call.
- Fix or accept the same-millisecond stamp issue (`one-writer.test` is the failing test; it passes when stamps are unique).
- Note `merge.mjs` on michael/dev now pushes michael/dev to GitHub after a landing, so the merge will publish immediately. Also check that agent-facing docs cover the id change (CLAUDE.md and skills were not edited; `Servex/doc/item-tool.md` was).

Scratch work: `/tmp/claude-0/-home-claude/e3fd9043-ad4b-5d36-9e28-17f46c3e0b52/scratchpad/branch-test/` (exports `dev/`, `integ/`, `devx/`; result files `*-core.txt`, `*-srv2.txt`, `*-rerun.txt`, `*-root.txt`).
