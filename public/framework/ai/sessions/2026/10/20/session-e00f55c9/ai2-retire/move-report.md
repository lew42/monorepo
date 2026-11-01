# The ai2 move: before and after

Written by [move-ai2.mjs](./move-ai2.mjs) on 2026-11-01; every number here was computed by it. Brief: [move-brief.md](./move-brief.md), changed by the owner the same day: a duplicate is merged, then removed, with no archive copy. Every path and line: [manifest.json](./manifest.json). The run stopped once part way, when the folder-listing watcher (`Server/plugins/PageFiles.js`) had appended to a listing being removed; it resumed from its own saved plan ([run1.json](./run1.json)), and the before numbers are the first run's.

| Whole of public/framework/ai + ai2 | Before | After | Change |
| --- | --- | --- | --- |
| Distinct session ids | 11,103 | 11,104 | +1 |
| Session folders | 11,897 | 11,104 | −793 |
| Ids stored in two folders | 794 | 0 | −794 |
| index.json dollars, once per id (live copy) | $18948.51 | $18959.73 | +11.22 |
| index.json dollars, once per id (highest copy) | $19353.22 | $18959.73 | −393.49 |
| index.json dollars, every folder summed | $24702.90 | $18959.73 | −5743.17 |
| .jsonl lines | 370,174 | 370,093 | −81 |
| .jsonl lines in the sessions store | 340,907 | 341,381 | +474 |

**Nothing lost** (checked after the move by `move-ai2.mjs --verify`, [verify.json](./verify.json)). The 1,560 removed or replaced files (1,496 gitignored, rebuilt from the backup; 64 tracked, rebuilt from HEAD) held 1,260 distinct lines. 404 are found again in a .jsonl under public/. The rest: 773 stale `summary` lines of a gitignored `cache.jsonl` (machine state AISession.save() rebuilds from the transcript, which exists for every one of these ids; the fresher copy stayed), 31 generated folder-listing lines, and 52 ai2 task-stub pointers or folded copies whose values audit-ai2.mjs found in the store. **Lines lost: 0.** **Session ids:** the 794 ids named by a removed index.json all still have a folder (0 missing), and 0 ids are in two folders now. The +1 id is `2026/11/01/session-88c481e1`, a session that began during the run; the live-copy dollars rose for the same reason (sessions working while it ran). The "highest copy" and "every folder" dollars fall because they counted the duplicates; 10 stale copies had been counted under the old cost rule (no `cost_v`).

**Checked by a second reader.** 14 Haiku readers each read one batch of the digest: both copies of every differing file, line by line as sha1 plus the summary fields. They covered 1,486 file pairs: 692 cache pairs and 794 index pairs (794 with the same id, kept copy as new or newer). They found 1 problem (2026/10/08/ai-system-docs-fa3e829d/cache.jsonl: deleted summaries run to 2026-10-12T06:25 (up to 368 msgs) but no kept line reaches past 2026-10-09T09:27 (max 322 msgs), so none is superseded). The cause was the first keeper rule, which took the cache from whichever folder had the newest index.json. The rule now keeps the fresher copy of each machine-state file, and this script's own check finds no deleted copy fresher than its kept one. The 18 pairs the new rule changed were read again: 0 problems. No pair was byte-identical, so no removal rests on a sha match alone. Verdicts, verbatim: [haiku-checks.jsonl](./haiku-checks.jsonl).

## What moved where

- **Lines added to the store:** 300 record lines (copied byte for byte from ai2/, the old dated card logs and ai/archive/ai2/; an old card log whose store home did not exist was copied whole, so its card page reads the same), plus 796 redirect lines in `ai/sessions/task-moves.jsonl`, one per folder that went (the ledger `TaskMove` and `StoreFolder` already read), so old links still resolve. 7 files are new. Six of the card logs are session cards (`cards/session-<id8>/`), which `.gitignore` keeps out of git by design ("live card state, not source"); their old tracked copies stay in git history and in the HEAD backup below.
- **Duplicate session folders:** 794 of 794 merged and gone. The keeper is the folder holding tracked task files (102), else the live one (692). 131 fresher machine-state files (index.json, cache.jsonl) replaced the keeper's older copy, 20 files the keeper lacked moved in, and 1373 stale gitignored copies were removed (backed up outside the repo in `%LOCALAPPDATA%/lew42/servex/moved-aside/move-ai2-2026-11-01/`, the folder SessionConsolidate.mjs uses; the HEAD copies of the 64 removed tracked files are beside it in `move-ai2-2026-11-01-head/`).
- **Flat session folders** (`ai/sessions/<uuid>/`, the shape before the dated tree): 1 folded into their dated folder (70f4fedc-e673-4e10-9cdf-425c8e808bcd -> 2026/10/25/session-70f4fedc).
- **ai2 records:** 40 tracked files under `public/framework/ai2/` (tasks/, ai/, overview/, page.jsonl, weight.jsonl) removed with `git rm`; git history is the undo.
- **Old places outside the store:** 27 files under `ai/2026/`, `ai/2026-10-13/` and `ai/archive/ai2/` (the old dated card logs and the old ai2 page logs, every line now in the store) removed, tracked ones with `git rm`. Nothing session-shaped is left outside `ai/sessions/YYYY/MM/DD/<name>/`.
- **Held, not touched:** none.

## Why it happened

- **2026-10-09, the session-folder rename ran under a live server.** `Server/session-migrate.mjs` (commit `537fd7df2`) renamed each `<uuid>` session folder to a slug. The running Servex kept its old id-to-folder map: `AISessionIndex.load()` fills `this.dirs` once, and `write()` does `mkdir -p` on the cached path before writing `index.json`. So every rewrite recreated the old `<uuid>` folder holding only an `index.json`. `Session.scan()` also runs once per process: a process that scanned before the rename did not know the slug, so `Session.locate()` made a new `session-<id8>` folder on that day (the 125 pairs that span two days).
- **2026-10-12, task folders were filed into the wrong twin.** `TaskMove` (commit `c15216adc`) moved `ai/<date>/<task>/` folders into their session through `session_dir()`, which only knows `<uuid>` and `session-<id8>` names. It never found the slug folder, so it put tasks into the stale `<uuid>` folder. That is why 102 keepers here are the folder with the task files.

## Can it happen again

**Yes, two ways; not fixed by this run.**

1. **A session whose only folder is a slug gets a second folder on its next task.** `DatedFiles.session_dir()` (`Server/DatedFiles.mjs`) still looks only for `<uuid>` and `session-<id8>`; checked read-only against today's store, it returns a new `2026/11/01/session-<id8>` for slug-only ids (about 5,700 of them). **The fix:** before the `home` fallback, look the id up in a lazily built map of the day's other folders using the existing `DatedFiles.owner(dir)`.
2. **Any folder move under a running Servex brings the old path back.** `AISessionIndex.dir_of()` returns a cached folder that may be gone, and `write()` recreates it. **The fix:** when the cached folder no longer exists, drop it and locate again (the same in `Session.locate()` for `days`/`slugs`), and never `mkdir -p` a vanished cached path. Until then, restart Servex after every move, including this one.

`Server/SessionConsolidate.mjs` (2026-10-25) already folds one session's twins by id, but it sees only `<uuid>` / `session-<id8>` folders, so it could not find the 726 pairs that involve a slug. This run's batch logic belongs in it (one tool, not two).

## Next

1. **531 store cards still name `/framework/ai2/card.js` as their class**, so `ai2/card.js` and `ai2/page.js` stay. Add the alias in `core/Page/Jsonl.js` `log_class()` (move-plan.md step 3a), repoint the live readers (step 3b), then remove the rest of ai2/.
2. **Fix the two writers** named under "Can it happen again" (DatedFiles.session_dir, AISessionIndex.dir_of), and fold this batch logic into `Server/SessionConsolidate.mjs`.
3. **Restart Servex** so AISessionIndex reloads its folder map; until then it may rewrite an `index.json` into a folder this run removed. Then run `node public/framework/ai/AISession/AISessionIndex.mjs --check`. The day files still name a removed folder for some sessions; the redirect lines in `ai/sessions/task-moves.jsonl` answer those links.
