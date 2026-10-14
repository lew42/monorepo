# Docs check: can you restore a broken September picture?

**Verdict: mostly yes.** `2026/09/readme.md` alone answers where, what and the command. Gaps below.

- **Where it went: clear.** `2026/09/readme.md` line 3 names the drive path, "same paths below it". `doc/picture-archive.md` line 12 gives a worked path example.
- **Command: clear for a whole month.** `2026/09/readme.md` line 6 and `picture-archive.md` line 16 give `node Server/archive-sessions.mjs --undo --months 09`.
- **Why: only in one place, and not where you land.** The reason (651 MB to 72 MB, `.git` unaffected) is only in `repo-size.md` line 52. `2026/09/readme.md` line 3 and `picture-archive.md` line 3 say pictures leave "once its month is old" but never say the disk was the problem. Add one sentence and a link to each.
- **Restoring ONE picture has no command.** `picture-archive.md` line 17 says "copy it back by hand". The tab you reach from a broken image needs a literal line, e.g. `copy E:/Projects/lew42/archive/sessions/2026/09/22/x/shots/a.png` to the matching repo path. The only scripted route restores 3,651 files (430 MB) just to fix one.
- **Unit mismatch.** `picture-archive.md` lines 7-8 sum to 4,982 pictures and 552.4 MB, but `repo-size.md` line 52 says 578 MB. The counts agree; the sizes do not (MiB vs MB?). Pick one unit and say it.
- **Undo months differ in form, not meaning.** `repo-size.md` line 52 uses `--months 08,09`, the others `--months 09`. Fine, but only the first shows that a comma list works.
- **Unstated assumptions.** Nothing says what happens if the drive is not `E:` (drive letters move) or whether `--undo` overwrites a file you edited. `picture-archive.md` line 16 says "the drive keeps its copy", which helps.
- **Link that may go nowhere.** `2026/09/readme.md` lines 11-28 link each day as `01/`, `04/`...; those are folders, not pages, and I did not check they have a readme. `picture-archive.md` line 6 links `../2026/08/readme.md`, unchecked too.
- **Dead end for readers.** `repo-size.md` line 52 links the decision to `archive-phase-2/task.jsonl`, a raw log, not a readable page.
- **Entry from Sessions is thin.** `sessions/readme.md` line 20 and `doc/readme.md` line 12 point to `picture-archive.md` correctly, but neither names the command. One click is fine.
- **No contradictions found** in the counts (September day table sums to 3,651) or the anchor `#phase-2--archive-old-sessions`.
- **Readability.** `repo-size.md` line 52 is one dense paragraph with nine facts; the newcomer rule would split it into short bullets.
