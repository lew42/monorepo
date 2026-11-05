# Findings: ai2 and the folders in ai/

Read-only. Nothing changed. Receipts are commands or `path:line` with the quoted text.

## 1. What is left in `public/framework/ai2/`

Receipt: `find public/framework/ai2 -type f | wc -l` → 26 files, `du -sh` → 108K.

- **18 of 26 are one-line shims.** Receipt: `head -c 160 *.js`; e.g. `ai2/card.js` reads `// Moved to ai/cards/card.js (ai2 merged into ai, 2026-10-09). … export * from "../ai/cards/card.js";`. Shim list: activity, agents, card, chat, compose, faces, floating, fold, groups, inbox, live, meter, outline, real, rules, rail, tasks, workspace.
- **Real code:** `page.js` (170 lines, the route for `/framework/ai2/`), `ai2.css` (457 lines).
- **Data:** `ai/log.jsonl` (12 lines), `ai/files.jsonl`, `doc/files.jsonl`, `doc/img/files.jsonl`, `files.jsonl` (generated listings).
- **Undeniable:** `ai2/readme.md` names `page.jsonl` and `weight.jsonl` as kept here. Receipt: `ls public/framework/ai2/page.jsonl public/framework/ai2/weight.jsonl` → "No such file or directory" for both. The readme is wrong about its own contents.
- **Undeniable:** `ai2/readme.md` links `ai/archive/ai2`. Receipt: `ls public/framework/ai/archive/ai2` → no such file or directory.
- **Last commit touching the folder:** `c1bd2c94d` 2026-11-03 "voice-system: ask 10 review answers" (`git log -- public/framework/ai2`). Most recent commits are sweeps ("worktree closed: … leftover file(s) saved", "wip: local generated index appends"), so this is not a code change.

### Real imports of an ai2 path (code, not comments or data)

- **Undeniable, one live import:** `public/framework/dev/DevBar/chat.js:4` reads `import { AgentTalk } from "../../ai2/live.js";`. It goes through the shim `ai2/live.js` to `ai/rail/live.js`. Removing the shim breaks the dev bar unless this line changes too.
- **Not confirmed:** the earlier audit (`ai/sessions/2026/10/20/session-e00f55c9/ai2-retire/audit.md`, §Counts) says `core/Page/Jsonl.js` imports `/framework/ai2/card.js`. Receipt: `rg "ai2" public/framework/core/Page/Jsonl.js` → no match. The same audit says 531 record files name that class in their `class` field. That is data, not an import, and the audit's count was not re-run here.

### The URL is live, and most references are links

- **Undeniable:** the route `/framework/ai2/` is still used by code that builds or checks it. Receipts: `Servex/agents/Layers.js:523` builds `` `/framework/ai2/${id}/` `` for every card page; `Server/smoke.mjs:117` loads `["/framework/", "/framework/ai2/"]` as canaries; `Server/review.mjs:134`; `Server/merge.mjs:25` maps `public/framework/ai/YYYY/...` to `/framework/ai2/...`; `public/framework/ai/AIOverview.js:185` links the "Dashboard" tile to `/framework/ai2/`.
- **Count:** `rg -c "framework/ai2/" public --glob '*.js' --glob '*.md' | wc -l` → 374 files. Most are old records and links.

So the folder cannot be deleted without a redirect or a new home for the route. Deleting it breaks the canaries, the card URLs and the nav.

## 2. Why is it still there?

Each time it was asked for, and where it stopped:

| Date | Ask (`ai/asks.jsonl`) | Where it stopped |
|---|---|---|
| 2026-09-30 | "AI 2 merges into /framework/ai/ (later)", line 28 | parked, owner `ai/todo.md` |
| 2026-10-03 | "AI 2: finish the retirement now (nav entry + ai2/ dir, Git keeps history)", line 207 | line 209 marks it `landed` by `servex-asks-tick`, "owner's task.jsonl has a landed_at line". The folder was not removed. Filed and marked done with no removal. |
| 2026-10-03 onward | orphaned, line 295 | re-tracked to `/framework/ai/tasks/ai-2-finish-the-retirement-now-nav-entry/` |
| 2026-10-09 | merge into ai, `ai2-merge` | code moved, shims left, folder kept (`ai2/readme.md` says so) |
| 2026-11-01 | `retire-ai2 merge 1: drop AI 2 from the nav` (`a02d9b0448`) | nav dropped |
| 2026-11-01 | `ai2 move` (`fa90c3a41`), `cleanup` (`55348bb9e`) | 795 duplicate session folders removed; `ai2/` itself kept |

**Step where it stopped:** merged but kept on purpose. The 2026-11-01 move report (`ai/sessions/2026/10/20/session-e00f55c9/ai2-retire/move-report.md`) says the duplicates are gone and nothing was lost. The 2026-11-01 audit (`ai2-retire/audit.md`) says `ai2/` may move only after two things: (1) 295 lines copied into 14 store files, (2) 531 card records given a class alias. Neither was reported done in the move report.

**Questionable:** whether those 295 lines are now in the store. The move report says `.jsonl lines in the sessions store +474`, which may cover them. Settling it means re-running the audit's line count (`ai/sessions/2026/10/20/session-e00f55c9/ai2-retire/audit-ai2.mjs`) against the current tree. Not re-run here.

## 3. Map of `public/framework/ai/` (partial)

The map script hit a 120 s timeout and was still writing when I stopped it at `screenshots`. Rows below are complete for the names shown. Files, size and last commit are receipts from `find`, `du -sk` and `git log -1 -- <path>`. "index-links" counts `ai/readme.md` and `public/framework/readme.md` matches. "code-importers" is noisy (it matched date strings and common words), so I do not use it as evidence.

| Folder | Files | KB | Last commit | Index link | Note |
|---|---|---|---|---|---|
| 2026 | 2 | 2 | 2026-11-03 | 0 | dated folder, see §4 |
| AIDashboard | 13 | 47 | 2026-11-02 | 1 | live page, `ai/readme.md` links it |
| AIDay | 4 | 25 | 2026-10-24 | 1 | live page |
| AISession | 84 | 697 | 2026-11-03 | 1 | live, the session page |
| AITask | 133 | 1078 | 2026-11-03 | 2 | live, the task viewer |
| ai | 2 | 16 | 2026-11-01 | 2 | |
| archive | 167 | 279 | 2026-11-01 | 0 | ai2's old logs are NOT here (see §1) |
| asks | 15 | 1483 | 2026-11-04 | 1 | live |
| audits | 40 | 1155 | 2026-11-03 | 0 | |
| cards | 35 | 219 | 2026-11-01 | 0 | live, 52 code files mention it |
| classes | 8 | 21 | 2026-11-03 | 0 | |
| collab | 3 | 13 | 2026-09-29 | 0 | |
| council | 6 | 78 | 2026-10-12 | 0 | 1 code file |
| dashboard | 11 | 42 | 2026-10-16 | 0 | |
| doc | 154 | 4625 | 2026-11-04 | 2 | the docs |
| errors | 9 | 157 | 2026-11-03 | 0 | |
| health | 27 | 6196 | 2026-10-23 | 0 | 6 MB, check size |
| landed | 2 | 6 | 2026-10-17 | 0 | live (see below) |
| local | 11 | 45 | 2026-10-22 | 0 | |
| log | 2 | 5 | 2026-11-01 | 0 | |
| merge | 13 | 53 | 2026-11-03 | 1 | live |
| models | 16 | 73 | 2026-10-23 | 0 | |
| now | 13 | 48 | 2026-10-24 | 1 | live |
| process | 2 | 5 | 2026-09-29 | 0 | |
| prompt-tasks-test-3984 | 1 | 1 | 2026-10-22 | 0 | see below |
| queue | 15 | 103 | 2026-11-03 | 0 | |
| quick-fix | 18 | 76 | 2026-11-02 | 0 | |
| rail | 29 | 396 | 2026-11-03 | 0 | live, 34 code files |
| readmes | 12 | 446 | 2026-10-24 | 1 | live |
| recordings | 6 | 643 | (gitignored) | 0 | live: `Server/plugins/Recordings.js:5` writes here |
| review | 12 | 61 | 2026-10-23 | 0 | |
| screenshots | 6 | 778 | (gitignored) | 0 | Playwright output, gitignored by `.gitignore:171` `**/screenshots/` |

Not yet mapped (the script did not reach them): `sessions`, `system`, `talk`, `tasks`, `tests`, `usage`, `v`, `audits`, `dashboard` (partly), `ai2`, `ai`. `ai2` is §1.

## 4. Undeniably dead `ai/` folders

Only one passes the receipt test:

- **`ai/prompt-tasks-test-3984/`** (undeniable). One file, `files.jsonl`, with two lines: `{"file":"tasks/"}` and `{"file":"tasks/","gone":true}`. Zero references outside sessions: `rg -l "ai/prompt-tasks-test-3984" public Servex Server .claude` → no match outside `sessions/`. It is a test artifact from 2026-10-22.

Candidates that are not dead, though they look it:

- **`ai/landed/`** is live. `public/framework/ai/cards.jsonl:124` says the page `/framework/ai/landed/` is computed. The code is `Servex/Landed.js` (found by `find Server Servex -iname "*landed*"`); the cards note's `Server/Landed.mjs` is stale. `ai/tasks/doc/week-2026-10-17.md` links the page. Keep.
- **`ai/recordings/`** is live: `Server/plugins/Recordings.js:5`, `Server/TranscribeLoop.mjs:42` and the whisper tests use it. Gitignored by design (`.gitignore:43, 91`). Keep.
- **`ai/screenshots/`** has zero code references (`rg -l "ai/screenshots" ...` → none). It is gitignored by a generic `**/screenshots/` rule (`.gitignore:171`) and holds one dated run. Questionable: a generated artifact, not in git, possibly safe to delete. Settling it needs an owner decision about whether old Playwright shots are wanted.

## Recommendation

**The smallest undeniable step for ai2, in order:**

1. Change one line: `public/framework/dev/DevBar/chat.js:4` from `../../ai2/live.js` to `../../ai/rail/live.js`. Verify by loading the dev bar.
2. Fix `ai2/readme.md`: delete the `page.jsonl`/`weight.jsonl` claim and the `ai/archive/ai2` link. These are wrong today.
3. Re-run the audit's line count to confirm the 295 lines are in the store (questionable, see §2).
4. Only then, as a scripted move with a dry run and manifest (the repo's move rule): move `ai2/page.js` and `ai2.css` to a single new route home and keep one redirect for `/framework/ai2/`, since 374 files and the canaries depend on the URL.

Proof that it worked: `rg "ai2/" public Servex Server` returns only records and links, and `Server/smoke.mjs` passes on `/framework/ai2/` at its new path.

**Undeniable `ai/` removal:** `ai/prompt-tasks-test-3984/` (one test artifact, zero references). Delete it in a worktree and say so in the log.

## What is questionable

- Whether the 295 lines from the 2026-11-01 audit are now in the store (§2).
- Whether `ai/screenshots/` is worth keeping (§4).
- The route home for `ai2/page.js` (§Recommendation step 4): the owner should choose the URL before the move.
