# Session twins: stop a session ever getting a second folder (the cause, fixed once)

**The owner (2026-11-01):** "We should have one dated folder structure… put the files and folders in the right place once and for all… no chance of anyone coming back and saying, how did this happen?"

**Read first:** [../ai2-retire/move-report.md](../ai2-retire/move-report.md), the "Why it happened" and "Can it happen again" sections. The cleanup removed 794 twin folders; the two causes below are still live.

## Fix, in a worktree, with a failing test first for each

1. **`DatedFiles.session_dir()` (`Server/DatedFiles.mjs`)** looks only for `<uuid>` and `session-<id8>` names. For a session whose only folder is a slug, it makes a new `session-<id8>` folder (about 5,700 sessions today). Fix: find the session by id in any existing folder (use `DatedFiles.owner(dir)`), before making a new one.
2. **`AISessionIndex.dir_of()` / `write()`** return a cached folder that may be gone, then `mkdir -p` it back into existence. `Session.locate()` (`days`/`slugs`) has the same problem. Fix: if the cached folder is gone, locate the session again; never recreate a vanished cached path.
3. **One folder-finder:** every writer (TaskDirs, DatedFiles, AISessionIndex, Session.locate, TaskMove) asks one function for "the folder of session X". Delete the duplicates (law 6).
4. **`Server/SessionConsolidate.mjs`:** teach it slug folders too, and put the cleanup's batch logic from `../ai2-retire/move-ai2.mjs` there, so one tool does it. Add a check that reports any session id held in two folders, and run it from an existing health check or test, so a twin is caught the day it appears.
5. **Write it down:** the store's one shape and the one finder, in the sessions readme (`public/framework/ai/sessions/readme.md` or its doc), verified against the code.

## Fences

- **Worktree;** never merge. Run `node Server/review.mjs <this dir> <worktree>` and answer every finding.
- Move or delete no record in the main tree.
- **No `python`.** Commit by path.
- **Budget:** about $25.
- **Land:** the merge command, the tests, and "can it happen again: no, because …".
