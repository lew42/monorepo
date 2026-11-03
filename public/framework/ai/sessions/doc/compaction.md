# Compaction of task logs: 4.5 MB would be saved in August and September (not applied)

- **4.5 MB saved of 11.4 MB** (4,681,567 of 11,934,035 bytes) if every eligible August and September `task.jsonl` were compacted: 931 of 1,022 logs are eligible.
- **59% of all lines are `log`/`action` noise; 3.4% are decisions.** The other lines (assign, agent, review, ask) are mostly kept.
- **Not applied; `--apply` does not exist yet.** Nothing here writes to any task log. Applying is a later brief if you want it.

## The rule (written once, as `Compact.blockers`)

A log may be compacted only when it has **landed**, **no `ask` is still open or building** (the latest status of each ask id counts), **no `decision` is reversed, superseded or overruled**, and it has been **quiet more than 7 days**. This is the "landed with no surprises" rule from [repo-size.md](../../doc/repo-size.md).

- **Kept verbatim:** the first `assign` (launch line), every `decision`, `verdict`, `review`, `agent` and `ask`, the landing line, the line just before each decision, anything after the landing line, anything unparseable.
- **Folded:** consecutive `log`, `action` and later `assign` lines become one `{"folded":{lines, kinds, from, to, files}}` line (files capped at 20, with the total).
- **Undo:** one `{"compacted":{lines, kept, commit, from, to}}` line (placed second, so line 1 stays the launch line) names the git commit holding the full log: `git show <commit>:<path>`. The original is never deleted.
- The compacted file's last line is always an original line, so the landing line checks with `tail -1`.

## Run it

```
node Server/Compact.mjs --dry <taskDir>
node Server/Compact.mjs --dry --all 2026/09 --out <file.md>
node Server/Compact.test.mjs
```

The class is [Compact.mjs](../../../../../Server/Compact.mjs) (`Compact.plan`, `Compact.month`). Per-task tables: [September](../2026/10/13/session-730e8a7b/mastermind-repo-slim/compaction-dryrun/compaction-2026-09.md) (648 tasks scanned, 648 task dirs) and [August](../2026/10/13/session-730e8a7b/mastermind-repo-slim/compaction-dryrun/compaction-2026-08.md) (374 and 374).

| month | tasks | eligible | bytes | saved if applied | log/action share |
|---|---|---|---|---|---|
| August | 374 | 370 | 3,331,046 | 1,477,129 | 67.9% |
| September | 648 | 561 | 8,602,989 | 3,204,438 | 55.2% |

Caveat: the saving is measured on file bytes with a placeholder commit hash; git already stores these logs compressed, so the saving in the pack is smaller than the working-tree figure.
