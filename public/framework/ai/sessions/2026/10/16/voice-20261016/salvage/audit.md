# Salvage audit: what is stranded on unmerged branches (2026-10-16)

**Read this first:**

- 422 local branches besides `main` and `michael/dev`.
- **239** have nothing that dev lacks.
- **183** carry commits not on dev, and of those **75** are pure noise (only `*.jsonl`, `index.json`, `*.log`).
- Another 11 change non-noise files but no source (`.js .mjs .css .md` outside `sessions/`).
- **97** touch real source, but dev has rewritten almost all of it: of the files they changed, only a handful are cleanly missing on dev (the single clean one is a `salvage/qf-6` branch, 1 file).
- So this is mostly superseded history, not lost work.

Method: `git rev-list --count michael/dev..B`; changed files from `git diff michael/dev...B`. "same/div/gone" = of the branch's source files, how many are now byte-identical on dev / changed on both sides / absent on dev.

## Top 25 by real source files changed

| branch | last commit | commits | src files | same/div/gone | newest subject |
|---|---|---|---|---|---|
| `worktree/ai2-real-pages` | 2026-09-28 | 2 | 107 | 15/61/31 | AI 2: an inbox row that is the real pag… |
| `worktree/ai2-workspace` | 2026-09-28 | 3 | 99 | 14/58/27 | ai2-workspace: task log, proof lines |
| `worktree/ai2-row-vanish` | 2026-09-28 | 3 | 94 | 22/54/18 | ai2-row-vanish: land the task |
| `worktree/page-extends-item` | 2026-10-02 | 19 | 91 | 35/51/5 | Merge branch 'michael/dev' into worktre… |
| `worktree/ai2-resurface` | 2026-10-05 | 5 | 90 | 21/55/14 | salvage: save uncommitted work from ai2… |
| `worktree/ai2-base2` | 2026-09-25 | 2 | 89 | 21/54/14 | baseline 2: main tree's public/framewor… |
| `audio/chat-revision-pairs-wip` | 2026-09-29 | 13 | 73 | 16/45/12 | WIP (untested): the real mobile sheet a… |
| `salvage/qf-6-2026-09-29` | 2026-09-29 | 14 | 72 | 17/44/11 | salvage: qf-6, held by task-mastermind-… |
| `worktree/design-code` | 2026-09-30 | 8 | 58 | 32/24/0 | Merge branch 'michael/dev' into worktre… |
| `worktree/source-library` | 2026-09-28 | 11 | 40 | 34/6/0 | css-scopes.txt: union of the sibling's … |
| `worktree/collab-rounds` | 2026-09-28 | 9 | 39 | 25/13/1 | ext/page.js: leave the children line to… |
| `worktree/architecture-md` | 2026-10-13 | 18 | 36 | 29/7/0 | architecture-md: fix three stale readme… |
| `worktree/file-system` | 2026-09-29 | 17 | 34 | 8/26/0 | file-system: page.jsonl for this task's… |
| `salvage/qf-2-2026-09-29` | 2026-09-29 | 24 | 27 | 2/5/20 | salvage: uncommitted files left in qf-2… |
| `salvage/qf-2-2026-09-29-2` | 2026-09-29 | 24 | 27 | 2/5/20 | salvage: qf-2, held by task-mastermind-… |
| `worktree/cards-and-logs` | 2026-10-05 | 12 | 25 | 14/11/0 | salvage: save uncommitted work from car… |
| `_tmp_cards_and_logs_check` | 2026-09-30 | 6 | 24 | 6/18/0 | cards-and-logs/wire: review answered (4… |
| `salvage/qf-4-2026-09-29` | 2026-09-29 | 3 | 24 | 0/19/5 | salvage: uncommitted files left in qf-4… |
| `salvage/qf-4-2026-09-29-2` | 2026-09-29 | 3 | 24 | 0/19/5 | salvage: qf-4, held by task-mastermind-… |
| `worktree/framework-home` | 2026-10-02 | 19 | 22 | 4/18/0 | Merge remote-tracking branch 'origin-lo… |
| `salvage/server-query-builder` | 2026-10-12 | 11 | 19 | 5/14/0 | server-query: drop the rest of the work… |
| `worktree/mobile-nav-live` | 2026-09-29 | 4 | 17 | 1/15/1 | POST /ask/turn — the AI drawer's one Cl… |
| `worktree/voice-fixes` | 2026-09-30 | 4 | 16 | 3/13/0 | voice-fixes: fix the double chat line, … |
| `worktree/fixer` | 2026-10-01 | 4 | 14 | 5/9/0 | merge michael/dev: pick up the quick-fi… |
| `worktree/ui-system-land2` | 2026-10-03 | 12 | 14 | 0/8/6 | core/Shell: doc/property/content.md -- … |

The `worktree/ai2-*` and `salvage/qf-*` rows are the old `public/framework/ai2/` tree (since replaced by `ai/`); read them as history. The count column is inflated by old bases (a stale branch "changes" every file dev later touched).

## The eight named in the brief

| branch | read |
|---|---|
| `worktree/dup-bubbles` (2026-10-09, 7 commits) | Code already on dev (b87834ba2); only proof PNGs differ, and dev untracks shots/. Nothing to merge (see below). |
| `worktree/voice-fixes` (2026-09-30, 4 commits) | Covered: Part A (double chat line) is `own_ats` in `ux/Dictate/chat.js`, Part B `fresh:true` is in `ext/Session/Session.js`. Skip. |
| `audio/chat-revision-pairs-wip` (2026-09-29, 13 commits) | Half-done, untested revision pairs in ChatPanel. 45 of 73 files since rewritten on dev. Idea only, not mergeable. |
| `worktree/page-extends-item` (2026-10-02, 19 commits) | Page extends Item, LiveList, Store via FsFile. The largest unmerged core change; 51 files diverged. Needs a human decision. |
| `worktree/architecture-md` (2026-10-13, 18 commits) | Mostly landed: 29 of 36 files identical to dev; 7 left are readme-line fixes. Likely stale. |
| `worktree/review-turns` (2026-09-28, 22 commits) | Review tooling merge commits; 4 of 5 files diverged. Superseded. |
| `worktree/framework-home` (2026-10-02, 19 commits) | Framework home / old/ readme index work, merged with origin; 18 files diverged. Probably superseded. |
| `worktree/one-dictation` (2026-09-30, 9 commits) | Session.line() also writes to a card page.jsonl; 2 files, both diverged. Check Session/Sessions on dev. |

## Top 5 worth a human look

1. `worktree/page-extends-item` (10-02): core Page/Item/LiveList design, 19 commits, never landed.
2. `salvage/server-query-builder` (10-12): newest real code (11 commits, `Server/plugins/SocketServer`); 14 of 19 files diverged, check what query-builder dev now has.
3. `audio/chat-revision-pairs-wip` (09-29): revision-pairs idea for chat; read for the idea, do not merge.
4. `worktree/design-code` (09-30): skill edits (`code`, `color`, `css`); skills may have drifted on dev.
5. `worktree/framework-home` (10-02): framework home/readme index, merged with origin-local; likely superseded but 19 commits.
(Judged from the numbers only; unverified.)

## Pure-noise branches: 75

These have commits not on dev, but every changed file is a `*.jsonl`, `index.json` or `*.log`. **Safe to delete if the owner agrees** (nothing was deleted). Another 239 branches have zero commits ahead of dev and are also safe in git terms.

`michael/bags-rail  michael/models-asks  michael/task-folders  salvage/qf-1-2026-10-09-2  salvage/qf-1-2026-10-10  salvage/qf-1-2026-10-11  salvage/qf-1-2026-10-12-2  salvage/qf-1-2026-10-13-97  salvage/qf-1-2026-10-13-98  salvage/qf-1-2026-10-13-99  salvage/qf-2-2026-09-30  salvage/qf-2-2026-10-09  salvage/qf-2-2026-10-12  salvage/qf-2-2026-10-12-2  salvage/qf-2-2026-10-13  salvage/qf-2-2026-10-13-10  salvage/qf-2-2026-10-13-11  salvage/qf-2-2026-10-13-12  salvage/qf-2-2026-10-13-13  salvage/qf-2-2026-10-13-14  salvage/qf-2-2026-10-13-15  salvage/qf-2-2026-10-13-16  salvage/qf-2-2026-10-13-17  salvage/qf-2-2026-10-13-18  salvage/qf-2-2026-10-13-19  salvage/qf-2-2026-10-13-2  salvage/qf-2-2026-10-13-20  salvage/qf-2-2026-10-13-21  salvage/qf-2-2026-10-13-22  salvage/qf-2-2026-10-13-23  salvage/qf-2-2026-10-13-24  salvage/qf-2-2026-10-13-25  salvage/qf-2-2026-10-13-26  salvage/qf-2-2026-10-13-27  salvage/qf-2-2026-10-13-28  salvage/qf-2-2026-10-13-29  salvage/qf-2-2026-10-13-3  salvage/qf-2-2026-10-13-30  salvage/qf-2-2026-10-13-31  salvage/qf-2-2026-10-13-32  salvage/qf-2-2026-10-13-4  salvage/qf-2-2026-10-13-5  salvage/qf-2-2026-10-13-6  salvage/qf-2-2026-10-13-7  salvage/qf-2-2026-10-13-8  salvage/qf-2-2026-10-13-9  salvage/qf-3-2026-10-12  salvage/qf-3-2026-10-12-2  salvage/qf-3-2026-10-12-3  salvage/qf-3-2026-10-13  salvage/qf-3-2026-10-13-2  salvage/qf-4-2026-10-12  salvage/qf-4-2026-10-12-2  salvage/qf-4-2026-10-13  salvage/qf-4-2026-10-14  salvage/qf-4-2026-10-14-2  salvage/qf-4-2026-10-14-3  salvage/qf-4-2026-10-14-4  salvage/qf-5-2026-10-09  salvage/qf-6-2026-09-30-2  salvage/qf-6-2026-10-13  salvage/qf-6-2026-10-13-2  salvage/qf-6-2026-10-14  salvage/qf-6-2026-10-14-2  salvage/qf-7-2026-10-14-2  salvage/qf-7-2026-10-14-3  salvage/qf-8-2026-10-14  salvage/qf-8-2026-10-14-2  salvage/qf-8-2026-10-14-4  worktree-agent-a3c7fdb6298cb9b59  worktree/prompts-live  worktree/refine-demo  worktree/relay-2  worktree/voice-asks-2  worktree/voice-verify`
