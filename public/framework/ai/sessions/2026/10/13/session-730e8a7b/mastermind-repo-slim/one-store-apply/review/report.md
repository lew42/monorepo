verdict: fix
1. [fix] The branch re-creates the old tree it set out to remove: it adds `ai/2026/files.jsonl`, `ai/2026/09/files.jsonl` and `ai/2026/09/19/files.jsonl` (the `PageFiles.js` watcher's listings, written while folders moved; the task log names this caveat). That is the "stale fragment" the owner's ask 3 rules out — diff.patch, three `new file` entries outside `ai/sessions/`. Remove them (`git rm`) before the merge, and run the main-tree sweep with the watcher held or stopped.
2. [note] `Servex/cards/readme.md` was only half updated: the day index line shows the new `ai/sessions/…/cards/` path, but the two card lines below it still show `ai/2026/09/24/fix-the-sidebar/…` as folders. One code block now holds both trees (content: names used the same way every time).
3. [note] Ask 2's real apply in the main tree, `check_page` at 1200, smoke and `merge.mjs`, and all of ask 4, have not happened yet: `git log` shows no merge and task.jsonl stops at the `shots` line. This is expected before the gate, so it is a note, but the landing has to do them.

No shots were given (`shots/` is empty), so this review covers Requirements and Words only.

## Requirements
- 1 "`Cards.dir(id)` / `Cards.url(id)` resolver, every caller switched, tested on a private Servex (create, open, reply, both paths)" — yes — `CardDir.js` holds the one rule, and `Cards.dir`/`Cards.path` fall back to the old folder. Callers switched: Layers, Sessions, on-landing, smoke, day-prompts-refine, card.js, Activity, Needs, Server.js. servex-proof.txt: 10 pass (new, moved and old-tree cards opened and replied to). `Cards.url` keeps the page route by decision (task.jsonl, 18:59).
- 2 "The move: `git mv` by script from the manifest, relink, a redirect for old card URLs, undo proven on a worktree copy, then the real apply…merge.mjs" — partly — `TaskMove --manifest --ledger card-moves` exists. undo-proof.txt: 575 folders, 0 bad, 0 tracked files changed after the undo. The relink rewrote 165 mentions. Server.js serves old file URLs from the new folders. Not done yet: the real main-tree apply, check_page and merge (finding 3), and the old-tree residue (finding 1).
- 3 "`ai/readme.md`'s three-line pattern updated to the final truth; `task-folders.md` gets the applied decision with the counts" — yes — the readme's card line is rewritten; task-folders.md has a new "one tree, applied" section that gives 557 folders + 24 index files, verify 0 bad, 165 mentions in 122 files.
- 4 "Owner note (kind `decision`), card report, landing line" — no, not yet — no `note` or `landed` line in task.jsonl (finding 3).
- Owner's ask 3 "port everything over to one single data structure… no stale fragments" — no — finding 1.

## Words
- content: the takeaway comes first — yes — task-folders.md opens with "Every Inbox card folder now lives inside the sessions store", then a code block of the three paths.
- content: every name is used the same way every time — no — `Servex/cards/readme.md` shows both trees in one block (finding 2).
- content: a mention is a link — yes — the readme and task-folders.md link `cards/CardDir.js`, `card-move-plan.mjs` and `undo-proof.txt`.
- content: plain sentences, no clipped fragments — yes — the readme line and the doc section read in full sentences.
- content: comments are short — note — `CardDir.js` has a five-line header and the `Server.js` comment runs two lines; both are within reason for a rule shared by three runtimes.
