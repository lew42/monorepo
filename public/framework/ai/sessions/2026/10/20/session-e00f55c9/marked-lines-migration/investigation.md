# Investigation: marked lines migration

Scope: every `.jsonl` under `public/framework` (27,970 files, 468k non-empty lines). Counts come from two node passes over the tree (scratch: `%TEMP%/count-marks.mjs`, `%TEMP%/verbs.mjs`, manifest `%TEMP%/bare-manifest.json`). Marked = checked in code. Guess = not checked.

## Counts (checked)

| Measure | Result |
|---|---|
| `.jsonl` files read | 27,970 |
| Non-empty lines | 468,525 |
| Lines with a top-level verb in bare spelling (`start`, `complete`, `set`, `log`, `assign`, `stop`, `add`, `finish`, `move`, `clear`, `unset`) | 54,094 in 4,776 files |
| Bare hop lines (`"tasks": {"c3": …}`) | 0 |
| Files that contain a `#` or `()` anywhere in the text | 3,406 (false positives: prose inside strings; the key-based pass found 2 marked keys in the whole tree) |
| Lines with a real marked key (`name()` or `#id`, checked by key) | 2 |
| Unparseable lines | 2 |
| Git-tracked `.jsonl` under `ai/sessions` | 6,598 |

Verb breakdown of the bare top-level lines: `log` 41,316 · `assign` 9,029 · `add` 1,815 · `stop` 1,022 · `set` 280 · `start` 138 · `finish` 91 · `complete` 376 · `move` 26 · `clear` 1.

Reading: the switch went on today (`Store.marked_lines = true`, `line-format.md`), so almost nothing new is marked yet. The files to rewrite are the ~4,800 with bare verb lines. The other ~23,000 files hold only data lines (`{"session":…}`, `{"at":…}`), which the migration does not touch.

## Questions, ranked

1. **Which lines does the script rewrite?** Only top-level verb keys, and only in files the item system reads. Checked: `line-format.md` lists the writers and readers. Open: the `log` and `assign` lines are written by Servex (`Servex/agents/*`) and read by `Server/Steps.mjs`, which reads only `assign` and `log` bare (checked in `line-format.md`). Rewriting them to `log()` breaks `Steps.mjs` unless it goes through `LineKey` first. Decide before the script: keep `assign` and `log` bare on disk and migrate only `start`, `complete`, `set`, `stop`, `add`, `finish`, `move`, `clear`, `unset`; or move `Steps.mjs` onto `LineKey` first. **Recommendation: fix `Steps.mjs` first (one reader, one test), then migrate all verbs.**
2. **Live files and reset.** A rewrite is a log rewritten under a reader. `core/Item/doc/reset.md` (checked) says a reader recovers by proving its cursor; a rewritten file triggers a reset, which re-reads the file. Guess: that is safe, but it costs a re-read in every open tab. Rule for the script: skip any file whose mtime is inside the quiet window (default 10 min) and re-check mtime just before the write.
3. **Snapshots.** `Server/Snapshots.mjs` exists (checked by path). Not read yet. Open: does a snapshot store line offsets? If so a rewrite invalidates it. Pass 2 should read it.
4. **Replay identity.** `Server/ReplayCompare.mjs` (checked: it exists, takes another checkout as argument). Run it before and after each batch; the line-format doc quotes 4,071 of 4,071 identical on the bare→marked switch, so the method works.
5. **Tools that grep for bare verbs.** Not yet checked across the tree. Guess: the 8 tools named in the brief all use `LineKey` (brief, checked by grep: `LineKey` is imported by 19 files including `Server/DatedFiles.mjs`, `Server/AIIndex.mjs`, `Servex/TaskLoop.js`, `Servex/CloseLoop.js`). Still to check: any `grep`-style shell check in `.claude/hooks/` and `Servex/` that matches `"start"` as text. Pass 2.
6. **Git noise.** Checked: 6,598 tracked jsonl under sessions. A rewrite touches about 4,800 of them in one or more commits. Recommend commits by path, batches of about 500 files, so each commit reverts cleanly.
7. **The `.jsonlog` question.** Recommendation: **keep `.jsonl`**. The spelling is inside each line (the key), not in the file extension, so a new extension changes nothing the readers need. Checked: `DatedFiles`, `AIIndex` and the watchers look for `.jsonl`; a new extension would make every one of them miss the files until it is changed. Alternative (not taken): `.jsonlog` would mark the new files at a glance, at the cost of touching every glob and watcher. Guess: the readers' globs are many; a grep count was too slow on this Windows tree to finish in this pass.

## Class and part sketches

- `Item/LineKey.js`: `class LineKey` (static helpers, no instance). API: `LineKey.bare(key)`, `LineKey.unmark(line)` (top level), `LineKey.deep(line)` (all levels). Checked.
- `Item/Store.js`: `Item.Store.marked_lines` (boolean, `true` since 2026-11-02). Checked.
- Proposed `Server/MarkLines.mjs` (new, not built): dry run by default, `--apply` rewrites one file at a time, quiet-window check, writes a manifest (`old path → new path`, line counts), runs `ReplayCompare` before and after. Name and home: `Server/`, next to `ReplayCompare.mjs`.
- Readers to update after the rewrite (checked list in `line-format.md`): `Item.set_one` already reads all shapes. Remove bare branches from `LineKey` and the readers only after count = 0.

## Reuse

- `node Server/PastWork.mjs "<topic>"`: ran for the brief's title. Found the switch task (`marked-lines-switch`, merged `110635a9c`) and the `LineKey` commit `ee6e2bb8b`. Reuse both; do not rebuild the helper.
- `core/Item/doc/line-format.md`: already the source for the spelling table. Update it, do not add a second doc.

## Risks

- Rewriting a file a live tab appends to: data loss if the append lands between read and write. Mitigation: quiet window plus mtime re-check; write to a temp file and rename.
- `Steps.mjs` and the Servex writers that stay bare: a half-migrated reader breaks silently (`nothing throws`). Mitigation: fix readers first, then migrate.
- Replay drift: mitigated by `ReplayCompare` per batch.
- Budget: the rewrite is local code work, no model calls; the cost is review time, not tokens.

## Not done in this pass

- Snapshots internals, `.claude/hooks` text matching, and a per-file replay run. These are pass 2 leads, to be sent to Haiku scouts with file and line ranges.
